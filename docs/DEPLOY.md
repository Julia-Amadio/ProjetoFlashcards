# Plano de deploy (tentativa opcional)

> O professor **não exige** deploy — isso é uma tentativa feita por conta própria, encaixada
> no tempo que sobra. Este documento junta o que já foi avaliado até agora, pra não perder o
> raciocínio caso o deploy fique pela metade ou precise ser retomado depois.

---

## 1. Por que front e backend não vão pra plataforma nenhuma iguais

* **Frontend (React/Vite):** `npm run build` roda `tsc -b && vite build` e gera só HTML/JS/CSS
  estático — não existe servidor Node em runtime. Serve em qualquer host de estático/CDN
  (Vercel, Netlify, S3+CloudFront). Recomendação: **Vercel ou Netlify**, não S3 puro — os dois
  primeiros fazem deploy direto do Git sem precisar configurar bucket/policy/CDN na mão, o que
  economiza tempo real dado o prazo curto.
* **Backend (Spring Boot) e python-services (FastAPI):** os dois precisam de container de
  **longa duração**, não de função serverless efêmera. Motivo concreto encontrado no código: o
  `GenerateService.java` faz uma chamada **síncrona** (`RestTemplate.postForObject`) na cadeia
  Java → Python → OpenAI, tudo dentro da mesma thread de request — pool de conexão com o banco
  (HikariCP) e Tomcat embutido também não fazem sentido num ambiente que nasce e morre a cada
  chamada. Plataformas de container: Railway, Render, Fly.io (free tier) — AWS "de verdade"
  (ECS/EB/EC2) descartado pelo tempo disponível até a entrega.

## 2. `VITE_API_URL` é injetada em tempo de build — cuidado com o valor

O front lê a URL da API assim (`frontend/src/lib/api.ts`):
```ts
const API_URL = import.meta.env.VITE_API_URL || '/api'
```
Isso é resolvido **no build**, não em runtime. No desenvolvimento, o proxy do Vite encaminha
`/api` para `localhost:8080`. No Docker Compose, o Nginx do frontend também encaminha `/api`,
desta vez para `backend:8080`, então o caminho relativo funciona nos dois cenários locais.

Em uma hospedagem estática separada (Vercel/Netlify), esse Nginx não existe. Nesse caso,
`VITE_API_URL` precisa ser a URL pública **completa** do backend já deployado
(ex: `https://karta-backend.onrender.com`).

## 3. Ordem de deploy: 3 saltos, não 2

1. **`python-services` primeiro** → pega a URL pública dele.
2. **`backend`** → configura `PYTHON_SERVICE_URL` com a URL do passo 1 (hoje aponta pro nome
   interno do Compose, `http://python-services:8000`, que só existe dentro da mesma rede Docker
   local) → pega a URL pública do backend.
3. **`frontend` por último** → build com `VITE_API_URL` apontando pra URL do passo 2, só então
   deploy.

## 4. Gap crítico encontrado: CORS não existe hoje (mas só importa quando o front for deployado)

Não há **nenhuma** configuração de CORS no Spring (`grep` em `security`/`controller` não achou
nada). Em dev isso nunca aparece porque o proxy do Vite faz o browser enxergar tudo como
*same-origin*. Em produção, o front (`karta.vercel.app`) vai fazer `fetch` direto pra um domínio
diferente (`karta-backend.onrender.com`) — sem uma política de CORS liberando esse origin no
`SecurityConfigurations`, o browser bloqueia **toda** chamada. Precisa de um bean
`CorsConfigurationSource` + `.cors(...)` na security chain **antes** de tentar o deploy do front,
senão o sintoma ("URLs certos, mas nada funciona") só aparece depois de tudo já estar no ar.

> **Isso não bloqueia deployar só `backend` + `python-services` agora.** CORS é uma restrição
> imposta pelo *browser*, não existe pra chamadas via Postman/curl nem para a comunicação
> servidor-a-servidor entre os dois containers. Dá pra validar tudo (login, decks, geração via
> IA) direto nas URLs públicas com o `docs/API_CHEATSHEET.md`, sem esse fix, antes mesmo do front
> entrar em cena.

## 5. Imagem e áudio: decisão final — `bytea` no Postgres, sem bucket

Decisão revertida em relação ao que estava escrito aqui antes: **não tem mais bucket nenhum**
(nada de S3/R2/Backblaze). O grupo optou por guardar a mídia direto no Neon, como bytes.
Implementado e verificado no código de verdade:

* `python-services/main.py` já baixa a imagem do Pexels e gera os dois áudios (palavra e frase)
  via Edge-TTS, servindo tudo temporariamente por um diretório local (`tempfile.mkdtemp`) montado
  como `StaticFiles` em `/media` — só durante a janela da própria requisição.
* O Java (`GenerateService.java`) baixa esses bytes na hora (`RestTemplate.getForObject(url,
  byte[].class)`) e persiste direto nas colunas `image_data`, `audio_word_data`,
  `audio_sentence_data` (todas `BYTEA`, migration `V8__add_media_data_columns.sql`) — sem
  intermediário nenhum, sem credencial de bucket pra gerenciar.
* `FlashcardController` expõe `GET /flashcards/{id}/image`, `.../audio/word` e
  `.../audio/sentence`, servindo os bytes direto do Postgres com o `Content-Type` certo.
* Isso simplifica o deploy: **uma fonte de dados a menos pra provisionar** — só o Neon, nenhuma
  conta/bucket adicional, nenhuma credencial extra pra distribuir no grupo.

> **Atenção pro free tier do Neon:** mídia em `bytea` consome espaço de armazenamento bem mais
> rápido que texto — vale ficar de olho no limite de storage do plano gratuito do Neon se o
> grupo gerar muitos decks com imagem/áudio durante os testes, pra não estourar sem perceber.

> Continua valendo o ponto de performance: cada card gerado via IA passa por 3 chamadas externas
> antes de responder (busca+download da imagem no Pexels, síntese de áudio da palavra e da frase
> via Edge-TTS) — isso encadeado numa chamada já síncrona (`/decks/generate`) deixa a geração de
> um deck com vários cards perceptivelmente mais lenta. Vale testar com um tópico pequeno primeiro.

## 6. Plataforma recomendada

**Render** (free tier, Docker nativo, configuração via dashboard sem aprender CLI nova) pros dois
serviços (`backend` e `python-services`). Contrapartida conhecida: o serviço "dorme" depois de
inatividade e demora ~30-50s pra acordar no primeiro request — chato pro `backend` (afeta todo
mundo que abrir o site), tolerável pro `python-services` (só afeta quem clicar em "gerar deck com
IA", onde um spinner de espera já é esperado). Railway e Fly.io são alternativas, mas os termos de
free tier dos dois mudaram nos últimos tempos (Railway foi pra crédito de teste, Fly.io pede
cartão) — vale checar a página de pricing atual de cada um antes de se comprometer.

### `PORT` dinâmico — **já corrigido nos dois serviços**

Plataformas de container como Render/Railway/Fly.io **atribuem a porta dinamicamente** via env
var `PORT` no momento do deploy (às vezes não é a porta padrão do serviço) e esperam que o
processo escute exatamente ali — se o container ignora isso, o healthcheck da plataforma pode
nunca bater e o deploy falha. Localmente (via `docker-compose.yml`) isso nunca aparecia, porque o
compose já mapeia a mesma porta dos dois lados.

* **`python-services/Dockerfile`**: `CMD` trocado de *exec form* pra *shell form*
  (`CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`), que expande `$PORT` de verdade —
  antes era um array (`["uvicorn", ..., "--port", "8000"]`), que não expande variável nenhuma. O
  `HEALTHCHECK` interno também foi ajustado pra usar a mesma porta dinâmica. Contrapartida pequena
  do *shell form*: o Uvicorn passa a rodar como processo filho do `sh` (que vira o PID 1), então
  sinais de encerramento (`docker stop`/redeploy) podem não ser repassados tão rápido — aceitável
  pra escala desse projeto.
* **`backend/application.properties`**: adicionado `server.port=${PORT:8080}` — o Spring Boot não
  lia `PORT` de forma nenhuma antes disso, sempre subia fixo em 8080.
* Testado localmente (`docker compose up --build`) depois da mudança: os dois continuam subindo
  normalmente em 8080/8000 (sem `PORT` definida, cai no default de sempre) — nada quebrou pra
  quem só usa Docker Compose local.

---

## Checklist de execução

- [x] Trocar o `CMD` do `python-services/Dockerfile` para *shell form* com `${PORT:-8000}`.
- [x] Adicionar `server.port=${PORT:8080}` no `application.properties` do backend.
- [ ] Deploy do `python-services` no Render → anotar URL pública.
- [ ] Deploy do `backend` no Render, com `PYTHON_SERVICE_URL` apontando pra URL acima, e
  `backend/.env` (Neon) configurado nas env vars da plataforma → anotar URL pública.
- [ ] Testar via `docs/API_CHEATSHEET.md` direto nas URLs públicas (login, decks, geração via IA)
  — não depende do front nem de CORS.
- [ ] Adicionar configuração de CORS no `SecurityConfigurations` liberando o domínio do front —
  só precisa disso a partir daqui.
- [ ] Build do front com `VITE_API_URL` = URL pública do backend.
- [ ] Deploy do front (Vercel/Netlify).
- [ ] Teste ponta a ponta pelo navegador: login, listar decks, favoritar, gerar deck via IA.

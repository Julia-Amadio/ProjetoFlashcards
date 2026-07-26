# Checklist do que falta

Anotações soltas do que ainda está pendente, por módulo. Isso é só pra não esquecer no meio da
correria — pode virar cards num Trello (ou equivalente) quando o grupo organizar isso formalmente.

---

## Backend (Java / Spring Boot)

- [ ] Criar `Entity`, `Repository`, `DTOs`, `Service` e `Controller` de `flashcards`. A tabela já
  existe desde a migration V4, mas ainda não possui representação Java nem rotas HTTP.
- [ ] CRUD de `flashcards` (criar, editar, remover) restrito a `ROLE_ADMIN`, conforme o escopo do
  projeto (README, seção "Permissões e roles").
- [ ] Endpoint que dispara a geração via IA (`POST /decks/generate`), incluindo cliente HTTP para
  o `python-services` e DTO de validação antes de persistir — ver `ARCHITECTURE.md`, seção 7. A
  regra `.hasAuthority("ROLE_ADMIN")` já está no `SecurityConfigurations`.
- [ ] Implementar tratamento global de exceções (`@RestControllerAdvice`) para transformar
  `RuntimeException`, recursos inexistentes, conflitos de unicidade e erros de validação em
  respostas HTTP previsíveis. Hoje várias falhas de service chegam como `500` e as mensagens são
  ocultadas pelo `application.properties`.
- [ ] Decidir se `DELETE /users/{id}` será implementado ou se a regra atualmente reservada no
  `SecurityConfigurations` deve ser removida.
- [ ] Adicionar testes de controller/service/segurança. O projeto possui apenas o teste vazio de
  carregamento do contexto.

## Frontend (React / TypeScript)

- [ ] Integrar a tela de estudo com endpoints reais de flashcards. Hoje `/study/{id}` usa apenas
  os cartões de `frontend/src/data/decks.ts`, mesmo que o dashboard já liste decks do backend.
- [ ] Evitar que um deck retornado por `GET /decks` leve a uma sessão indisponível quando seu ID
  não existir nos dados demonstrativos.
- [ ] Trocar os favoritos locais (`localStorage`) pelas rotas
  `/users/{userId}/favorites`. Para isso, a sessão de login também precisa obter/guardar o UUID do
  usuário; hoje o login devolve somente o token e o frontend mantém apenas o e-mail.
- [ ] Persistir progresso e preferências no backend quando os respectivos modelos/rotas existirem.
  Por enquanto ambos ficam somente no dispositivo.
- [ ] Adicionar o frontend ao Docker Compose ou documentar o modelo de deploy separado quando essa
  decisão for tomada.
- [ ] Adicionar testes automatizados da interface e do cliente HTTP.

## python-services (Python / FastAPI)

- [ ] Conectar `llm_agent.py`, imagem e áudio ao `main.py`; hoje a FastAPI só expõe `GET /` e o
  pipeline completo existe apenas no script manual `test.py`.
- [ ] Endpoint real de geração de flashcards, devolvendo o payload JSON estruturado combinado com
  o Java (contrato descrito em `ARCHITECTURE.md`, seção 7).
- [ ] Alinhar os modelos Pydantic atuais, que variam por idioma, com o DTO único que será
  consumido pelo Java (camada 1 da validação em duas camadas).
- [ ] Adicionar `genanki` ao `requirements.txt`. `gerador_apkg.py` importa a biblioteca, mas uma
  instalação/container limpo não a possui hoje.
- [ ] Criar `.env.example` com `OPENAI_API_KEY` e `PEXELS_API_KEY`. Existe um `.env` local
  ignorado pelo Git, mas o Compose não o carrega no container Python.
- [ ] Revisar o uso do modelo `gpt-5`, limites de entrada, timeouts e respostas vazias antes de
  expor o pipeline como endpoint.
- [ ] Decidir se a exportação `.apkg` continuará no produto. Ela gera arquivos e mídias locais,
  enquanto a arquitetura principal descreve um serviço stateless que devolve JSON ao Java.
- [ ] Decidir se vale implementar o segredo compartilhado entre Java e Python (defesa em
  profundidade, ver "mudanças futuras" na seção 7 do `ARCHITECTURE.md`).
- [ ] Avaliar se vale a pena uma rota `/health` dedicada, já que hoje o healthcheck do Dockerfile
  bate na rota `/` genérica do stub.

## Infra / Docker

- [ ] Tornar `backend/.env` opcional para o cenário local ou versionar um
  `backend/.env.example`. Hoje o caminho continua obrigatório e, ao mesmo tempo, suas variáveis
  são sobrescritas pelo bloco `environment`; alinhar essa precedência para existir uma única
  fonte de configuração clara.
- [ ] Reavaliar se o container `postgres` precisa subir quando `DB_URL` aponta pro Neon. Hoje ele
  sempre sobe e participa do `depends_on`, mesmo quando não é utilizado.
- [ ] Reavaliar a exposição pública da porta `8000` do `python-services` antes de qualquer deploy
  real (já documentado como mudança futura na seção 7 do `ARCHITECTURE.md`, não aplicado ainda).
- [ ] Trocar os segredos de *fallback* (`password123` e `minha-chave-secreta`) em qualquer ambiente
  que não seja desenvolvimento local.

---

## ✅ Já concluídas

- PostgreSQL local com volume e healthcheck no Docker Compose, mantendo suporte a banco remoto via
  `DB_URL`.
- Autenticação JWT stateless com expiração de quatro horas e resposta de login em JSON
  (`LoginResponseDTO`).
- Cadastro, consulta e atualização de usuários com DTOs e validação.
- Regras de segurança para rotas públicas, Swagger, `ROLE_ADMIN` e acesso do dono do recurso.
- Endpoint de criação/listagem de decks (`POST`/`GET /decks`, `GET /decks/{id}`).
- Endpoints de adicionar, listar e remover favoritos no backend.
- Swagger UI/OpenAPI liberado sem token.
- Frontend com cadastro/login, expiração de sessão, catálogo real de decks, busca/filtro,
  tela de estudo demonstrativa e persistência local resiliente.

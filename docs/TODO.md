# Checklist do que falta

Anotações soltas do que ainda está pendente, por módulo. Isso é só pra não esquecer no meio da
correria — pode virar cards num Trello (ou equivalente) quando o grupo organizar isso formalmente.

---

## Backend (Java / Spring Boot)

_Sem pendências de código conhecidas_ — CRUD de decks/flashcards, geração via IA, mídia em
`bytea`, progresso de estudo e preferências, tudo implementado e verificado. Único ponto de
atenção: existe uma regra em `SecurityConfigurations` pra `DELETE /users/*` (ROLE_ADMIN), mas
esse endpoint **não existe** no `UserController` — config morta, sem efeito prático, mas vale
remover ou implementar o endpoint quando alguém for mexer ali.

## Frontend (React / TypeScript)

Esse é o gap real de hoje. O backend suporta tudo abaixo, mas a interface não chama nada disso:

- [ ] Tela/ação de admin para gerar deck via IA (`POST /decks/generate`).
- [ ] Telas de admin para CRUD de decks e flashcards (criar/editar/remover) — rotas já protegidas
  no backend, só faltam ser chamadas.
- [ ] Renderizar imagem e áudio dos flashcards (`GET /flashcards/{id}/image`, `.../audio/word`,
  `.../audio/sentence`) — hoje nenhum componente usa esses endpoints; a preferência
  `autoplayAudio` já existe em `UserPreferencesDTO` mas não tem áudio nenhum pra tocar ainda.
- [ ] Adicionar as funções correspondentes em `lib/api.ts` (nenhuma delas existe hoje).
- [ ] Adicionar o frontend ao Docker Compose ou documentar o modelo de deploy separado quando essa
  decisão for tomada.
- [ ] Adicionar testes automatizados da interface e do cliente HTTP.

## python-services (Python / FastAPI)

_Sem pendências de código conhecidas para uso local_ — ver `docs/DEPLOY.md` para o item do `PORT`,
que só importa na hora do deploy.

## Infra / Docker

- [ ] Reavaliar a exposição pública da porta `8000` do `python-services` antes de qualquer deploy
  real (documentado como mudança futura na seção 7 do `ARCHITECTURE.md`, não aplicado ainda).
- [ ] Avaliar (no audit de segurança pré-deploy) como as credenciais são expostas via env var: hoje
  `docker inspect`/`docker compose config` mostram os valores do `backend/.env` em texto puro pra
  quem tem acesso ao daemon do Docker. Considerar Docker secrets (`/run/secrets/` + `configtree` no
  Spring) ou deixar a plataforma de hospedagem injetar os segredos. Não é urgente enquanto for
  grupo + Neon.
- [ ] CORS não existe no Spring — só importa se o deploy (front e backend em domínios diferentes)
  realmente acontecer. Detalhado em `docs/DEPLOY.md`.

---

## ✅ Já concluídas

- Tratamento de exceção no `GlobalExceptionHandler`: login com credencial errada agora devolve
  `401` (antes era `500` genérico); falha na chamada ao `python-services` (erro devolvido por ele
  ou nem foi possível conectar) devolve `502` com o detalhe real, via nova `ExternalServiceException`
  lançada pelo `GenerateService`; JSON malformado no corpo e path variable com tipo errado (ex.:
  `/decks/abc/flashcards`) agora devolvem `400` em vez de `500`
- `OPENAI_API_KEY` conseguida e configurada — geração via IA agora usa o LLM de verdade, não só o
  `MOCK_RESPONSE`
- `PEXELS_API_KEY` adicionada ao `python-services/.env`
- `INTERNAL_SECRET` (base64, `openssl rand -base64 32`) gerado e compartilhado com o grupo pra
  ativar a validação do segredo compartilhado Java↔Python
- Variáveis de Ambiente e Infraestrutura no Docker Compose (db, JWT, portas, PYTHON_SERVICE_URL)
- Regras de Segurança no SecurityConfigurations (admin-only para GET /users, DELETE /users/**, POST /decks, POST /decks/generate)
- Endpoint de criação/listagem de decks (`POST`/`GET /decks`, `GET /decks/{id}`)
- Swagger UI/OpenAPI liberado sem token em dev
- `AuthenticationController.login` retorna token em JSON (`LoginResponseDTO`)
- Endpoint de geração via IA (`POST /decks/generate`) com integração Java ↔ Python (Pydantic + RestTemplate + persistência)
- CRUD de `flashcards` (criar, listar, editar, remover) restrito a `ROLE_ADMIN`
- Tela de estudo (`/study/{id}`) integrada aos endpoints reais de flashcards (`GET /decks/{id}` e
  `GET /decks/{id}/flashcards`), substituindo os dados estáticos de `frontend/src/data/decks.ts`
- Sessão de estudo não fica mais indisponível para um deck do `GET /decks` cujo ID não exista nos
  dados demonstrativos (consequência direta do ponto anterior)
- Favoritos via `/users/{userId}/favorites` (`GET`/`POST`/`DELETE`), com o login devolvendo e o
  frontend guardando o UUID do usuário além do token
- Progresso de estudo e preferências persistidos no backend (`/users/{userId}/study-progress/{deckId}`
  e `/users/{userId}/preferences`), substituindo o armazenamento local (`localStorage`)
- Endpoint real de geração de flashcards no `python-services` (`POST /generate`) com payload JSON
  estruturado alinhado ao contrato Java
- Validação da resposta do LLM com Pydantic no `python-services` (camada 1 da validação em duas camadas)
- ADR-0001: Mídia de flashcards armazenada como `bytea` no PostgreSQL (docs/adr/0001-media-storage.md)
- Migration `V8__add_media_data_columns.sql` (`image_data`, `audio_word_data`, `audio_sentence_data`,
  `image_mime_type`), `Flashcard.java` com os campos `byte[]` correspondentes
- `GenerateService` baixa a mídia das URLs temporárias do Python (`RestTemplate.getForObject(url, byte[].class)`)
  e persiste como bytes; `PythonDeckResponse` com `image_url`/`audio_word_url`/`audio_sentence_url`
- `FlashcardController` expõe `GET /flashcards/{id}/image`, `.../audio/word`, `.../audio/sentence`
  servindo os bytes direto do Postgres
- Adaptar `llm_agent.py` + `gerador_apkg.py` + `buscador_imagens.py` + `gerador_audio.py`
  para trabalharem via FastAPI com uma resposta unificada (multi-idioma: mandarim, inglês,
  francês, japonês) — Python baixa imagem (Pexels) e gera áudio (Edge-TTS), serve via `/media`
  temporário, Java baixa e persiste
- `.env.example` do `python-services` criado (`OPENAI_API_KEY`, `PEXELS_API_KEY`,
  `INTERNAL_SECRET`, `PORT`)
- Segredo compartilhado (`INTERNAL_SECRET`/`X-Internal-Token`) implementado nos dois lados —
  validação opcional no Python (`modulos/internal_auth.py`), envio condicional no
  `GenerateService.java`
- Rota `GET /health` dedicada no `python-services`, dissociada da rota genérica `/`

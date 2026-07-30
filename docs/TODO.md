# Checklist do que falta

Anotações soltas do que ainda está pendente, por módulo. Isso é só pra não esquecer no meio da
correria — pode virar cards num Trello (ou equivalente) quando o grupo organizar isso formalmente.

---

## Backend (Java / Spring Boot)

_Nenhuma task pendente no backend._

## Frontend (React / TypeScript)

- [ ] Adicionar o frontend ao Docker Compose ou documentar o modelo de deploy separado quando essa
  decisão for tomada.
- [ ] Adicionar testes automatizados da interface e do cliente HTTP.

## python-services (Python / FastAPI)


## Backend (Java / Spring Boot) — como consequência do item acima

- [ ] Adicionar colunas `bytea` à entidade `Flashcard` (via Flyway) para armazenar imagem e áudio
- [ ] Criar endpoints `GET /flashcards/{id}/image`, .../audio/word, .../audio/sentence
- [ ] Atualizar `GenerateService` para baixar a mídia das URLs do Python e salvar como bytes
- [ ] Atualizar `PythonDeckResponse` e `GenerateResponse` para o novo formato unificado
- [ ] Adicionar `image_mime_type` à entidade `Flashcard`

## Infra / Docker

- [ ] Reavaliar a exposição pública da porta `8000` do `python-services` antes de qualquer deploy
  real (já documentado como mudança futura na seção 6 do `ARCHITECTURE.md`, não aplicado ainda).
- [ ] Avaliar (no audit de segurança pré-deploy) como as credenciais são expostas via env var: hoje
  `docker inspect`/`docker compose config` mostram os valores do `backend/.env` em texto puro pra
  quem tem acesso ao daemon do Docker. Considerar Docker secrets (`/run/secrets/` + `configtree` no
  Spring) ou deixar a plataforma de hospedagem injetar os segredos. Não é urgente enquanto for
  grupo + Neon.

---

## ✅ Já concluídas

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
- Adaptar `llm_agent.py` + `gerador_apkg.py` + `buscador_imagens.py` + `gerador_audio.py`
  para trabalharem via FastAPI com uma resposta unificada. Direção decidida:
  - Resposta unificada (genérica, não específica por idioma)
  - Python baixa imagem (Pexels) e gera áudio (Edge-TTS) inline
  - Retorna URLs temporárias de mídia no JSON
  - Java faz download dos bytes e armazena em bytea no PostgreSQL (ver ADR-0001)
- `.env`/`.env.example` próprio do serviço (`env_file` no compose e funcionando).  
- Segredo compartilhado entre Java e Python implementado.
- Rota `/health` dedicada adicionada.
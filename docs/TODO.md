# Checklist do que falta

Anotações soltas do que ainda está pendente, por módulo. Isso é só pra não esquecer no meio da
correria — pode virar cards num Trello (ou equivalente) quando o grupo organizar isso formalmente.

---

## Backend (Java / Spring Boot)

_Nenhuma task pendente no backend._

## python-services (Python / FastAPI)

- [ ] Refatoração geral do módulo — hoje é só o stub de `main.py`; `buscador_imagens.py`,
  `gerador_audio.py` e `llm_agent.py` são herdados e ainda não estão conectados a nada.
- [ ] Endpoint real de geração de flashcards, devolvendo o payload JSON estruturado combinado com
  o Java (contrato descrito em `ARCHITECTURE.md`, seção 6).
- [ ] Validação da resposta do LLM com Pydantic (camada 1 da validação em duas camadas).
- [ ] `.env`/`.env.example` próprio do serviço (hoje não existe nenhum — o `env_file` no compose
  foi marcado como opcional só pra não travar o build enquanto isso).
- [ ] Decidir se vale implementar o segredo compartilhado entre Java e Python (defesa em
  profundidade, ver "mudanças futuras" na seção 6 do `ARCHITECTURE.md`).
- [ ] Avaliar se vale a pena uma rota `/health` dedicada, já que hoje o healthcheck do Dockerfile
  só bate na rota `/` genérica do stub.

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

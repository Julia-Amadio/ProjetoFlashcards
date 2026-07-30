# 🗂️ Karta

Aplicação de Flashcards desenvolvida para auxiliar nos estudos através da criação e revisão de
cartões de memorização. O projeto possui autenticação JWT, gerenciamento de usuários, catálogo de
decks e flashcards (com CRUD completo para administradores), geração de decks via IA, favoritos,
progresso de estudo e preferências — tudo persistido no backend.

> ⚠️ **Aviso:** este projeto ainda está em **desenvolvimento**. O que falta hoje é
> majoritariamente frontend: telas de admin para gerar deck via IA e gerenciar decks/flashcards, e
> a renderização de imagem/áudio dos cards gerados. Veja `docs/TODO.md` para o detalhamento.

---

## Stack

* **React 19**, **TypeScript** e **Vite 5**
* **Java 21**
* **Spring Boot 4.0.5** (Web MVC, Data JPA, Security)
* **PostgreSQL** (hospedado na nuvem via Neon — não existe Postgres local em nenhum cenário)
* **Flyway** (migrations)
* **Maven** (build tool)
* **Springdoc OpenAPI (Swagger)** (documentação)
* **FastAPI** e **Python 3.12** (serviço de IA: geração de texto via LLM, imagem via Pexels e
  áudio via Edge-TTS)

> Nota: este projeto foi desenhado sem a utilização do Lombok, priorizando a transparência
> no tempo de compilação.

---

## Permissões e roles

O sistema utiliza o Spring Security para proteger as rotas.
Existem atualmente dois níveis de acesso (*roles*):

* **`ROLE_USER` (Estudante):** usuário padrão do sistema. Pode visualizar decks, consultar e
  alterar os próprios dados e gerenciar sua coleção de favoritos.
* **`ROLE_ADMIN` (Administrador):** além das permissões acima, pode listar todos os usuários,
  criar/editar/remover decks e flashcards, e gerar decks automaticamente via IA
  (`POST /decks/generate`).

---

## Como Executar - Aplicação completa (Docker Compose)

Backend e serviço Python sobem via Docker Compose, direto contra o banco na nuvem (Neon). Não é
necessário ter Java, Maven, PostgreSQL ou Python instalados na máquina, só o Docker. O build das
imagens acontece dentro dos containers.

### Pré-requisitos

* [Docker Desktop](https://www.docker.com/products/docker-desktop) (ou Docker Engine + Compose
  plugin), já rodando na máquina;
* **Git** para clonar o repositório;
* Um arquivo `backend/.env` com as credenciais do Neon (peça no grupo — não é commitado, ver
  `.gitignore`): `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.
* Um arquivo `python-services/.env` a partir do `python-services/.env.example`: `OPENAI_API_KEY`,
  `PEXELS_API_KEY`, `INTERNAL_SECRET` (combine o mesmo valor com o grupo), `PORT`.

### 1) Clone o repositório

```bash
git clone https://github.com/Julia-Amadio/ProjetoFlashcards.git
cd ProjetoFlashcards
```

### 2) Suba os containers

```bash
docker compose up -d --build
```
O `application.properties` só sabe conectar no banco se existir um `backend/.env` com `DB_URL`,
`DB_USERNAME` e `DB_PASSWORD` — sem ele, o backend não sobe (ver `docs/ARCHITECTURE.md`, seção 1).

Depois de subir, os serviços ficam disponíveis em:

* Backend (Spring Boot): `http://localhost:8080`
* Swagger UI: `http://localhost:8080/swagger-ui/index.html` (liberado sem token em dev)
* Python Services (FastAPI): `http://localhost:8000`

Exemplos de requisição para todas as rotas implementadas estão em `docs/API_CHEATSHEET.md`.

### 3) Encerrando a aplicação

```bash
docker compose down
```

---

## Como Executar - Frontend React

O frontend fica em `frontend/` e roda fora do Compose atual:

```bash
cd frontend
npm install
npm run dev
```

O Vite abre em `http://localhost:5173` e encaminha `/api` ao backend em
`http://localhost:8080`. Para outro servidor, copie `.env.example` para `.env` e ajuste
`VITE_API_URL` (em build de produção, precisa ser a URL pública completa do backend — ver
`docs/DEPLOY.md`).

```bash
npm run lint
npm run build
```

Cadastro, login (com sessão JWT persistida), catálogo de decks, tela de estudo, favoritos,
progresso de revisão e preferências já são integrados ao backend real — nada disso usa mais
dados estáticos ou `localStorage` como fonte de verdade. O que ainda falta no frontend (geração
de deck via IA, CRUD de admin, exibição de imagem/áudio dos cards) está detalhado em
`docs/TODO.md`.

---

## Documentação auxiliar

* `docs/ARCHITECTURE.md`: arquitetura, responsabilidades, persistência e integração técnica do
  serviço de geração;
* `docs/API_CHEATSHEET.md`: cURL/Postman de todas as rotas HTTP já implementadas;
* `docs/DEPLOY.md`: plano e decisões para uma tentativa de deploy (opcional, não exigido);
* `docs/TODO.md`: pendências reais, separadas por módulo.

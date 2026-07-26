# 🗂️ Karta

Aplicação de Flashcards desenvolvida para auxiliar nos estudos através da criação e revisão de
cartões de memorização. O projeto já possui autenticação JWT, gerenciamento de usuários, catálogo
de decks, favoritos e uma primeira experiência de revisão no frontend.

> ⚠️ **Aviso:** este projeto ainda está em **desenvolvimento**. O catálogo já vem do backend, mas
> os cartões usados na tela de estudo, o progresso, as preferências e os favoritos da interface
> continuam salvos localmente no navegador. A integração completa com flashcards e IA ainda faz
> parte do escopo em andamento.

---

## Stack

* **React 19**, **TypeScript** e **Vite 5**
* **Java 21**
* **Spring Boot 4.0.5** (Web MVC, Data JPA, Security)
* **PostgreSQL 15** (container local por padrão, com possibilidade de usar Neon via variáveis)
* **Flyway** (migrations)
* **Maven** (build tool)
* **Springdoc OpenAPI (Swagger)** (documentação)
* **FastAPI** e **Python 3.12** (serviço de IA ainda em integração)

> Nota: este projeto foi desenhado sem a utilização do Lombok, priorizando a transparência
> no tempo de compilação.

---

## Permissões e roles

O sistema utiliza o Spring Security para proteger as rotas.
Existem atualmente dois níveis de acesso (*roles*):

* **`ROLE_USER` (Estudante):** usuário padrão do sistema. Pode visualizar decks, consultar e
  alterar os próprios dados e gerenciar sua coleção de favoritos.
* **`ROLE_ADMIN` (Administrador):** além das permissões acima, pode listar todos os usuários e
  criar decks. A rota planejada de geração via IA também já está reservada para essa role, mas
  ainda não possui controller.

---

## Como Executar - Aplicação completa (Docker Compose)

Backend, PostgreSQL local e serviço Python sobem via Docker Compose. Não é necessário ter Java,
Maven, PostgreSQL ou Python instalados na máquina para esse cenário, só o Docker. O build das
imagens acontece dentro dos containers.

### Pré-requisitos

* [Docker Desktop](https://www.docker.com/products/docker-desktop) (ou Docker Engine + Compose
  plugin), já rodando na máquina;
* **Git** para clonar o repositório;
* Um arquivo `backend/.env`. O caminho é obrigatório no Compose atual, mesmo que as variáveis
  efetivamente usadas sejam definidas pelos *fallbacks* do próprio `docker-compose.yml`.

Para desenvolvimento local, o arquivo pode conter:

```env
DB_URL=jdbc:postgresql://postgres:5432/flashcards_db
DB_USERNAME=flashcards_admin
DB_PASSWORD=password123
JWT_SECRET=troque-por-uma-chave-longa-e-aleatoria
```

> **Atenção à precedência do Compose:** as credenciais do Neon distribuídas em
> `backend/.env`, sozinhas, **não são usadas pelo backend no estado atual**. O bloco
> `environment` do serviço `backend` tem precedência e injeta o endereço local
> `jdbc:postgresql://postgres:5432/flashcards_db`. Na prática, executar apenas
> `docker compose up` faz a aplicação usar o PostgreSQL local. O Neon só é usado se
> `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET` estiverem definidos no ambiente do shell
> ou em um arquivo `.env` na raiz do projeto (não commitado). Mesmo nesse cenário, o container
> local do PostgreSQL continua subindo por causa do `depends_on`, embora não receba as consultas
> do backend.

### 1) Clone o repositório

```bash
git clone https://github.com/Julia-Amadio/ProjetoFlashcards.git
cd ProjetoFlashcards
```

### 2) Suba os containers

```bash
docker compose up -d --build
```

Depois de subir, os serviços ficam disponíveis em:

* Backend (Spring Boot): `http://localhost:8080`
* Swagger UI: `http://localhost:8080/swagger-ui/index.html`
* Python Services (FastAPI): `http://localhost:8000`
* PostgreSQL local: `localhost:5434`

O Swagger/OpenAPI está liberado sem token. Já a rota raiz do serviço Python responde apenas
`{"status":"AI Service running"}`; o endpoint de geração ainda não foi conectado ao FastAPI.

Exemplos de requisição para todas as rotas implementadas estão em `docs/API_CHEATSHEET.md`.

### 3) Encerrando a aplicação

```bash
docker compose down
```

O volume `postgres_data` preserva os dados entre reinicializações. `docker compose down -v`
também remove esse volume e, portanto, apaga o banco local — use apenas quando essa for realmente
a intenção.

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
`VITE_API_URL`.

```bash
npm run lint
npm run build
```

O cadastro e o login são integrados ao Spring, com sessão JWT persistida e encerramento
automático após a expiração do token. O dashboard consulta os decks reais da API e permite
busca por título/idioma e filtro por dificuldade.

> **Estado atual da tela de estudo:** os decks e cartões demonstrativos de
> `frontend/src/data/decks.ts` continuam sendo usados em `/study/{id}`. Por isso, um deck listado
> pelo backend só abre uma sessão se seu ID também existir nesse arquivo. Favoritos, preferências
> e progresso de revisão ficam no `localStorage`, separados pelo e-mail da sessão.

---

## Documentação auxiliar

* `docs/ARCHITECTURE.md`: arquitetura, responsabilidades, persistência e fluxo planejado da IA;
* `docs/API_CHEATSHEET.md`: cURL/Postman de todas as rotas HTTP já implementadas;
* `docs/TODO.md`: pendências reais, separadas por módulo.

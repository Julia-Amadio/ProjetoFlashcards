# 🗂️ Karta

Este é o backend da aplicação de Flashcards, um sistema desenvolvido para auxiliar nos estudos 
através da criação e revisão de cartões de memorização. A proposta é oferecer uma API RESTful 
completa, com autenticação, gerenciamento de usuários e controle de permissões.

> ⚠️ **Aviso:** este projeto está atualmente na fase inicial de **desenvolvimento e arquitetura**. 
> As funcionalidades listadas abaixo representam o escopo proposto 
> para a versão final da aplicação.

---

## Frontend React

O primeiro fluxo do frontend está em `frontend/`, construído com React, TypeScript e Vite. Inclui
cadastro e login integrados ao Spring, sessão JWT persistida, dashboard responsivo, favoritos locais
e uma demonstração da experiência de revisão. Os decks demonstrativos ficam isolados em
`frontend/src/data/decks.ts` até a API disponibilizar controllers de decks e flashcards.

```bash
cd frontend
npm install
npm run dev
```

O Vite abre em `http://localhost:5173` e encaminha `/api` ao backend em `http://localhost:8080`.
Para outro servidor, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

```bash
npm run lint
npm run build
```

---

## Stack

* **Java 21**
* **Spring Boot 4.0.5** (Web, Data JPA, Security)
* **PostgreSQL 17** (hospedado na nuvem via Neon)
* **Flyway** (migrations)
* **Maven** (build tool)
* **Springdoc OpenAPI (Swagger)** (documentação)

> Nota: este projeto foi desenhado sem a utilização do Lombok, priorizando a transparência 
> no tempo de compilação.

---

## Permissões e roles

O sistema utiliza o Spring Security para proteger as rotas. 
Existem atualmente dois níveis de acesso (*roles*):

* **`ROLE_USER` (Estudante):** usuário padrão do sistema. Tem permissão para gerenciar sua 
coleção de flashcards, podendo visualizar, interagir e favoritar decks que já existem no 
banco da aplicação.
* **`ROLE_ADMIN` (Administrador):** possui acesso total ao sistema. Pode gerenciar usuários, 
visualizar métricas globais e intervir em qualquer conteúdo cadastrado, além de utilizar
a ferramenta de IA para a geração de flashcards e decks dentro do banco da aplicação.

---

## Como Executar - Frontend React

O primeiro fluxo do frontend está em `frontend/`, construído com React, TypeScript e Vite. Inclui
cadastro e login integrados ao Spring, sessão JWT persistida, dashboard responsivo, favoritos locais
e uma demonstração da experiência de revisão. Os decks demonstrativos ficam isolados em
`frontend/src/data/decks.ts` até a API disponibilizar controllers de decks e flashcards.

```bash
cd frontend
npm install
npm run dev
```

O Vite abre em `http://localhost:5173` e encaminha `/api` ao backend em `http://localhost:8080`.
Para outro servidor, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

```bash
npm run lint
npm run build
```

---

## Como Executar - Backend Spring Boot + python-services (Docker Compose)

Backend e serviço de IA sobem **inteiramente via Docker Compose**, direto contra o banco
PostgreSQL na nuvem (Neon) — não existe mais um Postgres local via Compose. Não é necessário ter
Java, Maven ou Python instalados na máquina para rodar o projeto, só o Docker. O build de cada
imagem (Maven, empacotamento do `.jar`, dependências Python) acontece dentro dos containers.

### Pré-requisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (ou Docker Engine + Compose plugin), já rodando na máquina;
* **Git** para clonar o repositório;
* Um arquivo `backend/.env` com as credenciais do banco Neon (peça no grupo — não é commitado,
  ver `.gitignore`).

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
`DB_USERNAME` e `DB_PASSWORD` — sem ele, o backend não sobe (ver detalhamento em
`docs/ARCHITECTURE.md`, seção 1.1).

Depois de subir, os serviços ficam disponíveis em:
* Backend (Spring Boot): `http://localhost:8080`
* Swagger UI: `http://localhost:8080/swagger-ui/index.html` — hoje exige um Bearer token válido
  no cabeçalho pra abrir, já que `SecurityConfigurations` ainda não libera essa rota
  explicitamente (cai no `.anyRequest().authenticated()`)
* Python Services (FastAPI): `http://localhost:8000`

Exemplos de requisição para testar as rotas já implementadas estão em
`docs/API_CHEATSHEET.md`.

> ⚠️ Como todo mundo aponta pro mesmo banco Neon, tome cuidado com dados de teste alheios. Se
> alguém sujar o banco de um jeito difícil de reverter, a saída combinada é recriar uma instância
> nova no Neon e redistribuir as credenciais — não tem instância local pra isolar esse risco.

### 3) Encerrando a aplicação
```bash
docker compose down
```

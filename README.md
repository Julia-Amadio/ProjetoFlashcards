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
* **PostgreSQL 15** (via Docker)
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

Backend e serviço de IA sobem **inteiramente via Docker Compose** — não é necessário ter Java,
Maven ou Python instalados na máquina para rodar o projeto, só o Docker. O build de cada imagem
(Maven, empacotamento do `.jar`, dependências Python) acontece dentro dos containers.

### Pré-requisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (ou Docker Engine + Compose plugin), já rodando na máquina;
* **Git** para clonar o repositório.

### 1) Clone o repositório
```bash
git clone https://github.com/Julia-Amadio/ProjetoFlashcards.git
cd ProjetoFlashcards
```

### 2) Escolha o cenário: desenvolvimento ou produção
Existem dois arquivos Compose na raiz do projeto, cada um resolvendo o banco de dados de um jeito
diferente (detalhamento completo em `docs/ARCHITECTURE.md`, seção 1.1):

| Cenário | Comando | Banco de dados |
|---|---|---|
| **Dev/homologação** (padrão) | `docker compose up -d --build` | PostgreSQL local, subido pelo próprio Compose na porta **5434** |
| **Produção** (ou testar contra o banco real) | `docker compose -f docker-compose.yml up -d --build` | PostgreSQL na nuvem (Neon), via credenciais do `backend/.env` |

O modo dev é o **padrão**: rodando `docker compose up` sem `-f`, o Docker Compose mescla
automaticamente o `docker-compose.override.yml` por cima do `docker-compose.yml`, subindo um
banco local descartável — nenhum `.env` é necessário nesse cenário. Já o modo produção precisa do
`-f docker-compose.yml` explícito (isso ignora o override) **e** de um `backend/.env` com as
credenciais do Neon; sem esse arquivo, o backend não sabe como conectar no banco de produção.

Depois de subir, os serviços ficam disponíveis em:
* Backend (Spring Boot): `http://localhost:8080`
* Swagger UI: `http://localhost:8080/swagger-ui/index.html` — hoje exige um Bearer token válido
  no cabeçalho pra abrir, já que `SecurityConfigurations` ainda não libera essa rota
  explicitamente (cai no `.anyRequest().authenticated()`)
* Python Services (FastAPI): `http://localhost:8000`
* PostgreSQL local (só no cenário dev): `localhost:5434`

Exemplos de requisição para testar as rotas já implementadas estão em
`docs/API_CHEATSHEET.md`.

### 3) Encerrando a aplicação
```bash
docker compose down
```
Use a mesma flag (`-f docker-compose.yml`) que você usou para subir, caso queira ter certeza de
que está derrubando exatamente o conjunto de containers esperado.

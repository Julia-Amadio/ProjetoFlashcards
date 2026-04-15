# 🗂️ Projeto Flashcards - Backend

Este é o backend da aplicação de Flashcards, um sistema desenvolvido para auxiliar nos estudos 
através da criação e revisão de cartões de memorização. A proposta é oferecer uma API RESTful 
completa, com autenticação, gerenciamento de usuários e controle de permissões.

> ⚠️ **Aviso:** este projeto está atualmente na fase inicial de **desenvolvimento e arquitetura**. 
> As funcionalidades listadas abaixo representam o escopo proposto 
> para a versão final da aplicação.

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

## Como executar localmente

Siga o passo a passo abaixo para rodar o projeto na sua máquina.

### Pré-requisitos
* [Java (JDK 21)](https://www.oracle.com/br/java/technologies/downloads/#java21);
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (o mesmo precisa já estar rodando na máquina antes da 
inicialização do *backend* com Spring Boot);
* **Git** para clonar o repositório.

### 1) Setup da instância local PostgreSQL + backend

Para garantir que todos os desenvolvedores utilizem a mesma versão do banco sem conflitos de
porta na máquina local, utilizamos o Docker Compose. O banco será exposto na porta **5434**.

1.  **Clone o repositório e navegue até a pasta do backend:**
    ```bash
    git clone https://github.com/Julia-Amadio/ProjetoFlashcards.git
    cd ProjetoFlashcards/backend
    ```
2.  **Inicie o Banco de Dados local (PostgreSQL):**

    Suba o contêiner do banco de dados na porta 5434.
    ```bash
    docker-compose up -d
    ```
3.  **Execute a aplicação Spring Boot:**

    Utilize o Maven Wrapper para baixar as dependências, compilar e rodar o projeto. 
    O Flyway detectará o banco zerado e criará as tabelas automaticamente.

    *No Windows:*
    ```bash
    .\mvnw spring-boot:run
    ```
    *No Linux/Mac:*
    ```bash
    ./mvnw spring-boot:run
    ```
    
### 2) Encerrando a aplicação

Quando terminar de testar, você pode derrubar os serviços da seguinte forma:

1. **Backend:**

   Pressione `Ctrl + C` no terminal onde a aplicação Spring Boot está rodando.

2. **Banco de Dados:**

   No terminal, dentro da pasta `backend`, execute o comando abaixo para parar e 
   remover o contêiner do Docker:
   ```bash
   docker-compose down
   ```

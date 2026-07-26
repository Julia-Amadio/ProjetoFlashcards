# Cheat sheet de requisições HTTP (cURL + Postman)

Guia com exemplos prontos de requisição para todas as rotas **já implementadas** do backend,
tanto para testes rápidos via terminal (cURL) quanto via Postman. Os corpos de requisição JSON
aqui especificados são os mesmos nos dois casos — a única diferença real de um pro outro está em
como o *Bearer Token* é passado, explicado logo abaixo.

> Este documento cobre apenas rotas que já existem no código. O CRUD de `flashcards` e a rota de
> geração via IA (`POST /decks/generate`) ainda não existem — ver `ARCHITECTURE.md`, seção 7,
> para o desenho planejado dessa integração.

---

# IMPORTANTE: Uso do *Bearer Token*
Com exceção de `POST /login`, `POST /users` e das páginas do Swagger/OpenAPI, todas as rotas
abaixo são protegidas e exigem um *bearer token* (JWT) válido no cabeçalho de autorização.

### Em requisições usando cURL
Os cabeçalhos (`-H`) precisam ser construídos manualmente. Para obter o token, faça login primeiro:
```bash
curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"email":"myemail@example.com", "password":"Password123!@#"}'
```
Se as credenciais forem válidas, o terminal retorna um objeto JSON no formato:
```json
{"token":"eyJ..."}
```
Copie apenas o valor de `token` e insira em
`-H "Authorization: Bearer SEU-TOKEN-AQUI"` nas rotas protegidas. Não esqueça da palavra
`Bearer` antes do token, separada por um espaço.

### Em requisições usando Postman
O JWT presente no campo `token` da resposta de `POST http://localhost:8080/login` deve ser
inserido na guia `Authorization` antes de realizar requisições protegidas. Selecione
`Bearer Token` no dropdown `Auth Type` e cole o token (sem a palavra `Bearer`, o Postman já
adiciona isso por você).
[![token-Demonstration.png](https://i.postimg.cc/RhLQN9pT/token-Demonstration.png)](https://postimg.cc/zH3RQmrL)

---

# `login` — Autenticação

## Login (`POST /login`)
Rota pública. Gera o *bearer token* usado em todas as outras rotas.
```bash
curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"email":"myemail@example.com", "password":"Password123!@#"}'
```
Resposta: `200 OK` com `LoginResponseDTO` (`{"token":"..."}`). O token identifica o usuário pelo
e-mail, usa o issuer `auth-api` e expira quatro horas após a criação. Credenciais inválidas
retornam erro de autenticação.

---

# `users` — Usuários

## Cadastrar um novo usuário (`POST /users`)
Rota pública — é assim que qualquer pessoa vira `ROLE_USER`.

*Constraints* (`UserCreateDTO`):
* **Nenhum** campo pode ser vazio;
* O **nome** deve ter entre 3 e 50 caracteres, ser único e só pode conter letras, números, ponto,
  traço e underline (`^[a-zA-Z0-9._-]+$`);
* O **e-mail** deve ter formato válido e ser único;
* A **senha** deve ter no mínimo 8 caracteres, com ao menos uma maiúscula, uma minúscula e um
  número (`^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$`).
```bash
curl -X POST http://localhost:8080/users \
     -H "Content-Type: application/json" \
     -d '{
           "name": "name_example",
           "email": "myemail@example.com",
           "password": "Password123!@#"
         }'
```
Resposta: `201 Created` com `UserResponseDTO` (`id`, `name`, `email`, `role`, `createdAt` — nunca
o hash da senha).

## Listar todos os usuários (`GET /users`)
Exige token de **Administrador** (`ROLE_ADMIN`) no cabeçalho — usuário comum recebe `403`.
```bash
curl -X GET http://localhost:8080/users \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` com uma lista de `UserResponseDTO`.

## Buscar usuário específico por `UUID` (`GET /users/{id}`)
Substitua `SEU-UUID-AQUI` pelo UUID real de um usuário. Exige que o token pertença ao
**próprio usuário** ou a um `ROLE_ADMIN` (ver `SecurityUtils.validatePermissions`) — qualquer
outra combinação retorna `403`.
```bash
curl -X GET http://localhost:8080/users/SEU-UUID-AQUI \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` com `UserResponseDTO`, ou `404 Not Found` se o usuário não existir.

## Atualizar usuário por `UUID` (`PUT /users/{id}`)
Mesma regra de permissão do endpoint acima (dono do recurso ou `ROLE_ADMIN`). Todos os campos são
opcionais — envie só o que quiser alterar (`null`/omitido mantém o valor atual). Nome e e-mail
continuam sujeitos às regras de unicidade; senha, nome e e-mail enviados são validados com as
mesmas restrições do cadastro.
```bash
curl -X PUT http://localhost:8080/users/SEU-UUID-AQUI \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI" \
     -d '{ "name": "newname_example", "email": "newemail@example.com" }'
```
> O `-H` do `Content-Type` deve ser mantido para especificar o tipo do corpo da requisição, e NUNCA
> deve ser substituído pelo do Bearer Token — é possível (e necessário) usar os dois `-H` na mesma
> chamada. A ordem entre eles não importa para o servidor.

> **NOTA:** apesar de existir uma regra administrativa para `DELETE /users/**` no
> `SecurityConfigurations`, nenhum método `@DeleteMapping` foi implementado no
> `UserController`. Portanto, exclusão de usuário ainda não é uma rota disponível.

---

# `decks` — Catálogo de decks

As respostas das três rotas usam `DeckSummaryDTO`: `id`, `title`, `language` e
`difficultyLevel`. Descrição, autor e data de criação são persistidos, mas não aparecem nesse DTO.

## Criar um deck (`POST /decks`)
Exige token de **Administrador** (`ROLE_ADMIN`). O autor não é enviado no JSON: o backend usa o
usuário autenticado no token.

*Constraints* (`DeckCreateDTO`):
* `title` é obrigatório e possui no máximo 100 caracteres;
* `language` é obrigatório e possui no máximo 50 caracteres;
* `description` é opcional e não possui limite definido no DTO;
* `difficultyLevel` é opcional e possui no máximo 50 caracteres.
```bash
curl -X POST http://localhost:8080/decks \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_ADMIN_AQUI" \
     -d '{
           "title": "Inglês para viagens",
           "description": "Vocabulário para aeroporto e hotel.",
           "language": "Inglês",
           "difficultyLevel": "Iniciante"
         }'
```
Resposta: `201 Created` com o `DeckSummaryDTO` do deck criado.

## Listar todos os decks (`GET /decks`)
Aceita qualquer token válido. A busca não possui paginação, ordenação ou filtros no backend.
```bash
curl -X GET http://localhost:8080/decks \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` com uma lista de `DeckSummaryDTO`.

## Buscar deck por ID (`GET /decks/{id}`)
Aceita qualquer token válido.
```bash
curl -X GET http://localhost:8080/decks/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` com `DeckSummaryDTO`. ID inexistente dispara o erro
`Deck não encontrado`; como o projeto ainda não possui tratamento global de exceções e oculta
mensagens de erro no `application.properties`, esse caso atualmente chega ao cliente como erro
do servidor sem a mensagem interna.

---

# `users/{userId}/favorites` — Decks favoritos

Todas as rotas abaixo seguem a mesma regra de permissão de `/users/{id}`: o token precisa pertencer
ao próprio `userId` da URL, ou ser de um `ROLE_ADMIN`.

## Favoritar um deck (`POST /users/{userId}/favorites/{deckId}`)
```bash
curl -X POST http://localhost:8080/users/SEU-UUID-AQUI/favorites/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` sem corpo. Chamar novamente com o mesmo `deckId` mantém um único vínculo porque
a coleção é um `Set` e a tabela usa chave primária composta. O usuário e o deck precisam existir.

## Listar decks favoritos (`GET /users/{userId}/favorites`)
```bash
curl -X GET http://localhost:8080/users/SEU-UUID-AQUI/favorites \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` com uma lista de `DeckSummaryDTO`.

## Remover um deck dos favoritos (`DELETE /users/{userId}/favorites/{deckId}`)
```bash
curl -X DELETE http://localhost:8080/users/SEU-UUID-AQUI/favorites/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `204 No Content` em caso de sucesso. Se o deck não estiver nos favoritos do usuário,
o service dispara `Este deck não está nos favoritos do usuário`; a observação sobre ausência de
tratamento global de exceções também se aplica aqui.

---

# `python-services` — Estado atual

O serviço FastAPI fica na porta `8000`, mas hoje só expõe uma rota:
```bash
curl http://localhost:8000/
```
Resposta: `200 OK` com `{"status":"AI Service running"}`. Essa mesma rota é usada pelo
`HEALTHCHECK` da imagem. Os módulos de geração ainda não estão expostos por HTTP.

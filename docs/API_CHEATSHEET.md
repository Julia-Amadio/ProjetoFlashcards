# Cheat sheet de requisições HTTP (cURL + Postman)

Guia com exemplos prontos de requisição para todas as rotas **já implementadas** do backend,
tanto para testes rápidos via terminal (cURL) quanto via Postman. Os corpos de requisição JSON
aqui especificados são os mesmos nos dois casos — a única diferença real de um pro outro está em
como o *Bearer Token* é passado, explicado logo abaixo.

> Este documento cobre apenas rotas que já existem no código. Rotas de `decks` (criação, listagem)
> e da IA (`python-services`) ainda não existem — ver `ARCHITECTURE.md`, seção 6, para o desenho
> planejado da geração de flashcards.

---

# IMPORTANTE: Uso do *Bearer Token*
Com exceção de `POST /login` e `POST /users`, todas as rotas abaixo são protegidas e exigem um
*bearer token* (JWT) válido no cabeçalho de autorização.

### Em requisições usando cURL
Os cabeçalhos (`-H`) precisam ser construídos manualmente. Para obter o token, faça login primeiro:
```bash
curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"email":"myemail@example.com", "password":"Password123!@#"}'
```
Se as credenciais forem válidas, o **terminal retorna o token puro** (sem aspas/JSON). Copie e
insira em `-H "Authorization: Bearer SEU-TOKEN-AQUI"` nas rotas protegidas. Não esqueça da palavra
`Bearer` antes do token, separada por um espaço.

### Em requisições usando Postman
O JWT retornado por `POST http://localhost:8080/login` deve ser inserido na guia `Authorization`
antes de realizar requisições protegidas. Selecione `Bearer Token` no dropdown `Auth Type` e cole
o token (sem a palavra `Bearer`, o Postman já adiciona isso por você).
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
Resposta: `200 OK` com o token JWT em texto puro no corpo. Credenciais inválidas retornam erro de
autenticação (o `SecurityFilter`/`AuthenticationManager` rejeita antes de chegar ao Controller).

---

# `users` — Usuários

## Cadastrar um novo usuário (`POST /users`)
Rota pública — é assim que qualquer pessoa vira `ROLE_USER`.

*Constraints* (`UserCreateDTO`):
* **Nenhum** campo pode ser vazio;
* O **nome** deve ter entre 3 e 50 caracteres, e só pode conter letras, números, ponto, traço e
  underline (`^[a-zA-Z0-9._-]+$`);
* O **e-mail** deve ter formato válido e ser único (já cadastrado retorna erro);
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

## Buscar usuário específico por `UUID` (`GET /users/{id}`)
Substitua `SEU-UUID-AQUI` pelo UUID real de um usuário (retornado no cadastro/login). Exige que o
token pertença ao **próprio usuário** ou a um `ROLE_ADMIN` (ver `SecurityUtils.validatePermissions`)
— qualquer outra combinação retorna `403`.
```bash
curl -X GET http://localhost:8080/users/SEU-UUID-AQUI \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```

## Atualizar usuário por `UUID` (`PUT /users/{id}`)
Mesma regra de permissão do endpoint acima (dono do recurso ou `ROLE_ADMIN`). Todos os campos são
opcionais — envie só o que quiser alterar (`null`/omitido mantém o valor atual).
```bash
curl -X PUT http://localhost:8080/users/SEU-UUID-AQUI \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI" \
     -d '{ "name": "newname_example", "email": "newemail@example.com" }'
```
> O `-H` do `Content-Type` deve ser mantido para especificar o tipo do corpo da requisição, e NUNCA
> deve ser substituído pelo do Bearer Token — é possível (e necessário) usar os dois `-H` na mesma
> chamada. A ordem entre eles não importa para o servidor.

---

# `users/{userId}/favorites` — Decks favoritos

Todas as rotas abaixo seguem a mesma regra de permissão de `/users/{id}`: o token precisa pertencer
ao próprio `userId` da URL, ou ser de um `ROLE_ADMIN`.

> ⚠️ **Pré-requisito para testar:** ainda não existe endpoint de criação/listagem de `decks` (ver
> aviso no topo deste documento). Para testar as rotas de favoritos hoje, é preciso que já exista
> ao menos um deck no banco com um `deckId` conhecido — insira um manualmente via `psql`/pgAdmin
> na tabela `decks` antes de testar.

## Favoritar um deck (`POST /users/{userId}/favorites/{deckId}`)
```bash
curl -X POST http://localhost:8080/users/SEU-UUID-AQUI/favorites/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` sem corpo. Chamar de novo com o mesmo `deckId` é idempotente do ponto de vista
de resultado (Hibernate gerencia a coleção via `Set`), mas depende de `deckId` existir — caso
contrário, retorna erro (`Deck não encontrado`).

## Listar decks favoritos (`GET /users/{userId}/favorites`)
```bash
curl -X GET http://localhost:8080/users/SEU-UUID-AQUI/favorites \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` com uma lista de `DeckSummaryDTO` (`id`, `title`, `language`,
`difficultyLevel` — nunca o autor completo ou a data de criação).

## Remover um deck dos favoritos (`DELETE /users/{userId}/favorites/{deckId}`)
```bash
curl -X DELETE http://localhost:8080/users/SEU-UUID-AQUI/favorites/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `204 No Content` em caso de sucesso. Se o deck não estiver nos favoritos do usuário,
retorna erro (`Este deck não está nos favoritos do usuário`).

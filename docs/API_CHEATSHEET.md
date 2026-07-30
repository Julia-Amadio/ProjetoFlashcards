# Cheat sheet de requisições HTTP (cURL + Postman)

Guia com exemplos prontos de requisição para todas as rotas **já implementadas** do backend,
tanto para testes rápidos via terminal (cURL) quanto via Postman. Os corpos de requisição JSON
aqui especificados são os mesmos nos dois casos — a única diferença real de um pro outro está em
como o *Bearer Token* é passado, explicado logo abaixo.

> A geração de deck via IA (`POST /decks/generate`) depende do `python-services` estar de pé e
> configurado (chave de LLM, Pexels, Edge-TTS) — ver `docs/ARCHITECTURE.md`, seção 7, e
> `docs/DEPLOY.md` para o estado atual disso.

---

# IMPORTANTE: Uso do *Bearer Token*
Com exceção de `POST /login` e `POST /users`, todas as rotas abaixo são protegidas e exigem um
*bearer token* (JWT) válido no cabeçalho de autorização. Rotas marcadas **ROLE_ADMIN** exigem
que o usuário do token tenha essa role — qualquer outro usuário recebe `403`.

### Em requisições usando cURL
Os cabeçalhos (`-H`) precisam ser construídos manualmente. Para obter o token, faça login primeiro:
```bash
curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"email":"myemail@example.com", "password":"Password123!@#"}'
```
A resposta é um JSON com o token e os dados do usuário (ver seção `login` abaixo). Copie o valor
de `"token"` e insira em `-H "Authorization: Bearer SEU-TOKEN-AQUI"` nas rotas protegidas. Não
esqueça da palavra `Bearer` antes do token, separada por um espaço.

### Em requisições usando Postman
O JWT retornado por `POST http://localhost:8080/login` (campo `token` do JSON) deve ser inserido
na guia `Authorization` antes de realizar requisições protegidas. Selecione `Bearer Token` no
dropdown `Auth Type` e cole o token (sem a palavra `Bearer`, o Postman já adiciona isso por você).
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
Resposta: `200 OK` com `LoginResponseDTO` — **JSON**, não texto puro:
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "uuid...", "name": "...", "email": "...", "role": "ROLE_USER", "createdAt": "..." }
}
```
Credenciais inválidas (e-mail inexistente ou senha errada) retornam `401 Unauthorized`:
```json
{ "message": "E-mail ou senha inválidos.", "errors": null }
```
A mensagem é sempre a mesma pros dois casos, de propósito — não dá pra saber se o e-mail existe
ou não a partir da resposta.

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

## Listar todos os usuários (`GET /users`) — **ROLE_ADMIN**
Paginado (`Page<UserResponseDTO>`, Spring Data). Aceita `?page=&size=&sort=` na URL — sem
parâmetros, usa página 0, 50 usuários, ordenado por nome.
```bash
curl -X GET http://localhost:8080/users \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `200 OK` com objeto de página do Spring (`content`, `totalElements`, `totalPages`, etc.
— o array de usuários fica em `content`).

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

---

# `decks` — Decks

## Criar um deck manualmente (`POST /decks`) — **ROLE_ADMIN**
*Constraints* (`DeckCreateDTO`): `title` (obrigatório, máx. 100), `description` (livre),
`language` (obrigatório, máx. 50), `difficultyLevel` (opcional, máx. 50).
```bash
curl -X POST http://localhost:8080/decks \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_ADMIN_AQUI" \
     -d '{
           "title": "Saudações básicas",
           "description": "Cumprimentos do dia a dia",
           "language": "english",
           "difficultyLevel": "A1"
         }'
```
Resposta: `201 Created` com `DeckSummaryDTO` (`id`, `title`, `language`, `difficultyLevel`).

## Atualizar um deck (`PUT /decks/{id}`) — **ROLE_ADMIN**
Todos os campos são opcionais. Campos omitidos preservam o valor atual.

```bash
curl -X PUT http://localhost:8080/decks/1 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_ADMIN_AQUI" \
     -d '{ "title": "Saudações essenciais", "difficultyLevel": "A2" }'
```

Resposta: `200 OK` com `DeckSummaryDTO`.

## Remover um deck (`DELETE /decks/{id}`) — **ROLE_ADMIN**
A remoção também exclui flashcards, favoritos e progresso relacionados por cascade no banco.

```bash
curl -X DELETE http://localhost:8080/decks/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_ADMIN_AQUI"
```

Resposta: `204 No Content`.

## Gerar um deck via IA (`POST /decks/generate`) — **ROLE_ADMIN**
Dispara a geração completa: Java chama o `python-services`, que gera texto (OpenAI),
busca imagem (Pexels) e sintetiza áudio (Edge-TTS) pra cada card; o Java baixa essa mídia e
persiste tudo (ver `docs/ARCHITECTURE.md`, seção 7). Sem `OPENAI_API_KEY` configurada no
`python-services`, cai num `MOCK_RESPONSE` fixo (sem mídia) em vez de chamar o LLM.

*Constraints* (`DeckGenerateDTO`): `topic` (obrigatório, máx. 200), `language` (obrigatório,
máx. 50), `difficultyLevel` (opcional, máx. 50).
```bash
curl -X POST http://localhost:8080/decks/generate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_ADMIN_AQUI" \
     -d '{
           "topic": "cumprimentos do dia a dia",
           "language": "english",
           "difficultyLevel": "A1"
         }'
```
Resposta: `201 Created` com `DeckSummaryDTO` do deck já persistido (cards inclusos no banco,
consultáveis depois via `GET /decks/{deckId}/flashcards`). Pode demorar alguns segundos —
depende da resposta do LLM e do download de imagem/áudio.

## Listar todos os decks (`GET /decks`)
Paginado, igual `GET /users`. Qualquer usuário autenticado pode listar.
```bash
curl -X GET http://localhost:8080/decks \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```

## Buscar deck por `id` (`GET /decks/{id}`)
```bash
curl -X GET http://localhost:8080/decks/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```

---

# `flashcards` — Cards de um deck

## Criar um card manualmente (`POST /decks/{deckId}/flashcards`) — **ROLE_ADMIN**
*Constraints* (`FlashcardCreateDTO`): `targetWord` (obrigatório, máx. 100), `phoneticReading`
(opcional, máx. 100), `nativeTranslation` (obrigatório, máx. 255), `partOfSpeech` (opcional,
máx. 50), `targetSentence`/`sentencePhonetic`/`sentenceTranslation` (todos opcionais, texto livre).
```bash
curl -X POST http://localhost:8080/decks/1/flashcards \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_ADMIN_AQUI" \
     -d '{
           "targetWord": "hello",
           "phoneticReading": "/həˈloʊ/",
           "nativeTranslation": "olá",
           "partOfSpeech": "interjection",
           "targetSentence": "Hello, how are you?",
           "sentencePhonetic": "/həˈloʊ haʊ ɑːr juː/",
           "sentenceTranslation": "Olá, como você está?"
         }'
```
Resposta: `201 Created` com `FlashcardDTO` (sem imagem/áudio — cards criados manualmente não têm
mídia; só os gerados via `/decks/generate` têm).

## Listar cards de um deck (`GET /decks/{deckId}/flashcards`)
Qualquer usuário autenticado (é a rota usada pela tela de estudo).
```bash
curl -X GET http://localhost:8080/decks/1/flashcards \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```

## Buscar card específico (`GET /flashcards/{id}`)
```bash
curl -X GET http://localhost:8080/flashcards/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```

## Atualizar um card (`PUT /flashcards/{id}`) — **ROLE_ADMIN**
Todos os campos opcionais (`FlashcardUpdateDTO`), mesma lógica de "só envia o que quer mudar".
```bash
curl -X PUT http://localhost:8080/flashcards/1 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_ADMIN_AQUI" \
     -d '{ "nativeTranslation": "olá / oi" }'
```

## Remover um card (`DELETE /flashcards/{id}`) — **ROLE_ADMIN**
```bash
curl -X DELETE http://localhost:8080/flashcards/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_ADMIN_AQUI"
```
Resposta: `204 No Content`.

## Mídia de um card (imagem e áudio)
Só existe conteúdo nesses três endpoints pra cards **gerados via IA** — cards criados
manualmente não têm imagem/áudio, e as rotas devolvem `404`. Os bytes ficam salvos direto no
Postgres (`bytea`), não em URL externa nem bucket — qualquer usuário autenticado pode acessar.

```bash
# Imagem (Content-Type varia: image/jpeg, image/png, etc.)
curl -X GET http://localhost:8080/flashcards/1/image \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI" \
     --output card1.jpg

# Áudio da palavra (audio/mpeg)
curl -X GET http://localhost:8080/flashcards/1/audio/word \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI" \
     --output card1-word.mp3

# Áudio da frase de exemplo (audio/mpeg)
curl -X GET http://localhost:8080/flashcards/1/audio/sentence \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI" \
     --output card1-sentence.mp3
```
No Postman, essas três rotas são melhor visualizadas na aba **"Send and Download"** (ou abrindo a
resposta na aba "Preview") em vez do modo padrão de texto/JSON.

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
retorna erro (`Este deck não está nos favoritos do usuário`).

---

# `users/{userId}/study-progress` — Progresso de estudo

Mesma regra de permissão de `/users/{id}` (dono do recurso ou `ROLE_ADMIN`).

## Buscar progresso de um deck (`GET /users/{userId}/study-progress/{deckId}`)
```bash
curl -X GET http://localhost:8080/users/SEU-UUID-AQUI/study-progress/1 \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `StudyProgressDTO` (`deckId`, `index` — posição atual no deck, `revealed`, `completed`,
`results` com `{again, almost, easy}`, `updatedAt`).

## Salvar progresso (`PUT /users/{userId}/study-progress/{deckId}`)
```bash
curl -X PUT http://localhost:8080/users/SEU-UUID-AQUI/study-progress/1 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI" \
     -d '{
           "index": 3,
           "revealed": false,
           "completed": false,
           "results": { "again": 1, "almost": 0, "easy": 2 }
         }'
```

---

# `users/{userId}/preferences` — Preferências do usuário

Mesma regra de permissão de `/users/{id}`.

## Buscar preferências (`GET /users/{userId}/preferences`)
```bash
curl -X GET http://localhost:8080/users/SEU-UUID-AQUI/preferences \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```
Resposta: `UserPreferencesDTO` (`dailyGoal`, `autoplayAudio`, `confirmExit`).

## Salvar preferências (`PUT /users/{userId}/preferences`)
Todos os três campos são obrigatórios nesse DTO (`UserPreferencesSaveDTO`), diferente do
`PUT /users/{id}` — não dá pra mandar só um campo.
```bash
curl -X PUT http://localhost:8080/users/SEU-UUID-AQUI/preferences \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI" \
     -d '{ "dailyGoal": 20, "autoplayAudio": true, "confirmExit": true }'
```

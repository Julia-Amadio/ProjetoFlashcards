*Cheat sheet* com comandos cURL para testar requisições por meio do terminal enquanto
a aplicação roda.

Corpos de requisição json aqui especificados podem ser utilizados também dentro do Postman, com
uma pequena diferença no uso do *Bearer Token*. Leia o tópico a seguir para mais detalhes. 

---

# IMPORTANTE: Uso do *Bearer Token*
Com a exceção de Login e Cadastro de Usuários, todas as rotas são protegidas com *bearer token* 
para a validação de permissões. 

### Em requisições usando cURL
Quando usando cURL pelo terminal, os cabeçalhos (`Headers -> -H`) 
precisam ser construídos manualmente. Para obter o token JWT, você deve primeiro realizar o Login:
```json
curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"email":"myemail@example.com", "password":"Password123!@#"}'
```
Caso a requisição ocorra normalmente e as credenciais informadas forem válidas, o **terminal irá
retornar o token**. Copie e insira o mesmo no parâmetro `-H` para passar o cabeçalho de autorização em 
todas as rotas protegidas. Não esqueça da palavra `Bearer` antes do token, separada por um espaço.

### Em requisições usando Postman
Dentro do Postman, o JWT retornado por meio do Login (`POST http://localhost:8080/login`) deve 
ser inserido na guia `Authorization` antes de realizar requisições protegidas pelo mesmo. 
Especifique o tipo de autorização selecionando `Bearer Token` no menu dropdown `Auth Type`.
[![token-Demonstration.png](https://i.postimg.cc/RhLQN9pT/token-Demonstration.png)](https://postimg.cc/zH3RQmrL)


---

# `users`
    
## Cadastrar um novo usuário (`POST`)
*Constraints*:
* **NENHUM** campo pode ser vazio;
* O **nome** deve ter entre 3 e 50 caracteres;
* O **nome** só pode conter letras, números, ponto, traço e underline (*regex* `^[a-zA-Z0-9._-]+$`);
* O **e-mail** deve ter formato válido;
* A ***senha** deve ter no mínimo 8 caracteres;
* A **senha** deve conter pelo menos uma letra maiúscula, uma minúscula e um número 
(*regex* `^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$`).
```json
curl -X POST http://localhost:8080/users \
     -H "Content-Type: application/json" \
     -d '{
           "name": "name_example",
           "email": "myemail@example.com",
           "password": "Password123!@#"
         }'
```

## Listar todos os usuários (`GET`)
Exige token de Administrador (`ROLE_ADMIN`) fornecido no cabeçalho.
```json
curl -X GET http://localhost:8080/users \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```

## Buscar usuário <u>específico</u> por `UUID` (`GET`)
Copiar o UUID real de algum usuário retornado em testes anteriores e substituir o `SEU-UUID-AQUI` 
na URL. Exige que o token inserido no cabeçalho pertença ao mesmo usuário do UUID fornecido.
```json
curl -X GET http://localhost:8080/users/SEU-UUID-AQUI \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI"
```

## Atualizar usuário por `UUID` (`PUT`)
Substituir o `SEU-UUID-AQUI`, como já explicado.
Exige que o token inserido no cabeçalho pertença ao mesmo usuário do UUID fornecido.

O `-H` do `Content-Type` deve ser mantido para especificar o tipo de corpo de requisição e
NUNCA deve ser substituído pelo Bearer Token. É possível utilizar mais de um parâmetro e
a ordem em que eles são declarados no comando (se o de `Authorization` vem antes ou depois 
do `Content-Type`) não faz a menor diferença para o servidor.
```json
curl -X PUT http://localhost:8080/users/SEU-UUID-AQUI \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer INSIRA_TOKEN_AQUI" \
     -d '{ "name": "newname_example", "email": "newemail@example.com" }'
```

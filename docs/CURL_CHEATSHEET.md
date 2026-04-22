Corpos de requisição json funcionam também para o Postman.

---

# `users`
    
### Cadastrar/criar um novo usuário (`POST`)
```json
curl -X POST http://localhost:8080/users \
     -H "Content-Type: application/json" \
     -d '{
           "name": "name_example",
           "email": "myemail@example.com",
           "password": "Password123"
         }'
```

### Listar todos os usuários (`GET`)
```json
curl -X GET http://localhost:8080/users
```

### Buscar usuário <u>específico</u> por id (`GET`)
**ATENÇÃO:** copiar o UUID real de algum usuário que foi retornado nos testes anteriores e substituir o `SEU-UUID-AQUI`.
```json
curl -X GET http://localhost:8080/users/SEU-UUID-AQUI
```

### Atualizar usuário  por id (`PUT)
**ATENÇÃO:** substituir o `SEU-UUID-AQUI`.
```json
curl -X PUT http://localhost:8080/users/SEU-UUID-AQUI \
     -H "Content-Type: application/json" \
     -d '{
           "name": "examplename",
           "email": "examplename@email.com"
         }'
```

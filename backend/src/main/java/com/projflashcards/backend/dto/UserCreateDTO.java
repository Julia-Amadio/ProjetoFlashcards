package com.projflashcards.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/* Por padrão, todo componente de um Record (os campos definidos no cabeçalho) já é:
 *   - Private: ninguém acessa o campo diretamente.
 *   - Final: o valor não pode ser alterado depois de criado (imutabilidade).
 *   - Acessível via método: o Java cria automaticamente um método público com o mesmo nome
 *                           do campo para você ler o valor (ex: meuRecord.email()).*/
public record UserCreateDTO(

        @NotBlank(message = "O nome de usuário é obrigatório")
        @Size(min = 3, max = 50, message = "O nome deve ter entre 3 e 50 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "O nome só pode conter letras, números, ponto, traço e underline")
        String name,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "Formato de e-mail inválido")
        String email,

        //O campo aqui é o que o usuário DIGITA, não o hash que estará no banco.
        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        @Pattern(
                regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$",
                message = "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número."
        )
        String password
) {
    //O Record não precisa de nada aqui dentro!
    //Ele já entende que os parâmetros acima são os campos.
}

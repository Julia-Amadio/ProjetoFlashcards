package com.projflashcards.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateDTO(
        @NotBlank(message = "O nome não pode ser vazio")
        @Size(min = 3, max = 50)
        String name,

        @NotBlank(message = "O e-mail não pode ser vazio")
        @Email(message = "E-mail inválido")
        String email,

        //Incluído para fins de aprendizado
        //No futuro, isso sairá daqui para um endpoint próprio
        //Não colocar @NotBlank na senha
        //As anotações de validação (@Size, @Pattern) no Java ignoram valores null por padrão
        //Se o usuário mandar password: null -> validação passa, mantem a senha antiga
        //Se o usuário mandar password: "123" -> validação falha, muito curta.
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        @Pattern(
                regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$",
                message = "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número."
        )
        String password
) {
}

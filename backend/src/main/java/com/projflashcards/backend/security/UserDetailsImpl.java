package com.projflashcards.backend.security;

import com.projflashcards.backend.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {

    private final User user;

    public UserDetailsImpl(User user) { this.user = user; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        //Converte a sua String "ROLE_USER" ou "ROLE_ADMIN" para o formato que o Spring entende
        return List.of(new SimpleGrantedAuthority(user.getRole()));
    }

    @Override
    public String getPassword() { return user.getPassword(); }

    @Override
    public String getUsername() {
        //O Spring chama de "Username", mas para a nossa regra de negócio é o e-mail
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; //Retorne true, a menos que você tenha uma coluna no banco controlando isso
    }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    //Método para pegar a entidade User original de dentro do contexto de segurança.
    public User getUser() { return user; }
}

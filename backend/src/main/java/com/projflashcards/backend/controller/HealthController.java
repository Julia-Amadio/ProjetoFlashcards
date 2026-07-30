package com.projflashcards.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

//Liveness check para plataformas de deploy (Render/Railway/Fly.io). Sem auth, sem tocar no banco.
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}

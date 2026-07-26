LANGUAGE_CONFIG = {
    "mandarin": {
        "target_language": "Mandarim",
        "native_language": "Portugues",
        "voice": "zh-CN-XiaoxiaoNeural",
        "deck_name": "Mandarim IA - Vocabulario licao X",
        "apkg_name": "Meus_Flashcards_Mandarim.apkg",
    },
    "english": {
        "target_language": "Ingles",
        "native_language": "Portugues",
        "voice": "en-US-AriaNeural",
        "deck_name": "Ingles IA - Vocabulario licao X",
        "apkg_name": "Meus_Flashcards_Ingles.apkg",
    },
    "french": {
        "target_language": "Frances",
        "native_language": "Portugues",
        "voice": "fr-FR-DeniseNeural",
        "deck_name": "Frances IA - Vocabulario licao X",
        "apkg_name": "Meus_Flashcards_Frances.apkg",
    },
    "japanese": {
        "target_language": "Japones",
        "native_language": "Portugues",
        "voice": "ja-JP-NanamiNeural",
        "deck_name": "Japones IA - Vocabulario licao X",
        "apkg_name": "Meus_Flashcards_Japones.apkg",
    },
}


def get_language_config(language: str) -> dict:
    if not language:
        return LANGUAGE_CONFIG["mandarin"]
    idioma = language.strip().lower()
    if idioma not in LANGUAGE_CONFIG:
        raise ValueError(f"Idioma nao suportado: {language}. Use 'mandarin', 'french' ou 'english'.")
    return LANGUAGE_CONFIG[idioma]

import os
from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app, _map_card_to_unified

client = TestClient(app)


@patch("main.os.getenv")
@patch("main.gerar_flashcards_json")
def test_generate_english(mock_gerar, mock_getenv):
    mock_getenv.return_value = "sk-test-key"
    mock_gerar.return_value = [
        {
            "id_unico": "CARD-01",
            "palavra_en": "hello",
            "ipa_pronuncia": "/həˈloʊ/",
            "traducao_pt": "olá",
            "classe_gramatical": "interjection",
            "frase_exemplo_en": "Hello, how are you?",
            "frase_exemplo_traducao": "Olá, como você está?",
            "tags": "A1",
            "termo_busca_imagem_en": "hello greeting",
        }
    ]

    response = client.post("/generate", json={
        "topic": "Greetings",
        "language": "english",
        "difficulty_level": "beginner"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["deck_title"] == "Greetings"
    assert len(data["cards"]) == 1
    card = data["cards"][0]
    assert card["target_word"] == "hello"
    assert card["phonetic_reading"] == "/həˈloʊ/"
    assert card["native_translation"] == "olá"
    assert card["part_of_speech"] == "interjection"
    assert card["target_sentence"] == "Hello, how are you?"
    assert card["sentence_phonetic"] is None
    assert card["sentence_translation"] == "Olá, como você está?"
    assert card["image_url"] is None
    assert card["audio_word_url"] is None
    assert card["audio_sentence_url"] is None
    mock_gerar.assert_called_once_with(
        "Greetings", language="english", mode="topic", difficulty_level="beginner"
    )


@patch("main.os.getenv")
@patch("main.gerar_flashcards_json")
def test_generate_mandarin(mock_gerar, mock_getenv):
    mock_getenv.return_value = "sk-test-key"
    mock_gerar.return_value = [
        {
            "id_unico": "CARD-01",
            "hanzi": "你好",
            "pinyin": "nǐ hǎo",
            "traducao_pt": "olá",
            "classe_gramatical": "interjection",
            "frase_exemplo_hanzi": "你好，你怎么样？",
            "frase_exemplo_pinyin": "nǐ hǎo, nǐ zěnme yàng?",
            "frase_exemplo_traducao": "Olá, como você está?",
            "tags": "HSK1",
            "termo_busca_imagem_en": "hello wave",
        }
    ]

    response = client.post("/generate", json={
        "topic": "Saudações",
        "language": "mandarin",
    })

    assert response.status_code == 200
    card = response.json()["cards"][0]
    assert card["target_word"] == "你好"
    assert card["phonetic_reading"] == "nǐ hǎo"
    assert card["native_translation"] == "olá"
    assert card["sentence_phonetic"] == "nǐ hǎo, nǐ zěnme yàng?"
    assert card["image_url"] is None


@patch("main.os.getenv")
@patch("main.gerar_flashcards_json")
def test_generate_french(mock_gerar, mock_getenv):
    mock_getenv.return_value = "sk-test-key"
    mock_gerar.return_value = [
        {
            "id_unico": "CARD-01",
            "palavra_fr": "bonjour",
            "ipa_pronuncia": "/bɔ̃ʒuʁ/",
            "traducao_pt": "olá",
            "classe_gramatical": "interjection",
            "frase_exemplo_fr": "Bonjour, comment allez-vous?",
            "frase_exemplo_traducao": "Olá, como vai você?",
            "tags": "A1",
            "termo_busca_imagem_en": "hello french",
        }
    ]

    response = client.post("/generate", json={
        "topic": "Salutations",
        "language": "french",
    })

    assert response.status_code == 200
    card = response.json()["cards"][0]
    assert card["target_word"] == "bonjour"
    assert card["phonetic_reading"] == "/bɔ̃ʒuʁ/"
    assert card["sentence_phonetic"] is None


@patch("main.os.getenv")
@patch("main.gerar_flashcards_json")
def test_generate_japanese(mock_gerar, mock_getenv):
    mock_getenv.return_value = "sk-test-key"
    mock_gerar.return_value = [
        {
            "id_unico": "CARD-01",
            "kanji": "こんにちは",
            "kana": "こんにちは",
            "romaji": "konnichiwa",
            "traducao_pt": "olá",
            "classe_gramatical": "interjection",
            "frase_exemplo_jp": "こんにちは、お元気ですか？",
            "frase_exemplo_traducao": "Olá, como você está?",
            "tags": "N5",
            "termo_busca_imagem_en": "hello japanese",
        }
    ]

    response = client.post("/generate", json={
        "topic": "挨拶",
        "language": "japanese",
    })

    assert response.status_code == 200
    card = response.json()["cards"][0]
    assert card["target_word"] == "こんにちは"
    assert card["phonetic_reading"] == "こんにちは (konnichiwa)"
    assert card["sentence_phonetic"] is None


@patch("main.os.getenv")
@patch("main.gerar_flashcards_json")
def test_generate_llm_error(mock_gerar, mock_getenv):
    mock_getenv.return_value = "sk-test-key"
    mock_gerar.side_effect = ValueError("OpenAI API error")

    response = client.post("/generate", json={
        "topic": "Test",
        "language": "english",
    })

    assert response.status_code == 502
    assert "LLM error" in response.json()["detail"]


@patch("main.os.getenv")
def test_generate_mock_fallback(mock_getenv):
    mock_getenv.return_value = None

    response = client.post("/generate", json={
        "topic": "Test",
        "language": "english",
    })

    assert response.status_code == 200
    data = response.json()
    assert data["deck_title"] == "Basic Greetings"
    assert len(data["cards"]) == 3
    assert data["cards"][0]["image_url"] is None


def test_map_english():
    card = _map_card_to_unified({
        "palavra_en": "hello",
        "ipa_pronuncia": "/həˈloʊ/",
        "traducao_pt": "olá",
        "classe_gramatical": "interjection",
        "frase_exemplo_en": "Hello!",
        "frase_exemplo_traducao": "Olá!",
    }, "english")
    assert card.target_word == "hello"
    assert card.phonetic_reading == "/həˈloʊ/"
    assert card.sentence_phonetic is None


def test_map_mandarin():
    card = _map_card_to_unified({
        "hanzi": "你好",
        "pinyin": "nǐ hǎo",
        "traducao_pt": "olá",
        "classe_gramatical": "interjection",
        "frase_exemplo_hanzi": "你好",
        "frase_exemplo_pinyin": "nǐ hǎo",
        "frase_exemplo_traducao": "Olá",
    }, "mandarin")
    assert card.target_word == "你好"
    assert card.phonetic_reading == "nǐ hǎo"
    assert card.sentence_phonetic == "nǐ hǎo"


def test_map_japanese():
    card = _map_card_to_unified({
        "kanji": "水",
        "kana": "みず",
        "romaji": "mizu",
        "traducao_pt": "água",
        "classe_gramatical": "n.",
        "frase_exemplo_jp": "水をください",
        "frase_exemplo_traducao": "Água, por favor",
    }, "japanese")
    assert card.target_word == "水"
    assert card.phonetic_reading == "みず (mizu)"


def test_map_french():
    card = _map_card_to_unified({
        "palavra_fr": "merci",
        "ipa_pronuncia": "/mɛʁsi/",
        "traducao_pt": "obrigado",
        "classe_gramatical": "interjection",
        "frase_exemplo_fr": "Merci beaucoup",
        "frase_exemplo_traducao": "Muito obrigado",
    }, "french")
    assert card.target_word == "merci"
    assert card.phonetic_reading == "/mɛʁsi/"

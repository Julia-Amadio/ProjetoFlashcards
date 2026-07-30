from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from dotenv import load_dotenv
from modulos.llm_agent import gerar_flashcards_json

load_dotenv()

app = FastAPI(title="Flashcards AI Service")

class GenerateRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    language: str = Field(..., min_length=1, max_length=50)
    difficulty_level: Optional[str] = Field(None, max_length=50)

class CardResponse(BaseModel):
    target_word: str = Field(..., min_length=1, max_length=100)
    phonetic_reading: Optional[str] = None
    native_translation: str = Field(..., min_length=1, max_length=255)
    part_of_speech: Optional[str] = None
    target_sentence: Optional[str] = None
    sentence_phonetic: Optional[str] = None
    sentence_translation: Optional[str] = None
    image_url: Optional[str] = None
    audio_word_url: Optional[str] = None
    audio_sentence_url: Optional[str] = None

class GenerateResponse(BaseModel):
    deck_title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    cards: List[CardResponse] = Field(..., min_length=1)


def _map_card_to_unified(card: dict, language: str) -> CardResponse:
    if language == "mandarin":
        return CardResponse(
            target_word=card["hanzi"],
            phonetic_reading=card["pinyin"],
            native_translation=card["traducao_pt"],
            part_of_speech=card["classe_gramatical"],
            target_sentence=card["frase_exemplo_hanzi"],
            sentence_phonetic=card["frase_exemplo_pinyin"],
            sentence_translation=card["frase_exemplo_traducao"],
        )
    elif language == "english":
        return CardResponse(
            target_word=card["palavra_en"],
            phonetic_reading=card["ipa_pronuncia"],
            native_translation=card["traducao_pt"],
            part_of_speech=card["classe_gramatical"],
            target_sentence=card["frase_exemplo_en"],
            sentence_phonetic=None,
            sentence_translation=card["frase_exemplo_traducao"],
        )
    elif language == "french":
        return CardResponse(
            target_word=card["palavra_fr"],
            phonetic_reading=card["ipa_pronuncia"],
            native_translation=card["traducao_pt"],
            part_of_speech=card["classe_gramatical"],
            target_sentence=card["frase_exemplo_fr"],
            sentence_phonetic=None,
            sentence_translation=card["frase_exemplo_traducao"],
        )
    elif language == "japanese":
        return CardResponse(
            target_word=card["kanji"],
            phonetic_reading=f"{card['kana']} ({card['romaji']})",
            native_translation=card["traducao_pt"],
            part_of_speech=card["classe_gramatical"],
            target_sentence=card["frase_exemplo_jp"],
            sentence_phonetic=None,
            sentence_translation=card["frase_exemplo_traducao"],
        )
    else:
        raise ValueError(f"Unsupported language: {language}")


MOCK_RESPONSE = {
    "deck_title": "Basic Greetings",
    "description": "Common greeting phrases",
    "cards": [
        {
            "target_word": "hello",
            "phonetic_reading": "/həˈloʊ/",
            "native_translation": "olá",
            "part_of_speech": "interjection",
            "target_sentence": "Hello, how are you?",
            "sentence_phonetic": "/həˈloʊ, haʊ ɑːr juː/",
            "sentence_translation": "Olá, como você está?",
            "image_url": None,
            "audio_word_url": None,
            "audio_sentence_url": None
        },
        {
            "target_word": "goodbye",
            "phonetic_reading": "/ɡʊdˈbaɪ/",
            "native_translation": "tchau",
            "part_of_speech": "interjection",
            "target_sentence": "Goodbye, see you tomorrow!",
            "sentence_phonetic": "/ɡʊdˈbaɪ, siː juː təˈmɒroʊ/",
            "sentence_translation": "Tchau, vejo você amanhã!",
            "image_url": None,
            "audio_word_url": None,
            "audio_sentence_url": None
        },
        {
            "target_word": "thank you",
            "phonetic_reading": "/θæŋk juː/",
            "native_translation": "obrigado",
            "part_of_speech": "phrase",
            "target_sentence": "Thank you for your help.",
            "sentence_phonetic": "/θæŋk juː fɔːr jɔːr hɛlp/",
            "sentence_translation": "Obrigado pela sua ajuda.",
            "image_url": None,
            "audio_word_url": None,
            "audio_sentence_url": None
        }
    ]
}


@app.get("/")
def read_root():
    return {"status": "AI Service running"}

@app.post("/generate", response_model=GenerateResponse)
def generate_cards(req: GenerateRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            card_dicts = gerar_flashcards_json(
                req.topic,
                language=req.language,
                mode="topic",
                difficulty_level=req.difficulty_level or ""
            )
            cards = [_map_card_to_unified(c, req.language) for c in card_dicts]
            return GenerateResponse(
                deck_title=req.topic,
                description=f"Generated flashcards about {req.topic} in {req.language}",
                cards=cards
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")
    else:
        return GenerateResponse(**MOCK_RESPONSE)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import openai
import os
from dotenv import load_dotenv

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

class GenerateResponse(BaseModel):
    deck_title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    cards: List[CardResponse] = Field(..., min_length=1)

SYSTEM_PROMPT = """You are a language learning assistant. Given a topic and language, generate a set of flashcards.
Each card must contain: target word, phonetic reading (if applicable), native translation, part of speech,
a sentence example, sentence phonetic (if applicable), and sentence translation.
Return ONLY valid JSON in the following format, no markdown, no code fences:
{
  "deck_title": "Topic Name",
  "description": "Brief description",
  "cards": [
    {
      "target_word": "word",
      "phonetic_reading": "pronunciation",
      "native_translation": "translation",
      "part_of_speech": "noun/verb/etc",
      "target_sentence": "example sentence",
      "sentence_phonetic": "sentence pronunciation",
      "sentence_translation": "sentence translation"
    }
  ]
}"""

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
            "sentence_translation": "Olá, como você está?"
        },
        {
            "target_word": "goodbye",
            "phonetic_reading": "/ɡʊdˈbaɪ/",
            "native_translation": "tchau",
            "part_of_speech": "interjection",
            "target_sentence": "Goodbye, see you tomorrow!",
            "sentence_phonetic": "/ɡʊdˈbaɪ, siː juː təˈmɒroʊ/",
            "sentence_translation": "Tchau, vejo você amanhã!"
        },
        {
            "target_word": "thank you",
            "phonetic_reading": "/θæŋk juː/",
            "native_translation": "obrigado",
            "part_of_speech": "phrase",
            "target_sentence": "Thank you for your help.",
            "sentence_phonetic": "/θæŋk juː fɔːr jɔːr hɛlp/",
            "sentence_translation": "Obrigado pela sua ajuda."
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
            openai.api_key = api_key
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Generate flashcards about '{req.topic}' in {req.language} "
                                                 f"at difficulty level {req.difficulty_level or 'beginner'}"}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content
            import json
            data = json.loads(raw)
            return GenerateResponse(**data)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"LLM error: {str(e)}")
    else:
        return GenerateResponse(**MOCK_RESPONSE)

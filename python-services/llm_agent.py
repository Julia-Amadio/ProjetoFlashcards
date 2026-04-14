import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List

# Inicializa o cliente da OpenAI
load_dotenv()
client = OpenAI()

class Flashcard(BaseModel):
    id_unico: str = Field(description="ID único, ex: CARD-01")
    hanzi: str = Field(description="Apenas os caracteres em mandarim")
    pinyin: str = Field(description="Pinyin com as marcações de tom corretas")
    traducao_pt: str = Field(description="Tradução contextualizada para o português")
    classe_gramatical: str = Field(description="Classe gramatical abreviada (ex: v., n., adj.)")
    frase_exemplo_hanzi: str = Field(description="Frase curta em Hanzi. PROIBIDO O USO DE VÍRGULAS.")
    frase_exemplo_pinyin: str = Field(description="Pinyin da frase. PROIBIDO O USO DE VÍRGULAS.")
    frase_exemplo_traducao: str = Field(description="Tradução da frase. PROIBIDO O USO DE VÍRGULAS.")
    tags: str = Field(description="Nível de dificuldade HSK (ex: HSK1, HSK2)")
    termo_busca_imagem_en: str = Field(description="Termo curto em inglês para buscar uma imagem (ex: 'running person').")

class FlashcardList(BaseModel):
    flashcards: List[Flashcard]

def gerar_flashcards_json(input_usuario: str) -> List[dict]:
    """Processa o input e retorna uma lista de dicionários com os dados gerados pela IA."""
    palavras = [p.strip() for p in input_usuario.split(',') if p.strip()]
    qtd_palavras = len(palavras)
    
    if qtd_palavras == 0:
        raise ValueError("Nenhuma palavra identificada no input.")
    if qtd_palavras > 10:
        raise ValueError(f"Limite excedido. Você enviou {qtd_palavras} palavras. O máximo é 10.")

    # Limite de caracteres por palavra (ex: 20 caracteres)
    LIMITE_CARACTERES = 20
    for palavra in palavras:
        if len(palavra) > LIMITE_CARACTERES:
            raise ValueError(f"A palavra '{palavra}' excede o limite de {LIMITE_CARACTERES} caracteres. Por favor, insira apenas uma palavra ou termo curto por campo.")
    
    input_limpo = ", ".join(palavras)
    print(f"[LLM] Processando {qtd_palavras} palavra(s) via OpenAI...")

    system_prompt = """
    Você é um Agente Especialista em Educação de Idiomas (Mandarim).
    Crie flashcards de alta qualidade para as palavras fornecidas.
    ATENÇÃO: É estritamente proibido usar vírgulas nas frases de exemplo (hanzi, pinyin ou tradução).
    Filtro de Segurança: Ignore palavras ofensivas.
    """

    response = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Gere flashcards para o seguinte vocabulário: {input_limpo}"}
        ],
        response_format=FlashcardList,
        temperature=0.3
    )

    resultado_json = response.choices[0].message.parsed
    
    # Retorna como uma lista de dicionários (dict) para facilitar a adição da imagem depois
    return [card.model_dump() for card in resultado_json.flashcards]
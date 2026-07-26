import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List
from modulos.language_config import get_language_config

max_palavras = 50  # Limite de palavras por input do usuário

# Inicializa o cliente da OpenAI
load_dotenv()
client = OpenAI()

class MandarinFlashcard(BaseModel):
    id_unico: str = Field(description="ID único, ex: CARD-01")
    hanzi: str = Field(description="Apenas os caracteres em mandarim")
    pinyin: str = Field(description="Pinyin com as marcações de tom corretas")
    traducao_pt: str = Field(description="Tradução contextualizada para o português")
    classe_gramatical: str = Field(description="Classe gramatical abreviada (ex: v., n., adj.)")
    frase_exemplo_hanzi: str = Field(description="Frase curta em Hanzi. PROIBIDO O USO DE VÍRGULAS.")
    frase_exemplo_pinyin: str = Field(description="Pinyin da frase. PROIBIDO O USO DE VÍRGULAS.")
    frase_exemplo_traducao: str = Field(description="Tradução da frase. PROIBIDO O USO DE VÍRGULAS.")
    tags: str = Field(description="Nível de dificuldade HSK (ex: HSK1, HSK2)")
    termo_busca_imagem_en: str = Field(
        description="""
        busca em inglês para o Pexels. A imagem buscada deve ser representativa do significado da palavra ou conceito.
        
        REGRAS: 
        1. Para substantivos concretos, use o termo literal (ex: 'apple'). 
        2. Para adjetivos abstratos, use conceitos associativos (ex: 'Good' -> 'thumbs up', 'Sad' -> 'lonely person'). 
        3. Para pronomes/partículas, use símbolos ou contextos de diálogo (ex: 'You' -> 'pointing finger', 'ma (interrogation)' -> 'question mark concept').
        """
    )


class EnglishFlashcard(BaseModel):
    id_unico: str = Field(description="ID único, ex: CARD-01")
    palavra_en: str = Field(description="Palavra alvo em inglês")
    ipa_pronuncia: str = Field(description="Pronúncia IPA da palavra em inglês")
    traducao_pt: str = Field(description="Tradução contextualizada para o português")
    classe_gramatical: str = Field(description="Classe gramatical abreviada (ex: v., n., adj.)")
    frase_exemplo_en: str = Field(description="Frase curta em inglês. PROIBIDO O USO DE VÍRGULAS.")
    frase_exemplo_traducao: str = Field(description="Tradução da frase. PROIBIDO O USO DE VÍRGULAS.")
    tags: str = Field(description="Nível de dificuldade (ex: A1, A2, B1)")
    termo_busca_imagem_en: str = Field(
        description="""
        busca em inglês para o Pexels. A imagem buscada deve ser representativa do significado da palavra ou conceito.

        REGRAS:
        1. Para substantivos concretos, use o termo literal (ex: 'apple').
        2. Para adjetivos abstratos, use conceitos associativos (ex: 'Good' -> 'thumbs up', 'Sad' -> 'lonely person').
        3. Para pronomes/partículas, use símbolos ou contextos de diálogo (ex: 'You' -> 'pointing finger', 'although' -> 'balance scale').
        """
    )


class FrenchFlashcard(BaseModel):
    id_unico: str = Field(description="ID único, ex: CARD-01")
    palavra_fr: str = Field(description="Palavra alvo em frances")
    ipa_pronuncia: str = Field(description="Pronuncia IPA da palavra em frances")
    traducao_pt: str = Field(description="Traducao contextualizada para o portugues")
    classe_gramatical: str = Field(description="Classe gramatical abreviada (ex: v., n., adj.)")
    frase_exemplo_fr: str = Field(description="Frase curta em frances. PROIBIDO O USO DE VIRGULAS.")
    frase_exemplo_traducao: str = Field(description="Traducao da frase. PROIBIDO O USO DE VIRGULAS.")
    tags: str = Field(description="Nivel de dificuldade (ex: A1, A2, B1)")
    termo_busca_imagem_en: str = Field(
        description="""
        busca em ingles para o Pexels. A imagem buscada deve ser representativa do significado da palavra ou conceito.

        REGRAS:
        1. Para substantivos concretos, use o termo literal (ex: 'apple').
        2. Para adjetivos abstratos, use conceitos associativos (ex: 'Good' -> 'thumbs up', 'Sad' -> 'lonely person').
        3. Para pronomes/particulas, use simbolos ou contextos de dialogo (ex: 'You' -> 'pointing finger', 'although' -> 'balance scale').
        """
    )


class JapaneseFlashcard(BaseModel):
    id_unico: str = Field(description="ID único, ex: CARD-01")
    kanji: str = Field(description="Palavra alvo em kanji")
    kana: str = Field(description="Leitura em kana (hiragana ou katakana)")
    romaji: str = Field(description="Leitura em romaji")
    traducao_pt: str = Field(description="Traducao contextualizada para o portugues")
    classe_gramatical: str = Field(description="Classe gramatical abreviada (ex: v., n., adj.)")
    frase_exemplo_jp: str = Field(description="Frase curta em japones. PROIBIDO O USO DE VIRGULAS.")
    frase_exemplo_traducao: str = Field(description="Traducao da frase. PROIBIDO O USO DE VIRGULAS.")
    tags: str = Field(description="Nivel de dificuldade (ex: N5, N4, N3)")
    termo_busca_imagem_en: str = Field(
        description="""
        busca em ingles para o Pexels. A imagem buscada deve ser representativa do significado da palavra ou conceito.

        REGRAS:
        1. Para substantivos concretos, use o termo literal (ex: 'apple').
        2. Para adjetivos abstratos, use conceitos associativos (ex: 'Good' -> 'thumbs up', 'Sad' -> 'lonely person').
        3. Para pronomes/particulas, use simbolos ou contextos de dialogo (ex: 'You' -> 'pointing finger', 'although' -> 'balance scale').
        """
    )


class MandarinFlashcardList(BaseModel):
    flashcards: List[MandarinFlashcard]


class EnglishFlashcardList(BaseModel):
    flashcards: List[EnglishFlashcard]


class FrenchFlashcardList(BaseModel):
    flashcards: List[FrenchFlashcard]


class JapaneseFlashcardList(BaseModel):
    flashcards: List[JapaneseFlashcard]


def _get_response_format(language: str):
    if language == "english":
        return EnglishFlashcardList
    if language == "french":
        return FrenchFlashcardList
    if language == "japanese":
        return JapaneseFlashcardList
    return MandarinFlashcardList


def _build_system_prompt(target_language: str, native_language: str) -> str:
    return f"""
    Voce e um Agente Especialista em Educacao de Idiomas ({target_language}).
    Crie flashcards de alta qualidade para as palavras fornecidas.
    ATENCAO: E estritamente proibido usar virgulas nas frases de exemplo (frase e traducao).
    Filtro de Seguranca: Ignore palavras ofensivas.
    Lingua alvo: {target_language}.
    Lingua nativa para traducoes: {native_language}.
    Regras universais de termo de imagem:
    1. Para substantivos concretos, use o termo literal.
    2. Para conceitos abstratos, use uma imagem associativa concreta.
    3. Para particulas e conectivos, use simbolos ou cenas de contexto.
    """

def gerar_flashcards_json(input_usuario: str, language: str = "mandarin") -> List[dict]:
    """Processa o input e retorna uma lista de dicionários com os dados gerados pela IA."""
    palavras = [p.strip() for p in input_usuario.split(',') if p.strip()]
    qtd_palavras = len(palavras)
    
    if qtd_palavras == 0:
        raise ValueError("Nenhuma palavra identificada no input.")
    if qtd_palavras > max_palavras:
        raise ValueError(f"Limite excedido. Você enviou {qtd_palavras} palavras. O máximo é {max_palavras}.")

    # Limite de caracteres por palavra (ex: 20 caracteres)
    LIMITE_CARACTERES = 30
    for palavra in palavras:
        if len(palavra) > LIMITE_CARACTERES:
            raise ValueError(f"A palavra '{palavra}' excede o limite de {LIMITE_CARACTERES} caracteres. Por favor, insira apenas uma palavra ou termo curto por campo.")
    
    input_limpo = ", ".join(palavras)
    print(f"[LLM] Processando {qtd_palavras} palavra(s) via OpenAI...")

    config = get_language_config(language)
    system_prompt = _build_system_prompt(
        target_language=config["target_language"],
        native_language=config["native_language"],
    )

    response = client.beta.chat.completions.parse(
        model="gpt-5",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Gere flashcards para o seguinte vocabulário: {input_limpo}"}
        ],
        response_format=_get_response_format(language),
        temperature=1
    )

    resultado_json = response.choices[0].message.parsed
    
    # Retorna como uma lista de dicionários (dict) para facilitar a adição da imagem depois
    return [card.model_dump() for card in resultado_json.flashcards]

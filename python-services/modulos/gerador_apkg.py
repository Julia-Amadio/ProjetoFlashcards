import genanki
import random
from modulos.language_config import get_language_config

def _build_mandarin_model():
    estilo_css = """
    .card { font-family: arial; text-align: center; color: #333; background-color: #fcfcfc; padding: 15px; }
    .hanzi-gigante { font-size: 80px; font-weight: bold; color: #d32f2f; margin-bottom: 10px; }
    .pinyin { font-size: 26px; color: #555; margin-bottom: 5px; }
    .traducao { font-size: 22px; font-weight: bold; color: #1976d2; margin-bottom: 15px; }
    .instrucao { font-size: 14px; color: #999; margin-bottom: 15px; font-style: italic; letter-spacing: 1px; text-transform: uppercase; }
    .frase-hanzi { font-size: 36px; color: #222; margin-top: 20px; margin-bottom: 5px; line-height: 1.4; }
    .frase-pinyin { font-size: 22px; color: #666; margin-bottom: 5px; }
    .frase-traducao { font-size: 18px; color: #444; font-style: italic; margin-top: 5px; }
    .container-exemplo { background-color: #f0f0f0; border-radius: 8px; padding: 15px; margin-top: 20px; }
    img { max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 15px; }
    """

    modelo_id = 1607392330
    modelo = genanki.Model(
        modelo_id,
        'Modelo Mandarim IA - Audio Duplo',
        fields=[
            {'name': 'Hanzi'}, {'name': 'Pinyin'}, {'name': 'Traducao_PT'},
            {'name': 'Classe_Gramatical'}, {'name': 'Frase_Hanzi'},
            {'name': 'Frase_Pinyin'}, {'name': 'Frase_Traducao'},
            {'name': 'Tags'}, {'name': 'Imagem'},
            {'name': 'Audio_Palavra'}, {'name': 'Audio_Frase'}
        ],
        templates=[
            {
                'name': '1. Leitura (Hanzi -> PT)',
                'qfmt': '<div class="instrucao">Leia e Traduza</div><div class="hanzi-gigante">{{Hanzi}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="pinyin">{{Pinyin}}</div><div class="traducao">{{Traducao_PT}} <i>({{Classe_Gramatical}})</i></div><div class="audio">{{Audio_Palavra}}</div><br>{{Imagem}}<div class="container-exemplo"><div class="frase-hanzi">{{Frase_Hanzi}}</div><div class="audio">{{Audio_Frase}}</div><div class="frase-pinyin">{{Frase_Pinyin}}</div><div class="frase-traducao">{{Frase_Traducao}}</div></div>',
            },
            {
                'name': '2. Audicao (Audio -> Hanzi)',
                'qfmt': '<div class="instrucao">O que voce ouviu?</div><br><br><div class="audio">{{Audio_Palavra}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="hanzi-gigante">{{Hanzi}}</div><div class="pinyin">{{Pinyin}}</div><div class="traducao">{{Traducao_PT}}</div><br>{{Imagem}}',
            },
            {
                'name': '3. Visual (Imagem -> Hanzi)',
                'qfmt': '<div class="instrucao">Como se diz isto?</div>{{Imagem}}',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="hanzi-gigante">{{Hanzi}}</div><div class="pinyin">{{Pinyin}}</div><div class="audio">{{Audio_Palavra}}</div>',
            },
            {
                'name': '4. Traducao (PT -> Hanzi)',
                'qfmt': '<div class="instrucao">Traduza para o mandarim</div><br><div class="traducao" style="font-size: 45px;">{{Traducao_PT}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="hanzi-gigante">{{Hanzi}}</div><div class="pinyin">{{Pinyin}}</div><div class="audio">{{Audio_Palavra}}</div>',
            },
            {
                'name': '5. Contexto (Frase -> Significado)',
                'qfmt': '<div class="instrucao">Entenda a Frase</div><div class="frase-hanzi">{{Frase_Hanzi}}</div><br><div class="audio">{{Audio_Frase}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="frase-pinyin">{{Frase_Pinyin}}</div><div class="frase-traducao">{{Frase_Traducao}}</div><br><hr><div class="instrucao">Vocabulario alvo nesta frase:</div><div style="font-size: 20px;"><b>{{Hanzi}}</b> ({{Pinyin}}) - {{Traducao_PT}} {{Audio_Palavra}}</div>',
            },
        ],
        css=estilo_css
    )
    return modelo


def _build_english_model():
    estilo_css = """
    .card { font-family: arial; text-align: center; color: #333; background-color: #fcfcfc; padding: 15px; }
    .palavra-gigante { font-size: 72px; font-weight: bold; color: #1b5e20; margin-bottom: 10px; }
    .ipa { font-size: 24px; color: #555; margin-bottom: 5px; }
    .traducao { font-size: 22px; font-weight: bold; color: #1976d2; margin-bottom: 15px; }
    .instrucao { font-size: 14px; color: #999; margin-bottom: 15px; font-style: italic; letter-spacing: 1px; text-transform: uppercase; }
    .frase-en { font-size: 30px; color: #222; margin-top: 20px; margin-bottom: 5px; line-height: 1.4; }
    .frase-traducao { font-size: 18px; color: #444; font-style: italic; margin-top: 5px; }
    .container-exemplo { background-color: #f0f0f0; border-radius: 8px; padding: 15px; margin-top: 20px; }
    img { max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 15px; }
    """

    modelo_id = 1607392331
    modelo = genanki.Model(
        modelo_id,
        'Modelo Ingles IA - Audio Duplo',
        fields=[
            {'name': 'Palavra_En'}, {'name': 'IPA'}, {'name': 'Traducao_PT'},
            {'name': 'Classe_Gramatical'}, {'name': 'Frase_En'},
            {'name': 'Frase_Traducao'}, {'name': 'Tags'}, {'name': 'Imagem'},
            {'name': 'Audio_Palavra'}, {'name': 'Audio_Frase'}
        ],
        templates=[
            {
                'name': '1. Leitura (EN -> PT)',
                'qfmt': '<div class="instrucao">Leia e Traduza</div><div class="palavra-gigante">{{Palavra_En}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="ipa">/{{IPA}}/</div><div class="traducao">{{Traducao_PT}} <i>({{Classe_Gramatical}})</i></div><div class="audio">{{Audio_Palavra}}</div><br>{{Imagem}}<div class="container-exemplo"><div class="frase-en">{{Frase_En}}</div><div class="audio">{{Audio_Frase}}</div><div class="frase-traducao">{{Frase_Traducao}}</div></div>',
            },
            {
                'name': '2. Audicao (Audio -> EN)',
                'qfmt': '<div class="instrucao">O que voce ouviu?</div><br><br><div class="audio">{{Audio_Palavra}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="palavra-gigante">{{Palavra_En}}</div><div class="ipa">/{{IPA}}/</div><div class="traducao">{{Traducao_PT}}</div><br>{{Imagem}}',
            },
            {
                'name': '3. Visual (Imagem -> EN)',
                'qfmt': '<div class="instrucao">Como se diz isto?</div>{{Imagem}}',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="palavra-gigante">{{Palavra_En}}</div><div class="ipa">/{{IPA}}/</div><div class="audio">{{Audio_Palavra}}</div>',
            },
            {
                'name': '4. Traducao (PT -> EN)',
                'qfmt': '<div class="instrucao">Traduza para o ingles</div><br><div class="traducao" style="font-size: 45px;">{{Traducao_PT}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="palavra-gigante">{{Palavra_En}}</div><div class="ipa">/{{IPA}}/</div><div class="audio">{{Audio_Palavra}}</div>',
            },
            {
                'name': '5. Contexto (Frase -> Significado)',
                'qfmt': '<div class="instrucao">Entenda a Frase</div><div class="frase-en">{{Frase_En}}</div><br><div class="audio">{{Audio_Frase}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="frase-traducao">{{Frase_Traducao}}</div><br><hr><div class="instrucao">Vocabulario alvo nesta frase:</div><div style="font-size: 20px;"><b>{{Palavra_En}}</b> (/{{IPA}}/) - {{Traducao_PT}} {{Audio_Palavra}}</div>',
            },
        ],
        css=estilo_css
    )
    return modelo


def _build_french_model():
    estilo_css = """
    .card { font-family: arial; text-align: center; color: #333; background-color: #fcfcfc; padding: 15px; }
    .palavra-gigante { font-size: 72px; font-weight: bold; color: #1b5e20; margin-bottom: 10px; }
    .ipa { font-size: 24px; color: #555; margin-bottom: 5px; }
    .traducao { font-size: 22px; font-weight: bold; color: #1976d2; margin-bottom: 15px; }
    .instrucao { font-size: 14px; color: #999; margin-bottom: 15px; font-style: italic; letter-spacing: 1px; text-transform: uppercase; }
    .frase-fr { font-size: 30px; color: #222; margin-top: 20px; margin-bottom: 5px; line-height: 1.4; }
    .frase-traducao { font-size: 18px; color: #444; font-style: italic; margin-top: 5px; }
    .container-exemplo { background-color: #f0f0f0; border-radius: 8px; padding: 15px; margin-top: 20px; }
    img { max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 15px; }
    """

    modelo_id = 1607392332
    modelo = genanki.Model(
        modelo_id,
        'Modelo Frances IA - Audio Duplo',
        fields=[
            {'name': 'Palavra_Fr'}, {'name': 'IPA'}, {'name': 'Traducao_PT'},
            {'name': 'Classe_Gramatical'}, {'name': 'Frase_Fr'},
            {'name': 'Frase_Traducao'}, {'name': 'Tags'}, {'name': 'Imagem'},
            {'name': 'Audio_Palavra'}, {'name': 'Audio_Frase'}
        ],
        templates=[
            {
                'name': '1. Leitura (FR -> PT)',
                'qfmt': '<div class="instrucao">Leia e Traduza</div><div class="palavra-gigante">{{Palavra_Fr}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="ipa">/{{IPA}}/</div><div class="traducao">{{Traducao_PT}} <i>({{Classe_Gramatical}})</i></div><div class="audio">{{Audio_Palavra}}</div><br>{{Imagem}}<div class="container-exemplo"><div class="frase-fr">{{Frase_Fr}}</div><div class="audio">{{Audio_Frase}}</div><div class="frase-traducao">{{Frase_Traducao}}</div></div>',
            },
            {
                'name': '2. Audicao (Audio -> FR)',
                'qfmt': '<div class="instrucao">O que voce ouviu?</div><br><br><div class="audio">{{Audio_Palavra}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="palavra-gigante">{{Palavra_Fr}}</div><div class="ipa">/{{IPA}}/</div><div class="traducao">{{Traducao_PT}}</div><br>{{Imagem}}',
            },
            {
                'name': '3. Visual (Imagem -> FR)',
                'qfmt': '<div class="instrucao">Como se diz isto?</div>{{Imagem}}',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="palavra-gigante">{{Palavra_Fr}}</div><div class="ipa">/{{IPA}}/</div><div class="audio">{{Audio_Palavra}}</div>',
            },
            {
                'name': '4. Traducao (PT -> FR)',
                'qfmt': '<div class="instrucao">Traduza para o frances</div><br><div class="traducao" style="font-size: 45px;">{{Traducao_PT}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="palavra-gigante">{{Palavra_Fr}}</div><div class="ipa">/{{IPA}}/</div><div class="audio">{{Audio_Palavra}}</div>',
            },
            {
                'name': '5. Contexto (Frase -> Significado)',
                'qfmt': '<div class="instrucao">Entenda a Frase</div><div class="frase-fr">{{Frase_Fr}}</div><br><div class="audio">{{Audio_Frase}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="frase-traducao">{{Frase_Traducao}}</div><br><hr><div class="instrucao">Vocabulario alvo nesta frase:</div><div style="font-size: 20px;"><b>{{Palavra_Fr}}</b> (/{{IPA}}/) - {{Traducao_PT}} {{Audio_Palavra}}</div>',
            },
        ],
        css=estilo_css
    )
    return modelo


def _build_japanese_model():
    estilo_css = """
    .card { font-family: arial; text-align: center; color: #333; background-color: #fcfcfc; padding: 15px; }
    .kanji-gigante { font-size: 78px; font-weight: bold; color: #37474f; margin-bottom: 8px; }
    .kana { font-size: 26px; color: #555; margin-bottom: 4px; }
    .romaji { font-size: 20px; color: #777; margin-bottom: 8px; }
    .traducao { font-size: 22px; font-weight: bold; color: #1976d2; margin-bottom: 15px; }
    .instrucao { font-size: 14px; color: #999; margin-bottom: 15px; font-style: italic; letter-spacing: 1px; text-transform: uppercase; }
    .frase-jp { font-size: 30px; color: #222; margin-top: 20px; margin-bottom: 5px; line-height: 1.4; }
    .frase-traducao { font-size: 18px; color: #444; font-style: italic; margin-top: 5px; }
    .container-exemplo { background-color: #f0f0f0; border-radius: 8px; padding: 15px; margin-top: 20px; }
    img { max-width: 80%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-top: 15px; }
    """

    modelo_id = 1607392333
    modelo = genanki.Model(
        modelo_id,
        'Modelo Japones IA - Audio Duplo',
        fields=[
            {'name': 'Kanji'}, {'name': 'Kana'}, {'name': 'Romaji'},
            {'name': 'Traducao_PT'}, {'name': 'Classe_Gramatical'},
            {'name': 'Frase_JP'}, {'name': 'Frase_Traducao'},
            {'name': 'Tags'}, {'name': 'Imagem'},
            {'name': 'Audio_Palavra'}, {'name': 'Audio_Frase'}
        ],
        templates=[
            {
                'name': '1. Leitura (JP -> PT)',
                'qfmt': '<div class="instrucao">Leia e Traduza</div><div class="kanji-gigante">{{Kanji}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="kana">{{Kana}}</div><div class="romaji">{{Romaji}}</div><div class="traducao">{{Traducao_PT}} <i>({{Classe_Gramatical}})</i></div><div class="audio">{{Audio_Palavra}}</div><br>{{Imagem}}<div class="container-exemplo"><div class="frase-jp">{{Frase_JP}}</div><div class="audio">{{Audio_Frase}}</div><div class="frase-traducao">{{Frase_Traducao}}</div></div>',
            },
            {
                'name': '2. Audicao (Audio -> JP)',
                'qfmt': '<div class="instrucao">O que voce ouviu?</div><br><br><div class="audio">{{Audio_Palavra}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="kanji-gigante">{{Kanji}}</div><div class="kana">{{Kana}}</div><div class="romaji">{{Romaji}}</div><div class="traducao">{{Traducao_PT}}</div><br>{{Imagem}}',
            },
            {
                'name': '3. Visual (Imagem -> JP)',
                'qfmt': '<div class="instrucao">Como se diz isto?</div>{{Imagem}}',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="kanji-gigante">{{Kanji}}</div><div class="kana">{{Kana}}</div><div class="romaji">{{Romaji}}</div><div class="audio">{{Audio_Palavra}}</div>',
            },
            {
                'name': '4. Traducao (PT -> JP)',
                'qfmt': '<div class="instrucao">Traduza para o japones</div><br><div class="traducao" style="font-size: 45px;">{{Traducao_PT}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="kanji-gigante">{{Kanji}}</div><div class="kana">{{Kana}}</div><div class="romaji">{{Romaji}}</div><div class="audio">{{Audio_Palavra}}</div>',
            },
            {
                'name': '5. Contexto (Frase -> Significado)',
                'qfmt': '<div class="instrucao">Entenda a Frase</div><div class="frase-jp">{{Frase_JP}}</div><br><div class="audio">{{Audio_Frase}}</div>',
                'afmt': '{{FrontSide}}<hr id="answer"><div class="frase-traducao">{{Frase_Traducao}}</div><br><hr><div class="instrucao">Vocabulario alvo nesta frase:</div><div style="font-size: 20px;"><b>{{Kanji}}</b> ({{Kana}}) - {{Traducao_PT}} {{Audio_Palavra}}</div>',
            },
        ],
        css=estilo_css
    )
    return modelo


def _get_model(language: str):
    if language == "english":
        return _build_english_model()
    if language == "french":
        return _build_french_model()
    if language == "japanese":
        return _build_japanese_model()
    return _build_mandarin_model()


def criar_baralho_apkg(flashcards_dados: list, nome_arquivo_saida: str = "Baralho_Mandarim.apkg", language: str = "mandarin"):
    print("\n[Genanki] Empacotando flashcards com audios separados...")
    config = get_language_config(language)
    modelo = _get_model(language)

    baralho_id = random.randrange(1 << 30, 1 << 31)
    meu_baralho = genanki.Deck(baralho_id, config["deck_name"])

    arquivos_midia = []

    for card in flashcards_dados:
        if language == "english":
            fields = [
                card.get('palavra_en', ''),
                card.get('ipa_pronuncia', ''),
                card.get('traducao_pt', ''),
                card.get('classe_gramatical', ''),
                card.get('frase_exemplo_en', ''),
                card.get('frase_exemplo_traducao', ''),
                card.get('tags', ''),
                f"<img src='{card.get('nome_imagem', '')}'>" if card.get('nome_imagem') else "",
                f"[sound:{card.get('nome_audio_palavra', '')}]" if card.get('nome_audio_palavra') else "",
                f"[sound:{card.get('nome_audio_frase', '')}]" if card.get('nome_audio_frase') else "",
            ]
        elif language == "french":
            fields = [
                card.get('palavra_fr', ''),
                card.get('ipa_pronuncia', ''),
                card.get('traducao_pt', ''),
                card.get('classe_gramatical', ''),
                card.get('frase_exemplo_fr', ''),
                card.get('frase_exemplo_traducao', ''),
                card.get('tags', ''),
                f"<img src='{card.get('nome_imagem', '')}'>" if card.get('nome_imagem') else "",
                f"[sound:{card.get('nome_audio_palavra', '')}]" if card.get('nome_audio_palavra') else "",
                f"[sound:{card.get('nome_audio_frase', '')}]" if card.get('nome_audio_frase') else "",
            ]
        elif language == "japanese":
            fields = [
                card.get('kanji', ''),
                card.get('kana', ''),
                card.get('romaji', ''),
                card.get('traducao_pt', ''),
                card.get('classe_gramatical', ''),
                card.get('frase_exemplo_jp', ''),
                card.get('frase_exemplo_traducao', ''),
                card.get('tags', ''),
                f"<img src='{card.get('nome_imagem', '')}'>" if card.get('nome_imagem') else "",
                f"[sound:{card.get('nome_audio_palavra', '')}]" if card.get('nome_audio_palavra') else "",
                f"[sound:{card.get('nome_audio_frase', '')}]" if card.get('nome_audio_frase') else "",
            ]
        else:
            fields = [
                card.get('hanzi', ''),
                card.get('pinyin', ''),
                card.get('traducao_pt', ''),
                card.get('classe_gramatical', ''),
                card.get('frase_exemplo_hanzi', ''),
                card.get('frase_exemplo_pinyin', ''),
                card.get('frase_exemplo_traducao', ''),
                card.get('tags', ''),
                f"<img src='{card.get('nome_imagem', '')}'>" if card.get('nome_imagem') else "",
                f"[sound:{card.get('nome_audio_palavra', '')}]" if card.get('nome_audio_palavra') else "",
                f"[sound:{card.get('nome_audio_frase', '')}]" if card.get('nome_audio_frase') else "",
            ]

        nota = genanki.Note(
            model=modelo,
            fields=fields,
            tags=[card.get('tags', 'IA')]
        )
        meu_baralho.add_note(nota)
        
        if card.get('caminho_imagem'): arquivos_midia.append(card['caminho_imagem'])
        if card.get('caminho_audio_palavra'): arquivos_midia.append(card['caminho_audio_palavra'])
        if card.get('caminho_audio_frase'): arquivos_midia.append(card['caminho_audio_frase'])

    pacote = genanki.Package(meu_baralho)
    pacote.media_files = list(set(arquivos_midia))
    pacote.write_to_file(nome_arquivo_saida)
    print(f"[Genanki] Sucesso! Baralho gerado: {nome_arquivo_saida}")

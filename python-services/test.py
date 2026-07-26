import os
import requests
from modulos.llm_agent import gerar_flashcards_json
from modulos.gerador_apkg import criar_baralho_apkg
from modulos.gerador_audio import gerar_audio_local
from modulos.language_config import get_language_config

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "SUA_CHAVE_AQUI")

def baixar_imagem_pexels(termo_busca, id_unico):
    print(f"  -> [Imagem] Buscando: {termo_busca}")
    url_busca = f"https://api.pexels.com/v1/search?query={termo_busca}&per_page=1"
    headers = {"Authorization": PEXELS_API_KEY}
    
    try:
        resposta = requests.get(url_busca, headers=headers)
        if resposta.status_code == 200 and resposta.json().get("photos"):
            url_img = resposta.json()["photos"][0]["src"]["medium"]
            img_data = requests.get(url_img).content
            
            nome_arquivo = f"{id_unico}.jpg"
            caminho = os.path.join("media_temp", nome_arquivo)
            with open(caminho, "wb") as f: f.write(img_data)
            return caminho, nome_arquivo
    except Exception as e:
        print(f"  -> [Erro Imagem]: {e}")
    return None, None

def _get_card_texts(card: dict, language: str) -> tuple[str, str, str]:
    if language == "english":
        palavra = card.get("palavra_en", "")
        frase = card.get("frase_exemplo_en", "")
        referencia = palavra
    elif language == "french":
        palavra = card.get("palavra_fr", "")
        frase = card.get("frase_exemplo_fr", "")
        referencia = palavra
    elif language == "japanese":
        palavra = card.get("kanji", "")
        frase = card.get("frase_exemplo_jp", "")
        referencia = palavra
    else:
        palavra = card.get("hanzi", "")
        frase = card.get("frase_exemplo_hanzi", "")
        referencia = palavra
    return palavra, frase, referencia


def pipeline_principal(input_usuario: str, language: str = "mandarin"):
    os.makedirs("media_temp", exist_ok=True)
    config = get_language_config(language)
    
    try:
        print("\n=== INICIANDO PIPELINE DE FLASHCARDS ===")
        flashcards = gerar_flashcards_json(input_usuario, language=language)
        
        for card in flashcards:
            palavra, frase, referencia = _get_card_texts(card, language)
            print(f"\nProcessando midia para o card: {referencia}")
            
            # 1. Imagem
            cam_img, nom_img = baixar_imagem_pexels(card['termo_busca_imagem_en'], card['id_unico'])
            card['caminho_imagem'] = cam_img
            card['nome_imagem'] = nom_img
            
            # 2. Áudio da Palavra (Agora usando o módulo direto)
            cam_aud_palavra, nom_aud_palavra = gerar_audio_local(palavra, card['id_unico'], config["voice"])
            card['caminho_audio_palavra'] = cam_aud_palavra
            card['nome_audio_palavra'] = nom_aud_palavra

            # 3. Áudio da Frase (Usando o sufixo _frase)
            cam_aud_frase, nom_aud_frase = gerar_audio_local(frase, f"{card['id_unico']}_frase", config["voice"])
            card['caminho_audio_frase'] = cam_aud_frase
            card['nome_audio_frase'] = nom_aud_frase

        criar_baralho_apkg(flashcards, config["apkg_name"], language=language)
        print("\n=== PROCESSO FINALIZADO COM SUCESSO ===")
        
    except Exception as e:
        print(f"\n=== ERRO ===\n{e}\n")

if __name__ == "__main__":
    
    lista_teste = "vampiro, mel, dança, escorregador, lápis"
    # , poder, para, telefonar, telefone, telefornar a alguem, meu, nosso, numero, zero, enviar, e-mail, eletronica, correio, este, feminino, amigo, fazer favor, entrar, sentar-se, agradecer, beber, cha, onde, instituto, como, grande, bonito, gostar, aquilo, masculino, pequeno, Universidade de Lisboa, Faculdade de Letras, Canada, Instituto Oriental"

    pipeline_principal(lista_teste, language="japanese")

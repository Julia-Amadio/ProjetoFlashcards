import os
import requests

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "COLE_SUA_CHAVE_AQUI")

def buscar_url_imagem(termo_em_ingles: str) -> str:
    """Busca a imagem no Pexels e retorna a tag HTML com a URL direta."""
    print(f"[Imagem] Buscando URL para: '{termo_em_ingles}'...")
    url_busca = f"https://api.pexels.com/v1/search?query={termo_em_ingles}&per_page=1"
    headers = {"Authorization": PEXELS_API_KEY}
    
    try:
        resposta = requests.get(url_busca, headers=headers, timeout=10)
        resposta.raise_for_status()
        dados = resposta.json()
        
        if not dados.get("photos"):
            print(f"  -> [Aviso] Nenhuma imagem encontrada para '{termo_em_ingles}'.")
            return ""
            
        # Pega a URL direta da imagem hospedada no Pexels
        url_imagem = dados["photos"][0]["src"]["medium"]
        
        print(f" {termo_em_ingles} -> [Sucesso] URL capturada!")
        # Retorna a tag de imagem pronta para o Anki renderizar a URL da web
        return f'<img src="{url_imagem}">'
        
    except Exception as e:
        print(f"  -> [Erro] Falha ao buscar imagem: {e}")
        return ""


def baixar_imagem_para_arquivo(termo_em_ingles: str, caminho_destino: str) -> bool:
    """Busca imagem no Pexels e salva os bytes no arquivo especificado."""
    url_busca = f"https://api.pexels.com/v1/search?query={termo_em_ingles}&per_page=1"
    headers = {"Authorization": PEXELS_API_KEY}

    try:
        resposta = requests.get(url_busca, headers=headers, timeout=10)
        resposta.raise_for_status()
        dados = resposta.json()

        if not dados.get("photos"):
            return False

        url_imagem = dados["photos"][0]["src"]["medium"]
        img_resp = requests.get(url_imagem, timeout=10)
        img_resp.raise_for_status()

        with open(caminho_destino, "wb") as f:
            f.write(img_resp.content)

        return True
    except Exception:
        return False
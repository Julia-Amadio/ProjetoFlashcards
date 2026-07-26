# modulos/gerador_audio.py
import os
import edge_tts
import asyncio

async def _gerar_audio_async(texto: str, caminho_saida: str, voz: str):
    """Função interna assíncrona que realmente se comunica com a Microsoft."""
    communicate = edge_tts.Communicate(texto, voz)
    await communicate.save(caminho_saida)

def gerar_audio_local(texto: str, nome_arquivo_base: str, voz: str):
    """
    Função síncrona que o main.py vai chamar. 
    Ela usa o asyncio para rodar a função assíncrona acima.
    """
    print(f"  -> [Audio] Gerando via Edge-TTS: {texto}")
    
    try:
        nome_arquivo = f"{nome_arquivo_base}.mp3"
        caminho = os.path.join("media_temp", nome_arquivo)
        
        # Roda o processo assíncrono e espera ele terminar
        asyncio.run(_gerar_audio_async(texto, caminho, voz))
        
        return caminho, nome_arquivo
        
    except Exception as e:
        print(f"  -> [Erro Áudio]: {e}")
        return None, None
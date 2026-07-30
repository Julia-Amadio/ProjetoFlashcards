import os
from fastapi import Header, HTTPException


async def verify_internal_token(x_internal_token: str = Header(None)):
    # Sem fallback de proposito: se INTERNAL_SECRET nao estiver configurado, a rota
    # ficava aberta pra qualquer um (sem token, sem admin) chamar /generate direto e
    # gastar credito da API de LLM. Falha fechada em vez de aberta.
    internal_secret = os.getenv("INTERNAL_SECRET")
    if not internal_secret or x_internal_token != internal_secret:
        raise HTTPException(status_code=401, detail="Invalid internal token")

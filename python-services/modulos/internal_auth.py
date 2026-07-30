import os
from fastapi import Header, HTTPException


async def verify_internal_token(x_internal_token: str = Header(None)):
    internal_secret = os.getenv("INTERNAL_SECRET")
    if not internal_secret:
        return
    if x_internal_token != internal_secret:
        raise HTTPException(status_code=401, detail="Invalid internal token")

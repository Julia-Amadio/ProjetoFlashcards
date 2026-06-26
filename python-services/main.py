# Stub de main.py para testes do docker
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "AI Service running"}

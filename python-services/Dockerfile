# --- STAGE 1: builder ---
# Instala dependências em uma pasta isolada.
# Tudo que for ferramenta de build fica aqui e não vai para a imagem final.
FROM python:3.12-slim AS builder
WORKDIR /app

# Descomente as duas linhas abaixo se algum pacote do requirements.txt
# passar a exigir compilação (o erro no build costuma ser bem claro:
# "gcc: command not found" ou "error: command 'gcc' failed").
# RUN apt-get update && apt-get install -y --no-install-recommends gcc \
#     && rm -rf /var/lib/apt/lists/*

# Copia só o requirements.txt primeiro. O Docker cacheia cada instrução
# como uma "layer"; o pip só roda de novo quando esse arquivo mudar,
# não a cada alteração no código da aplicação.
COPY requirements.txt .

# --no-cache-dir: não salva cache do pip, reduz tamanho da imagem.
# --prefix: instala em pasta separada para facilitar a cópia no stage final.
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- STAGE 2: final ---
# Imagem limpa de execução
# Não contém pip, gcc nem ferramentas de build.
FROM python:3.12-slim
WORKDIR /app

# Cria usuário não-root antes de copiar qualquer coisa.
RUN adduser --disabled-password --gecos "" appuser
# 1. --disabled-password: o usuário não tem senha, ou seja, ninguém consegue fazer
#    login interativo como ele. Para um container isso é o correto, nenhum
#    humano vai "logar" nele.
# 2. --gecos "": GECOS é um campo antigo do Unix que armazena informações pessoais
#    do usuário (nome completo, telefone, etc). A flag vazia pula essas perguntas
#    interativas que o adduser normalmente faria.
# 3. appuser: o nome do usuário criado.
# O objetivo aqui é ter um usuário com o mínimo de privilégios possível.

# Funde os pacotes instalados no builder com o path padrão do Python do sistema
COPY --from=builder /install /usr/local

# Copia o código da aplicação.
COPY . .

# Transfere a propriedade dos arquivos para o usuário não-root
RUN chown -R appuser:appuser /app
USER appuser

# Documenta que o container escuta na porta 8000
EXPOSE 8000

# Verifica se o container está saudável a cada 30 segundos.
# Caso ocorram três falhas consecutivas, o container é marcado como 'unhealthy',
# e o orquestrador pode reiniciá-lo ou tirar ele do load balancer.
# Usa a rota "/" do main.py atual (retorna {"status": "AI Service running"}).
# Se o serviço ganhar uma rota /health dedicada, é só trocar aqui.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

# --host 0.0.0.0 é obrigatório: sem isso o Uvicorn só escuta em localhost
# *dentro* do container, e o Docker não consegue rotear a porta pra fora.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# tools/api-endpoint.py
# v1.1.0 - Servidor de API (FastAPI)
#
# MUDANÇAS v1.1.0:
# 1. (COESÃO) Importa a lógica 'core' unificada do alignment_visualizer.py.
# 2. (FÍSICA) Expõe a "Física v1.1.0" (SD + Minimalismo) como um endpoint JSON.

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
import sys

# --- Importação Cirúrgica ---
# Importa a função "coração" do framework.
try:
    from alignment_visualizer import generate_alignment_report
except ImportError:
    print("Erro: Falha ao importar 'generate_alignment_report'.", file=sys.stderr)
    print("Certifique-se que 'alignment_visualizer.py' está no mesmo diretório.", file=sys.stderr)
    sys.exit(1)

# --- Definição da API ---

app = FastAPI(
    title="Agente Canivete Cirúrgico (ACC) - API de Análise",
    description="API para calcular a 'Física' do ACC (Densidade Semântica e Minimalismo) para um Agente.",
    version="1.1.0"
)

class AlignmentRequest(BaseModel):
    """
    Define o corpo da requisição para a análise.
    """
    agent_name: str
    domain: str

    class Config:
        schema_extra = {
            "example": {
                "agent_name": "Hacker Semântico",
                "domain": "análise forense de APIs e ofertas de tecnologia"
            }
        }

class AlignmentResponse(BaseModel):
    """
    Define a resposta (espelha a saída do 'generate_alignment_report').
    """
    agent_name: str
    domain: str
    semantic_density: float
    word_count: int
    recommendations: list[str]
    # Você pode adicionar os outros campos (keywords_analysis, etc.) se necessário

@app.post("/api/v1/analyze-alignment", response_model=AlignmentResponse)
async def analyze_alignment(request: AlignmentRequest):
    """
    Endpoint principal.
    
    Recebe um Nome de Agente e um Domínio, e retorna o relatório
    completo de alinhamento com a "Física v1.1.0".
    """
    
    # Chama a lógica "core" unificada
    report = generate_alignment_report(
        request.agent_name, 
        request.domain
    )
    
    # Retorna o relatório completo. O FastAPI o serializará para JSON.
    return report

# --- Executor (para rodar o servidor) ---

def main():
    """
    Inicia o servidor da API.
    """
    print(f"\n{'='*70}")
    print(f"🚀 Iniciando Servidor da API - ACC (v1.1.0)")
    print(f"   Endpoint: http://127.0.0.1:8000/api/v1/analyze-alignment")
    print(f"   Docs (Swagger): http://127.0.0.1:8000/docs")
    print(f"{'='*70}\n")
    
    uvicorn.run(app, host="127.0.0.1", port=8000)

if __name__ == "__main__":
    main()

# Para executar:
# 1. Instale o uvicorn e fastapi:
#    pip install fastapi uvicorn
# 2. Rode o script:
#    python tools/api-endpoint.py

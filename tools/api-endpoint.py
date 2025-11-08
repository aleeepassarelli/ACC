from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AlignmentRequest(BaseModel):
    agent_name: str
    domain: str

@app.post("/api/alignment-analysis")
async def analyze_alignment(request: AlignmentRequest):
    """
    Endpoint para análise de alinhamento completa
    
    Example request:
    {
        "agent_name": "explorador",
        "domain": "Varredura multi-camada de APIs gratuitas de IA"
    }
    
    Example response:
    {
        "overall_sd": 0.65,
        "keywords": [
            {
                "word": "apis",
                "type": "technical",
                "alignment": 0.82,
                "contribution": 0.75
            },
            ...
        ],
        "top_contributors": ["apis", "varredura"],
        "recommendations": [...]
    }
    """
    
    report = generate_alignment_report(
        request.agent_name, 
        request.domain
    )
    
    return report

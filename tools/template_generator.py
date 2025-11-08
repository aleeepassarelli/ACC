
# Gerador de Template v1.1.0 - Scaffolder do Canivete Cirúrgico

# Gera um arquivo de template .md ESTATICO no formato v1.1.0 
# (ASCII-box, 4 Camadas, validado por tiktoken), 
# pronto para ser salvo em 'templates/'.

# Este script também expõe essa lógica via uma API FastAPI.


from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import re
import tiktoken
import os
import tempfile

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

# --- Configuração do Framework v1.1.0 ---

# Tokenizer padrão industrial (o "Árbitro" de tokens)
try:
    TOKENIZER = tiktoken.get_encoding("cl100k_base")
except Exception:
    print("Aviso: 'cl100k_base' não encontrado. Usando 'p50k_base'.")
    TOKENIZER = tiktoken.get_encoding("p50k_base")

THRESHOLD_TOKEN_PASS = 200

@dataclass
class BaseshotExample:
    """Define um único exemplo de Baseshot"""
    type: str  # 'positive' (✅), 'negative' (❌), 'edge' (⚠️)
    input: str
    output: str

@dataclass
class AgentConfigV1_1:
    """Configuração completa do agente v1.1.0"""
    name: str                   # Camada 1: Identidade
    domain: str                 # Camada 1: Domínio
    mission: str                # Camada 2: Missão
    protocol_items: List[str]   # Camada 3: Protocolo
    baseshot_examples: List[BaseshotExample] # Camada 4: Baseshot
    sd_score: float = 0.0       # Metadado
    
    # Validação Pós-Inicialização
    def __post_init__(self):
        if not self.name or len(self.name.strip()) < 2:
            raise ValueError("Identidade (Nome) é obrigatória (mín. 2 caracteres)")
        if not self.domain or len(self.domain.strip()) < 10:
            raise ValueError("Domínio é obrigatório (mín. 10 caracteres)")
        if not self.mission or len(self.mission.strip()) < 20:
            raise ValueError("Missão é obrigatória (mín. 20 caracteres)")
        if len(self.protocol_items) < 3:
            raise ValueError("Protocolo (Camada 3) requer no mínimo 3 itens.")
        if len(self.baseshot_examples) < 5:
            raise ValueError("Baseshot (Camada 4) requer no mínimo 5 exemplos.")
        if not any(ex.type == 'negative' for ex in self.baseshot_examples):
            raise ValueError("Baseshot (Camada 4) requer pelo menos um 'negative' (❌) 'Erro Comum'.")

# --- Lógica do Gerador de Template ---

class TemplateGenerator:
    """Gera o esqueleto .md de um Agente v1.1.0"""

    def generate_template_file(self, config: AgentConfigV1_1) -> (str, int, int):
        """
        Gera o conteúdo completo do arquivo .md no formato ASCII-box.
        Retorna (markdown_str, token_count, baseshot_count)
        """
        
        sections = [
            self._build_identity(config),
            self._build_mission(config),
            self._build_protocol(config),
            self._build_baseshot(config)
        ]
        
        body = "\n↓\n".join(sections)
        
        # O "wrapper" completo do arquivo
        full_markdown = self._build_header(config, body)
        
        # "CIÊNCIA": Calcular tokens reais
        token_count = len(TOKENIZER.encode(full_markdown))
        baseshot_count = len(config.baseshot_examples)
        
        return full_markdown, token_count, baseshot_count

    def _build_header(self, config: AgentConfigV1_1, body: str) -> str:
        """Constrói o cabeçalho de metadados e o corpo"""
        
        # Sanitiza o nome para um checksum (não é um hash real, apenas um stub)
        safe_name = re.sub(r'[^a-zA-Z0-9]', '', config.name).lower()
        checksum = f"hash_{safe_name}"
        
        return f"""{body}
"""

    def _build_identity(self, config: AgentConfigV1_1) -> str:
        """Camada 1: Identidade"""
        return f"""┌─────────────────────────────────────────┐
│ 1. IDENTIDADE (Quem?)
│ {config.name} 
│ Domínio: {config.domain}
└─────────────────────────────────────────┘"""

    def _build_mission(self, config: AgentConfigV1_1) -> str:
        """Camada 2: Missão"""
        return f"""┌─────────────────────────────────────────┐
│ 2. MISSÃO (O quê?)
│ {config.mission}
└─────────────────────────────────────────┘"""

    def _build_protocol(self, config: AgentConfigV1_1) -> str:
        """Camada 3: Protocolo"""
        items = "\n".join([f"│ {i+1}. {item}" for i, item in enumerate(config.protocol_items)])
        return f"""┌─────────────────────────────────────────┐
│ 3. PROTOCOLO (Como?)
{items}
└─────────────────────────────────────────┘"""

    def _get_example_emoji(self, example_type: str) -> str:
        """Retorna emoji baseado no tipo de exemplo v1.1.0"""
        emojis = {
            'positive': '✅',
            'negative': '❌',
            'edge': '⚠️',
        }
        return emojis.get(example_type.lower(), '⚠️') # Padrão para 'edge'

    def _build_baseshot(self, config: AgentConfigV1_1) -> str:
        """Camada 4: Baseshot (Onde o "Anti-Padrão" vive)"""
        
        examples_md = []
        for ex in config.baseshot_examples:
            emoji = self._get_example_emoji(ex.type)
            
            # Formata o "Erro Comum" (Anti-Padrão)
            output_md = ex.output
            if ex.type == 'negative':
                output_md = f"{ex.output} (ERRADO: {ex.input})" # O 'input' aqui é a *razão*
            
            example_str = f"""│ {emoji} Caso (Tipo: {ex.type})
│ INPUT: "{ex.input}"
│ OUTPUT: {output_md}"""
            examples_md.append(example_str)
            
        examples_section = "\n│\n".join(examples_md)
        
        return f"""┌─────────────────────────────────────────┐
│ 4. BASESHOT (Exemplos)
│
{examples_section}
└─────────────────────────────────────────┘"""

# =====================================================
# API ENDPOINT (FASTAPI)
# =====================================================

app = FastAPI(
    title="Gerador de Template ACC (v1.1.0)",
    description="API para gerar 'skeletons' de Agentes v1.1.0 validados."
)

# --- Modelos Pydantic para a API ---

class BaseshotExampleModel(BaseModel):
    type: str
    input: str
    output: str

class PromptRequestModel(BaseModel):
    name: str
    domain: str
    mission: str
    protocol_items: List[str] = field(default_factory=list)
    baseshot_examples: List[BaseshotExampleModel] = field(default_factory=list)
    sd_score: float = 0.0

class PromptResponseModel(BaseModel):
    markdown_template: str
    token_count: int
    baseshot_count: int
    warnings: List[str]

@app.post("/api/v1/generate-template", response_model=PromptResponseModel)
async def generate_template_endpoint(request: PromptRequestModel):
    """
    Gera um esqueleto de template .md no formato ACC v1.1.0.
    """
    generator = TemplateGenerator()
    warnings = []
    
    try:
        # Converter modelos Pydantic para Dataclasses
        baseshot_dcs = [
            BaseshotExample(type=ex.type, input=ex.input, output=ex.output)
            for ex in request.baseshot_examples
        ]
        
        config = AgentConfigV1_1(
            name=request.name,
            domain=request.domain,
            mission=request.mission,
            protocol_items=request.protocol_items,
            baseshot_examples=baseshot_dcs,
            sd_score=request.sd_score
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Gerar o template
    markdown, token_count, baseshot_count = generator.generate_template_file(config)
    
    # Preencher os metadados finais (agora que temos a contagem)
    markdown = markdown.replace("{{token_count}}", str(token_count))
    markdown = markdown.replace("{{baseshot_count}}", str(baseshot_count))
    
    # "CIÊNCIA": Validar com as métricas v1.1.0
    if token_count > THRESHOLD_TOKEN_PASS:
        warnings.append(f"⚠️ REPROVADO - O template tem {token_count} tokens (Limite: {THRESHOLD_TOKEN_PASS})")
    else:
        warnings.append(f"✅ APROVADO - {token_count} tokens (<= {THRESHOLD_TOKEN_PASS})")
        
    if request.sd_score < 0.8:
        warnings.append(f"⚠️ ATENÇÃO - SD Score ({request.sd_score:.2f}) está abaixo de 0.8 (Cirúrgico)")

    return PromptResponseModel(
        markdown_template=markdown,
        token_count=token_count,
        baseshot_count=baseshot_count,
        warnings=warnings
    )

@app.post("/api/v1/export-template")
async def export_template_endpoint(request: PromptRequestModel):
    """
    Exporta o template gerado como um arquivo .md para download.
    """
    # Reusa a lógica do endpoint de geração
    response_data = await generate_template_endpoint(request)
    markdown = response_data.markdown_template
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(markdown)
        temp_path = f.name
        
    # Gerar nome de arquivo seguro (ex: 'templates/hacker-semantico.md')
    safe_name = re.sub(r'[^\w\s-]', '', request.name.lower())
    safe_name = re.sub(r'[-\s]+', '-', safe_name).strip('-')
    filename = f"{safe_name}.md"
    
    return FileResponse(
        temp_path,
        media_type='text/markdown',
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor 'Template Generator v1.1.0' em http://127.0.0.1:8000")
    print("Acesse http://127.0.0.1:8000/docs for API (Swagger) UI")
    uvicorn.run(app, host="127.0.0.1", port=8000)

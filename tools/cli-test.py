# tools/cli-test.py
# v1.1.0 - Ferramenta de Teste de Comportamento (CLI)
#
# OBJETIVO:
# Executar um template de Agente ACC contra um LLM real para 
# validar o comportamento e a aderência ao protocolo.
#
# DEPENDÊNCIAS:
# 1. google-generativeai (para acesso ao LLM)
#
# CONFIGURAÇÃO (Variável de Ambiente):
# Para usar, você DEVE configurar sua API key:
# export GOOGLE_API_KEY="SUA_API_KEY_AQUI"
#

import os
import sys
import argparse
import google.generativeai as genai
from pathlib import Path

# --- Configuração do LLM ---
# O modelo padrão "canivete": rápido, barato e potente.
DEFAULT_MODEL = "gemini-1.5-flash-latest"

def load_api_key():
    """Carrega a API key da variável de ambiente."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Erro: Variável de ambiente 'GOOGLE_API_KEY' não definida.", file=sys.stderr)
        print("Execute: export GOOGLE_API_KEY='SUA_API_KEY_AQUI'", file=sys.stderr)
        sys.exit(1)
    return api_key

def read_template_file(file_path: str) -> str:
    """Lê o conteúdo do arquivo de template do Agente."""
    path = Path(file_path)
    if not path.is_file():
        print(f"Erro: Arquivo de template não encontrado: {file_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Erro ao ler o arquivo {file_path}: {e}", file=sys.stderr)
        sys.exit(1)

def run_agent_test(template_content: str, user_query: str, model_name: str) -> str:
    """
    Combina o template com o query e executa no LLM.
    """
    
    # --- O "Acoplamento" Cirúrgico ---
    # O prompt final é a concatenação do sistema (template) e do usuário (query)
    full_prompt = f"""{template_content}

---
TAREFA DO USUÁRIO:
{user_query}
"""
    
    print(f"⏳ Executando Agente no modelo: {model_name}...")
    
    try:
        genai.configure(api_key=load_api_key())
        model = genai.GenerativeModel(model_name)
        
        # Configurações de geração "cirúrgicas"
        # Baixa temperatura para reduzir alucinação e aumentar a aderência
        # ao protocolo (determinismo).
        generation_config = genai.GenerationConfig(
            temperature=0.1,
            top_p=0.9,
            top_k=10
        )
        
        response = model.generate_content(
            full_prompt,
            generation_config=generation_config
        )
        
        return response.text
        
    except Exception as e:
        print(f"\nErro durante a chamada da API do LLM: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    """
    Ponto de entrada do CLI.
    """
    parser = argparse.ArgumentParser(
        description='Ferramenta de Teste de Comportamento (ACC v1.1.0)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
==========================================
EXEMPLO DE USO (Validando o Hacker Semântico)
==========================================

$ python tools/cli-test.py \\
    -t "templates/hacker-semantico.md" \\
    -q "Analise esta oferta: 'Cloud Mágica que escala infinito e usa IA quântica.'"

... (aguarde a resposta) ...

=========================================
🤖 RESPOSTA DO AGENTE (SAÍDA ESPERADA)
=========================================
- "Infinito": Termo de marketing.
- "IA quântica": Termo de marketing.
- Fatores de Custo: Qual a métrica de billing? (CPU, GB, IOPS?)
- Lock-in: APIs proprietárias? Compatível com S3/Postgres?
"""
    )
    
    parser.add_argument('-t', '--template', type=str, required=True,
                        help='Caminho para o arquivo .md do template do Agente.')
    parser.add_argument('-q', '--query', type=str, required=True,
                        help='A tarefa (query) a ser executada pelo Agente.')
    parser.add_argument('-m', '--model', type=str, default=DEFAULT_MODEL,
                        help=f'Nome do modelo LLM a ser usado (Padrão: {DEFAULT_MODEL}).')
    
    args = parser.parse_args()
    
    # 1. Carregar o "cérebro" do Agente
    template_content = read_template_file(args.template)
    
    # 2. Executar a simulação
    agent_response = run_agent_test(template_content, args.query, args.model)
    
    # 3. Imprimir o resultado
    print(f"\n{'='*70}")
    print(f"🤖 RESPOSTA DO AGENTE ({args.model})")
    print(f"{'='*70}\n")
    print(agent_response)
    print(f"\n{'='*70}\n")

if __name__ == "__main__":
    main()

# tools/token-counter.py
# v1.1.0 - Contador de Tokens (Padrão Industrial)
#
# OBJETIVO:
# Validar a métrica de "Minimalismo" (< 200 tokens) 
# usando o tokenizer padrão da OpenAI (GPT-4).

import sys
import tiktoken
import argparse
from pathlib import Path

# Tokenizer padrão da indústria (usado pelo GPT-4, GPT-3.5-Turbo, etc.)
TOKENIZER_NAME = "cl100k_base"

# --- Constante de Validação (A "Ciência" do ACC) ---
THRESHOLD_TOKEN_PASS = 200

def count_tokens_from_file(file_path: str) -> (int, str):
    """
    Lê um arquivo e conta seus tokens usando o tokenizer 'cl100k_base'.
    """
    path = Path(file_path)
    if not path.is_file():
        print(f"Erro: Arquivo não encontrado: {file_path}", file=sys.stderr)
        sys.exit(1)

    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Erro ao ler o arquivo {file_path}: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        encoding = tiktoken.get_encoding(TOKENIZER_NAME)
        token_list = encoding.encode(content)
        token_count = len(token_list)
        return token_count, content
    except Exception as e:
        print(f"Erro ao processar tokens: {e}", file=sys.stderr)
        print("Tente: pip install tiktoken", file=sys.stderr)
        sys.exit(1)

def main():
    """
    Ponto de entrada do CLI.
    """
    parser = argparse.ArgumentParser(
        description=f'Contador de Tokens (ACC v1.1.0) - Padrão: {TOKENIZER_NAME}',
        epilog="Exemplo: python tools/token-counter.py templates/hacker-semantico.md"
    )
    
    parser.add_argument(
        'template_file', 
        type=str, 
        help='Caminho para o arquivo .md do template do Agente.'
    )
    
    args = parser.parse_args()
    
    token_count, content = count_tokens_from_file(args.template_file)
    word_count = len(content.split())
    char_count = len(content)
    
    print(f"\n{'='*70}")
    print(f"📊 ANÁLISE DE TAMANHO: {args.template_file}")
    print(f"{'='*70}\n")
    
    print(f"Contagem de Tokens (tiktoken 'cl100k_base'): {token_count}")
    print(f"Contagem de Palavras: {word_count}")
    print(f"Contagem de Caracteres: {char_count}\n")
    
    print(f"{'='*70}")
    print(f"🎯 VEREDITO (Minimalismo)")
    print(f"{'='*70}\n")
    
    if token_count <= THRESHOLD_TOKEN_PASS:
        print(f"✅ APROVADO - Contagem cirúrgica ({token_count} <= {THRESHOLD_TOKEN_PASS} tokens)")
    else:
        print(f"❌ REPROVADO - Contagem alta ({token_count} > {THRESHOLD_TOKEN_PASS} tokens)")
        print(f"   Sugestão: Refine o template para reduzir o tamanho.")
    print(f"\n{'='*70}\n")

if __name__ == "__main__":
    main()

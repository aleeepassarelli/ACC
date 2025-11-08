# tools/strategy_generator.py
# v1.1.0 - Gerador de Candidatos (Sem Spacy)
#
# MUDANÇAS v1.1.0:
# 1. (REMOÇÃO) Dependência do 'spacy' removida.
# 2. (COESÃO) Agora importa a lógica de extração de keywords 
#    diretamente do 'alignment_visualizer.py'.
# 3. (FLUXO) Foca em ser o Passo 1: "Gerar" candidatos para 
#    o Passo 2: "Validar" com o 'semantic-density-calculator.py'.

import sys
import argparse
from typing import List, Set

# --- Importação Cirúrgica ---
# Importa a lógica "Canivete" de extração de SINAL do 
# script "coração" do framework.
try:
    from alignment_visualizer import extract_domain_keywords
except ImportError:
    print("Erro: Falha ao importar 'extract_domain_keywords'.", file=sys.stderr)
    print("Certifique-se que 'alignment_visualizer.py' está no mesmo diretório.", file=sys.stderr)
    sys.exit(1)

def generate_name_candidates(name_base: str, domain: str, top_n: int = 5) -> List[str]:
    """
    Gera uma lista de nomes candidatos para o Agente, combinando o
    Nome Base com as keywords "SINAL" (Técnico/Ação/Domínio) do Domínio.
    
    Respeita a regra de "Minimalismo" (máx 3 palavras).
    
    Args:
        name_base (str): O nome raiz (ex: "Hacker")
        domain (str): O texto completo do domínio alvo.
        top_n (int): O número de keywords principais a usar (padrão 5).
        
    Returns:
        List[str]: Uma lista de candidatos únicos (ex: "Hacker de API").
    """
    
    # 1. Extrai as keywords "SINAL" usando a lógica central do ACC
    #    (Já filtra 'quality' terms e stopwords)
    keywords_data = extract_domain_keywords(domain, top_n=top_n)
    
    if not keywords_data:
        print("Aviso: Nenhuma keyword 'SINAL' extraída do domínio.", file=sys.stderr)
        return [name_base] # Retorna apenas o nome base

    keywords = [k['word'] for k in keywords_data]
    
    variations: Set[str] = set() # Usar um Set para garantir unicidade
    
    # 2. Gera variações que respeitam o Minimalismo (<= 3 palavras)
    for keyword in keywords:
        
        # Variação 1: "Hacker de API" (2 palavras se nome_base=1)
        # Não adiciona se o nome base já tiver > 1 palavra
        if len(name_base.split()) == 1:
            variations.add(f"{name_base} {keyword}")
        
        # Variação 2: "API Hacker" (Invertido)
        if len(name_base.split()) == 1:
            variations.add(f"{keyword} {name_base}")
            
        # Variação 3: "Hacker de API" (3 palavras)
        variations.add(f"{name_base} de {keyword}")
        
        # Variação 4: "Hacker para API" (3 palavras)
        variations.add(f"{name_base} para {keyword}")

    return list(variations)

def main():
    """
    Executa o CLI para o Gerador de Estratégia.
    """
    parser = argparse.ArgumentParser(
        description='Gerador de Nomes Candidatos (ACC v1.1.0)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
==========================================
EXEMPLO DE USO (FLUXO DE TRABALHO ACC)
==========================================

Este é o PASSO 1 (Gerar).

$ python tools/strategy_generator.py "Hacker" "análise forense de APIs e ofertas tech"

Output (Exemplo):
[
  "Hacker de APIs",
  "APIs Hacker",
  "Hacker para análise",
  "Hacker forense",
  "Hacker Semântico"
]

...

PASSO 2 (Validar):
Pegue os melhores candidatos e use o 'semantic-density-calculator.py'

$ python tools/semantic-density-calculator.py "Hacker Semântico" "análise forense de APIs e ofertas tech" --benchmark
"""
    )
    
    parser.add_argument('name_base', type=str, 
                        help='O Nome Base para o agente (ex: "Hacker", "Auditor")')
    parser.add_argument('domain', type=str, nargs='+',
                        help='O texto completo do Domínio Alvo (ex: "análise de APIs")')
    
    args = parser.parse_args()
    
    # Junta múltiplos argumentos de domínio em um único texto
    domain_text = " ".join(args.domain)
    
    print(f"\n{'='*70}")
    print(f"🧬 GERADOR DE CANDIDATOS (ACC v1.1.0)")
    print(f"{'='*70}\n")
    print(f"Nome Base: {args.name_base}")
    print(f"Domínio:   {domain_text[:60]}...\n")
    
    # --- 1. GERAÇÃO (Exploração) ---
    print("--- 1. Gerando Candidatos (com base em keywords 'SINAL') ---")
    
    candidates = generate_name_candidates(args.name_base, domain_text)
    
    if candidates:
        for i, candidate in enumerate(candidates):
            print(f"  {i+1}. \"{candidate}\"")
    else:
        print("Nenhum candidato gerado.")

    # --- 2. Próximo Passo ---
    print(f"\n{'='*70}")
    print("--- 2. Próximo Passo: Validação (O 'Árbitro') ---")
    print(f"{'='*70}\n")
    print("Use o 'semantic-density-calculator.py' para validar os candidatos:")
    print("\nExemplo (copie e cole):")
    if candidates:
        print(f"$ python tools/semantic-density-calculator.py \"{candidates[0]}\" \"{domain_text}\" --benchmark")
    else:
        print(f"$ python tools/semantic-density-calculator.py \"SEU_CANDIDATO\" \"{domain_text}\" --benchmark")
    print(f"\n{'='*70}\n")

if __name__ == "__main__":
    main()

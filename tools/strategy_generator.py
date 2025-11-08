# tools/strategy_generator.py (Sugiro um novo nome)

import spacy
from typing import List, Set
from collections import Counter

# Carrega o modelo de português. 
# "sm" = small, alinhado com o minimalismo do ACC.
try:
    NLP = spacy.load("pt_core_news_sm")
except IOError:
    print("Erro: Modelo 'pt_core_news_sm' do spacy não encontrado.")
    print("Execute: python -m spacy download pt_core_news_sm")
    exit(1)

# Stopwords do Spacy são mais robustas
STOPWORDS: Set[str] = spacy.lang.pt.stop_words.STOP_WORDS

def extract_key_terms_v1_1(text: str) -> List[str]:
    """
    Extrai termos principais (SINAL) usando Part-of-Speech (POS) Tagging.
    Filtra por Substantivos (NOUN) e Verbos (VERB) para focar na ação e no objeto.
    """
    doc = NLP(text.lower())
    
    keywords = []
    for token in doc:
        # 1. Não é stopword
        # 2. Não é pontuação
        # 3. É um tipo de palavra "SINAL" (Substantivo, Verbo, ou Nomes Próprios)
        if (token.lemma_ not in STOPWORDS and 
            not token.is_punct and 
            token.pos_ in {"NOUN", "VERB", "PROPN"}):
            
            keywords.append(token.lemma_) # Usar o 'lemma' (ex: "análises" -> "análise")
            
    # Contar frequência dos lemmas
    freq = Counter(keywords)
    sorted_keywords = sorted(freq.items(), key=lambda x: -x[1])
    
    return [k for k, v in sorted_keywords[:5]] # Top 5 termos de "SINAL"

def strategy_next_token_prediction(name: str, domain: str) -> List[str]:
    """
    Gera sugestões baseadas em 'próxima palavra provável'
    (v1.1.0 - usando extrator semântico)
    """
    
    # Extrai substantivos/verbos principais do domínio
    domain_keywords = extract_key_terms_v1_1(domain)
    # Resultado (Ex): ["análise", "api", "oferta", "tecnologia"]
    
    variations = []
    
    # Para cada keyword, criar sequência natural [nome] + [preposição] + [keyword]
    for keyword in domain_keywords:
        # Respeita o threshold de minimalismo (3 palavras)
        variations.append(f"{name} de {keyword}")   # "Hacker de api"
        variations.append(f"{name} para {keyword}") # "Hacker para api"
        variations.append(f"{keyword} {name}")      # "Api Hacker" (Invertido)
    
    return list(set(variations)) # Retorna lista única de candidatos

# --- Exemplo de uso ---
if __name__ == "__main__":
    nome_base = "Hacker"
    dominio_alvo = "Um especialista em análise forense de APIs e para desmontar ofertas de tecnologia."
    
    print(f"Nome Base: {nome_base}")
    print(f"Domínio: {dominio_alvo}\n")
    
    # 1. GERAÇÃO (Exploração)
    print("--- 1. Gerando Candidatos ---")
    candidatos = strategy_next_token_prediction(nome_base, dominio_alvo)
    for c in candidatos:
        print(f"  - {c}")
        
    print("\n--- 2. Próximo Passo: Validação ---")
    print("Use o 'semantic-density-calculator.py --benchmark' em cada candidato.")
    print("Exemplo:")
    print(f"$ python tools/semantic-density-calculator.py \"Hacker de análise\" \"{dominio_alvo}\" --benchmark")


def strategy_next_token_prediction(name: str, domain: str) -> List[str]:
    """
    Gera sugestões baseadas em 'próxima palavra provável'
    """
    
    # Extrair substantivos/verbos principais do domínio
    domain_keywords = extract_key_terms(domain)
    # Resultado: ["varredura", "APIs", "gratuitas", "desenvolvimento", "aplicações"]
    
    variations = []
    
    # Para cada keyword, criar sequência natural [nome] + [preposição] + [keyword]
    for keyword in domain_keywords:
        variations.append(f"{name} de {keyword}")  # "explorador de APIs"
        variations.append(f"{name} para {keyword}") # "explorador para APIs"
        variations.append(f"{keyword} {name}")      # "APIs explorador"
    
    return variations

def extract_key_terms(text: str) -> List[str]:
    """
    Extrai termos principais usando TF-IDF ou NER
    """
    # Simples: filtrar stopwords
    stopwords = ['de', 'para', 'a', 'o', 'e', 'com', 'em']
    
    tokens = text.lower().split()
    keywords = [t for t in tokens if t not in stopwords and len(t) > 3]
    
    # Ordenar por relevância (palavras únicas primeiro)
    from collections import Counter
    freq = Counter(keywords)
    sorted_keywords = sorted(freq.items(), key=lambda x: -x[1])
    
    return [k for k, v in sorted_keywords[:5]]  # Top 5

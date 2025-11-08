from sentence_transformers import SentenceTransformer, util
from typing import List, Dict, Tuple
import re
from collections import Counter

# Modelo global
MODEL = SentenceTransformer('all-MiniLM-L6-v2')

# Stopwords PT-BR expandidas
STOPWORDS = {
    'de', 'da', 'do', 'para', 'com', 'sem', 'em', 'na', 'no', 'a', 'o', 'e',
    'ou', 'que', 'um', 'uma', 'os', 'as', 'ao', 'aos', 'à', 'às', 'pelo', 'pela',
    'pelos', 'pelas', 'este', 'esse', 'aquele', 'qual', 'quais', 'seu', 'sua'
}

def extract_domain_keywords(domain: str, top_n: int = 8) -> List[Dict[str, any]]:
    """
    Extrai palavras-chave do domínio com metadata
    
    Args:
        domain: Texto do domínio alvo
        top_n: Quantas keywords retornar
        
    Returns:
        Lista de dicts com {word, type, relevance}
    """
    
    # Normalizar texto
    text = domain.lower()
    
    # Remover pontuação mas manter hífens em palavras compostas
    text = re.sub(r'[^\w\s-]', ' ', text)
    
    # Tokenizar
    tokens = [t.strip() for t in text.split() if len(t.strip()) > 2]
    
    # Filtrar stopwords
    keywords = [t for t in tokens if t not in STOPWORDS]
    
    # Contar frequência
    freq = Counter(keywords)
    
    # Classificar tipo (técnico vs comum)
    classified = []
    for word, count in freq.most_common(top_n):
        word_type = classify_word_type(word)
        
        classified.append({
            'word': word,
            'type': word_type,
            'frequency': count,
            'relevance': min(count / len(keywords), 1.0)  # Normalizado 0-1
        })
    
    return classified

def classify_word_type(word: str) -> str:
    """
    Classifica palavra como técnica, ação, domínio, etc
    """
    
    # Dicionário de classificação (simplificado)
    tech_terms = ['api', 'apis', 'rest', 'http', 'json', 'xml', 'código', 'software', 
                  'sistema', 'aplicação', 'endpoint', 'dados', 'database']
    
    action_verbs = ['análise', 'varredura', 'auditoria', 'desenvolvimento', 'criação',
                    'geração', 'tradução', 'conversão', 'exploração', 'investigação']
    
    quality_terms = ['gratuito', 'gratuitas', 'premium', 'profissional', 'especializado',
                     'avançado', 'simples', 'rápido', 'eficiente']
    
    if word in tech_terms:
        return 'technical'
    elif word in action_verbs:
        return 'action'
    elif word in quality_terms:
        return 'quality'
    else:
        return 'domain'

def calculate_alignment_per_keyword(
    agent_name: str, 
    domain_keywords: List[Dict[str, any]]
) -> List[Dict[str, any]]:
    """
    Calcula alinhamento (cosine similarity) entre nome e cada keyword
    
    Args:
        agent_name: Nome do agente (ex: "explorador")
        domain_keywords: Lista de keywords extraídas do domínio
        
    Returns:
        Keywords com scores de alinhamento adicionados
    """
    
    # Embedding do nome
    name_embedding = MODEL.encode(agent_name, convert_to_tensor=True)
    
    results = []
    
    for keyword_data in domain_keywords:
        keyword = keyword_data['word']
        
        # Embedding da keyword
        keyword_embedding = MODEL.encode(keyword, convert_to_tensor=True)
        
        # Calcular similaridade
        similarity = util.cos_sim(name_embedding, keyword_embedding)[0][0].item()
        
        # Adicionar score de alinhamento
        result = keyword_data.copy()
        result['alignment'] = round(similarity, 3)
        
        # Calcular contribuição ponderada (similarity * relevance)
        result['contribution'] = round(similarity * keyword_data['relevance'], 3)
        
        results.append(result)
    
    # Ordenar por contribuição (maior primeiro)
    results.sort(key=lambda x: x['contribution'], reverse=True)
    
    return results

def generate_alignment_report(agent_name: str, domain: str) -> Dict[str, any]:
    """
    Gera relatório completo de alinhamento
    
    Returns:
        {
            'agent_name': str,
            'domain': str,
            'overall_sd': float,
            'keywords': List[Dict],
            'top_contributors': List[str],
            'weak_links': List[str],
            'recommendations': List[str]
        }
    """
    
    # Calcular SD geral
    name_embed = MODEL.encode(agent_name, convert_to_tensor=True)
    domain_embed = MODEL.encode(domain, convert_to_tensor=True)
    cosine_sim = util.cos_sim(name_embed, domain_embed)[0][0].item()
    word_count = max(len(agent_name.split()), 1)
    overall_sd = cosine_sim / word_count
    
    # Extrair keywords
    domain_keywords = extract_domain_keywords(domain, top_n=8)
    
    # Calcular alinhamento por keyword
    aligned_keywords = calculate_alignment_per_keyword(agent_name, domain_keywords)
    
    # Identificar top contributors (alignment >0.50)
    top_contributors = [
        k['word'] for k in aligned_keywords 
        if k['alignment'] >= 0.50
    ]
    
    # Identificar weak links (alignment <0.30)
    weak_links = [
        k['word'] for k in aligned_keywords 
        if k['alignment'] < 0.30
    ]
    
    # Gerar recomendações
    recommendations = generate_recommendations(
        agent_name, 
        aligned_keywords, 
        overall_sd
    )
    
    return {
        'agent_name': agent_name,
        'domain': domain,
        'overall_sd': round(overall_sd, 3),
        'cosine_similarity': round(cosine_sim, 3),
        'word_count': word_count,
        'keywords': aligned_keywords,
        'top_contributors': top_contributors,
        'weak_links': weak_links,
        'recommendations': recommendations
    }

def generate_recommendations(
    agent_name: str, 
    aligned_keywords: List[Dict], 
    overall_sd: float
) -> List[str]:
    """
    Gera recomendações baseadas na análise de alinhamento
    """
    
    recs = []
    
    # Se SD já está bom
    if overall_sd >= 0.70:
        recs.append("✅ Excelente alinhamento! Nome está bem específico ao domínio.")
        return recs
    
    # Se SD médio (0.50-0.70)
    if 0.50 <= overall_sd < 0.70:
        top_keyword = aligned_keywords[0]['word']
        recs.append(f"💡 Considere incorporar '{top_keyword}' no nome para maior especificidade")
        recs.append(f"Exemplo: '{agent_name} de {top_keyword}'")
        return recs
    
    # Se SD baixo (<0.50)
    if overall_sd < 0.50:
        top_2_keywords = [k['word'] for k in aligned_keywords[:2]]
        
        recs.append("⚠️ Alinhamento fraco. Sugestões:")
        recs.append(f"1. Use termo mais específico que '{agent_name}'")
        recs.append(f"2. Incorpore keywords de alta contribuição: {', '.join(top_2_keywords)}")
        
        # Sugerir sinônimo se nome é muito genérico
        generic_names = ['analista', 'assistente', 'consultor', 'gerente']
        if agent_name.lower() in generic_names:
            recs.append(f"3. Substitua '{agent_name}' por termo mais técnico (ex: 'auditor', 'explorador', 'scanner')")
    
    return recs

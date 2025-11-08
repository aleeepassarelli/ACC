# tools/alignment_visualizer.py
# v1.1.0 - O "Coração" do ACC (Analisador + CLI)
#
# MUDANÇAS v1.1.0:
# 1. (FÍSICA) Unificado com a física v1.1.0:
#    - Densidade Semântica (SD) É a Similaridade de Cossenos (pura).
#    - Minimalismo É a Contagem de Palavras (métrica separada).
# 2. (LÓGICA) 'generate_recommendations' agora avalia AMBAS as métricas.
# 3. (CORE) Este script é a "fonte da verdade" que 'api-endpoint.py' e 
#    'strategy_generator.py' irão importar.

from sentence_transformers import SentenceTransformer, util
from typing import List, Dict, Tuple, Set
import re
import sys
from collections import Counter

# --- Constantes Globais do Framework ---

# Modelo global (carregado uma vez)
try:
    MODEL = SentenceTransformer('all-MiniLM-L6-v2')
except Exception as e:
    print(f"ERRO: Falha ao carregar modelo 'all-MiniLM-L6-v2'.", file=sys.stderr)
    print("Execute: pip install sentence-transformers", file=sys.stderr)
    sys.exit(1)

# Stopwords PT-BR (método "canivete")
STOPWORDS: Set[str] = {
    'de', 'da', 'do', 'para', 'com', 'sem', 'em', 'na', 'no', 'a', 'o', 'e',
    'ou', 'que', 'um', 'uma', 'os', 'as', 'ao', 'aos', 'à', 'às', 'pelo', 'pela',
    'pelos', 'pelas', 'este', 'esse', 'aquele', 'qual', 'quais', 'seu', 'sua'
}

# Thresholds da "Física" v1.1.0
THRESHOLD_SD_PASS = 0.70
THRESHOLD_MINIMALISM_PASS = 3

# --- Parte A: Lógica de Extração (Sinal vs. Ruído) ---
# (Esta lógica será importada pelo 'strategy_generator.py')

def classify_word_type(word: str) -> str:
    """
    Classifica palavra como técnica, ação, domínio, etc. (Método "Canivete")
    """
    # Dicionário de classificação (manual e cirúrgico)
    tech_terms = ['api', 'apis', 'rest', 'http', 'json', 'xml', 'código', 'software',
                    'sistema', 'aplicação', 'endpoint', 'dados', 'database', 'llm', 
                    'ia', 'ai', 'vetor', 'latente', 'semântico']
    
    action_verbs = ['análise', 'varredura', 'auditoria', 'desenvolvimento', 'criação',
                    'geração', 'tradução', 'conversão', 'exploração', 'investigação',
                    'desmontar', 'validar', 'testar', 'mapear']
    
    # "RUÍDO" - Termos de qualidade/marketing que diluem o sinal
    quality_terms = ['gratuito', 'gratuitas', 'premium', 'profissional', 'especializado',
                       'avançado', 'simples', 'rápido', 'eficiente', 'melhor', 'novo']
    
    if word in tech_terms:
        return 'technical' # SINAL
    elif word in action_verbs:
        return 'action' # SINAL
    elif word in quality_terms:
        return 'quality' # RUÍDO
    else:
        return 'domain' # SINAL (neutro)

def extract_domain_keywords(domain: str, top_n: int = 8) -> List[Dict[str, any]]:
    """
    Extrai palavras-chave "SINAL" do domínio com metadata.
    """
    # Normalizar texto
    text = domain.lower()
    # Remover pontuação mas manter hífens
    text = re.sub(r'[^\w\s-]', ' ', text)
    
    # Tokenizar
    tokens = [t.strip() for t in text.split() if len(t.strip()) > 2]
    
    # Filtrar stopwords
    keywords = [t for t in tokens if t not in STOPWORDS]
    
    # Contar frequência
    freq = Counter(keywords)
    
    classified = []
    for word, count in freq.most_common():
        word_type = classify_word_type(word)
        
        # FILTRO CIRÚRGICO: Ignorar "RUÍDO" (termos de qualidade/marketing)
        if word_type == 'quality':
            continue
            
        classified.append({
            'word': word,
            'type': word_type,
            'frequency': count,
            'relevance': min(count / len(keywords), 1.0) # Normalizado 0-1
        })
        
        if len(classified) >= top_n:
            break
            
    return classified

# --- Parte B: Lógica de Análise (O "Coração") ---
# (Esta lógica será importada pelo 'api-endpoint.py')

def calculate_alignment_per_keyword(
    agent_name: str, 
    domain_keywords: List[Dict[str, any]]
) -> List[Dict[str, any]]:
    """
    Calcula alinhamento (cosine similarity) entre nome e CADA keyword "SINAL".
    """
    name_embedding = MODEL.encode(agent_name, convert_to_tensor=True)
    
    results = []
    
    for keyword_data in domain_keywords:
        keyword = keyword_data['word']
        keyword_embedding = MODEL.encode(keyword, convert_to_tensor=True)
        
        similarity = util.cos_sim(name_embedding, keyword_embedding)[0][0].item()
        
        result = keyword_data.copy()
        result['alignment'] = round(similarity, 3)
        
        # Contribuição Ponderada = Quão alinhada E quão relevante
        result['contribution'] = round(similarity * keyword_data['relevance'], 3)
        results.append(result)
        
    # Ordenar por contribuição (maior primeiro)
    results.sort(key=lambda x: x['contribution'], reverse=True)
    
    return results

def generate_recommendations(
    agent_name: str, 
    aligned_keywords: List[Dict], 
    semantic_density: float,
    word_count: int
) -> List[str]:
    """
    [FÍSICA v1.1.0] Gera recomendações baseadas nas duas métricas do ACC:
    1. Densidade Semântica (SD)
    2. Minimalismo (Word Count)
    """
    recs = []
    
    # --- Teste 1: Densidade Semântica ---
    if semantic_density >= THRESHOLD_SD_PASS:
        recs.append(f"✅ (Densidade) APROVADO (SD: {semantic_density:.3f} >= {THRESHOLD_SD_PASS}).")
    elif 0.50 <= semantic_density < THRESHOLD_SD_PASS:
        top_keyword = aligned_keywords[0]['word']
        recs.append(f"⚠️  (Densidade) ATENÇÃO (SD: {semantic_density:.3f}). Alvo > {THRESHOLD_SD_PASS}.")
        recs.append(f"   Sugestão: Incorpore '{top_keyword}' no nome (Ex: '{agent_name} de {top_keyword}')")
    else: # < 0.50
        recs.append(f"❌ (Densidade) REPROVADO (SD: {semantic_density:.3f}).")
        generic_names = ['analista', 'assistente', 'consultor', 'gerente']
        if agent_name.lower() in generic_names:
            recs.append(f"   Sugestão: Substitua '{agent_name}' por termo técnico (ex: 'auditor', 'scanner', 'hacker').")

    # --- Teste 2: Minimalismo ---
    if word_count <= THRESHOLD_MINIMALISM_PASS:
        recs.append(f"✅ (Minimalismo) APROVADO (Palavras: {word_count} <= {THRESHOLD_MINIMALISM_PASS}).")
    else:
        recs.append(f"❌ (Minimalismo) REPROVADO (Palavras: {word_count} > {THRESHOLD_MINIMALISM_PASS}).")
        recs.append(f"   Sugestão: Refine o nome para ser mais curto ({THRESHOLD_MINIMALISM_PASS} palavras max), mantendo a SD alta.")
    
    return recs

def generate_alignment_report(agent_name: str, domain: str) -> Dict[str, any]:
    """
    [FÍSICA v1.1.0] Gera relatório completo de alinhamento.
    Esta é a função "core" importada pela API e outros scripts.
    """
    
    # --- Cálculo da Física v1.1.0 ---
    name_embed = MODEL.encode(agent_name, convert_to_tensor=True)
    domain_embed = MODEL.encode(domain, convert_to_tensor=True)
    
    cosine_sim = util.cos_sim(name_embed, domain_embed)[0][0].item()
    word_count = max(len(agent_name.split()), 1)
    
    # A FÍSICA:
    # 1. SD é a Similaridade de Cossenos (pura) entre Nome e Domínio *Inteiro*.
    semantic_density = cosine_sim
    # 2. Minimalismo é a contagem de palavras.
    minimalism_score = word_count
    
    # --- Análise de Keywords (Diagnóstico) ---
    domain_keywords = extract_domain_keywords(domain, top_n=8)
    aligned_keywords = calculate_alignment_per_keyword(agent_name, domain_keywords)
    
    # Identificar top contributors (alta afinidade com o *Nome*)
    top_contributors = [
        k['word'] for k in aligned_keywords 
        if k['alignment'] >= 0.50
    ]
    
    # Identificar weak links (baixa afinidade com o *Nome*)
    weak_links = [
        k['word'] for k in aligned_keywords 
        if k['alignment'] < 0.30
    ]
    
    # Gerar recomendações com base na FÍSICA
    recommendations = generate_recommendations(
        agent_name, 
        aligned_keywords, 
        semantic_density,  # Passa a SD v1.1.0
        minimalism_score   # Passa o Minimalismo v1.1.0
    )
    
    return {
        'agent_name': agent_name,
        'domain': domain,
        'semantic_density': round(semantic_density, 3), # Métrica Principal
        'word_count': minimalism_score,                 # Métrica Secundária
        'keywords_analysis': aligned_keywords,
        'top_contributors': top_contributors,
        'weak_links': weak_links,
        'recommendations': recommendations
    }

# --- Parte C: Executor CLI (O "Visualizador") ---
# (Este bloco é executado quando o script é chamado diretamente)

def run_cli_visualizer():
    """
    Executa a interface de linha de comando para o visualizador.
    """
    if len(sys.argv) < 3:
        print("Uso: python tools/alignment_visualizer.py 'nome agente' 'domínio alvo'")
        print("Exemplo: python tools/alignment_visualizer.py 'Hacker Semântico' 'análise forense de APIs tech'")
        sys.exit(1)
        
    name = sys.argv[1]
    # Junta todos os argumentos restantes como o domínio
    domain = " ".join(sys.argv[2:])
    
    print(f"\n{'='*70}")
    print(f"🔍 ANÁLISE DE ALINHAMENTO SEMÂNTICO (ACC v1.1.0)")
    print(f"{'='*70}\n")
    
    report = generate_alignment_report(name, domain)
    
    print(f"Agente: {report['agent_name']}")
    print(f"Domínio: {report['domain'][:60]}...")
    
    # --- Métricas Principais (Física v1.1.0) ---
    print(f"\n{'---'*10}")
    print(f"Densidade Semântica (SD): {report['semantic_density']:.3f} (Alvo: > {THRESHOLD_SD_PASS})")
    print(f"Minimalismo (Palavras): {report['word_count']} (Alvo: <= {THRESHOLD_MINIMALISM_PASS})")
    print(f"{'---'*10}\n")
    
    print(f"{'='*70}")
    print(f"📊 ALINHAMENTO POR TERMO DO DOMÍNIO (SINAL)")
    print(f"{'='*70}\n")
    
    if not report['keywords_analysis']:
        print("Nenhum termo 'SINAL' (Técnico/Ação/Domínio) encontrado para analisar.")
        print("Verifique o texto do Domínio ou os dicionários em 'classify_word_type'.")
    
    for keyword in report['keywords_analysis']:
        # Barra de progresso visual
        alignment_score = keyword['alignment']
        # Garante que o score esteja entre 0 e 1 para a barra
        alignment_score_clipped = max(0, min(1, alignment_score))
        
        bar_length = int(alignment_score_clipped * 30)
        bar = '█' * bar_length + '░' * (30 - bar_length)
        
        print(f"{keyword['word']:<20} {bar} {alignment_score:.3f}")
        print(f"{'':20} Tipo: {keyword['type']:<10} | Contribuição: {keyword['contribution']:.3f}\n")
        
    print(f"{'='*70}")
    print(f"💡 INSIGHTS E RECOMENDAÇÕES")
    print(f"{'='*70}\n")
    
    if report['top_contributors']:
        print(f"✅ Top Contributors (alta afinidade do Nome com o termo):")
        print(f"   • {', '.join(report['top_contributors'])}\n")
    
    if report['weak_links']:
        print(f"⚠️ Weak Links (baixa afinidade do Nome com o termo):")
        print(f"   • {', '.join(report['weak_links'])}\n")
    
    print(f"📋 Veredito (baseado na Física v1.1.0):")
    for rec in report['recommendations']:
        print(f"   {rec}")
        
    print(f"\n{'='*70}\n")

if __name__ == "__main__":
    run_cli_visualizer()

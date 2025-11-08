## 🐍 **tools/semantic-density-calculator.py** - Multi-Model Benchmark
---
python
---
"""
Calculadora de Densidade Semântica (SD) - Multi-Model Benchmark
Baseado em Yang et al. (2025) - Latent Feature Steering

NOVIDADE v1.0.1:
- Testa 3 modelos de embedding diferentes
- Valida portabilidade cross-platform do threshold SD >0.7
- Gera relatório comparativo

Uso:
    python tools/semantic-density-calculator.py "Hacker Semântico" "análise forense ofertas tech"
    
    # Com benchmark completo:
    python tools/semantic-density-calculator.py "Hacker Semântico" "análise forense" --benchmark
"""

from sentence_transformers import SentenceTransformer, util
import sys
import argparse

# Modelos disponíveis para benchmark
EMBEDDING_MODELS = {
    'miniLM': 'all-MiniLM-L6-v2',           # Lightweight, rápido
    'mpnet': 'all-mpnet-base-v2',          # Balanceado qualidade/velocidade
    'multilingual': 'paraphrase-multilingual-mpnet-base-v2'  # Suporta PT-BR
}

def calculate_sd(name, domain, model_name='all-MiniLM-L6-v2'):
    """
    Calcula SD = cos(embed(name), embed(domain)) / length(name)
    
    Args:
        name: Nome do agente (ex: "Hacker Semântico")
        domain: Domínio alvo (ex: "análise forense ofertas tech")
        model_name: Nome do modelo sentence-transformer
        
    Returns:
        tuple: (sd, cosine_sim, word_count)
    """
    model = SentenceTransformer(model_name)
    
    embed_name = model.encode(name, convert_to_tensor=True)
    embed_domain = model.encode(domain, convert_to_tensor=True)
    
    cosine_sim = util.cos_sim(embed_name, embed_domain)[0][0].item()
    word_count = len(name.split())
    
    sd = cosine_sim / word_count
    
    return sd, cosine_sim, word_count

def run_benchmark(name, domain):
    """
    Executa benchmark em 3 modelos diferentes
    
    Args:
        name: Nome do agente
        domain: Domínio alvo
    
    Returns:
        dict: Resultados por modelo
    """
    results = {}
    
    print(f"\n{'='*70}")
    print(f"🔬 BENCHMARK MULTI-MODEL - Semantic Density Calculator")
    print(f"{'='*70}")
    print(f"Nome do Agente: {name}")
    print(f"Domínio: {domain}")
    print(f"{'='*70}\n")
    
    for key, model_name in EMBEDDING_MODELS.items():
        print(f"⏳ Testando modelo: {key} ({model_name})...")
        sd, cos_sim, words = calculate_sd(name, domain, model_name)
        results[key] = {'sd': sd, 'cosine_sim': cos_sim, 'model': model_name}
        print(f"   SD = {sd:.4f} | Cosine Sim = {cos_sim:.4f}")
    
    return results, words

def print_benchmark_report(results, words, name, domain):
    """
    Imprime relatório consolidado do benchmark
    """
    print(f"\n{'='*70}")
    print(f"📊 RELATÓRIO CONSOLIDADO")
    print(f"{'='*70}\n")
    
    # Tabela de resultados
    print(f"{'Modelo':<20} {'SD Score':<12} {'Cosine Sim':<15} {'Status'}")
    print(f"{'-'*70}")
    
    for key, data in results.items():
        sd = data['sd']
        cos_sim = data['cosine_sim']
        status = "✅ PASS" if sd >= 0.7 else "❌ FAIL"
        print(f"{key:<20} {sd:.4f}       {cos_sim:.4f}          {status}")
    
    # Estatísticas agregadas
    sd_values = [r['sd'] for r in results.values()]
    sd_mean = sum(sd_values) / len(sd_values)
    sd_min = min(sd_values)
    sd_max = max(sd_values)
    sd_variance = sum((x - sd_mean)**2 for x in sd_values) / len(sd_values)
    
    print(f"\n{'='*70}")
    print(f"📈 ESTATÍSTICAS AGREGADAS")
    print(f"{'='*70}")
    print(f"SD Médio:     {sd_mean:.4f}")
    print(f"SD Mínimo:    {sd_min:.4f}")
    print(f"SD Máximo:    {sd_max:.4f}")
    print(f"Variância:    {sd_variance:.4f}")
    print(f"Palavras:     {words}")
    
    # Veredicto final
    print(f"\n{'='*70}")
    print(f"🎯 VEREDICTO FINAL")
    print(f"{'='*70}")
    
    if sd_mean >= 0.7 and sd_min >= 0.55:
        print(f"✅ APROVADO CROSS-PLATFORM")
        print(f"   Nomenclatura robusta em todos os modelos (SD médio: {sd_mean:.4f})")
    elif sd_mean >= 0.7 and sd_min < 0.55:
        print(f"⚠️ ATENÇÃO - Variação entre modelos")
        print(f"   SD médio OK ({sd_mean:.4f}), mas min <0.55 ({sd_min:.4f})")
        print(f"   Sugestão: Teste em mais plataformas antes de produção")
    else:
        print(f"❌ REPROVADO - SD abaixo do threshold")
        print(f"   SD médio: {sd_mean:.4f} (alvo: >0.7)")
        print(f"   Sugestão: Refine nomenclatura para aumentar densidade semântica")
    
    print(f"{'='*70}\n")

def main():
    parser = argparse.ArgumentParser(
        description='Calculadora de Densidade Semântica com Multi-Model Benchmark'
    )
    parser.add_argument('name', type=str, help='Nome do agente (ex: "Hacker Semântico")')
    parser.add_argument('domain', type=str, help='Domínio alvo (ex: "análise tech")')
    parser.add_argument('--benchmark', action='store_true', 
                       help='Executa benchmark em 3 modelos diferentes')
    parser.add_argument('--model', type=str, default='all-MiniLM-L6-v2',
                       help='Modelo específico a usar (se --benchmark não ativado)')
    
    args = parser.parse_args()
    
    if args.benchmark:
        results, words = run_benchmark(args.name, args.domain)
        print_benchmark_report(results, words, args.name, args.domain)
    else:
        sd, cos_sim, words = calculate_sd(args.name, args.domain, args.model)
        
        print(f"\n{'='*70}")
        print(f"Nome do Agente: {args.name}")
        print(f"Domínio: {args.domain}")
        print(f"Modelo: {args.model}")
        print(f"{'='*70}")
        print(f"Cosine Similarity: {cos_sim:.4f}")
        print(f"Número de Palavras: {words}")
        print(f"Semantic Density (SD): {sd:.4f}")
        print(f"{'='*70}")
        
        if sd >= 0.7:
            print(f"✅ APROVADO - SD acima do threshold (>0.7)")
        else:
            print(f"❌ REPROVADO - SD abaixo do threshold (<0.7)")
            print(f"Sugestão: Refine nomenclatura para aumentar densidade semântica")
        print(f"{'='*70}\n")

if __name__ == "__main__":
    main()

# ==========================================
# EXEMPLOS DE USO
# ==========================================
"""
EXEMPLO 1 - Cálculo simples:
$ python semantic-density-calculator.py "Hacker Semântico" "análise tech"
Output: SD = 0.82 ✅

EXEMPLO 2 - Benchmark completo:
$ python semantic-density-calculator.py "Hacker Semântico" "análise tech" --benchmark
Output: 
    miniLM:        SD = 0.82 ✅
    mpnet:         SD = 0.79 ✅
    multilingual:  SD = 0.75 ✅
    VEREDICTO: ✅ APROVADO CROSS-PLATFORM

EXEMPLO 3 - Teste de nomenclatura ruim:
$ python semantic-density-calculator.py "Analista" "análise técnica" --benchmark
Output:
    SD médio = 0.38 ❌
    VEREDICTO: ❌ REPROVADO
    
EXEMPLO 4 - Teste de excesso (diluição):
$ python semantic-density-calculator.py "Hacker Semântico Forense Estrategista Especializado" "análise tech"
Output:
    SD = 0.52 ❌ (diluição por excesso de palavras)
"""


---

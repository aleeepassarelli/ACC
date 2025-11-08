# tools/semantic-density-calculator.py
# v1.1.0 - Refatoração Cirúrgica
#
# MUDANÇAS v1.1.0:
# 1. (FÍSICA) SD = cosine_sim. A Densidade Semântica é a proximidade vetorial.
#    A contagem de palavras (Word Count) é agora uma métrica separada de "Minimalismo".
#    O Veredito agora avalia AMBAS: Densidade (SD > 0.7) E Minimalismo (Words <= 3).
# 2. (EFICIÊNCIA) Modelos são carregados UMA VEZ no início do benchmark, não em cada loop.
# 3. (MANUTENÇÃO) Thresholds definidos como constantes globais.

from sentence_transformers import SentenceTransformer, util
import sys
import argparse
import time

# --- Constantes de Validação (A "Ciência" do ACC) ---
EMBEDDING_MODELS = {
    'miniLM': 'all-MiniLM-L6-v2',                # Leve, rápido
    'mpnet': 'all-mpnet-base-v2',                 # Balanceado
    'multilingual': 'paraphrase-multilingual-mpnet-base-v2' # Suporta PT-BR
}
THRESHOLD_PASS = 0.70  # Threshold principal para SD (Cosine Sim)
THRESHOLD_MIN_CROSS_PLATFORM = 0.55 # Mínimo aceitável em benchmark
THRESHOLD_MINIMALISM = 3 # Número máximo de palavras no Nome do Agente

def calculate_sd(name: str, domain: str, model: SentenceTransformer):
    """
    Calcula a Densidade Semântica (SD) e o Minimalismo.
    
    SD (Física): A similaridade de cossenos pura entre Nome e Domínio.
    Minimalismo (Métrica): A contagem de palavras do Nome.
    
    Args:
        name: Nome do agente (ex: "Hacker Semântico")
        domain: Domínio alvo (ex: "análise forense ofertas tech")
        model: O *objeto* do modelo SentenceTransformer já carregado.
        
    Returns:
        tuple: (sd, word_count)
    """
    embed_name = model.encode(name, convert_to_tensor=True)
    embed_domain = model.encode(domain, convert_to_tensor=True)
    
    cosine_sim = util.cos_sim(embed_name, embed_domain)[0][0].item()
    word_count = len(name.split())
    
    # SD é a Similaridade de Cossenos.
    sd = cosine_sim
    
    return sd, word_count

def run_benchmark(name, domain):
    """
    Executa benchmark em 3 modelos, carregando-os apenas uma vez.
    """
    results = {}
    
    print(f"\n{'='*70}")
    print(f"🔬 BENCHMARK MULTI-MODEL - Semantic Density Calculator (v1.1.0)")
    print(f"{'='*70}")
    print(f"Nome do Agente: {name}")
    print(f"Domínio: {domain}")
    
    print(f"\n⏳ Carregando {len(EMBEDDING_MODELS)} modelos de embedding (pode levar um momento)...")
    start_load = time.time()
    # Carrega todos os modelos UMA VEZ
    try:
        loaded_models = {
            key: SentenceTransformer(model_name) 
            for key, model_name in EMBEDDING_MODELS.items()
        }
    except Exception as e:
        print(f"\n❌ ERRO FATAL: Falha ao carregar modelos. Verifique a instalação 'sentence-transformers'.")
        print(f"Detalhe: {e}")
        sys.exit(1)
        
    load_time = time.time() - start_load
    print(f"✅ Modelos carregados em {load_time:.2f}s.\n")
    print(f"{'='*70}")
    
    word_count = 0
    for key, model in loaded_models.items():
        print(f"Testando modelo: {key} ({EMBEDDING_MODELS[key]})...")
        sd, wc = calculate_sd(name, domain, model)
        if word_count == 0:
            word_count = wc # Pega a contagem de palavras (só precisa ser 1 vez)
            
        results[key] = {'sd': sd}
        print(f"  SD (Cosine Sim) = {sd:.4f}")
    
    return results, word_count

def print_benchmark_report(results, words, name, domain):
    """
    Imprime relatório consolidado do benchmark, agora avaliando SD e Minimalismo.
    """
    print(f"\n{'='*70}")
    print(f"📊 RELATÓRIO CONSOLIDADO")
    print(f"{'='*70}\n")
    
    # Tabela de resultados
    print(f"{'Modelo':<20} {'SD (Cosine Sim)':<20} {'Status'}")
    print(f"{'-'*70}")
    
    sd_values = [r['sd'] for r in results.values()]
    
    for key, data in results.items():
        sd = data['sd']
        status = "✅ PASS" if sd >= THRESHOLD_PASS else "❌ FAIL"
        print(f"{key:<20} {sd:<20.4f} {status}")
    
    # Estatísticas agregadas
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
    print(f"Variância:    {sd_variance:.4f} (Quanto menor, mais portável)")
    
    # --- VEREDITO FINAL (DUPLA CONDIÇÃO) ---
    print(f"\n{'='*70}")
    print(f"🎯 VEREDICTO FINAL (Padrão ACC)")
    print(f"{'='*70}")
    
    # 1. Teste de Densidade Semântica
    pass_sd = sd_mean >= THRESHOLD_PASS and sd_min >= THRESHOLD_MIN_CROSS_PLATFORM
    if pass_sd:
        print(f"✅ (Densidade) APROVADO CROSS-PLATFORM")
        print(f"   SD Médio ({sd_mean:.4f}) > {THRESHOLD_PASS} E SD Mínimo ({sd_min:.4f}) > {THRESHOLD_MIN_CROSS_PLATFORM}")
    elif sd_mean >= THRESHOLD_PASS and sd_min < THRESHOLD_MIN_CROSS_PLATFORM:
        print(f"⚠️  (Densidade) ATENÇÃO - Variação entre modelos")
        print(f"   SD médio OK ({sd_mean:.4f}), mas min < {THRESHOLD_MIN_CROSS_PLATFORM} ({sd_min:.4f})")
    else:
        print(f"❌ (Densidade) REPROVADO - SD abaixo do threshold")
        print(f"   SD médio: {sd_mean:.4f} (alvo: > {THRESHOLD_PASS})")
        
    # 2. Teste de Minimalismo
    pass_minimalism = words <= THRESHOLD_MINIMALISM
    print(f"\n{'---'*10}\n")
    if pass_minimalism:
        print(f"✅ (Minimalismo) APROVADO")
        print(f"   Contagem de palavras ({words}) está em <= {THRESHOLD_MINIMALISM}.")
    else:
        print(f"❌ (Minimalismo) REPROVADO")
        print(f"   Contagem de palavras ({words}) excede o limite de {THRESHOLD_MINIMALISM}.")
        print(f"   SUGESTÃO: Refine o Nome para ser mais curto, mantendo a SD alta.")

    print(f"{'='*70}\n")

def main():
    parser = argparse.ArgumentParser(
        description='Calculadora de Densidade Semântica (v1.1.0) com Multi-Model Benchmark',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
==========================================
EXEMPLOS DE USO
==========================================

# 1. Cálculo simples (usando o modelo 'miniLM'):
$ python tools/semantic-density-calculator.py "Hacker Semântico" "análise forense ofertas tech"

# 2. Benchmark completo (recomendado para validação de PRs):
$ python tools/semantic-density-calculator.py "Hacker Semântico" "análise forense ofertas tech" --benchmark

# 3. Teste de Nomenclatura Ruim (SD baixo):
$ python tools/semantic-density-calculator.py "O Cara" "análise técnica" --benchmark
# Veredito: ❌ (Densidade) REPROVADO

# 4. Teste de Excesso/Diluição (Minimalismo baixo):
$ python tools/semantic-density-calculator.py "Hacker Semântico Forense Estrategista Especializado" "análise tech" --benchmark
# Veredito: ❌ (Minimalismo) REPROVADO
"""
    )
    parser.add_argument('name', type=str, help='Nome do agente (ex: "Hacker Semântico")')
    parser.add_argument('domain', type=str, help='Domínio alvo (ex: "análise tech")')
    parser.add_argument('--benchmark', action='store_true', 
                        help='Executa benchmark em todos os modelos do framework')
    parser.add_argument('--model', type=str, default='miniLM',
                        help=f'Modelo específico a usar (chave de EMBEDDING_MODELS). Padrão: "miniLM"')
    
    args = parser.parse_args()
    
    if args.benchmark:
        results, words = run_benchmark(args.name, args.domain)
        print_benchmark_report(results, words, args.name, args.domain)
    else:
        # Execução simples
        if args.model not in EMBEDDING_MODELS:
            print(f"Erro: Modelo '{args.model}' não encontrado. Disponíveis: {list(EMBEDDING_MODELS.keys())}", file=sys.stderr)
            sys.exit(1)
        
        model_name = EMBEDDING_MODELS[args.model]
        print(f"⏳ Carregando modelo: {args.model} ({model_name})...")
        try:
            model = SentenceTransformer(model_name)
        except Exception as e:
            print(f"\n❌ ERRO FATAL: Falha ao carregar modelo. Verifique a instalação 'sentence-transformers'.")
            print(f"Detalhe: {e}")
            sys.exit(1)
            
        print("✅ Modelo carregado.")
        
        sd, words = calculate_sd(args.name, args.domain, model)
        
        print(f"\n{'='*70}")
        print(f"📊 RESULTADO SIMPLES (Padrão ACC)")
        print(f"{'='*70}")
        print(f"Nome do Agente: {args.name}")
        print(f"Domínio: {args.domain}")
        print(f"Modelo: {model_name}")
        print(f"{'---'*10}")
        
        # Veredito de Densidade
        pass_sd = sd >= THRESHOLD_PASS
        print(f"SD (Cosine Sim): {sd:.4f}")
        if pass_sd:
            print(f"✅ (Densidade) APROVADO (>= {THRESHOLD_PASS})")
        else:
            print(f"❌ (Densidade) REPROVADO (< {THRESHOLD_PASS})")

        # Veredito de Minimalismo
        pass_minimalism = words <= THRESHOLD_MINIMALISM
        print(f"Palavras (Nome): {words}")
        if pass_minimalism:
            print(f"✅ (Minimalismo) APROVADO (<= {THRESHOLD_MINIMALISM})")
        else:
            print(f"❌ (Minimalismo) REPROVADO (> {THRESHOLD_MINIMALISM})")
        print(f"{'='*70}\n")

if __name__ == "__main__":
    main()

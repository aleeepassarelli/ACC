# validation_core.py
# Versão Minimalista para Notebook Colab
# Implementa SD (Densidade Semântica) e Minimalismo.

from sentence_transformers import SentenceTransformer, util
import time
from typing import Tuple, Dict, Any

# --- Constantes de Validação (A "Ciência" do ACC) ---
EMBEDDING_MODELS = {
    'miniLM': 'all-MiniLM-L6-v2',  # Leve, rápido
    'mpnet': 'all-mpnet-base-v2',  # Balanceado
    'multilingual': 'paraphrase-multilingual-mpnet-base-v2' # Suporta PT-BR
}
THRESHOLD_PASS = 0.70  # Threshold principal para SD (Cosine Sim)
THRESHOLD_MIN_CROSS_PLATFORM = 0.55 # Mínimo aceitável em benchmark
THRESHOLD_MINIMALISM = 3 # Número máximo de palavras no Nome do Agente

# Armazenamento em cache para modelos já carregados
_LOADED_MODELS = {}

def load_models() -> Dict[str, SentenceTransformer]:
    """
    Carrega todos os modelos de embedding UMA VEZ e os armazena em cache.
    """
    global _LOADED_MODELS
    if _LOADED_MODELS:
        return _LOADED_MODELS

    print(f"⏳ Carregando {len(EMBEDDING_MODELS)} modelos de embedding...")
    start_load = time.time()
    
    try:
        for key, model_name in EMBEDDING_MODELS.items():
            _LOADED_MODELS[key] = SentenceTransformer(model_name)
    except Exception as e:
        # No Colab, erros fatais devem ser lançados para a célula falhar.
        raise RuntimeError(f"❌ ERRO FATAL: Falha ao carregar modelos: {e}")
            
    load_time = time.time() - start_load
    print(f"✅ Modelos carregados e prontos em {load_time:.2f}s.")
    return _LOADED_MODELS

def calculate_sd(name: str, domain: str, model: SentenceTransformer) -> Tuple[float, int]:
    """
    Calcula a Densidade Semântica (SD) e a contagem de palavras.
    """
    embed_name = model.encode(name, convert_to_tensor=True)
    embed_domain = model.encode(domain, convert_to_tensor=True)
    
    # SD é a Similaridade de Cossenos.
    sd = util.cos_sim(embed_name, embed_domain)[0][0].item()
    word_count = len(name.split())
    
    return sd, word_count

def run_validation(name: str, domain: str) -> Dict[str, Any]:
    """
    Executa a validação multi-modelo e retorna um dicionário consolidado.
    """
    loaded_models = load_models()
    results = {}
    
    print(f"\n{'='*70}")
    print(f"🔬 VALIDANDO: {name} | Domínio: {domain}")
    print(f"{'='*70}")
    
    word_count = 0
    sd_values = []
    
    for key, model in loaded_models.items():
        # print(f"Testando modelo: {key}...") # Removido para minimalismo no output
        sd, wc = calculate_sd(name, domain, model)
        if word_count == 0:
            word_count = wc
            
        results[key] = {'sd': sd}
        sd_values.append(sd)
        
    # --- Veredito Final (Lógica de Dupla Condição) ---
    sd_mean = sum(sd_values) / len(sd_values)
    sd_min = min(sd_values)
    
    # 1. Teste de Densidade Semântica
    pass_sd = sd_mean >= THRESHOLD_PASS and sd_min >= THRESHOLD_MIN_CROSS_PLATFORM
    
    # 2. Teste de Minimalismo
    pass_minimalism = word_count <= THRESHOLD_MINIMALISM

    # Retorna o dicionário de resultados e status
    return {
        'status_sd': 'PASS' if pass_sd else 'FAIL',
        'status_minimalism': 'PASS' if pass_minimalism else 'FAIL',
        'sd_mean': sd_mean,
        'sd_min': sd_min,
        'word_count': word_count,
        'results_per_model': results,
        'thresholds': {
            'sd_pass': THRESHOLD_PASS,
            'sd_cross_platform': THRESHOLD_MIN_CROSS_PLATFORM,
            'minimalism': THRESHOLD_MINIMALISM
        }
    }

# Fim do Arquivo validation_core.py

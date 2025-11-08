# [TEMPLATE] Relatório de Validação Empírica: [NOME DO AGENTE]

* **Agente Testado:** `templates/[nome-do-agente].md`
* **Autor da Validação:** `[Seu Nome/Usuário do GitHub]`
* **Data:** `[AAAA-MM-DD]`

---

## 1. 🎯 Objetivo

Validar objetivamente a **confiabilidade de comportamento** do Agente `[Nome do Agente]` em um conjunto de dados do mundo real.

## 2. 🔬 Hipótese

O Agente demonstrará um alto grau de aderência ao seu `Protocolo` (Camada 3) e `Baseshot` (Camada 4).

* **Métrica-Alvo:** Confiabilidade Inter-Avaliador (Kappa de Cohen).
* **Hipótese Nula (H0):** A concordância do Agente é aleatória (`κ <= 0.4`).
* **Hipótese de Sucesso (H1):** O Agente exibe concordância substancial ou quase perfeita (`κ >= 0.7`).

## 3. 🛠️ Metodologia

O teste segue o framework de "Confiabilidade Inter-Avaliador" descrito no `docs/scientific-validation.md`.

* **Avaliador 1 (Gabarito / "Verdade"):**
    * Um conjunto de `[N]` inputs (ex: 50 `git diffs` únicos, 50 snippets de código inseguro).
    * Um conjunto correspondente de `[N]` outputs "ideais", definidos manualmente por um especialista humano.

* **Avaliador 2 (Agente / "Teste"):**
    * O Agente `[Nome do Agente]` (v1.1.0).
    * O `OUTPUT` foi coletado executando `tools/cli-test.py` em cada um dos `[N]` inputs.

* **Critério de Avaliação:**
    * Uma resposta foi classificada como `1 (Concorda)` se seguiu o protocolo.
    * Uma resposta foi classificada como `0 (Discorda)` se violou o protocolo (ex: gerou uma mensagem vaga, falhou em detectar uma vulnerabilidade).

## 4. 📊 Coleta de Dados

| ID da Amostra | Input (Resumo) | Output "Gabarito" (Humano) | Output "Agente" (LLM) | Concordância (1 ou 0) |
|:---:|:---|:---|:---|:---:|
| 001 | `[ex: diff de nova função]` | `feat(utils): ...` | `feat(utils): ...` | 1 |
| 002 | `[ex: diff de typo]` | `style(docs): ...` | `fix: update file` | 0 |
| 003 | `[...N]` | `...` | `...` | ... |
| ... | | | | |
| **Total** | | | | |
| **Nº de Concordâncias:** | | | | `[Total de 1s]` |
| **Nº de Discordâncias:** | | | | `[Total de 0s]` |

## 5. 🧮 Análise (Cálculo do Kappa)

O Kappa de Cohen (κ) foi calculado usando `scikit-learn` para determinar a concordância além do acaso.

```python
# Snippet de Cálculo (Exemplo)
from sklearn.metrics import cohen_kappa_score

# 1 = Concorda, 0 = Discorda
gabarito_humano = [1, 1, 1, 1, 1, 0, 1, 0, ...] # Lista de N resultados
output_do_agente = [1, 1, 0, 1, 1, 0, 1, 1, ...] # Lista de N resultados

# Calcular o score Kappa
kappa_score = cohen_kappa_score(gabarito_humano, output_do_agente)

print(f"Total de Amostras: {len(gabarito_humano)}")
print(f"Score Kappa (κ): {kappa_score:.4f}")

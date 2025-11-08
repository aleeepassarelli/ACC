# Estudo de Caso: Geração de Commit Semântico

Este estudo de caso demonstra o `CommitAssistant Proposital` em ação. A missão é analisar um `git diff` e gerar uma mensagem de commit que siga o padrão [Conventional Commits](https://www.conventionalcommits.org/).

* **Agente:** `templates/commit-assistant-proposital.md`
* **Métrica de Alvo:** Alta aderência ao `Protocolo` (Camada 3), que exige a identificação do "propósito" (neste caso, `feat:` para uma nova feature) e uma mensagem no imperativo (`Add function`).
* **Protocolo em Ação:** `2. Classifique o propósito: 'feat:', 'fix:', 'refactor:'...` e `4. Escreva a mensagem em inglês, no imperativo (ex: "Add function").`

---

## 1. INPUT (O `git diff` da Tarefa)

O Agente recebe o seguinte `diff` como input. A tarefa é analisá-lo e entendê-lo semanticamente.

```diff
diff --git a/app/utils.py b/app/utils.py
index e69de29..06a8e4f 100644
--- a/app/utils.py
+++ b/app/utils.py
@@ -0,0 +1,5 @@
+
+def calculate_tax(price: float, rate: float = 0.05) -> float:
+    """Calculates the tax based on a price and rate."""
+    return price * rate
+

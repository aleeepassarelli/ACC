# 🔬 Validação Científica (Semantic Density - SD)

Esta pasta contém o **framework de validação científica (SD)** para o Agente Canivete Cirúrgico (ACC). A validação garante que o **Nome do Agente** e seu **Domínio Alvo** possuam um alinhamento semântico (coerência) e um rigor minimalista exigidos pelo protocolo ACC.

---

## 📂 Estrutura

| Arquivo/Pasta | Responsabilidade |
| :--- | :--- |
| **`ACC_Validation.ipynb`** | **Execução:** O Notebook Colab que importa e executa a métrica, gerando o veredicto final (`PASS` ou `FAIL`). |
| **`../tools/validation_core.py`** | **Métrica Core:** Contém a lógica científica de cálculo da Densidade Semântica (SD) e as constantes de calibração (e.g., `THRESHOLD_PASS = 0.70`). |
| **`README.md` (Este arquivo)** | **Documentação:** Explica como replicar e interpretar os testes. |

---

## 🚀 Como Replicar a Validação

Para replicar e auditar a validação científica do ACC, siga estes passos:

### 1. Preparação

1.  Navegue até o Notebook **`ACC_Validation.ipynb`**.
2.  Abra o Notebook no Google Colab.

### 2. Execução

1.  O Notebook contém uma **única célula** de código.
2.  Execute esta célula.

A célula irá automaticamente:
* Instalar a dependência **`sentence-transformers`** (necessária para a métrica SD).
* Carregar os **três modelos de *embedding*** definidos no `validation_core.py` (MiniLM, MPNet e Multilingual) para garantir a robustez interplataforma.
* Executar a função `run_validation` com o agente de referência (`explorador api` / `explorador de api`), que é o agente que **deve passar** no teste.

### 3. Interpretação do Veredicto

O Notebook irá imprimir o relatório completo e, ao final, mostrará o **STATUS FINAL DE PUBLICAÇÃO**.

O teste só é considerado **`PASS`** se duas condições científicas forem atendidas simultaneamente:

| Critério | Métrica | Threshold |
| :--- | :--- | :--- |
| **Densidade Semântica (SD)** | Média da Similaridade de Cossenos (multi-modelo) | $\ge 0.70$ (e Mínimo $\ge 0.55$) |
| **Minimalismo** | Contagem de Palavras no **Nome do Agente** | $\le 3$ palavras |

---

## 🔗 Última Ação (Raiz do Repositório)

Lembre-se de usar o **link público** do `ACC_Validation.ipynb` para atualizar o `README.md` na **raiz do seu repositório** (`ACC/README.md`) e exibir o Badge Verde de validação.

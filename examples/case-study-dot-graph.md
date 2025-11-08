# Estudo de Caso: Mapeamento de Dependências (Graphviz)

Este estudo de caso demonstra o `DependencyMapper Visualizador` analisando um pequeno projeto Python para gerar um mapa de arquitetura.

* **Agente:** `templates/dependency-mapper-visualizador.md`
* **Métrica de Alvo:** Aderência ao `Protocolo` (Camada 3), que exige ignorar bibliotecas externas e responder *apenas* com o código `.dot`.
* **Protocolo em Ação:** `2. Ignore bibliotecas EXTERNAS (ex: 'react', 'flask')` e `6. Responda APENAS com o código DOT.`

---

## 1. INPUT (O Código-Fonte do Projeto)

O Agente recebe três arquivos de código que compõem um aplicativo web simples. O Agente deve analisar seus `imports`.

<details>
<summary>Clique para expandir os arquivos de código</summary>

**`main.py` (Arquivo Raiz)**
```python
# main.py
import flask # <- EXTERNO (deve ser ignorado)
import os    # <- EXTERNO (deve ser ignorado)

from app.routes import api_routes
from app.utils import calculate_tax

app = flask.Flask(__name__)
app.register_blueprint(api_routes)

if __name__ == "__main__":
    app.run()

# ⚠️ Aviso de Execução: Frontend do Prompt Builder

Este diretório (`/prompt-builder`) contém **apenas** o código do frontend (HTML/CSS/JS) para as aplicações de UI do Agente Canivete Cirúrgico.

Este frontend **NÃO FUNCIONARÁ** sozinho.

Ele é um "cliente" que depende de dois (2) servidores de backend Python (que estão na pasta `/tools`) para funcionar.

## Como Executar o Frontend Corretamente

### Passo 1: Instale as Dependências do Backend

(Se você já fez isso, pule esta etapa).
No diretório **raiz** do repositório, instale todas as dependências do Python:

```bash
# Na raiz do projeto (ex: /ACC)
pip install -r requirements.txt

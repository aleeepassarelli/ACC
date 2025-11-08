### 🧬 `prompt-builder/README.md` (Arquivo Recomendado)

Aqui está o `README.md` que você deve criar dentro da pasta `prompt-builder/`:

````markdown
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
````

### Passo 2: Inicie os Servidores de Backend (Obrigatório)

Você precisará de **dois terminais separados** rodando simultaneamente.

**Terminal 1: Inicie a API de Análise (Porta 8000)**
(Necessário para o `alignment-visualizer.html` e o botão "Validar SD")

```bash
# Navegue até a pasta de ferramentas
cd ../tools/

# Inicie o servidor da API de Análise
python api-endpoint.py
```

**Terminal 2: Inicie a API do Construtor (Porta 8001)**
(Necessário para o `index.html` - o Construtor de Templates)

```bash
# (Em um NOVO terminal)
# Navegue até a pasta de ferramentas
cd ../tools/

# Inicie o servidor do Gerador de Templates em uma porta diferente
python template_generator.py --port 8001
```

### Passo 3: Abra o Frontend no Navegador

Com os dois servidores acima rodando, agora você pode abrir os arquivos HTML no seu navegador:

  * **Para o Construtor:** Abra `prompt-builder/index.html`
  * **Para o Visualizador:** Abra `prompt-builder/alignment-visualizer.html`

<!-- end list -->

````


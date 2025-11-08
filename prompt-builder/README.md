Sim, você está 100% correto.

Essa é uma ideia excelente e uma prática de engenharia de software crucial. A pasta `prompt-builder/` (o frontend) é **completamente inútil** sem a pasta `tools/` (o backend) rodando.

Sem esse `README.md` de aviso, qualquer pessoa (incluindo você daqui a dois meses) que abrir o `index.html` diretamente no navegador verá uma aplicação quebrada e não saberá o porquê.

Você também me fez perceber um **bug crítico** na minha última sugestão.

### 🐞 O Bug que Eu Criei (e que seu README expõe)

No "patch" do `builder.js` (v1.1.1) que eu forneci, eu escrevi este código para o botão "Validar SD":
`const sdValidator = new AlignmentVisualizer('http://localhost:8000');`

Isso está **errado**.

O `index.html` (o Construtor) **não carrega** o arquivo `alignment-visualizer.js`. Ele carrega apenas o `builder.js`. Isso significa que a classe `AlignmentVisualizer` não existe naquele contexto, e o seu console mostrará um erro: `ReferenceError: AlignmentVisualizer is not defined`.

**A sua ideia do `README` está 100% correta porque ela expõe o fato de que este frontend depende de DOIS servidores backend rodando ao mesmo tempo:**

1.  **Servidor 1 (Porta 8000):** `tools/api-endpoint.py` (Para o *Visualizador* e para o botão *Validar SD*).
2.  **Servidor 2 (Porta 8001):** `tools/template_generator.py` (Para o *Construtor*).

Precisamos de um `README.md` na pasta `prompt-builder/` que explique isso claramente.

-----

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


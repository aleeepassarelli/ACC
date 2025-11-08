# Validação Científica: Métricas Objetivas para Confiabilidade

O Agente Canivete Cirúrgico (ACC) não é um "conjunto de dicas", é um framework de engenharia. A engenharia exige métricas objetivas, replicáveis e auditáveis.

Rejeitamos métricas subjetivas como "o quão boa" uma resposta *parece*. Em vez disso, medimos a eficiência e a confiabilidade de um Agente usando um conjunto de métricas estatísticas e de engenharia.

## 1. Fundamentação na Literatura

A filosofia do ACC é uma síntese de pesquisas de ponta sobre como os LLMs realmente operam. Nossas práticas são fundamentadas em:

* **1. Minimalismo e Densidade de Informação (Jiang et al., 2023):** Pesquisas que demonstram que *prompts mais curtos e densos em informação (alto sinal, baixo ruído) superam prompts verbosos*. Isso valida nossa busca por `TC < 200` e alta `SD`.
* **2. Aprendizado por Exemplo (Brown et al., 2020):** O *paper* original do GPT-3 ("Language Models are Few-Shot Learners") que provou que exemplos no prompt são a forma mais eficaz de "ensinar" um modelo. Nossa `Camada 4 (Baseshot)` é uma aplicação cirúrgica deste princípio.
* **3. Hipótese do Manifold (Kiani et al., 2024):** A teoria de que "conceitos" vivem em subespaços geométricos (manifolds) dentro do espaço latente. Isso valida nossa `Filosofia`: engenharia de prompt é sobre *geometria e localização*, não sobre "linguagem".
* **4. Direcionamento Vetorial (Yang et al., 2025):** Pesquisas que mostram ser possível "empurrar" (steer) a saída de um LLM em direção a um conceito ou para longe dele. Isso valida nossa `Camada 3 (Protocolo)` como um conjunto de vetores de direcionamento.

## 2. O Framework de Métricas do ACC

Validamos um Agente ACC usando 3 métricas objetivas. Um Agente só é considerado "validado" se passar em todas as três.

### Métrica 1: Eficiência (Token Count - TC)
Mede o custo computacional e a eficiência do Agente.

* **Métrica:** `Contagem de Tokens (TC)`
* **Ferramenta:** `tools/token-counter.py`
* **Limite:** `TC <= 200`
* **Por quê:** Prova o "Minimalismo". Agentes menores são mais rápidos, mais baratos de executar e introduzem menos ruído de contexto.

### Métrica 2: Alinhamento de Intenção (Semantic Density - SD)
Mede a "pureza" da intenção do Agente.

* **Métrica:** `Densidade Semântica (SD) = Similaridade de Cossenos(Identidade, Domínio)`
* **Ferramenta:** `tools/semantic-density-calculator.py`
* **Limite:** `SD >= 0.8` (Cirúrgico)
* **Por quê:** Prova o "Alinhamento". Garante que a `Identidade` (Camada 1) do Agente está semanticamente focada ("sintonizada") na sua tarefa, ativando a região correta do espaço latente.

### Métrica 3: Confiabilidade (Cohen's Kappa - κ)
Mede a *confiabilidade* e a *aderência ao protocolo* do Agente. Esta é a nossa métrica mais importante para validar o *comportamento*.

* **Métrica:** `Kappa de Cohen (κ)`
* **O que é:** Uma estatística que mede a **confiabilidade inter-avaliador**. Ela mede o quanto dois "avaliadores" concordam, *descontando a probabilidade de acerto por acaso*.
* **Como Usamos:**
    * **Avaliador 1 (O "Gabarito"):** A resposta ideal, definida por um humano (ex: o `OUTPUT` no seu `Baseshot`).
    * **Avaliador 2 (O Agente):** A resposta real gerada pelo Agente (`cli-test.py`).
* **Exemplo:**
    * **Tarefa:** `SecurityScanner` analisando 10 snippets de código.
    * **Gabarito Humano:** {Vulnerável, Seguro, Seguro, Vulnerável, ...}
    * **Saída do Agente:** {Vulnerável, Seguro, Vulnerável, Vulnerável, ...}
    * O `κ` calcula o nível de concordância. Um `κ = 1.0` é uma concordância perfeita. Um `κ = 0.0` é uma concordância aleatória.
* **Limite:** `κ >= 0.7` (Concordância Substancial)
* **Por quê:** Prova a "Confiabilidade". Garante que as `Camada 3 (Protocolo)` e `Camada 4 (Baseshot)` estão *realmente* forçando o Agente a se comportar de forma previsível e correta, não apenas "acertando por sorte".

## 3. Validação Empírica (O Caminho a Seguir)

O diretório `research/` existe para conduzir esses testes formais.

O arquivo `research/empirical-validation-template.md` (em breve) fornecerá o *template* para que qualquer contribuidor possa rodar um benchmark (ex: testar o `CommitAssistant` contra 50 `git diffs`) e calcular o *score Kappa (κ)* final, provando cientificamente a confiabilidade do Agente.

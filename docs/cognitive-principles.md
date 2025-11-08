# Princípios Cognitivos: Engenharia de Espaço Latente Aplicada

O `philosophy.md` explicou o **Porquê**. Este documento explica o **Como**.

As 4 Camadas do framework ACC não são uma "receita de bolo" arbitrária. Elas são um conjunto de ferramentas de engenharia de precisão, onde cada camada executa uma **manipulação deliberada do estado cognitivo do LLM**.

Nós não "pedimos" resultados. Nós *configuramos* o estado latente para tornar o resultado desejado a única conclusão provável.

## 1. A Geometria do Significado

Um LLM não "pensa" em palavras; ele "pensa" em geometria. O espaço latente é um mapa de alta dimensão onde "conceitos" são *locais* (vetores).

* **Significado é Localização:** "Rei", "Rainha" e "Monarca" estão "próximos" um do outro. "Rei" e "Cachorro" estão "distantes".
* **Intenção é Trajetória:** Um prompt é um conjunto de coordenadas que "teleporta" a atenção do LLM para um ponto de partida neste mapa. A "resposta" é a trajetória que o modelo calcula a partir desse ponto.

O objetivo do ACC é controlar esse teletransporte e essa trajetória com precisão cirúrgica.

## 2. Camada 1 (Identidade): Ativador de Região Semântica

**Princípio:** *Semantic Density (SD) > 0.8*

Esta camada "sintoniza" o LLM.

* **Prompt Verboso (Baixa SD):** "Você é um assistente legal que sabe sobre segurança..."
    * **Efeito Cognitivo:** Isso ativa *várias* regiões no mapa: ("assistente", "legal", "saber", "segurança"). O ponto de partida é um "borrão" médio e genérico.

* **Identidade ACC (Alta SD):** "SecurityScanner Contínuo" + "Domínio: Análise OWASP".
    * **Efeito Cognitivo:** Nossa ferramenta `semantic-density-calculator` valida que "SecurityScanner" e "Análise OWASP" já estão no *mesmo bairro* do mapa (SD > 0.8).
    * Isso age como um **ativador de região** (Region Activator). Ele pré-ativa (pré-carrega) o *cluster neural exato* do LLM treinado com todo o conhecimento do OWASP *antes* que a tarefa seja dada. A atenção do modelo é focada como um laser.

## 3. Camada 3 (Protocolo): Direcionamento Vetorial (Vector Steering)

**Princípio:** *Boundary Conditions (Restrições de Comportamento)*

Se a `Identidade` é *para onde* teleportamos a atenção, o `Protocolo` é *como* ela se move a partir de lá. As diretrizes (3-5 regras) não são "conselhos", são **operações físicas de direcionamento vetorial**.

* **A Diretriz:** `Priorize a detecção de "frutas baixas" (SQLi, XSS).`
    * **Efeito Cognitivo:** Isso não é um pedido. É uma instrução matemática que adiciona um "empurrão" vetorial constante *em direção* aos conceitos de "SQLi" e "XSS" em cada passo da geração da resposta.

* **A Diretriz:** `Ignore o marketing (ruído); foque na arquitetura (sinal).`
    * **Efeito Cognitivo:** Isso aplica um vetor de "repulsão" (um *steering vector* negativo) que empurra a atenção para *longe* de conceitos como "IA de ponta" e "infinito", e a puxa *em direção* a "custo", "lock-in" e "API".

O `Protocolo` constrói "paredes" no espaço latente, forçando a trajetória da resposta a permanecer no caminho cirúrgico.

## 4. Camada 4 (Baseshot): Calibração de Formato de Saída

**Princípio:** *Baseshot Learning (Aprendizado por Exemplo-Base)*

Esta é a calibração final. O *Baseshot Learning* é uma forma mais cirúrgica do que o "Few-Shot Learning" comum. Não estamos "ensinando" um conceito; estamos fornecendo **coordenadas de destino** exatas para o formato da resposta.

* **✅ Caso Ideal (Vetor de Atração):**
    * `INPUT: ...`
    * `OUTPUT: feat(api): Add new endpoint`
    * **Efeito Cognitivo:** Mostramos ao modelo o vetor de destino exato de uma "boa" resposta. Ele aprende a geometria e o formato desse ponto.

* **❌ Erro Comum (Vetor de Repulsão):**
    * `INPUT: ...`
    * `OUTPUT: "Updated the API file" (ERRADO: Vago)`
    * **Efeito Cognitivo:** Este é o exemplo mais poderoso. Nós fornecemos um **vetor de repulsão**. Mostramos ao modelo um local "tóxico" no espaço latente e o instruímos a *evitá-lo*. O modelo aprende a maximizar a distância desse "erro comum".

* **⚠️ Edge Case (Vetor de Ambiguidade):**
    * `INPUT: (Um diff com 2 mudanças)`
    * `OUTPUT: (Foca na mudança principal)`
    * **Efeito Cognitivo:** Mostramos ao modelo como resolver um *conflito vetorial* (ambiguidade), ensinando-o a priorizar um vetor (a feature principal) sobre o outro (o typo menor).

## Conclusão: O Agente como um Estado Configurado

Um Agente Canivete Cirúrgico não é um "prompt".

É uma **configuração de estado cognitivo pré-calculada**. É um pacote otimizado que, em menos de 200 tokens, executa uma sequência de operações de física aplicada:

1.  **Ativa (Sintoniza)** a região neural correta.
2.  **Direciona (Guia)** a trajetória da resposta.
3.  **Calibra (Formata)** o vetor de saída final.

É por isso que o ACC é portátil, eficiente e preciso. Ele não "conversa" com a IA. Ele fala a única língua que a máquina entende: a da geometria e do espaço latente.

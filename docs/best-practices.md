# Guia de Boas Práticas: Criando um Agente ACC

Este guia é o "manual de engenharia" do Agente Canivete Cirúrgico. Ele detalha o fluxo de trabalho passo a passo para criar um novo Agente que atenda aos nossos padrões científicos e de eficiência.

Criar um Agente ACC não é "escrever um prompt". É um **processo de engenharia** que consiste em **descobrir** vetores de alta densidade, **configurar** restrições de comportamento e **validar** os resultados com ferramentas objetivas.

## O Fluxo de Trabalho Cirúrgico (Passo a Passo)

Siga estas etapas em ordem. Cada etapa depende da anterior.

---

### Passo 1: A Descoberta (Identidade + Domínio)

Este é o passo mais crítico. Você não "escolhe" um nome; você **descobre** um nome que tenha uma "Física" (SD > 0.8) válida.

1.  **Brainstorm (Exploração):** Comece com um `Nome Base` (conceito, ex: "Revisor") e um `Domínio` (tarefa, ex: "Analisa Pull Requests em busca de bugs lógicos e de segurança").

2.  **Gerar (Candidatos):** Use o "Explorador" para gerar uma lista de nomes candidatos que misturam seu conceito com o "Sinal" do domínio.
    ```bash
    python tools/strategy_generator.py "Revisor" "Analisa Pull Requests em busca de bugs lógicos e de segurança"
    
    # Saída (Exemplo):
    # 1. "Revisor de segurança"
    # 2. "Revisor lógico"
    # 3. "CodeReviewer Lógico" 
    # ...
    ```

3.  **Validar (O Árbitro):** Teste seus melhores candidatos no "Árbitro" para encontrar um que passe no benchmark.
    ```bash
    # Teste o candidato "CodeReviewer Lógico"
    python tools/semantic-density-calculator.py "CodeReviewer Lógico" "Analisa PRs bugs lógicos e segurança" --benchmark
    ```

4.  **Selecionar (O Veredito):** Escolha o candidato que passe nas duas métricas:
    * `✅ (Densidade) APROVADO CROSS-PLATFORM` (SD > 0.7+)
    * `✅ (Minimalismo) APROVADO` (Palavras <= 3)

    Você agora tem sua **Camada 1 (Identidade)** validada.

---

### Passo 2: Defina o Protocolo (O "Como?")

Com a Identidade definida, você agora define as **Restrições de Comportamento** (Camada 3). Um bom protocolo é um conjunto de 3-5 regras **imperativas** (use verbos) que direcionam o vetor da resposta.

* **RUIM (Vago):** "Você deve ser útil."
* **BOM (Cirúrgico):** "1. Priorize a detecção de 'SQL Injection' (SQLi)."
* **BOM (Cirúrgico):** "2. Responda APENAS com o bloco de código formatado."
* **BOM (Cirúrgico):** "3. IGNORE a lógica; foque APENAS no estilo (PEP 8)."

Uma de suas regras deve *sempre* definir o **formato de saída** (ex: JSON, Markdown, código puro), pois isso é crucial para usar o Agente em automações.

---

### Passo 3: Calibre o Baseshot (O "Treinamento")

Esta é a **Camada 4**. Você irá calibrar a saída do Agente ensinando a ele o que "certo", "errado" e "ambíguo" significam *para este contexto*.

* **✅ O Caso Ideal (Vetor de Atração):**
    O "happy path". Mostre o input perfeito levando ao output perfeito.

* **❌ O Erro Comum (Vetor de Repulsão):**
    **Esta é a 'shot' mais importante.** Pense: Qual é a *forma mais provável* que um LLM genérico falharia nesta tarefa? (Ex: Ser vago, alucinar, focar no marketing).
    * Para o `StyleEnforcer`, o erro comum é `❌ Mudar a lógica`.
    * Para o `CommitAssistant`, o erro comum é `❌ Ser vago (ex: "update file")`.
    * Mostre esse erro e marque-o como `(ERRADO: ...)`. Isso ensina o Agente a se *afastar* ativamente desse tipo de resposta.

* **⚠️ O Edge Case (Vetor de Ambiguidade):**
    Ensine a *nuance*.
    * O que fazer com `input: None`?
    * O que fazer com uma `lista vazia`?
    * O que fazer se o input for *logicamente errado, mas estilisticamente perfeito*?

---

### Passo 4: Validação Final (O "Checklist")

Agora que seu arquivo `.md` está completo, rode as validações finais do `CONTRIBUTING.md`.

1.  **Validação de Minimalismo (Token):**
    ```bash
    python tools/token-counter.py templates/seu-novo-agente.md
    
    # RESULTADO: Deve ser <= 200 tokens.
    ```

2.  **Validação de Estrutura (Baseshot):**
    ```bash
    bash tools/baseshot-validator.sh templates/seu-novo-agente.md
    
    # RESULTADO: Deve passar em todos os checks (5-7 casos, com ✅ e ❌).
    ```

---

### Passo 5: Teste de Campo (O "Simulador")

Seu Agente está "validado" em teoria. Agora, prove que ele funciona na prática.

Use o "Simulador" para testar o Agente contra um LLM real. Recomendamos testar em pelo menos **dois** LLMs diferentes (ex: Gemini 1.5 Flash e Claude 3.5 Sonnet) para provar a portabilidade.

```bash
python tools/cli-test.py -t templates/seu-novo-agente.md -q "Um input de teste realista"

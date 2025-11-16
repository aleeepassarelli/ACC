# 🔪 Guia de Boas Práticas: Criando um Agente ACC

Este guia é o "manual de engenharia" do **Agente Canivete Cirúrgico**. Ele detalha o fluxo de trabalho passo a passo para criar um novo Agente que atenda aos nossos padrões científicos e de eficiência.

Criar um Agente $\text{ACC}$ não é "escrever um *prompt*". É um **processo de engenharia** que consiste em **descobrir** vetores de alta densidade, **configurar** restrições de comportamento e **validar** os resultados com ferramentas objetivas.

---

## 🎯 1. O Princípio do ACC (A Justificativa Cognitiva)

###O **ACC (Architectural Cognitive Control)** é um *framework* de **Governança Cognitiva** que ensina a lógica de operação no Espaço Latente. Ele garante que a **Liberdade Algorítmica** seja sempre vinculada à **Responsabilidade do Propósito Humano**.
---
### 1.1. A Lacuna da Intenção: Por Que o SD Não É Suficiente

A otimização de *prompts* é limitada pelo objetivo do LLM: alcançar a máxima **Densidade Semântica ($\text{SD}$)**.

| Métrica | Âncora Cognitiva | Limitação e Risco |
| :--- | :--- | :--- |
| **Densidade Semântica ($\text{SD}$)** | **O Espaço Latente** | **Garante Coerência, mas não Fidelidade.** O *output* pode ser linguística e coerentemente correto, mas falha em entregar a **experiência exata** ou o **rigor** que o arquiteto pretendia (Ex: é genérico onde deveria ser "Cirúrgico"). |
| **Fidelidade da Intenção** | **A Metáfora da Experiência** | **Garante o Propósito.** É o teste que avalia se o *output* atende ao **Contrato de Experiência** imposto pela linguagem (sua metáfora). |

O $\text{ACC}$ existe para fechar esta Lacuna, ensinando que o problema não está na ferramenta, mas na **qualidade da Intenção** que é passada ao sistema.
---
### 1.2. A Solução do ACC: Metáfora como Lógica de Restrição

O $\text{ACC}$ define a **Metáfora da Intenção** como a principal **Função de Restrição Cognitiva** do sistema.

  * **Restrição de Modularidade:** O termo "Canivete" exige que a solução seja compacta e adaptável, ensinando a lógica de decompor e delegar a funcionalidade (lógica $\text{MOE}$).
  * **Restrição de Rigor:** O termo "Cirúrgico" exige precisão absoluta e minimização de *ruído* (o oposto de alucinação), forçando o agente a ancorar sua proveniência e foco.

-----

## 🛠️ 2. O Fluxo de Trabalho Cirúrgico (Passo a Passo)

Siga estas etapas em ordem. Cada etapa depende da anterior.

### Passo 1: A Descoberta (Identidade + Domínio)

Este é o passo mais crítico. Você não "escolhe" um nome; você **descobre** um nome que tenha uma "Física" ($\text{SD} > 0.8$) válida.

1.  **Brainstorm (Exploração):** Comece com um **Nome Base** (conceito, ex: "Revisor") e um **Domínio** (tarefa, ex: "Analisa Pull Requests em busca de bugs lógicos e de segurança").

---

2.  **Gerar (Candidatos):** Use o "Explorador" para gerar uma lista de nomes candidatos.
    ```python
    python tools/strategy_generator.py "Revisor" "Analisa Pull Requests em busca de bugs lógicos e de segurança"
    ```
    `# Saída (Exemplo): 1. "Revisor de segurança" 2. "Revisor lógico" 3. "CodeReviewer Lógico"`

    ---
    
3.  **Validar (O Árbitro):** Teste seus melhores candidatos no "Árbitro" para encontrar um que passe no *benchmark*.
    ```python
    python tools/semantic-density-calculator.py "CodeReviewer Lógico" "Analisa PRs bugs lógicos e segurança" --benchmark
    ```
    ---
    
5.  **Selecionar (O Veredito):** Escolha o candidato que passe nas duas métricas:
      * ✅ (Densidade) APROVADO CROSS-PLATFORM ($\text{SD} > 0.7+$)
      * ✅ (Minimalismo) APROVADO (Palavras $\le 3$)
---

### Passo 2: Defina o Protocolo (O "Como?")

Com a Identidade validada, defina as **Restrições de Comportamento**. Um bom protocolo é um conjunto de 3-5 regras **imperativas** (use verbos) que direcionam o vetor da resposta.

  * **BOM (Cirúrgico):** "1. Priorize a detecção de 'SQL Injection' (SQLi)."
  * **BOM (Cirúrgico):** "2. Responda APENAS com o bloco de código formatado."
  * **Regra Crucial:** Uma de suas regras deve **sempre** definir o formato de saída (ex: JSON, Markdown, código puro).
---

### Passo 3: Calibre o Baseshot (O "Treinamento")

Calibre a saída do Agente ensinando a ele o que **"certo," "errado" e "ambíguo"** significam *para este contexto*.

  * **✅ O Caso Ideal (Vetor de Atração):** O "*happy path*". Mostre o *input* perfeito levando ao *output* perfeito.
  * **❌ O Erro Comum (Vetor de Repulsão):** **Pense:** Qual é a forma mais provável que um LLM genérico falharia nesta tarefa? (Ex: Ser vago, alucinar, focar no marketing). Mostre esse erro e marque-o como **(ERRADO: ...)**. Isso ensina o Agente a se afastar ativamente desse tipo de resposta.
  * **⚠️ O Edge Case (Vetor de Ambiguidade):** Ensine a nuance. O que fazer com *input: None*? O que fazer se o *input* for logicamente errado, mas estilisticamente perfeito?
---

### Passo 4: Validação Final (O "Checklist")

Rode as validações finais. O Agente só pode ser considerado ACC se passar em todas as etapas:

| Validação | Comando | Resultado Exigido |
| :--- | :--- | :--- |
| **Minimalismo (Token)** | `python tools/token-counter.py templates/seu-novo-agente.md` | `RESULTADO: Deve ser <= 200 tokens.` |
| **Estrutura (Baseshot)** | `bash tools/baseshot-validator.sh templates/seu-novo-agente.md` | `RESULTADO: Deve passar em todos os checks (5-7 casos, com ✅ e ❌).` |
---

### Passo 5: Teste de Campo (O "Simulador")

Prove que seu Agente funciona na prática e que é portátil.

  * **Teste de Portabilidade:** Teste contra pelo menos **dois LLMs diferentes** (Ex: Gemini 1.5 Flash e Claude 3.5 Sonnet) para provar a portabilidade.
    ```python
    python tools/cli-test.py -t templates/seu-novo-agente.md -q "Um input de teste realista"
    ```
---

**Objetivo Educacional:** O $\text{ACC}$ ensina a transcender a otimização de *tokens* e a criar sistemas de IA que são **fidelizados ao propósito humano**, garantindo uma experiência de alto valor e rigor, independente da ferramenta que ele use.

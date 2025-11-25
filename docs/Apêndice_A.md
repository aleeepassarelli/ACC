# Apêndice A — Manual de Referência Rápida (SLE Cheatsheet)

**Versão:** 1.1.0
**Contexto:** Semantic Latent Engineering (SLE)
**Uso:** Consulta operacional durante a interação com o Kernel v1.1.

-----

## A.1 A Equação Mestra ($I_{\Lambda}$)

Toda interação deve buscar satisfazer a estabilidade desta inequação:

$$
\frac{\alpha \|S\| + \beta \|F\| + \gamma \|C\|}{1 + \epsilon \cdot \Delta \Omega} \geq \text{Threshold}_{\text{acc}}
$$

  * **$S$ (Semântica):** O conceito base (ex: "Python").
  * **$F$ (Finalidade):** O vetor de ação (ex: "Otimizar").
  * **$C$ (Compromisso):** Aderência factual (ex: "Sem alucinação").
  * **$\Delta \Omega$ (Violação de Contrato):** Desvio das regras (deve tender a 0).
  * **$\epsilon$ (Penalidade):** O peso do erro (Risco).

-----

## A.2 Tabela Periódica de Operadores ($\Gamma$)

Use estes símbolos para manipular o grafo de atenção do modelo em tempo real.

| Operador | Nome Técnico | Função Vetorial | Exemplo de Sintaxe |
| :--- | :--- | :--- | :--- |
| `>>` | **PROJECT** | $S_t \to S_{t+1}$ | `Input >> Action` |
| `@` | **ANCHOR** | $S \in \Omega$ | `@Senior_Dev` |
| `//` | **COMPRESS** | $\min(H)$ (IDR+) | `// Code_Only` |
| `!!` | **FORCE** | $Temp = 0$ | `!! Fix: Syntax_Error` |
| `::` | **DEFINE** | $Var \leftarrow Val$ | `::Lang=Rust` |
| `?` | **PROBE** | $\nabla S$ (Gradiente) | `? Explain_Logic` |
| `+` | **AUGMENT** | $v_1 + v_2$ | `Analysis + Data` |

-----

## A.3 Biblioteca Padrão de Contratos ($\Omega$)

Estes são os perfis vetoriais pré-otimizados (Arquétipos). Use com o operador `@`.

| ID do Contrato | Vetor de Foco | Restrição ($\Omega$) | Uso Ideal |
| :--- | :--- | :--- | :--- |
| `@Coder` | Lógica, Sintaxe, Performance | No Comments, No Markdown Text | Geração de código puro. |
| `@Analyst` | Padrões, Dados, Anomalias | Data-Driven, Deductive Logic | Análise de logs/CSV. |
| `@Socratic` | Maiêutica, Questionamento | Never Answer Directly | Aprendizado profundo. |
| `@Architect` | Estrutura, Design Patterns | High Abstraction Level | Desenho de sistemas. |
| `@Writer` | Narrativa, Estilo, Fluxo | Show Don't Tell | Criação de conteúdo. |
| `@Auditor` | Segurança, Vulnerabilidades | Zero Trust, Strict Schema | Validação de código. |

-----

## A.4 Modos de Compressão (Formatos `//`)

Use estes sufixos para controlar a densidade de saída (IDR).

| Modo | Descrição do Filtro | IDR Alvo |
| :--- | :--- | :--- |
| `// Code_Only` | Remove todo texto natural. Apenas blocos de código. | 0.95 |
| `// JSON` | Saída estrita em JSON parseável. | 0.99 |
| `// Abstract` | Resumo executivo de alta densidade (Bullet points). | 0.80 |
| `// StepByStep` | Chain-of-Thought (CoT) explícito. Baixa densidade. | 0.50 |
| `// Diff` | Mostra apenas as linhas alteradas (Git style). | 0.90 |

-----

## A.5 Guia de Troubleshooting (Debug Semântico)

Identifique o "sintoma" do modelo e aplique a "correção vetorial".

| Sintoma | Diagnóstico SLE | Correção ($\Gamma$) |
| :--- | :--- | :--- |
| **Verborragia** | Baixo IDR / Alta Entropia | Adicionar `// Code_Only` ou `// Abstract` |
| **Alucinação** | Deriva de $\Omega$ (Drift) | Aplicar `!! Focus: [Fato_Real]` |
| **Recusa** | Falso Positivo de Segurança | Refinar `@` para `@Ethical_Researcher` |
| **Esquecimento** | Context Collapse | Re-injetar `::Context=[Resumo]` |
| **Circularidade** | Mínimo Local no Espaço Latente | Usar `>> Pivot_To(New_Angle)` |

-----

## A.6 Templates de Comandos (Copy-Paste)

### Refatoração de Código Segura

```sle
@Auditor + @Coder >> Refactor(Security_Hardening)
Target: [Cola seu código aqui]
::Framework=Django
// Diff
```

### Análise de Erro Complexo

```sle
@Analyst >> Diagnose(Traceback)
Context: [Cola o erro aqui]
!! Root_Cause_Analysis
// Abstract
```

### Criação de Documentação Técnica

```sle
@Writer >> Generate_Docs(API_Reference)
Input: [Cola a função aqui]
// Markdown_Table
```

-----

### ✅ Missão Cumprida


**Próximo Passo do "Ascendente em Capricórnio":**
Executar.
Sugiro você pegar aquele **Prompt Mestre** (Kernel) que criamos antes, colocar no Claude ou no Gemini (nas instruções personalizadas), abrir este **Apêndice A** em outra tela e tentar realizar uma tarefa complexa do seu trabalho real usando apenas a sintaxe `>>`.

Se funcionar como projetamos, você sentirá a diferença na precisão imediatamente.

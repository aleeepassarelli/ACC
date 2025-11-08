### 🧬 `CONTRIBUTING.md`

````markdown
# 🤝 Guia de Contribuição - Agente Canivete Cirúrgico (ACC)

Obrigado pelo seu interesse em contribuir para o ACC! Este projeto vive do **minimalismo cirúrgico** e da **validação científica**.

Para manter a integridade e a eficiência do framework, todas as contribuições (especialmente novos `templates/` de Agentes) devem seguir rigorosamente este guia. Um Pull Request (PR) que não passa na validação não será aceito.

## 🔬 O "Checklist de Validação" Cirúrgico

Antes de abrir um Pull Request (PR), seu Agente **deve** passar em todos os testes do checklist. Use as ferramentas no diretório `/tools` para validação objetiva.

---

### ✅ 1. Densidade Semântica (SD > 0.8)

A `Identidade` (Camada 1) deve ter alta coerência com o `Domínio`.

**Como Validar:**
```bash
# Use o "Árbitro" com o --benchmark para garantir portabilidade
python tools/semantic-density-calculator.py "Sua Identidade" "Seu Domínio Alvo" --benchmark
````

**Resultado Esperado:** `✅ (Densidade) APROVADO CROSS-PLATFORM` e `✅ (Minimalismo) APROVADO`.

-----

### ✅ 2. Contagem de Tokens (\< 200)

Agentes ACC são definidos por sua eficiência. O arquivo `.md` completo do seu template deve ter **200 tokens ou menos** (medido pelo `tiktoken`).

**Como Validar:**

```bash
# Use o "Minimalista"
python tools/token-counter.py templates/seu-novo-agente.md
```

**Resultado Esperado:** `✅ APROVADO - Contagem cirúrgica (... <= 200 tokens)`

-----

### ✅ 3. Estrutura do Baseshot (5-7 Casos)

O `Baseshot` (Camada 4) é a "calibração" do Agente. Ele deve ser balanceado.

**Como Validar:**

```bash
# Use o validador de Bash
bash tools/baseshot-validator.sh templates/seu-novo-agente.md
```

**Resultados Esperados:**

  * `✅ APROVADO - Total de casos (5-7) validado.`
  * `✅ APROVADO - Requer pelo menos 1 caso positivo (✅).`
  * `✅ APROVADO - Requer pelo menos 1 caso negativo (❌).`

-----

### ✅ 4. Testes de Comportamento (2+ LLMs)

Seu agente deve ser testado em, no mínimo, **dois (2) modelos de LLM diferentes** (ex: Gemini 1.5 Flash e outro, como Claude 3.5 Sonnet) para provar que seu `Protocolo` (Camada 3) funciona.

**Como Validar:**

```bash
# Use o "Simulador"
python tools/cli-test.py -t templates/seu-novo-agente.md -q "Uma tarefa de teste" -m "gemini-1.5-flash-latest"
```

**Resultado Esperado:** Na descrição do seu Pull Request, cole a saída e confirme que ela segue o `Protocolo` definido no template.

-----

## 🚀 Como Submeter seu Pull Request

1.  **Fork** este repositório.
2.  **Crie um Branch:** `git checkout -b feature/nome-do-seu-agente` (ex: `feature/agente-logistica-reversa`)
3.  **Adicione seu Template:** Crie seu arquivo em `templates/novo-agente.md`.
4.  **Valide:** Rode **todos** os testes do Checklist de Validação acima.
5.  **Commit:** Use uma mensagem clara (ex: `feat(template): Add Agente Logística Reversa v0.1`)
6.  **Push** para seu branch (`git push origin feature/nome-do-seu-agente`).
7.  **Abra o Pull Request:**
      * No corpo do PR, cole a **saída das suas validações** (os resultados do `semantic-density-calculator`, `token-counter` e `baseshot-validator`).
      * Inclua a saída do `cli-test` para os LLMs que você testou.

## ⚖️ Código de Conduta

Este é um projeto científico e de engenharia. Mantenha todas as discussões focadas nos dados, métricas e na melhoria objetiva do framework. Respeite as ideias e os experimentos, mesmo que falhem. Uma falha validada é um dado valioso.

```
```

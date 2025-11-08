# Changelog

Todo o histórico de mudanças notáveis neste projeto será documentado neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-08 - "Fundação Científica"

Esta é a primeira versão principal que estabelece o **Framework Científico** do Agente Canivete Cirúrgico. A versão foi atualizada para `1.1.0` para refletir a suíte de ferramentas unificada.

### Added (Adicionado)

* **Filosofia & Documentação:**
    * `docs/philosophy.md`: O "Manifesto" do ACC, definindo a Engenharia de Espaço Latente como o "Porquê".
    * `docs/cognitive-principles.md`: O "Como", explicando os princípios de `Vector Steering` e `Baseshot Learning` por trás das 4 Camadas.
    * `CONTRIBUTING.md`: Guia de contribuição rigoroso, focado no "Checklist de Validação Científica".

* **Suíte de Ferramentas (Tools v1.1.0):**
    * `tools/semantic-density-calculator.py`: O "Árbitro". Valida a `Densidade Semântica (SD > 0.8)` e o `Minimalismo (Palavras <= 3)` com um benchmark multi-modelo.
    * `tools/alignment_visualizer.py`: O "Diagnóstico". Script "coração" que fornece um CLI visual (`█░░`) para entender *por que* um Agente está (des)alinhado.
    * `tools/strategy_generator.py`: O "Explorador". Gera nomes de Agentes candidatos usando a lógica de extração de "Sinal" (sem `spacy`).
    * `tools/token-counter.py`: O "Minimalista". Valida a regra de `tokens < 200` usando o `tiktoken` (padrão industrial).
    * `tools/cli-test.py`: O "Simulador". Permite testar templates de Agentes em um LLM real (Gemini).
    * `tools/api-endpoint.py`: O "Servidor". Expõe a lógica de análise do framework via uma API FastAPI.

* **Templates "Canivete" (Validados):**
    * Adicionado o conjunto inicial de 8 templates validados, cobrindo Geração de Código, Segurança, DevOps e Análise. (Ex: `CommitAssistant`, `SecurityScanner`, `DependencyMapper`, etc.).

* **Estrutura de Dependências:**
    * `requirements.txt` modularizados (core, dev, docs, research) para um setup de ambiente limpo.

## [0.1.0] - 2025-10-XX - (Rascunho Inicial)

* **Added:** Conceituação inicial do `README.md` e da arquitetura de 4 Camadas. Rascunhos de ferramentas e templates.

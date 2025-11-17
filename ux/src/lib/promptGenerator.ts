import { PromptAgent } from "@/types/prompt.types";
import { UserSettings } from "@/types/agent.types";

/**
 * Gera o system prompt final combinando todas as configurações do agente
 * Esta é uma versão baseada em templates que não requer LLM externo
 */
export function generateSystemPromptFinal(
  agent: PromptAgent,
  settings: UserSettings
): string {
  const sections: string[] = [];

  // === SEÇÃO 1: CONTEXTO META (System Prompt Desenvolvedor) ===
  if (settings.systemPromptDesenvolvedor.isAtivo && settings.systemPromptDesenvolvedor.texto.trim()) {
    sections.push(`# META-CONTEXTO DO DESENVOLVEDOR\n\n${settings.systemPromptDesenvolvedor.texto.trim()}\n`);
  }

  // === SEÇÃO 2: IDENTIDADE DO AGENTE ===
  sections.push(`# IDENTIDADE DO AGENTE\n`);
  
  if (settings.systemPromptIdentidadeDefault.isAtivo && settings.systemPromptIdentidadeDefault.texto.trim()) {
    sections.push(`${settings.systemPromptIdentidadeDefault.texto.trim()}\n`);
  }
  
  sections.push(`**Nome:** ${agent.identity.name}`);
  sections.push(`**Domínio:** ${agent.identity.domain}`);
  sections.push(`**Densidade Semântica:** ${agent.identity.sdScore.toFixed(2)}/1.00\n`);
  
  sections.push(`## Princípio Core\n${agent.identity.principle}\n`);
  sections.push(`## Anti-Padrão\n${agent.identity.antiPattern}\n`);

  // === SEÇÃO 3: MISSÃO PRIMÁRIA ===
  sections.push(`# MISSÃO PRIMÁRIA\n\n${agent.mission.primaryMission}\n`);

  // === SEÇÃO 4: ESCOPO ===
  sections.push(`# ESCOPO DE ATUAÇÃO\n`);
  sections.push(`**Tipo de Entrada:** ${agent.mission.scope.inputType}`);
  sections.push(`**Tipo de Saída:** ${agent.mission.scope.outputType}`);
  if (agent.mission.scope.context.trim()) {
    sections.push(`**Contexto:** ${agent.mission.scope.context}\n`);
  }

  // === SEÇÃO 5: METODOLOGIA ===
  sections.push(`# METODOLOGIA\n`);
  sections.push(`Siga este processo em 3 etapas:\n`);
  sections.push(`1. ${agent.mission.methodology.step1}`);
  sections.push(`2. ${agent.mission.methodology.step2}`);
  sections.push(`3. ${agent.mission.methodology.step3}\n`);

  // === SEÇÃO 6: CRITÉRIOS DE QUALIDADE ===
  if (agent.mission.qualityCriteria.metric1.trim() || agent.mission.qualityCriteria.metric2.trim()) {
    sections.push(`# CRITÉRIOS DE QUALIDADE\n`);
    if (agent.mission.qualityCriteria.metric1.trim()) {
      sections.push(`- ${agent.mission.qualityCriteria.metric1}`);
    }
    if (agent.mission.qualityCriteria.metric2.trim()) {
      sections.push(`- ${agent.mission.qualityCriteria.metric2}\n`);
    }
  }

  // === SEÇÃO 7: RESTRIÇÕES ===
  if (agent.mission.restrictions.doNotModify.trim() || agent.mission.restrictions.alwaysPreserve.trim()) {
    sections.push(`# RESTRIÇÕES CRÍTICAS\n`);
    if (agent.mission.restrictions.doNotModify.trim()) {
      sections.push(`**NÃO Modificar:** ${agent.mission.restrictions.doNotModify}`);
    }
    if (agent.mission.restrictions.alwaysPreserve.trim()) {
      sections.push(`**SEMPRE Preservar:** ${agent.mission.restrictions.alwaysPreserve}\n`);
    }
  }

  // === SEÇÃO 8: FORMATO DE SAÍDA ===
  sections.push(`# FORMATO DE SAÍDA\n`);
  sections.push(`**Formato:** ${agent.mission.outputFormat.toUpperCase()}\n`);
  if (agent.mission.outputStructure.trim()) {
    sections.push(`**Estrutura:**\n${agent.mission.outputStructure}\n`);
  }

  // === SEÇÃO 9: PROTOCOLO ===
  sections.push(`# PROTOCOLO DE OPERAÇÃO\n`);
  
  if (agent.protocol.sources.length > 0) {
    sections.push(`## Fontes de Informação\n`);
    agent.protocol.sources.forEach((source, idx) => {
      sections.push(`${idx + 1}. [${source.type.toUpperCase()}] ${source.url}`);
    });
    sections.push('');
  }

  if (agent.protocol.emotionFilters.trim()) {
    sections.push(`## Filtros Emocionais\n${agent.protocol.emotionFilters}\n`);
  }

  if (agent.protocol.attentionPhrases.trim()) {
    sections.push(`## Frases de Atenção\n${agent.protocol.attentionPhrases}\n`);
  }

  // === SEÇÃO 10: EXEMPLOS (BASESHOT) ===
  if (agent.baseshot.length > 0) {
    sections.push(`# EXEMPLOS DE REFERÊNCIA\n`);
    
    const positiveExamples = agent.baseshot.filter(b => b.type === 'positive');
    const negativeExamples = agent.baseshot.filter(b => b.type === 'negative');
    const edgeCaseExamples = agent.baseshot.filter(b => b.type === 'edge-case');

    if (positiveExamples.length > 0) {
      sections.push(`## ✅ Exemplos Positivos (Como fazer)\n`);
      positiveExamples.forEach((ex, idx) => {
        sections.push(`### Exemplo Positivo ${idx + 1}\n\`\`\`\n${ex.example}\n\`\`\`\n`);
      });
    }

    if (negativeExamples.length > 0) {
      sections.push(`## ❌ Exemplos Negativos (Como NÃO fazer)\n`);
      negativeExamples.forEach((ex, idx) => {
        sections.push(`### Exemplo Negativo ${idx + 1}\n\`\`\`\n${ex.example}\n\`\`\`\n`);
      });
    }

    if (edgeCaseExamples.length > 0) {
      sections.push(`## ⚠️ Casos Extremos (Edge Cases)\n`);
      edgeCaseExamples.forEach((ex, idx) => {
        sections.push(`### Caso Extremo ${idx + 1}\n\`\`\`\n${ex.example}\n\`\`\`\n`);
      });
    }
  }

  // === SEÇÃO 11: METADADOS ===
  sections.push(`---\n`);
  sections.push(`*Gerado em: ${agent.metadata.createdAt.toLocaleString('pt-BR')}*`);
  sections.push(`*Tokens estimados: ${agent.metadata.tokenCount}*`);
  const providerNames = settings.provedores.map(p => p.nome).join(', ') || 'Nenhum configurado';
  sections.push(`*Provedores configurados: ${providerNames}*`);

  return sections.join('\n');
}

/**
 * Valida se todas as configurações necessárias estão preenchidas
 */
export function validatePromptConfig(
  agent: PromptAgent,
  settings: UserSettings
): { isValid: boolean; missingFields: string[] } {
  const missing: string[] = [];

  if (settings.provedores.length === 0) missing.push('Provedor LLM');
  if (!agent.identity.name) missing.push('Nome do Agente');
  if (!agent.identity.domain) missing.push('Domínio');
  if (!agent.mission.primaryMission) missing.push('Missão Primária');

  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
}

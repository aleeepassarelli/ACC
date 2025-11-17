import { PromptAgent } from '@/types/prompt.types';

export function formatPromptAsMarkdown(agent: PromptAgent): string {
  const { identity, mission, protocol, baseshot } = agent;

  let markdown = `# ${identity.name}\n\n`;
  
  // Identidade
  markdown += `## 🎯 IDENTIDADE\n\n`;
  markdown += `**Nome**: ${identity.name}\n`;
  markdown += `**Domínio**: ${identity.domain}\n\n`;
  markdown += `**Princípio Core**:\n${identity.principle}\n\n`;
  markdown += `**Anti-Padrão**:\n${identity.antiPattern}\n\n`;
  
  // Missão
  markdown += `## 🎯 MISSÃO PRIMÁRIA\n\n`;
  markdown += `${mission.primaryMission}\n\n`;
  
  markdown += `## 📍 ESCOPO DE ATUAÇÃO\n\n`;
  markdown += `**Input Esperado**: ${mission.scope.inputType}\n`;
  markdown += `**Output Desejado**: ${mission.scope.outputType}\n`;
  markdown += `**Contexto Necessário**: ${mission.scope.context}\n\n`;
  
  markdown += `## 🔄 METODOLOGIA\n\n`;
  markdown += `1. ${mission.methodology.step1}\n`;
  markdown += `2. ${mission.methodology.step2}\n`;
  markdown += `3. ${mission.methodology.step3}\n\n`;
  
  markdown += `## ✅ CRITÉRIOS DE QUALIDADE\n\n`;
  markdown += `- ${mission.qualityCriteria.metric1}\n`;
  markdown += `- ${mission.qualityCriteria.metric2}\n\n`;
  
  markdown += `## 🚫 RESTRIÇÕES\n\n`;
  markdown += `**Não Modificar**: ${mission.restrictions.doNotModify}\n`;
  markdown += `**Sempre Preservar**: ${mission.restrictions.alwaysPreserve}\n\n`;
  
  markdown += `## 📄 FORMATO DE SAÍDA\n\n`;
  markdown += `**Formato**: ${mission.outputFormat}\n\n`;
  markdown += `**Estrutura**:\n\`\`\`\n${mission.outputStructure}\n\`\`\`\n\n`;
  
  // Protocolo
  markdown += `## 📋 PROTOCOLO DE EXECUÇÃO\n\n`;
  markdown += `**Fontes Cadastradas** (${protocol.sources.length}):\n`;
  protocol.sources.forEach(source => {
    const typeLabel = source.type === 'website' ? '🌐' : source.type === 'youtube' ? '▶️' : '💬';
    markdown += `- ${typeLabel} ${source.url}\n`;
  });
  markdown += `\n**Filtros Emocionais**:\n${protocol.emotionFilters}\n\n`;
  markdown += `**Frases de Atenção para IA**:\n${protocol.attentionPhrases}\n\n`;
  
  // Baseshot
  markdown += `## 🎯 BASESHOT (Calibração)\n\n`;
  baseshot.forEach((shot, index) => {
    const typeLabel = {
      'positive': '✅ Exemplo Positivo',
      'negative': '❌ Exemplo Negativo',
      'edge-case': '⚠️ Caso Limite'
    }[shot.type];
    
    markdown += `### ${typeLabel} ${index + 1}\n`;
    markdown += `${shot.example}\n\n`;
  });

  markdown += `---\n`;
  markdown += `*Gerado pela Plataforma Canivete Cirúrgico*\n`;
  markdown += `*Tokens: ${agent.metadata.tokenCount} | SD Score: ${identity.sdScore.toFixed(2)}*\n`;

  return markdown;
}

export function formatPromptAsText(agent: PromptAgent): string {
  return formatPromptAsMarkdown(agent)
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '');
}

export function formatPromptAsJSON(agent: PromptAgent): string {
  return JSON.stringify(agent, null, 2);
}

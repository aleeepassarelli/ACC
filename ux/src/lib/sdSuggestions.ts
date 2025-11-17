/**
 * SD Suggestion Engine - Frontend Version
 * Gera sugestões automáticas para melhorar Semantic Density
 */

import { calculateSD } from './sdCalculator';

export interface Suggestion {
  name: string;
  sd: number;
  improvement: number;
}

// Dicionários de sinônimos especializados
const SYNONYMS_FUNCTION: Record<string, string[]> = {
  'analista': ['auditor', 'investigador', 'scanner', 'explorador'],
  'desenvolvedor': ['arquiteto', 'construtor', 'engenheiro'],
  'pesquisador': ['curador', 'explorador', 'investigador'],
  'consultor': ['estrategista', 'planejador', 'orientador'],
  'especialista': ['expert', 'mestre', 'autoridade'],
  'assistente': ['facilitador', 'auxiliador', 'parceiro'],
  'hacker': ['explorador', 'investigador', 'auditor', 'dissecador'],
  'tradutor': ['conversor', 'adaptador', 'intérprete'],
  'curador': ['selecionador', 'filtrador', 'organizador']
};

// Palavras de alta densidade semântica
const POWER_WORDS = [
  'forense', 'semântico', 'cirúrgico', 'estratégico', 
  'adversarial', 'contextual', 'reverso', 'adaptativo'
];

/**
 * Estratégia 1: Adicionar palavra de alta densidade
 */
function addPowerWord(name: string): string[] {
  const variations: string[] = [];
  const nameLower = name.toLowerCase();
  
  for (const powerWord of POWER_WORDS) {
    if (!nameLower.includes(powerWord)) {
      variations.push(`${name} ${powerWord}`);
    }
  }
  
  return variations;
}

/**
 * Estratégia 2: Incorporar termos do domínio
 */
function addDomainTerms(name: string, domain: string): string[] {
  const variations: string[] = [];
  const domainWords = domain
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !['para', 'com', 'de', 'da', 'do'].includes(w));
  
  for (const word of domainWords.slice(0, 3)) {
    variations.push(`${name} de ${word}`);
    variations.push(`${word} ${name}`);
  }
  
  return variations;
}

/**
 * Estratégia 3: Substituir por sinônimo mais específico
 */
function replaceSynonym(name: string): string[] {
  const variations: string[] = [];
  const nameLower = name.toLowerCase();
  
  for (const [key, synonyms] of Object.entries(SYNONYMS_FUNCTION)) {
    if (nameLower.includes(key)) {
      for (const synonym of synonyms.slice(0, 3)) {
        variations.push(name.replace(new RegExp(key, 'i'), synonym));
      }
    }
  }
  
  return variations;
}

/**
 * Gera sugestões automáticas de melhorias
 */
export function generateSuggestions(
  currentName: string,
  domain: string,
  currentSD: number,
  maxSuggestions: number = 3
): Suggestion[] {
  if (!currentName || !domain) return [];
  
  // Gerar variações usando múltiplas estratégias
  const allVariations = [
    ...addPowerWord(currentName),
    ...addDomainTerms(currentName, domain),
    ...replaceSynonym(currentName)
  ];
  
  // Remover duplicatas
  const uniqueVariations = Array.from(new Set(allVariations));
  
  // Calcular SD para cada variação
  const scoredVariations: Suggestion[] = [];
  
  for (const variation of uniqueVariations) {
    const result = calculateSD(variation, domain);
    
    // Apenas sugestões que melhoram o SD
    if (result.score > currentSD) {
      // Calcular melhoria de forma segura (proteger contra divisão por zero)
      let improvement: number;
      if (currentSD < 0.01) {
        // Se SD atual é ~0, usar diferença absoluta ao invés de porcentagem
        improvement = result.score * 100; // Converter para "pontos percentuais"
      } else {
        improvement = ((result.score - currentSD) / currentSD) * 100;
      }
      
      scoredVariations.push({
        name: variation,
        sd: result.score,
        improvement: Math.min(improvement, 999) // Cap em 999% para display
      });
    }
  }
  
  // Ordenar por SD (maior primeiro) e retornar top N
  return scoredVariations
    .sort((a, b) => b.sd - a.sd)
    .slice(0, maxSuggestions);
}

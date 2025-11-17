/**
 * Calcula Semantic Density usando heurística simplificada
 * SD = (overlap_words / word_count) * specificity_bonus
 */

export interface SDResult {
  score: number;
  status: 'excellent' | 'good' | 'poor';
  message: string;
}

export function calculateSD(name: string, domain: string): SDResult {
  // 1) Normalização básica
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const nameNorm = normalize(name);
  const domainNorm = normalize(domain);

  // 2) Tokenização + stopwords (PT)
  const STOP = new Set([
    'o','a','os','as','de','da','do','das','dos','em','para','por','com','e','ou','um','uma','uns','umas','no','na','nos','nas','ao','aos','à','às','que','se','sua','seu','suas','seus','depois','antes','entre','sobre','como','mais','menos','muito','pouco','ser','estar','ter'
  ]);
  const toWords = (s: string) => s.split(' ').filter(w => w.length > 1 && !STOP.has(w));

  const nameWords = toWords(nameNorm);
  const domainWords = toWords(domainNorm);

  // Validação aprimorada
  if (!name.trim() || !domain.trim()) {
    return {
      score: 0,
      status: 'poor',
      message: 'Preencha nome e domínio'
    };
  }

  if (name.trim().length < 2 || domain.trim().length < 3) {
    return {
      score: 0,
      status: 'poor',
      message: 'Texto muito curto para análise'
    };
  }

  if (nameWords.length === 0 || domainWords.length === 0) {
    return {
      score: 0,
      status: 'poor',
      message: 'Use palavras significativas (não apenas preposições)'
    };
  }

  // 3) Stem leve (prefixo de 5 chars) para aproximar variações
  const stem = (w: string) => (w.length <= 5 ? w : w.slice(0, 5));

  // 4) Mapear palavras para grupos semânticos de domínio (soft ontology)
  type Group =
    | 'tech' | 'forense' | 'seguranca' | 'semantica' | 'analise' | 'dados'
    | 'api' | 'cloud' | 'documentacao' | 'oferta' | 'llm' | 'codigo';

  const WORD_TO_GROUP: Record<string, Group> = {
    // Tech geral
    tech: 'tech', tecnologia: 'tech', tecnologico: 'tech', tecnologica: 'tech',
    software: 'tech', dev: 'tech', programacao: 'tech', engenharia: 'tech',
    // Segurança / hacker
    hacker: 'seguranca', seguranca: 'seguranca', security: 'seguranca', pentest: 'seguranca', pentester: 'seguranca', adversarial: 'seguranca', reverso: 'seguranca',
    // Forense
    forense: 'forense', forensic: 'forense', pericial: 'forense',
    // Semântica
    semantico: 'semantica', semantica: 'semantica', ontologia: 'semantica', contextual: 'semantica',
    // Análise
    analise: 'analise', analitico: 'analise', analitica: 'analise', auditoria: 'analise', investigacao: 'analise',
    // Dados
    dados: 'dados', data: 'dados', dataset: 'dados', informacao: 'dados', informacoes: 'dados',
    // API / Cloud
    api: 'api', apis: 'api', endpoint: 'api', rest: 'api', graphql: 'api',
    cloud: 'cloud', nuvem: 'cloud', aws: 'cloud', gcp: 'cloud', azure: 'cloud', serverless: 'cloud',
    // Documentação
    documentacao: 'documentacao', docs: 'documentacao', manual: 'documentacao', guia: 'documentacao', rfc: 'documentacao',
    // Oferta / produto
    oferta: 'oferta', ofertas: 'oferta', produto: 'oferta', produtos: 'oferta', servico: 'oferta', servicos: 'oferta', ferramenta: 'oferta', plataforma: 'oferta', saas: 'oferta',
    // LLM / IA
    llm: 'llm', ia: 'llm', ai: 'llm', modelo: 'llm', modelos: 'llm',
    // Código
    codigo: 'codigo', code: 'codigo', script: 'codigo', sistema: 'codigo', aplicacao: 'codigo', app: 'codigo'
  };

  const toGroups = (words: string[]): Set<Group> => {
    const set = new Set<Group>();
    for (const w of words) {
      const g = WORD_TO_GROUP[w as keyof typeof WORD_TO_GROUP];
      if (g) set.add(g);
    }
    return set;
  };

  const groupsName = toGroups(nameWords);
  const groupsDomain = toGroups(domainWords);

  // 5) Similaridade entre grupos (soft matches)
  const GROUP_SIM: Partial<Record<Group, Partial<Record<Group, number>>>> = {
    seguranca: { forense: 0.9, tech: 0.7, analise: 0.5 },
    forense: { seguranca: 0.9, analise: 0.8 },
    semantica: { analise: 0.7, llm: 0.6, dados: 0.4 },
    analise: { forense: 0.8, dados: 0.6, documentacao: 0.6 },
    tech: { dados: 0.7, codigo: 0.7, cloud: 0.6, api: 0.6, llm: 0.6 },
    llm: { tech: 0.6, dados: 0.6, semantica: 0.6 },
    documentacao: { analise: 0.6, tech: 0.4 },
    oferta: { tech: 0.4 },
    codigo: { tech: 0.7, dados: 0.6 },
    cloud: { tech: 0.6, api: 0.5 }
  };

  const groupSim = (a: Group, b: Group) => {
    if (a === b) return 1;
    return (
      GROUP_SIM[a]?.[b] ?? GROUP_SIM[b]?.[a] ?? 0
    );
  };

  const softGroupSimilarity = (A: Set<Group>, B: Set<Group>) => {
    if (A.size === 0 || B.size === 0) return 0;
    let sum = 0;
    for (const a of A) {
      let best = 0;
      for (const b of B) best = Math.max(best, groupSim(a, b));
      sum += best;
    }
    return Math.min(sum / A.size, 1);
  };

  // 6) Vetor TF simples com stems + n-grams de caracteres
  const charNGrams = (s: string, n = 3) => {
    const compact = s.replace(/\s+/g, '');
    const grams: string[] = [];
    for (let i = 0; i <= Math.max(0, compact.length - n); i++) {
      grams.push(`c:${compact.slice(i, i + n)}`);
    }
    return grams.slice(0, 20); // limitar ruído
  };

  const buildTokens = (words: string[], raw: string) => {
    const tokens = words.map(w => `w:${stem(w)}`);
    const grams = charNGrams(raw);
    return [...tokens, ...grams];
  };

  const tokensName = buildTokens(nameWords, nameNorm);
  const tokensDomain = buildTokens(domainWords, domainNorm);

  const toVector = (tokens: string[]) => {
    const m = new Map<string, number>();
    for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  };

  const cosine = (A: Map<string, number>, B: Map<string, number>) => {
    let dot = 0, na = 0, nb = 0;
    for (const [, v] of A) na += v * v;
    for (const [, v] of B) nb += v * v;
    const smaller = A.size < B.size ? A : B;
    const larger = A.size < B.size ? B : A;
    for (const [k, v] of smaller) {
      const u = larger.get(k);
      if (u) dot += v * u;
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  };

  const vecName = toVector(tokensName);
  const vecDomain = toVector(tokensDomain);
  const cosSim = cosine(vecName, vecDomain); // 0..1
  const grpSim = softGroupSimilarity(groupsName, groupsDomain); // 0..1

  // Combinação híbrida com maior peso para proximidade de categorias (robusto sem embeddings)
  const hybridSim = 0.3 * cosSim + 0.7 * grpSim;

  // 7) Bônus de especificidade e penalidades simples
  const genericWords = new Set(['geral','completo','total','universal','assistente']);
  const hasGeneric = nameWords.some(w => genericWords.has(w));

  const specialGroups = new Set<Group>([
    'tech','seguranca','forense','analise','semantica','dados','api','cloud','llm','codigo','documentacao'
  ]);
  let specialCount = 0;
  for (const g of groupsName) if (specialGroups.has(g)) specialCount++;
  for (const g of groupsDomain) if (specialGroups.has(g)) specialCount++;
  const bonusFactor = 1 + Math.min(specialCount * 0.03, 0.15);
  const penaltyFactor = hasGeneric ? 0.9 : 1;

  // 8) Penalidade por comprimento do nome (ideal 2-3 palavras)
  const len = nameWords.length;
  const lengthFactor = len <= 1 ? 0.85 : len <= 3 ? 1.0 : len <= 5 ? 0.9 : 0.8;

  // 9) SD final (garantir valores válidos)
  const raw = hybridSim * bonusFactor * penaltyFactor * lengthFactor;
  let finalScore = Math.max(0, Math.min(1, raw));
  
  // Proteção adicional contra NaN ou valores inválidos
  if (!isFinite(finalScore) || isNaN(finalScore)) {
    finalScore = 0;
  }
  
  // Arredondar para 2 casas decimais, mas garantir mínimo de 0.01 se houver alguma similaridade
  if (finalScore > 0 && finalScore < 0.01) {
    finalScore = 0.01;
  }

  // 10) Status e mensagem
  let status: 'excellent' | 'good' | 'poor';
  let message: string;
  if (finalScore >= 0.7) {
    status = 'excellent';
    message = '✅ Excelente densidade semântica';
  } else if (finalScore >= 0.6) {
    status = 'good';
    message = '✓ Boa densidade, aprovado';
  } else {
    status = 'poor';
    message = '⚠️ SD deve ser ≥ 0.60. Tente nome mais específico ao domínio.';
  }

  // Log útil de depuração (apenas em dev)
  if (import.meta?.env?.DEV) {
    console.debug('[SD/debug]', {
      name, domain, nameWords, domainWords,
      groupsName: Array.from(groupsName),
      groupsDomain: Array.from(groupsDomain),
      cosSim: Number(cosSim.toFixed(3)),
      grpSim: Number(grpSim.toFixed(3)),
      hybridSim: Number(hybridSim.toFixed(3)),
      lengthFactor,
      bonusFactor: Number(bonusFactor.toFixed(2)),
      penaltyFactor,
      finalScore
    });
    // Anexar utilitário manual no console: window.__sd(name, domain)
    // @ts-ignore
    if (!(window as any).__sd) (window as any).__sd = (n: string, d: string) => calculateSD(n, d);
  }

  return { score: parseFloat(finalScore.toFixed(2)), status, message };
}

export function getSDColor(status: 'excellent' | 'good' | 'poor'): 'success' | 'warning' | 'destructive' {
  if (status === 'excellent') return 'success';
  if (status === 'good') return 'success';
  return 'destructive';
}

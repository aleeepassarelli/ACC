/**
 * Token Counter - Estimativa de tokens para LLMs
 * Usa heurística: ~1 token = 4 caracteres (média para PT/EN)
 */

export function estimateTokens(text: string): number {
  if (!text) return 0;
  
  // Heurística simples: 1 token ≈ 4 caracteres
  // Mais preciso que contar palavras para textos mistos
  const charCount = text.trim().length;
  const tokenEstimate = Math.ceil(charCount / 4);
  
  return tokenEstimate;
}

export function formatTokenCount(tokens: number): string {
  if (tokens === 0) return '0 tokens';
  if (tokens === 1) return '1 token';
  return `~${tokens} tokens`;
}

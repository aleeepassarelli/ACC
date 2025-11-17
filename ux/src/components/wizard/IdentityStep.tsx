import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateSD, getSDColor, type SDResult } from '@/lib/sdCalculator';
import { generateSuggestions } from '@/lib/sdSuggestions';
import { estimateTokens, formatTokenCount } from '@/lib/tokenCounter';
import { SuggestionCard } from './SuggestionCard';
import { PromptIdentity } from '@/types/prompt.types';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentityStepProps {
  data: PromptIdentity;
  onChange: (data: PromptIdentity) => void;
}

export function IdentityStep({ data, onChange }: IdentityStepProps) {
  const [sdResult, setSdResult] = useState<SDResult>({
    score: data.sdScore,
    status: 'poor',
    message: 'Preencha os campos acima'
  });
  const [suggestions, setSuggestions] = useState<Array<{ name: string; sd: number; improvement: number }>>([]);

  useEffect(() => {
    if (data.name && data.domain) {
      const result = calculateSD(data.name, data.domain);
      console.debug('[SD]', { name: data.name, domain: data.domain, result });
      setSdResult(result);
      onChange({ ...data, sdScore: result.score });
      
      // Gerar sugestões se SD < 0.60
      if (result.score < 0.6) {
        const newSuggestions = generateSuggestions(data.name, data.domain, result.score);
        setSuggestions(newSuggestions);
      } else {
        setSuggestions([]);
      }
    }
  }, [data.name, data.domain]);

  const handleApplySuggestion = (suggestedName: string) => {
    onChange({ ...data, name: suggestedName });
  };

  const sdColor = getSDColor(sdResult.status);
  const isValid = sdResult.score >= 0.6;
  
  const StatusIcon = sdResult.status === 'poor' ? AlertCircle : CheckCircle2;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-foreground">Identidade do Agente</h2>
        <p className="text-muted-foreground">
          Defina o nome e o comportamento core do seu agente especializado
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Nome do Agente */}
        <div className="space-y-3">
          <Label htmlFor="name" className="text-base font-semibold">
            Nome do Agente *
          </Label>
          <Input
            id="name"
            placeholder="Ex: Hacker Semântico, Curador Técnico..."
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="text-lg"
          />
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Sugestão: Use [Função] + [Domínio] (2-3 palavras)
          </p>
        </div>

        {/* Domínio Alvo */}
        <div className="space-y-3">
          <Label htmlFor="domain" className="text-base font-semibold">
            Domínio Alvo *
          </Label>
          <Input
            id="domain"
            placeholder="Ex: análise forense de ofertas tech, curadoria de documentação..."
            value={data.domain}
            onChange={(e) => onChange({ ...data, domain: e.target.value })}
            className="text-lg"
          />
          <p className="text-sm text-muted-foreground">
            Descreva o contexto específico onde o agente atuará
          </p>
        </div>

        {/* SD Score Indicator */}
        {(data.name || data.domain) && (
          <Card className={cn(
            "p-4 border-2 transition-all",
            sdColor === 'success' && "border-success bg-success/5",
            sdColor === 'warning' && "border-warning bg-warning/5",
            sdColor === 'destructive' && "border-destructive bg-destructive/5"
          )}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Semantic Density (SD)</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold">
                    {sdResult.score.toFixed(2)}
                  </span>
                  <Badge variant={sdColor} className="text-sm px-3 py-1">
                    {sdResult.status === 'excellent' ? 'Excelente' : 
                     sdResult.status === 'good' ? 'Bom' : 'Baixo'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className={cn(
              'flex items-start gap-2 text-sm',
              sdColor === 'success' && 'text-success',
              sdColor === 'destructive' && 'text-destructive'
            )}>
              <StatusIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                {sdResult.message}
              </p>
            </div>
          </Card>
        )}

        {/* Sugestões Automáticas */}
        {suggestions.length > 0 && (
          <SuggestionCard 
            suggestions={suggestions} 
            onApply={handleApplySuggestion}
          />
        )}

        {/* Princípio Core */}
        <div className="space-y-3">
          <Label htmlFor="principle" className="text-base font-semibold">
            Princípio Core *
          </Label>
          <Textarea
            id="principle"
            placeholder="Descreva o comportamento esperado..."
            value={data.principle}
            onChange={(e) => onChange({ ...data, principle: e.target.value })}
            maxLength={100}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>O que o agente DEVE fazer</span>
            <span className="flex items-center gap-2">
              <span>{formatTokenCount(estimateTokens(data.principle))}</span>
              <span>•</span>
              <span>{data.principle.length}/100</span>
            </span>
          </div>
        </div>

        {/* Anti-Padrão */}
        <div className="space-y-3">
          <Label htmlFor="antiPattern" className="text-base font-semibold">
            Anti-Padrão *
          </Label>
          <Textarea
            id="antiPattern"
            placeholder="Descreva o que NÃO deve fazer..."
            value={data.antiPattern}
            onChange={(e) => onChange({ ...data, antiPattern: e.target.value })}
            maxLength={100}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>O que o agente NÃO DEVE fazer</span>
            <span className="flex items-center gap-2">
              <span>{formatTokenCount(estimateTokens(data.antiPattern))}</span>
              <span>•</span>
              <span>{data.antiPattern.length}/100</span>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

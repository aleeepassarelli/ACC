import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp } from 'lucide-react';
import { Suggestion } from '@/lib/sdSuggestions';

interface SuggestionCardProps {
  suggestions: Suggestion[];
  onApply: (name: string) => void;
}

export function SuggestionCard({ suggestions, onApply }: SuggestionCardProps) {
  if (suggestions.length === 0) return null;

  return (
    <Card className="p-4 bg-warning/5 border-warning/20">
      <div className="flex items-start gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Sugestões de Melhoria</h4>
          <p className="text-xs text-muted-foreground">
            Clique para aplicar e aumentar seu SD
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 p-3 bg-background rounded-lg border hover:border-warning/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 flex items-center justify-center bg-success text-success-foreground rounded-full text-xs font-bold">
                  {index + 1}
                </span>
                <span className="font-medium text-sm truncate">
                  {suggestion.name}
                </span>
              </div>
                <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  SD: {suggestion.sd.toFixed(2)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {isFinite(suggestion.improvement) && suggestion.improvement < 999
                      ? `+${suggestion.improvement.toFixed(0)}%`
                      : 'Grande melhoria'}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApply(suggestion.name)}
              className="flex-shrink-0"
            >
              Aplicar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

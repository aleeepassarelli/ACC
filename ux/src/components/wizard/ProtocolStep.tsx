import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import type { PromptProtocol, SourceItem } from "@/types/prompt.types";

interface ProtocolStepProps {
  data: PromptProtocol;
  onChange: (data: PromptProtocol) => void;
}

export function ProtocolStep({ data, onChange }: ProtocolStepProps) {
  const [newSourceType, setNewSourceType] = useState<'website' | 'youtube' | 'social'>('website');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  const handleAddSource = () => {
    if (!newSourceUrl.trim()) return;

    const newSource: SourceItem = {
      id: crypto.randomUUID(),
      type: newSourceType,
      url: newSourceUrl.trim(),
      createdAt: new Date(),
    };

    onChange({
      ...data,
      sources: [...data.sources, newSource],
    });

    setNewSourceUrl('');
  };

  const handleDeleteSource = (id: string) => {
    onChange({
      ...data,
      sources: data.sources.filter(s => s.id !== id),
    });
  };

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'website': return '🌐 Website';
      case 'youtube': return '▶️ YouTube';
      case 'social': return '💬 Social';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-foreground">Protocolo de Fontes</h2>
        <p className="text-muted-foreground">
          Defina as fontes de informação e filtros de validação
        </p>
      </div>

      {/* Add Source Section */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">Adicionar Nova Fonte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="source-type">Tipo de Fonte</Label>
            <Select value={newSourceType} onValueChange={(value: any) => setNewSourceType(value)}>
              <SelectTrigger id="source-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">🌐 Website</SelectItem>
                <SelectItem value="youtube">▶️ YouTube</SelectItem>
                <SelectItem value="social">💬 Redes Sociais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="source-url">URL da Fonte</Label>
            <div className="flex gap-2">
              <Input
                id="source-url"
                placeholder={
                  newSourceType === 'website' ? 'https://exemplo.com' :
                  newSourceType === 'youtube' ? 'https://youtube.com/watch?v=...' :
                  'https://twitter.com/...'
                }
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
              />
              <Button onClick={handleAddSource} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Sources History */}
      {data.sources.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Histórico de Fontes ({data.sources.length})</h3>
          <div className="space-y-2">
            {data.sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{getSourceTypeLabel(source.type)}</span>
                  </div>
                  <p className="text-sm truncate">{source.url}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSource(source.id)}
                  className="ml-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emotion-filters">Filtros Emocionais</Label>
          <Textarea
            id="emotion-filters"
            placeholder="Ex: tom neutro, evitar sensacionalismo, foco em dados objetivos..."
            value={data.emotionFilters}
            onChange={(e) => onChange({ ...data, emotionFilters: e.target.value })}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Defina o tom emocional e estilo que o agente deve usar
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attention-phrases">Frases de Atenção para IA</Label>
          <Textarea
            id="attention-phrases"
            placeholder="Ex: CRÍTICO: sempre validar dados, ATENÇÃO: não inventar informações..."
            value={data.attentionPhrases}
            onChange={(e) => onChange({ ...data, attentionPhrases: e.target.value })}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Instruções críticas que o agente NUNCA deve ignorar
          </p>
        </div>
      </div>
    </div>
  );
}

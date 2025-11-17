import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import type { BaseshotExample, BaseshotType } from "@/types/prompt.types";

interface BaseshotStepProps {
  data: BaseshotExample[];
  onChange: (data: BaseshotExample[]) => void;
}

export function BaseshotStep({ data, onChange }: BaseshotStepProps) {
  const [newType, setNewType] = useState<BaseshotType>('positive');
  const [newExample, setNewExample] = useState('');

  const handleAddExample = () => {
    if (!newExample.trim()) return;

    const newBaseshot: BaseshotExample = {
      type: newType,
      example: newExample.trim(),
    };

    onChange([...data, newBaseshot]);
    setNewExample('');
  };

  const handleDeleteExample = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const getTypeColor = (type: BaseshotType) => {
    switch (type) {
      case 'positive': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'negative': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'edge-case': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    }
  };

  const getTypeLabel = (type: BaseshotType) => {
    switch (type) {
      case 'positive': return '✓ Exemplo Positivo';
      case 'negative': return '✗ Exemplo Negativo';
      case 'edge-case': return '⚠ Caso Extremo';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-foreground">Baseshot - Exemplos de Aprendizado</h2>
        <p className="text-muted-foreground">
          Adicione exemplos que o agente usará como referência (Input → Output esperado)
        </p>
      </div>

      {/* Add Example Section */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">Adicionar Novo Exemplo</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="example-type">Tipo de Exemplo</Label>
            <Select value={newType} onValueChange={(value: BaseshotType) => setNewType(value)}>
              <SelectTrigger id="example-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">✓ Exemplo Positivo (fazer assim)</SelectItem>
                <SelectItem value="negative">✗ Exemplo Negativo (não fazer assim)</SelectItem>
                <SelectItem value="edge-case">⚠ Caso Extremo (situação rara)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="example-text">Exemplo (Input → Output)</Label>
            <Textarea
              id="example-text"
              placeholder="Ex: Input: 'analise esta oferta de 100GB storage gratuito'&#10;Output: 'LIMITAÇÕES: 100GB válido por 30 dias apenas, requer cartão de crédito...'"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleAddExample} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Exemplo
          </Button>
        </div>
      </Card>

      {/* Examples List */}
      {data.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Exemplos Cadastrados ({data.length})</h3>
          <div className="space-y-3">
            {data.map((baseshot, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(baseshot.type)}`}>
                      {getTypeLabel(baseshot.type)}
                    </span>
                    <p className="text-sm whitespace-pre-wrap">{baseshot.example}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteExample(index)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum exemplo cadastrado ainda. Adicione pelo menos 3 exemplos para treinar o agente.
          </p>
        </Card>
      )}
    </div>
  );
}

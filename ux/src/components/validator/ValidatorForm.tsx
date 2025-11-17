import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { calculateSD, getSDColor, type SDResult } from '@/lib/sdCalculator';
import { CheckCircle2, AlertCircle, Info, FileCheck } from 'lucide-react';

export const ValidatorForm = () => {
  const [agentName, setAgentName] = useState('');
  const [domain, setDomain] = useState('');
  const [task, setTask] = useState('');
  const [sdResult, setSdResult] = useState<SDResult | null>(null);

  // Calculate SD when fields change
  useEffect(() => {
    if (agentName && domain) {
      const result = calculateSD(agentName, domain);
      setSdResult(result);
    } else {
      setSdResult(null);
    }
  }, [agentName, domain]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center">
            <FileCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">Validador de Prompts</h2>
        <p className="text-muted-foreground">
          Cole as informações do seu prompt para validar qualidade e densidade semântica
        </p>
      </div>

      {/* Validation Form */}
      <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName" className="text-sm font-medium">
              Nome do Agente *
            </Label>
            <Input
              id="agentName"
              placeholder="Ex: CodeNavigator Assistente"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              O nome que identifica o agente ou assistente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm font-medium">
              Domínio de Operação *
            </Label>
            <Textarea
              id="domain"
              placeholder="Ex: Navegação e análise de código em tempo real"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              A área de especialização e contexto onde o agente opera
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task" className="text-sm font-medium">
              Tarefa a Realizar
            </Label>
            <Textarea
              id="task"
              placeholder="Ex: Mapear fluxos de execução e dependências"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              A tarefa específica que o agente irá executar
            </p>
          </div>
        </div>

        {/* SD Score Display */}
        {sdResult && (
          <Card className={`p-4 border-2 ${
            sdResult.status === 'excellent' 
              ? 'border-green-500/50 bg-green-500/5' 
              : sdResult.status === 'good' 
              ? 'border-yellow-500/50 bg-yellow-500/5' 
              : 'border-red-500/50 bg-red-500/5'
          }`}>
            <div className="flex items-start gap-3">
              {sdResult.status === 'excellent' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : sdResult.status === 'good' ? (
                <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Densidade Semântica (SD)</span>
                  <Badge variant={sdResult.status === 'excellent' ? 'default' : sdResult.status === 'good' ? 'secondary' : 'destructive'}>
                    {(sdResult.score * 100).toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sdResult.message}</p>
                
                {/* Quality Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Nome: </span>
                    <span className="font-medium">{agentName.split(' ').length} palavras</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Domínio: </span>
                    <span className="font-medium">{domain.split(' ').length} palavras</span>
                  </div>
                  {task && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Tarefa: </span>
                      <span className="font-medium">{task.split(' ').length} palavras</span>
                    </div>
                  )}
                  <div className="text-xs">
                    <span className="text-muted-foreground">Status: </span>
                    <span className={`font-medium ${
                      sdResult.status === 'excellent' ? 'text-green-500' : 
                      sdResult.status === 'good' ? 'text-yellow-500' : 
                      'text-red-500'
                    }`}>
                      {sdResult.status === 'excellent' ? 'Excelente' : 
                       sdResult.status === 'good' ? 'Bom' : 
                       'Precisa Melhorar'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        {!sdResult && (
          <Card className="p-4 bg-muted/50 border-border/50">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Como usar o validador</p>
                <p className="text-xs text-muted-foreground">
                  Preencha pelo menos o <strong>Nome do Agente</strong> e o <strong>Domínio de Operação</strong> para ver a análise de densidade semântica.
                  Quanto maior a correlação entre nome e domínio, melhor a qualidade do prompt.
                </p>
              </div>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

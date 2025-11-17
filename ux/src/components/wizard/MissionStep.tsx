import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptMission, OutputFormat } from "@/types/prompt.types";
import { estimateTokens, formatTokenCount } from "@/lib/tokenCounter";
import { Target, Workflow, CheckCircle2, AlertCircle, FileOutput } from "lucide-react";

interface MissionStepProps {
  data: PromptMission;
  onChange: (data: PromptMission) => void;
}

export function MissionStep({ data, onChange }: MissionStepProps) {
  const updateField = (field: keyof PromptMission, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateScopeField = (field: keyof PromptMission['scope'], value: string) => {
    onChange({
      ...data,
      scope: { ...data.scope, [field]: value }
    });
  };

  const updateMethodologyField = (field: keyof PromptMission['methodology'], value: string) => {
    onChange({
      ...data,
      methodology: { ...data.methodology, [field]: value }
    });
  };

  const updateQualityField = (field: keyof PromptMission['qualityCriteria'], value: string) => {
    onChange({
      ...data,
      qualityCriteria: { ...data.qualityCriteria, [field]: value }
    });
  };

  const updateRestrictionsField = (field: keyof PromptMission['restrictions'], value: string) => {
    onChange({
      ...data,
      restrictions: { ...data.restrictions, [field]: value }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-foreground">Missão e Formato</h2>
        <p className="text-muted-foreground">
          Defina o objetivo, escopo e metodologia do seu agente
        </p>
      </div>
      {/* Missão Primária */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Missão Primária
          </CardTitle>
          <CardDescription>
            Descreva em 1 frase clara o objetivo principal do agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="primary-mission">Missão</Label>
            <Input
              id="primary-mission"
              placeholder="Ex: Identificar limitações técnicas reais vs promessas de marketing em ofertas tech"
              value={data.primaryMission}
              onChange={(e) => updateField('primaryMission', e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {data.primaryMission.length}/150 caracteres
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Escopo de Atuação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-primary" />
            Escopo de Atuação
          </CardTitle>
          <CardDescription>
            Defina input, output e contexto necessário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-type">Input Esperado</Label>
            <Input
              id="input-type"
              placeholder="Ex: Nome de provedor de serviço tech (API, Cloud, VM)"
              value={data.scope.inputType}
              onChange={(e) => updateScopeField('inputType', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-type">Output Desejado</Label>
            <Input
              id="output-type"
              placeholder="Ex: Lista de limitações técnicas documentadas com fontes"
              value={data.scope.outputType}
              onChange={(e) => updateScopeField('outputType', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Contexto Necessário</Label>
            <Textarea
              id="context"
              placeholder="Ex: Tier gratuito ou freemium, foco em limitações não documentadas oficialmente"
              value={data.scope.context}
              onChange={(e) => updateScopeField('context', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {estimateTokens(data.scope.context)} • {formatTokenCount(estimateTokens(data.scope.context))}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metodologia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Metodologia (3 passos)
          </CardTitle>
          <CardDescription>
            Defina os 3 passos principais de execução
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="step1">Passo 1 - Ação Específica</Label>
            <Input
              id="step1"
              placeholder="Ex: Buscar em Reddit, GitHub Issues e HackerNews"
              value={data.methodology.step1}
              onChange={(e) => updateMethodologyField('step1', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step2">Passo 2 - Validação</Label>
            <Input
              id="step2"
              placeholder="Ex: Confirmar com mínimo 2 fontes independentes"
              value={data.methodology.step2}
              onChange={(e) => updateMethodologyField('step2', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step3">Passo 3 - Entrega</Label>
            <Input
              id="step3"
              placeholder="Ex: Compilar em tabela estruturada com fontes citadas"
              value={data.methodology.step3}
              onChange={(e) => updateMethodologyField('step3', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Critérios de Qualidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Critérios de Qualidade
          </CardTitle>
          <CardDescription>
            Defina métricas mensuráveis de sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metric1">Métrica 1</Label>
            <Input
              id="metric1"
              placeholder="Ex: Mínimo 2 fontes por limitação identificada"
              value={data.qualityCriteria.metric1}
              onChange={(e) => updateQualityField('metric1', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric2">Métrica 2</Label>
            <Input
              id="metric2"
              placeholder="Ex: Apenas fontes com data <12 meses ou confirmação recente"
              value={data.qualityCriteria.metric2}
              onChange={(e) => updateQualityField('metric2', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Restrições */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Restrições
          </CardTitle>
          <CardDescription>
            Defina limites claros e comportamentos críticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="do-not-modify">Não Modificar</Label>
            <Textarea
              id="do-not-modify"
              placeholder="Ex: Não parafrasear declarações técnicas, citar literalmente"
              value={data.restrictions.doNotModify}
              onChange={(e) => updateRestrictionsField('doNotModify', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="always-preserve">Sempre Preservar</Label>
            <Textarea
              id="always-preserve"
              placeholder="Ex: Incluir link da fonte para cada informação"
              value={data.restrictions.alwaysPreserve}
              onChange={(e) => updateRestrictionsField('alwaysPreserve', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Formato de Saída */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileOutput className="w-5 h-5 text-primary" />
            Formato de Saída
          </CardTitle>
          <CardDescription>
            Defina a estrutura exata do output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output-format">Formato</Label>
            <Select
              value={data.outputFormat}
              onValueChange={(value: OutputFormat) => updateField('outputFormat', value)}
            >
              <SelectTrigger id="output-format">
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Tabela</SelectItem>
                <SelectItem value="list">Lista</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-structure">Estrutura do Output</Label>
            <Textarea
              id="output-structure"
              placeholder="Ex: | Provedor | Limitação Técnica | Red Flag | Fonte |"
              value={data.outputStructure}
              onChange={(e) => updateField('outputStructure', e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {estimateTokens(data.outputStructure)} • {formatTokenCount(estimateTokens(data.outputStructure))}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, FileText, FileJson, Eye, CheckCircle2, Sparkles, MessageSquare } from "lucide-react";
import { PromptAgent } from "@/types/prompt.types";
import { UserSettings } from "@/types/agent.types";
import { formatPromptAsMarkdown, formatPromptAsJSON, formatPromptAsText } from "@/lib/promptFormatter";
import { toast } from "sonner";

interface PreviewStepProps {
  agent: PromptAgent;
  settings: UserSettings;
  systemPromptFinal: string;
}

export function PreviewStep({ agent, settings, systemPromptFinal }: PreviewStepProps) {
  const navigate = useNavigate();
  const [activeFormat, setActiveFormat] = useState<'markdown' | 'text' | 'json' | 'final'>('final');

  const formattedContent = {
    final: systemPromptFinal,
    markdown: formatPromptAsMarkdown(agent),
    text: formatPromptAsText(agent),
    json: formatPromptAsJSON(agent),
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedContent[activeFormat]);
    toast.success("Copiado para área de transferência!");
  };

  const handleDownload = () => {
    const content = formattedContent[activeFormat];
    const extension = activeFormat === 'json' ? 'json' : activeFormat === 'markdown' ? 'md' : 'txt';
    const fileName = activeFormat === 'final' 
      ? `${agent.identity.name.toLowerCase().replace(/\s+/g, '-')}-final.txt`
      : `${agent.identity.name.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Arquivo ${fileName} baixado!`);
  };

  const handleUseInChat = () => {
    navigate('/chat', { 
      state: { 
        systemPrompt: formattedContent[activeFormat],
        agentName: agent.identity.name 
      } 
    });
    toast.success("Prompt carregado no chat!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-foreground">Preview e Exportação</h2>
        <p className="text-muted-foreground">
          Revise seu prompt e exporte no formato desejado
        </p>
      </div>

      {/* Métricas do Prompt */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Prompt Completo
          </CardTitle>
          <CardDescription>
            {agent.identity.name} - Agente especializado em {agent.identity.domain}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-2xl font-bold">{agent.metadata.tokenCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">SD Score</p>
              <Badge variant={agent.identity.sdScore >= 0.8 ? 'success' : agent.identity.sdScore >= 0.6 ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                {agent.identity.sdScore.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fontes</p>
              <p className="text-2xl font-bold">{agent.protocol.sources.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Exemplos</p>
              <p className="text-2xl font-bold">{agent.baseshot.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview do Prompt
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                <Copy className="w-4 h-4" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={handleUseInChat} className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Usar no Chat
              </Button>
              <Button variant="default" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Baixar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFormat} onValueChange={(v) => setActiveFormat(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="final" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Final
              </TabsTrigger>
              <TabsTrigger value="markdown" className="gap-2">
                <FileText className="w-4 h-4" />
                Markdown
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2">
                <FileText className="w-4 h-4" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2">
                <FileJson className="w-4 h-4" />
                JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="final" className="mt-4">
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-1">
                <div className="bg-background rounded-lg p-4 max-h-[600px] overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {formattedContent.final}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="markdown" className="mt-4">
              <div className="bg-muted rounded-lg p-4 max-h-[600px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {formattedContent.markdown}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-4">
              <div className="bg-muted rounded-lg p-4 max-h-[600px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {formattedContent.text}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="json" className="mt-4">
              <div className="bg-muted rounded-lg p-4 max-h-[600px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {formattedContent.json}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dicas de uso */}
      <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            System Prompt Final Gerado
          </CardTitle>
          <CardDescription>
            Este é o prompt otimizado pronto para uso com seus provedores configurados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="bg-background/50 rounded-lg p-4 space-y-2">
            <p className="text-muted-foreground">
              ✨ O <strong className="text-foreground">systemPromptFinal</strong> foi gerado combinando:
            </p>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• Identidade do agente ({agent.identity.name})</li>
              <li>• Missão e metodologia</li>
              <li>• Protocolo com {agent.protocol.sources.length} fontes</li>
              <li>• {agent.baseshot.length} exemplos baseshot</li>
              <li>• System prompts mestres configurados</li>
            </ul>
          </div>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Como usar:</strong> Copie a aba "Final" e cole como system prompt no seu provedor LLM configurado (ChatGPT, Claude, Gemini, etc).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 Formatos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Final:</strong> System prompt otimizado gerado pelos prompts mestres.
          </p>
          <p>
            <strong className="text-foreground">Markdown/Texto:</strong> Formato estruturado com todas as seções.
          </p>
          <p>
            <strong className="text-foreground">JSON:</strong> Formato estruturado para APIs e automação.
          </p>
          <p>
            <strong className="text-foreground">Tokens:</strong> ~{agent.metadata.tokenCount} tokens estimados. GPT-4 suporta até 128k.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

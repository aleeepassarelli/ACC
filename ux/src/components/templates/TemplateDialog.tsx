import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PromptTemplate } from '@/types/prompt.types';
import { MessageSquare, Target, Shield, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveAgent } from '@/lib/storage';

interface TemplateDialogProps {
  template: PromptTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateDialog = ({ template, open, onOpenChange }: TemplateDialogProps) => {
  const navigate = useNavigate();

  if (!template) return null;

  const handleUseInChat = () => {
    // Salvar o agente no storage
    saveAgent(template.agent);
    
    // Navegar para o chat
    navigate('/chat', { state: { agentId: template.agent.id } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{template.icon}</span>
            <div>
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription>{template.category}</DialogDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">SD Score: {template.sdScore.toFixed(2)}</Badge>
            <Badge variant="outline">{template.agent.metadata.tokenCount} tokens</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Identidade */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Identidade do Agente</h3>
            </div>
            <div className="space-y-3 pl-7">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Domínio</p>
                <p className="text-sm">{template.agent.identity.domain}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Princípio Core</p>
                <p className="text-sm">{template.agent.identity.principle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Anti-Padrão</p>
                <p className="text-sm text-destructive">{template.agent.identity.antiPattern}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Missão */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Missão & Objetivo</h3>
            </div>
            <div className="space-y-3 pl-7">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Missão Principal</p>
                <p className="text-sm">{template.agent.mission.primaryMission}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Input</p>
                <p className="text-sm">{template.agent.mission.scope.inputType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Output</p>
                <p className="text-sm">{template.agent.mission.scope.outputType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Formato de Saída</p>
                <Badge variant="outline">{template.agent.mission.outputFormat}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Exemplos */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Exemplos (Baseshot)</h3>
            </div>
            <div className="space-y-2 pl-7">
              {template.agent.baseshot.slice(0, 3).map((shot, idx) => (
                <div key={idx} className="text-sm p-2 bg-muted/50 rounded-md">
                  <Badge variant={shot.type === 'positive' ? 'default' : shot.type === 'negative' ? 'destructive' : 'secondary'} className="text-xs mb-1">
                    {shot.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground line-clamp-2">{shot.example}</p>
                </div>
              ))}
              {template.agent.baseshot.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{template.agent.baseshot.length - 3} mais exemplos
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Fechar
          </Button>
          <Button
            onClick={handleUseInChat}
            className="flex-1 gap-2 bg-gradient-primary hover:opacity-90"
          >
            <MessageSquare className="w-4 h-4" />
            Usar no Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

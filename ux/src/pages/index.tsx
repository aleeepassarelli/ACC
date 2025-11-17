import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StepIndicator } from '@/components/wizard/StepIndicator';
import { IdentityStep } from '@/components/wizard/IdentityStep';
import { MissionStep } from '@/components/wizard/MissionStep';
import { PromptAgent, PromptIdentity, PromptMission, PromptProtocol, BaseshotExample, OutputFormat, PromptTemplate } from '@/types/prompt.types';
import { WizardProviderConfig } from '@/types/agent.types';
import { ProtocolStep } from '@/components/wizard/ProtocolStep';
import { BaseshotStep } from '@/components/wizard/BaseshotStep';
import { PreviewStep } from '@/components/wizard/PreviewStep';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplateDialog } from '@/components/templates/TemplateDialog';
import { Wand2, Library, FileCheck, ArrowRight, ArrowLeft, MessageSquare, Settings, Github } from 'lucide-react';
import { estimateTokens } from '@/lib/tokenCounter';
import { useNavigate } from 'react-router-dom';
import { generateSystemPromptFinal } from '@/lib/promptGenerator';
import { SettingsDialog } from '@/components/SettingsDialog';
import { getUserSettings, getCurrentUserId } from '@/lib/storage';
import templatesData from '@/data/templates.json';
import { ValidatorForm } from '@/components/validator/ValidatorForm';

const STEPS = [
  { number: 1, title: 'Identidade', description: 'Nome e princípio' },
  { number: 2, title: 'Missão', description: 'Objetivo e formato' },
  { number: 3, title: 'Protocolo', description: 'Fontes e filtros' },
  { number: 4, title: 'Baseshot', description: 'Exemplos' },
  { number: 5, title: 'Preview', description: 'Validar e exportar' },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'templates' | 'validate'>('create');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Form data
  const [identity, setIdentity] = useState<PromptIdentity>({
    name: '',
    domain: '',
    sdScore: 0,
    principle: '',
    antiPattern: '',
  });

  const [mission, setMission] = useState<PromptMission>({
    primaryMission: '',
    scope: {
      inputType: '',
      outputType: '',
      context: '',
    },
    methodology: {
      step1: '',
      step2: '',
      step3: '',
    },
    qualityCriteria: {
      metric1: '',
      metric2: '',
    },
    restrictions: {
      doNotModify: '',
      alwaysPreserve: '',
    },
    outputFormat: 'table' as OutputFormat,
    outputStructure: '',
  });

  const [protocol, setProtocol] = useState<PromptProtocol>({
    sources: [],
    emotionFilters: '',
    attentionPhrases: '',
  });

  const [baseshot, setBaseshot] = useState<BaseshotExample[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Convert templates data to PromptTemplate format
  const templates: PromptTemplate[] = (templatesData as any[]).map(t => {
    const primarySources = t.agent.protocol.primarySources || t.agent.protocol.sources || [];
    return {
      ...t,
      agent: {
        ...t.agent,
        protocol: {
          sources: primarySources.map((url: string, idx: number) => ({
            id: `source-${idx}`,
            type: 'website' as const,
            url: url,
            createdAt: new Date(),
          })),
          emotionFilters: t.agent.protocol.eliminationFilters?.join(', ') || t.agent.protocol.emotionFilters || '',
          attentionPhrases: t.agent.protocol.validationCriteria || t.agent.protocol.attentionPhrases || '',
        },
      },
    };
  });

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          identity.name.length >= 2 &&
          identity.domain.length >= 5 &&
          identity.sdScore >= 0.6 &&
          identity.principle.length >= 10 &&
          identity.antiPattern.length >= 10
        );
      case 2:
        return (
          mission.primaryMission.trim() !== '' &&
          mission.scope.inputType.trim() !== '' &&
          mission.scope.outputType.trim() !== '' &&
          mission.methodology.step1.trim() !== '' &&
          mission.methodology.step2.trim() !== '' &&
          mission.methodology.step3.trim() !== ''
        );
      case 3:
        return (
          protocol.sources.length >= 2 &&
          protocol.emotionFilters.trim().length >= 10 &&
          protocol.attentionPhrases.trim().length >= 10
        );
      case 4:
        return baseshot.length >= 5;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Calcular tokens totais para o preview
  const calculateTotalTokens = () => {
    let total = 0;
    total += estimateTokens(identity.name);
    total += estimateTokens(identity.domain);
    total += estimateTokens(identity.principle);
    total += estimateTokens(identity.antiPattern);
    total += estimateTokens(mission.primaryMission);
    total += estimateTokens(mission.scope.inputType);
    total += estimateTokens(mission.scope.outputType);
    total += estimateTokens(mission.scope.context);
    total += estimateTokens(mission.methodology.step1);
    total += estimateTokens(mission.methodology.step2);
    total += estimateTokens(mission.methodology.step3);
    total += estimateTokens(mission.outputStructure);
    total += estimateTokens(protocol.emotionFilters);
    total += estimateTokens(protocol.attentionPhrases);
    baseshot.forEach(shot => {
      total += estimateTokens(shot.example);
    });
    return total;
  };

  // Criar o agente completo para preview
  const completeAgent: PromptAgent = {
    id: crypto.randomUUID(),
    identity,
    mission,
    protocol,
    baseshot,
    metadata: {
      tokenCount: calculateTotalTokens(),
      createdAt: new Date(),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Canivete Cirúrgico</h1>
                <p className="text-sm text-muted-foreground">Framework de Prompt Engineering</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://github.com/aleeepassarelli/ACC', '_blank')}
                className="gap-2"
              >
                <Github className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/chat')}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Criar Novo</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="validate" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Validar</span>
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-8">
            <StepIndicator
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />

            <div className="min-h-[500px]">
              {currentStep === 1 && (
                <IdentityStep data={identity} onChange={setIdentity} />
              )}
              {currentStep === 2 && (
                <MissionStep data={mission} onChange={setMission} />
              )}
              {currentStep === 3 && (
                <ProtocolStep data={protocol} onChange={setProtocol} />
              )}
              {currentStep === 4 && (
                <BaseshotStep data={baseshot} onChange={setBaseshot} />
              )}
              {currentStep === 5 && (
                <PreviewStep 
                  agent={completeAgent} 
                  settings={getUserSettings(getCurrentUserId())}
                  systemPromptFinal={generateSystemPromptFinal(completeAgent, getUserSettings(getCurrentUserId()))}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between max-w-3xl mx-auto pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2 bg-gradient-primary hover:opacity-90"
                >
                  Próxima Etapa
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button className="gap-2 bg-gradient-accent">
                  Exportar Prompt
                  <FileCheck className="w-4 h-4" />
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Biblioteca de Templates</h2>
                <p className="text-muted-foreground">
                  Escolha um template pronto ou use como base para criar o seu
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setTemplateDialogOpen(true);
                    }}
                  />
                ))}
              </div>

              {templates.length === 0 && (
                <Card className="p-8 text-center">
                  <Library className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum template disponível no momento
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Validate Tab */}
          <TabsContent value="validate">
            <ValidatorForm />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Framework Agente Canivete Cirúrgico - v1.0</p>
          <p className="mt-2">Desenvolvido com ❤️ para democratizar Prompt Engineering</p>
        </div>
      </footer>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <TemplateDialog
        template={selectedTemplate}
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
    </div>
  );
};

export default Index;

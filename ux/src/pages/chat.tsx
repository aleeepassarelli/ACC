import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Paperclip, Mic, RefreshCw, Scissors, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateSD, getSDColor, type SDResult } from '@/lib/sdCalculator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  
  // Validation fields
  const [agentName, setAgentName] = useState('');
  const [domain, setDomain] = useState('');
  const [task, setTask] = useState('');
  const [sdResult, setSdResult] = useState<SDResult | null>(null);

  // Load prompt from navigation state
  useEffect(() => {
    const state = location.state as { systemPrompt?: string; agentName?: string } | null;
    if (state?.systemPrompt) {
      setSystemPrompt(state.systemPrompt);
      if (state.agentName) {
        setAgentName(state.agentName);
      }
      // Add welcome message
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        content: `Prompt "${state.agentName || 'Agente'}" carregado! Você pode começar a conversar.`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [location]);

  // Calculate SD when fields change
  useEffect(() => {
    if (agentName && domain) {
      const result = calculateSD(agentName, domain);
      setSdResult(result);
    } else {
      setSdResult(null);
    }
  }, [agentName, domain]);

  const agentInfo = {
    name: 'Canivete Cirúrgico',
    description: 'Minimalismo cirúrgico para engenharia de prompts: cada palavra com propósito, cada métrica com evidência.',
    icon: Scissors,
  };

  const suggestions = [
    'Validar consistência: cruzar requisitos funcionais e não funcionais → relatório de coerência lógica.',
    'Analisar requisitos: aplicar parsing semântico sobre texto técnico → mapa de entidades e relações.',
    'Detectar ambiguidade: analisar linguagem natural → lista de frases ambíguas e sugestões.',
    'Mapear dependências: gerar grafo de relação entre tarefas → rede de precedência visual.',
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Esta é uma resposta simulada. Integre com sua API de IA para respostas reais.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="hover:bg-accent/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">{agentInfo.name}</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent/50"
              onClick={() => setMessages([])}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl overflow-y-auto">
        {messages.length === 0 ? (
          /* Initial State - Validation Form */
          <div className="flex flex-col space-y-6 mb-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarFallback className="text-2xl bg-gradient-hero text-white">
                  <agentInfo.icon className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold mb-2">{agentInfo.name}</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl px-4">{agentInfo.description}</p>
            </div>

            {/* Validation Form */}
            <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agentName" className="text-sm font-medium">
                    Nome do Agente
                  </Label>
                  <Input
                    id="agentName"
                    placeholder="Ex: CodeNavigator Assistente"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-sm font-medium">
                    Domínio de Operação
                  </Label>
                  <Input
                    id="domain"
                    placeholder="Ex: Navegação e análise de código em tempo real"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task" className="text-sm font-medium">
                    Tarefa a Realizar
                  </Label>
                  <Input
                    id="task"
                    placeholder="Ex: Mapear fluxos de execução e dependências"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="bg-background/50"
                  />
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
                        <div className="text-xs">
                          <span className="text-muted-foreground">Tarefa: </span>
                          <span className="font-medium">{task.split(' ').length} palavras</span>
                        </div>
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
            </Card>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4 mt-8 mb-6">
              {suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className="p-4 hover:bg-accent/50 cursor-pointer transition-colors text-left"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <p className="text-sm text-foreground">{suggestion}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="space-y-4 mb-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-gradient-hero text-white">
                      <agentInfo.icon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={`p-3 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Input Area - Fixed at bottom of content */}
        <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-xl border shadow-sm p-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-9 w-9"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Pergunte qualquer coisa, crie qualquer coisa"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                />

                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-primary hover:bg-primary/90 h-9 w-9"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;

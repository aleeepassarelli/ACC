import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getUserSettings, saveUserSettings, getCurrentUserId } from '@/lib/storage';
import { UserSettings, Provedor } from '@/types/agent.types';
import { Info, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast();
  const userId = getCurrentUserId();
  const [settings, setSettings] = useState<UserSettings>(getUserSettings(userId));

  useEffect(() => {
    if (open) {
      setSettings(getUserSettings(userId));
    }
  }, [open, userId]);

  const handleSave = () => {
    saveUserSettings(settings);
    toast({
      title: 'Configurações salvas',
      description: 'Suas configurações foram atualizadas com sucesso.',
    });
    onOpenChange(false);
  };

  const addProvider = () => {
    setSettings({
      ...settings,
      provedores: [
        ...settings.provedores,
        { nome: 'OpenAI', apiKey: '', baseURL: '' },
      ],
    });
  };

  const removeProvider = (index: number) => {
    setSettings({
      ...settings,
      provedores: settings.provedores.filter((_, i) => i !== index),
    });
  };

  const updateProvider = (index: number, field: keyof Provedor, value: string) => {
    const newProviders = [...settings.provedores];
    newProviders[index] = { ...newProviders[index], [field]: value };
    setSettings({ ...settings, provedores: newProviders });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Configure provedores LLM e system prompts mestres
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="providers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="providers">Provedores</TabsTrigger>
            <TabsTrigger value="prompts">System Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Provedores LLM</CardTitle>
                <CardDescription>
                  Configure as chaves de API dos provedores que você deseja usar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.provedores.map((provider, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Provedor #{index + 1}</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProvider(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`provider-${index}`}>Tipo</Label>
                        <Select
                          value={provider.nome}
                          onValueChange={(value) => updateProvider(index, 'nome', value)}
                        >
                          <SelectTrigger id={`provider-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OpenAI">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                            <SelectItem value="OpenAICustom">OpenAI Custom</SelectItem>
                            <SelectItem value="Claude">Anthropic (Claude)</SelectItem>
                            <SelectItem value="Gemini">Google (Gemini)</SelectItem>
                            <SelectItem value="Groq">Groq</SelectItem>
                            <SelectItem value="OpenRouter">OpenRouter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`apikey-${index}`}>API Key</Label>
                        <Input
                          id={`apikey-${index}`}
                          type="password"
                          value={provider.apiKey}
                          onChange={(e) => updateProvider(index, 'apiKey', e.target.value)}
                          placeholder="sk-..."
                        />
                      </div>

                      {provider.nome === 'OpenAICustom' && (
                        <div className="space-y-2">
                          <Label htmlFor={`baseurl-${index}`}>Base URL</Label>
                          <Input
                            id={`baseurl-${index}`}
                            value={provider.baseURL || ''}
                            onChange={(e) => updateProvider(index, 'baseURL', e.target.value)}
                            placeholder="https://api.openai.com/v1"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                <Button onClick={addProvider} variant="outline" className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Provedor
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>System Prompt do Desenvolvedor</CardTitle>
                <CardDescription>
                  Define como o LLM deve se comportar ao gerar o prompt final
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dev-active">Ativo</Label>
                  <Switch
                    id="dev-active"
                    checked={settings.systemPromptDesenvolvedor.isAtivo}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        systemPromptDesenvolvedor: {
                          ...settings.systemPromptDesenvolvedor,
                          isAtivo: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={settings.systemPromptDesenvolvedor.texto}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        systemPromptDesenvolvedor: {
                          ...settings.systemPromptDesenvolvedor,
                          texto: e.target.value,
                        },
                      })
                    }
                    placeholder="Ex: Você é um assistente especializado em criar agents de alta precisão..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Define como o LLM deve se comportar ao gerar o prompt final.
                      Isso estabelece o contexto meta-cognitivo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Prompt de Identidade</CardTitle>
                <CardDescription>
                  Guia como combinar nome, domínio e princípio do agente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="identity-active">Ativo</Label>
                  <Switch
                    id="identity-active"
                    checked={settings.systemPromptIdentidadeDefault.isAtivo}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        systemPromptIdentidadeDefault: {
                          ...settings.systemPromptIdentidadeDefault,
                          isAtivo: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Textarea
                    value={settings.systemPromptIdentidadeDefault.texto}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        systemPromptIdentidadeDefault: {
                          ...settings.systemPromptIdentidadeDefault,
                          texto: e.target.value,
                        },
                      })
                    }
                    placeholder="Ex: Você está criando a identidade de um agente de IA..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Guia como combinar nome, domínio e princípio do agente em uma identidade coesa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export interface AgentTemplate {
  id: string;
  userId: string;
  nomeAgente: string;
  dominioAlvo: string;
  principioCore: string;
  antiPattern: string;
  missaoObjetivo: string;
  protocoloFiltros: string;
  systemPromptFinal: string;
  isPublico: boolean;
  skillTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Provedor {
  nome: 'Gemini' | 'Groq' | 'OpenRouter' | 'Claude' | 'OpenAI' | 'OpenAICustom';
  apiKey: string;
  baseURL?: string;
}

export interface SystemPromptConfig {
  texto: string;
  isAtivo: boolean;
}

export interface UserSettings {
  userId: string;
  provedores: Provedor[];
  systemPromptDesenvolvedor: SystemPromptConfig;
  systemPromptIdentidadeDefault: SystemPromptConfig;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatHistory {
  id: string;
  userId: string;
  templateIdUsado?: string;
  titulo: string;
  mensagens: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface para configuração do wizard (diferente de SystemPromptConfig)
export interface WizardProviderConfig {
  provedor: 'openai' | 'anthropic' | 'google' | 'local';
  systemPromptDesenvolvedor: string;
  systemPromptIdentidade: string;
}

import { AgentTemplate, UserSettings, ChatHistory } from '@/types/agent.types';
import { PromptAgent } from '@/types/prompt.types';

const STORAGE_KEYS = {
  TEMPLATES: 'agent_templates',
  AGENTS: 'canivete_agents',
  USER_SETTINGS: 'user_settings',
  CHAT_HISTORY: 'chat_history',
  CURRENT_USER: 'current_user_id',
} as const;

// User ID Management
export const getCurrentUserId = (): string => {
  let userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  }
  return userId;
};

// Agent Templates
export const saveAgentTemplate = (template: AgentTemplate): void => {
  const templates = getAgentTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  
  if (index >= 0) {
    templates[index] = { ...template, updatedAt: new Date() };
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const getAgentTemplates = (): AgentTemplate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  if (!data) return [];
  
  return JSON.parse(data).map((t: any) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  }));
};

export const getAgentTemplateById = (id: string): AgentTemplate | null => {
  const templates = getAgentTemplates();
  return templates.find(t => t.id === id) || null;
};

export const deleteAgentTemplate = (id: string): void => {
  const templates = getAgentTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const getMyTemplates = (userId: string): AgentTemplate[] => {
  return getAgentTemplates().filter(t => t.userId === userId);
};

export const getPublicTemplates = (): AgentTemplate[] => {
  return getAgentTemplates().filter(t => t.isPublico);
};

// Prompt Agents (for wizard-created agents)
export const saveAgent = (agent: PromptAgent): void => {
  const agents = getAllAgents();
  const index = agents.findIndex(a => a.id === agent.id);
  
  if (index >= 0) {
    agents[index] = agent;
  } else {
    agents.push(agent);
  }
  
  localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
};

export const getAllAgents = (): PromptAgent[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
  if (!data) return [];
  
  return JSON.parse(data).map((a: any) => ({
    ...a,
    metadata: {
      ...a.metadata,
      createdAt: new Date(a.metadata.createdAt),
    },
  }));
};

export const getAgentById = (id: string): PromptAgent | null => {
  const agents = getAllAgents();
  return agents.find(a => a.id === id) || null;
};

export const deleteAgent = (id: string): void => {
  const agents = getAllAgents().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
};

// User Settings
export const getUserSettings = (userId: string): UserSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
  
  if (!data) {
    const defaultSettings: UserSettings = {
      userId,
      provedores: [],
      systemPromptDesenvolvedor: {
        texto: 'Você é um especialista em engenharia de prompts. Sua missão é transformar descrições de identidade, missão e protocolo em system prompts otimizados e eficazes.',
        isAtivo: true,
      },
      systemPromptIdentidadeDefault: {
        texto: 'Você é um assistente prestativo, inteligente e versátil.',
        isAtivo: true,
      },
    };
    saveUserSettings(defaultSettings);
    return defaultSettings;
  }
  
  return JSON.parse(data);
};

export const saveUserSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
};

// Chat History
export const saveChatHistory = (chat: ChatHistory): void => {
  const history = getChatHistory();
  const index = history.findIndex(c => c.id === chat.id);
  
  if (index >= 0) {
    history[index] = { ...chat, updatedAt: new Date() };
  } else {
    history.push(chat);
  }
  
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
};

export const getChatHistory = (): ChatHistory[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
  if (!data) return [];
  
  return JSON.parse(data).map((c: any) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    mensagens: c.mensagens.map((m: any) => ({
      ...m,
      timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
    })),
  }));
};

export const getChatById = (id: string): ChatHistory | null => {
  const history = getChatHistory();
  return history.find(c => c.id === id) || null;
};

export const deleteChatHistory = (id: string): void => {
  const history = getChatHistory().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history));
};

export const getUserChatHistory = (userId: string): ChatHistory[] => {
  return getChatHistory().filter(c => c.userId === userId);
};

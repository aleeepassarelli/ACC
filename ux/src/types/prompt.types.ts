export type OutputFormat = 'table' | 'list' | 'json' | 'text';
export type BaseshotType = 'positive' | 'negative' | 'edge-case';

export interface BaseshotExample {
  type: BaseshotType;
  example: string;
}

export interface PromptIdentity {
  name: string;
  domain: string;
  sdScore: number;
  principle: string;
  antiPattern: string;
}

export interface PromptMission {
  primaryMission: string;
  scope: {
    inputType: string;
    outputType: string;
    context: string;
  };
  methodology: {
    step1: string;
    step2: string;
    step3: string;
  };
  qualityCriteria: {
    metric1: string;
    metric2: string;
  };
  restrictions: {
    doNotModify: string;
    alwaysPreserve: string;
  };
  outputFormat: OutputFormat;
  outputStructure: string;
}

export interface SourceItem {
  id: string;
  type: 'website' | 'youtube' | 'social';
  url: string;
  createdAt: Date;
}

export interface PromptProtocol {
  sources: SourceItem[];
  emotionFilters: string;
  attentionPhrases: string;
}

export interface PromptAgent {
  id: string;
  identity: PromptIdentity;
  mission: PromptMission;
  protocol: PromptProtocol;
  baseshot: BaseshotExample[];
  metadata: {
    tokenCount: number;
    createdAt: Date;
    author?: string;
    communityVotes?: number;
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  agent: PromptAgent;
  category: string;
  sdScore: number;
}

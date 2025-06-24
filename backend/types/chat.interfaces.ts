export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  conversationId?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  message: ChatMessage;
  conversationId: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface StreamChatRequest extends ChatRequest {
  stream: true;
}

export interface ChatHistory {
  conversations: ChatConversation[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface ChatError {
  error: string;
  code?: string;
  details?: any;
}

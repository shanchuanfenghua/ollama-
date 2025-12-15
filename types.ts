export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
}

export type AIProvider = 'ollama';

export interface AppSettings {
  userAvatar: string;
  botNickname: string;
  botAvatar: string;
  aiProvider: AIProvider;
  ollamaModel: string;
  ollamaBaseUrl: string;
}
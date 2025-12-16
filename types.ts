export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface AppSettings {
  // Profile
  userAvatar: string;
  botNickname: string;
  botAvatar: string;
  
  // Ollama Connection
  model: string;
  baseUrl: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
}
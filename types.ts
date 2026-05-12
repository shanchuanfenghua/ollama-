export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'API' | 'DEBUG';
  message: string;
}

export interface AppSettings {
  // Profile
  userAvatar: string;
  botNickname: string;
  botAvatar: string;
  
  // Ollama Connection
  model: string;
  baseUrl: string;

  // MQTT Connection
  mqttEnabled: boolean;
  mqttUrl: string; // e.g. ws://localhost:9001
  mqttTopic: string;
}
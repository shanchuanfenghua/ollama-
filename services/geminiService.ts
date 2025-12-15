import { Message, AppSettings } from "../types";

/**
 * Sends a message to a local Ollama instance.
 */
const sendMessageToOllama = async (
  history: Message[], 
  newMessage: string,
  settings: AppSettings
): Promise<string> => {
  // Convert history to Ollama format (user/assistant)
  // We take the last few messages to keep context without exceeding context windows too fast
  const messages = history.slice(-10).map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.content
  }));

  // Add the new message
  messages.push({ role: 'user', content: newMessage });

  const payload = {
    model: settings.ollamaModel || 'qwen2.5:7b',
    messages: messages,
    stream: false, // For simplicity in this implementation, we wait for full response
    options: {
      temperature: 0.7
    }
  };

  try {
    const baseUrl = settings.ollamaBaseUrl.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Ollama 错误: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;

  } catch (error: any) {
    console.error("Ollama connection failed", error);
    throw new Error("无法连接到 Ollama。请确保它正在运行，并配置了 'OLLAMA_ORIGINS=\"*\"'。");
  }
};

/**
 * Main Orchestrator Function
 */
export const sendMessageToAI = async (
  history: Message[], 
  newMessage: string,
  settings: AppSettings
): Promise<string> => {
  return await sendMessageToOllama(history, newMessage, settings);
};
import { Message, AppSettings } from "../types";

export const sendMessageToOllama = async (
  history: Message[],
  newMessage: string,
  settings: AppSettings
): Promise<string> => {
  const contextMessages = history.slice(-15).map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.content
  }));

  contextMessages.push({ role: 'user', content: newMessage });

  try {
    const targetUrl = `${(settings.baseUrl || 'http://localhost:11434').replace(/\/$/, '')}/api/chat`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: settings.model || 'qwen2.5:7b',
        messages: contextMessages,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content || "";
  } catch (error: any) {
    console.error("Ollama Chat Error:", error);
    throw error;
  }
};

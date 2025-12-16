import { Message, AppSettings } from "../types";

/**
 * Sends a message to the configured Ollama instance (direct connection).
 */
export const sendMessageToAI = async (
  history: Message[], 
  newMessage: string,
  settings: AppSettings
): Promise<string> => {
  // 1. Prepare messages context (Last 10 messages + new one)
  const contextMessages = history.slice(-10).map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.content
  }));

  contextMessages.push({ role: 'user', content: newMessage });

  // 2. Prepare Payload
  const payload = {
    model: settings.model || 'qwen2.5:7b',
    messages: contextMessages,
    stream: false,
    options: { temperature: 0.7 }
  };

  // 3. Determine URL (strip trailing slash)
  const baseUrl = (settings.baseUrl || 'http://localhost:11434').replace(/\/$/, '');
  const apiUrl = `${baseUrl}/api/chat`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Ollama API 错误 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || "";

  } catch (error: any) {
    console.error("Chat Error:", error);
    // Provide a helpful error message for common connection issues
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error("无法连接到 Ollama。\n请确保：\n1. Ollama 正在本地运行。\n2. 已设置环境变量 OLLAMA_ORIGINS=\"*\" 以允许跨域请求。");
    }
    throw error;
  }
};
import { Message, AppSettings } from "../types";

// Type definitions for Chrome's experimental built-in AI
declare global {
  interface Window {
    ai?: {
      languageModel?: {
        capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no' }>;
        create: (options?: any) => Promise<{
          prompt: (input: string) => Promise<string>;
          promptStreaming?: (input: string) => AsyncIterable<string>;
        }>;
      };
    };
  }
}

/**
 * Tries to generate a response using Chrome's built-in local AI (Gemini Nano).
 */
const generateLocalBrowserResponse = async (text: string): Promise<string> => {
  try {
    if (!window.ai?.languageModel) {
      throw new Error("Chrome built-in AI is not supported in this browser version. Enable 'Optimization Guide On Device Model' in chrome://flags.");
    }

    const capabilities = await window.ai.languageModel.capabilities();
    if (capabilities.available === 'no') {
      throw new Error("Chrome built-in AI is not available on this device.");
    }

    const session = await window.ai.languageModel.create({
      systemPrompt: "You are a helpful assistant. Keep answers concise."
    });

    const result = await session.prompt(text);
    return `[Chrome Built-in] ${result}`;
  } catch (error: any) {
    console.warn("Failed to use Chrome local AI:", error);
    throw new Error(`Chrome AI Error: ${error.message || 'Unknown error'}`);
  }
};

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
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;

  } catch (error: any) {
    console.error("Ollama connection failed", error);
    throw new Error("Could not connect to Ollama. Ensure it is running and 'OLLAMA_ORIGINS=\"*\"' is configured.");
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
  
  if (settings.aiProvider === 'ollama') {
    return await sendMessageToOllama(history, newMessage, settings);
  } else if (settings.aiProvider === 'chrome_builtin') {
    return await generateLocalBrowserResponse(newMessage);
  }

  throw new Error("Invalid AI Provider selected.");
};
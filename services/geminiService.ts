import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
const generateLocalResponse = async (text: string): Promise<string | null> => {
  try {
    if (!window.ai?.languageModel) {
      return null;
    }

    const capabilities = await window.ai.languageModel.capabilities();
    if (capabilities.available === 'no') {
      return null;
    }

    // Create a session with the local model
    const session = await window.ai.languageModel.create({
      systemPrompt: "You are a helpful assistant in an offline chat application. Keep answers concise."
    });

    const result = await session.prompt(text);
    return `[Local AI] ${result}`;
  } catch (error) {
    console.warn("Failed to use local AI:", error);
    return null;
  }
};

export const sendMessageToGemini = async (
  history: Message[], 
  newMessage: string
): Promise<string> => {
  // 1. Check if browser explicitly reports offline
  if (!navigator.onLine) {
    console.log("App is offline.");
    
    // Try to use Chrome's built-in Local AI first
    const localResponse = await generateLocalResponse(newMessage);
    if (localResponse) {
      return localResponse;
    }

    // Return explicit error if offline and no local model
    return "Network Error: You are offline and the local AI model is unavailable.";
  }

  try {
    const chatHistory = history.slice(-15).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: chatHistory,
      config: {
        systemInstruction: "You are a friendly friend chatting on a messaging app. Keep your responses casual, helpful, and concise. Use emojis occasionally.",
      },
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "";
  } catch (error) {
    console.warn("Gemini API Error:", error);
    
    // 2. API Failed (timeout/server error) -> Try local AI
    const localResponse = await generateLocalResponse(newMessage);
    if (localResponse) {
      return localResponse;
    }

    // Return explicit error if API fails and no local model
    return "Service Error: Unable to reach Gemini server and local AI model is unavailable.";
  }
};
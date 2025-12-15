import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a simulated response when the app is offline.
 * This allows the UI to function "normally" even without an internet connection.
 */
const getOfflineResponse = (text: string): string => {
  const lower = text.toLowerCase();
  
  // Simple rule-based responses for offline mode to make it feel alive
  if (lower.match(/\b(hi|hello|hey|greetings|yo)\b/)) {
    return "Hello! I noticed we're currently offline, but I'm still here to chat locally! 📡";
  }
  if (lower.includes("time")) {
    return `The current local time is ${new Date().toLocaleTimeString()}. ⌚`;
  }
  if (lower.includes("date")) {
    return `Today is ${new Date().toLocaleDateString()}. 📅`;
  }
  if (lower.includes("weather")) {
    return "I can't check the real weather without an internet connection, but let's pretend it's sunny! ☀️";
  }
  if (lower.includes("who are you") || lower.includes("your name")) {
    return "I'm your AI assistant. Currently operating in offline safe mode.";
  }
  if (lower.endsWith("?")) {
    return "That's a good question! I can't browse the web right now to give you a perfect answer, but I'm listening. 🤔";
  }
  
  const defaults = [
    "I'm currently offline, so my brain is a bit smaller than usual, but I'm still listening!",
    "Message received! (Offline Mode active 📶)",
    "I can't reach the cloud right now, but I can still echo your thoughts.",
    "Without internet, I'm just a simple script, but I'm here for you.",
    "I'm in offline mode right now. Once we're reconnected, I'll be back to full power!"
  ];
  
  return defaults[Math.floor(Math.random() * defaults.length)];
};

export const sendMessageToGemini = async (
  history: Message[], 
  newMessage: string
): Promise<string> => {
  // 1. Check if browser explicitly reports offline
  if (!navigator.onLine) {
    console.log("App is offline, using local simulation.");
    // Simulate a natural delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return getOfflineResponse(newMessage);
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
        // Updated instruction to be friendly and casual, like a WeChat friend
        systemInstruction: "You are a friendly friend chatting on a messaging app. Keep your responses casual, helpful, and concise. Use emojis occasionally.",
      },
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "";
  } catch (error) {
    console.warn("Gemini API Error (falling back to offline mode):", error);
    // 2. Fallback if the API call fails (e.g. server unreachable, timeout, or key issues)
    // This ensures the app keeps working "normally" from the user's perspective.
    await new Promise(resolve => setTimeout(resolve, 500)); 
    return getOfflineResponse(newMessage);
  }
};
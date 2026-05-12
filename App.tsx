import React, { useState, useEffect, useRef } from 'react';
import { Message, AppSettings } from './types';
import { sendMessageToOllama } from './services/ollamaService';
import { mqttService } from './services/mqttService';
import ChatBubble from './components/ChatBubble';
import SettingsModal from './components/SettingsModal';
import { MoreHorizontal, Wifi, WifiOff, Send } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mqttStatus, setMqttStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('chat_settings');
      const defaultSettings: AppSettings = {
        userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
        botNickname: 'Qwen 助手',
        botAvatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Ollama',
        model: 'qwen2.5:7b',
        baseUrl: 'http://localhost:11434',
        mqttEnabled: false,
        mqttUrl: 'ws://localhost:9001',
        mqttTopic: 'chat/ollama'
      };
      
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      }
      return defaultSettings;
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
      return {
        userAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
        botNickname: 'Qwen 助手',
        botAvatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Ollama',
        model: 'qwen2.5:7b',
        baseUrl: 'http://localhost:11434',
        mqttEnabled: false,
        mqttUrl: 'ws://localhost:9001',
        mqttTopic: 'chat/ollama'
      };
    }
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('chat_settings', JSON.stringify(settings));
  }, [settings]);

  // MQTT Connection Logic
  useEffect(() => {
    if (settings.mqttEnabled) {
      mqttService.connect({
        url: settings.mqttUrl,
        topic: settings.mqttTopic,
        onStatusChange: (status) => setMqttStatus(status),
        onMessage: (topic, message) => {
          // Here you could handle external messages or synchronization
          console.log(`MQTT [${topic}]: ${message}`);
        }
      });
    } else {
      mqttService.disconnect();
      setMqttStatus('disconnected');
    }

    return () => mqttService.disconnect();
  }, [settings.mqttEnabled, settings.mqttUrl, settings.mqttTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'model',
      content: "你好！我是你的本地 AI 助手 (Qwen 2.5)。我已经准备好通过 MQTT 同步你的对话了。",
      timestamp: new Date()
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);

    // MQTT Publish User Msg
    if (settings.mqttEnabled) {
      mqttService.publish(settings.mqttTopic, JSON.stringify({
        type: 'user_message',
        content: userText,
        timestamp: newUserMsg.timestamp
      }));
    }

    try {
      const response = await sendMessageToOllama(messages, userText, settings);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);

      // MQTT Publish Assistant Msg
      if (settings.mqttEnabled) {
        mqttService.publish(settings.mqttTopic, JSON.stringify({
          type: 'assistant_message',
          content: response,
          timestamp: assistantMsg.timestamp
        }));
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: `错误: ${error.message || '无法连接到 Ollama。请检查设置并将 OLLAMA_ORIGINS="*" 环境变量加入运行参数。'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#f0f2f5] font-sans selection:bg-[#07c160]/30 overflow-hidden">
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />

      <div className="flex flex-col w-[850px] h-[750px] max-h-[95vh] bg-[#f5f5f5] rounded-xl shadow-2xl overflow-hidden relative border border-gray-200">
        
        {/* Header */}
        <div className="h-[60px] border-b border-gray-200 flex items-center justify-between px-6 bg-[#f5f5f5] z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <div className="font-semibold text-lg text-gray-800">{settings.botNickname}</div>
             {settings.mqttEnabled && (
               <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                 mqttStatus === 'connected' ? 'bg-green-100 text-green-600' : 
                 mqttStatus === 'connecting' ? 'bg-yellow-100 text-yellow-600' :
                 'bg-red-100 text-red-600'
               }`}>
                 {mqttStatus === 'connected' ? <Wifi size={10} /> : <WifiOff size={10} />}
                 {mqttStatus}
               </div>
             )}
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-500 hover:text-gray-800 p-2 hover:bg-gray-200 rounded-lg transition-all"
          >
             <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f5f5f5]">
          {messages.map((msg, index) => {
             const prevMsg = messages[index-1];
             const msgDate = new Date(msg.timestamp);
             const showTime = index === 0 || (msgDate.getTime() - new Date(prevMsg.timestamp).getTime() > 300000); // 5 mins
             
             return (
               <React.Fragment key={msg.id}>
                 {showTime && (
                   <div className="flex justify-center my-6">
                     <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                        {msgDate.getHours() < 12 ? '上午' : '下午'} {msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                     </span>
                   </div>
                 )}
                 <ChatBubble 
                   message={msg} 
                   userAvatar={settings.userAvatar}
                   botAvatar={settings.botAvatar}
                 />
               </React.Fragment>
             );
          })}
          {isLoading && (
            <div className="flex items-center gap-2 ml-14 mb-4 mt-2">
               <div className="w-1.5 h-1.5 bg-[#07c160] rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-[#07c160] rounded-full animate-bounce [animation-delay:200ms]"></div>
               <div className="w-1.5 h-1.5 bg-[#07c160] rounded-full animate-bounce [animation-delay:400ms]"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="h-[180px] border-t border-gray-200 bg-[#f5f5f5] flex flex-col p-4">
          <div className="flex-1 bg-white rounded-lg border border-gray-200 focus-within:border-[#07c160] transition-colors relative overflow-hidden flex flex-col">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent px-4 py-3 resize-none text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none w-full"
              placeholder="输入对话..."
            />
            <div className="h-10 px-4 flex items-center justify-between bg-gray-50 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Enter 发送 / Shift+Enter 换行</span>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`flex items-center gap-2 px-4 py-1 text-sm font-medium rounded transition-all ${
                   input.trim() && !isLoading
                   ? 'bg-[#07c160] text-white hover:bg-[#06ad56] shadow-sm' 
                   : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                发送 <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import { sendMessageToGemini } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import SettingsModal from './components/SettingsModal';
import { 
  Smile, 
  Folder, 
  Paperclip,
  MoreHorizontal
} from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // User Settings State (Nickname removed)
  const [userAvatar, setUserAvatar] = useState('https://api.dicebear.com/9.x/avataaars/svg?seed=Felix');
  
  // Bot Settings State
  const [botNickname, setBotNickname] = useState('Gemini Assistant');
  const [botAvatar, setBotAvatar] = useState('https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Gemini');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Message
  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'model',
      content: "Hello! I'm Gemini. How can I help you today?",
      timestamp: new Date()
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsgText = input;
    setInput(''); // Clear immediately
    setIsLoading(true);

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);

    try {
      const responseText = await sendMessageToGemini(messages, userMsgText);

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newBotMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "Network error. Please try again.",
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

  // Helper to format time like "15:30"
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleSaveSettings = (
    newUserAvatar: string,
    newBotNickname: string,
    newBotAvatar: string
  ) => {
    setUserAvatar(newUserAvatar);
    setBotNickname(newBotNickname);
    setBotAvatar(newBotAvatar);
  };

  return (
    <div className="flex items-center justify-center h-screen w-full bg-cover bg-center font-sans" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop")' }}>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUserAvatar={userAvatar}
        currentBotNickname={botNickname}
        currentBotAvatar={botAvatar}
        onSave={handleSaveSettings}
      />

      {/* Main Window Container - Simplified to just the Chat Area */}
      <div className="flex flex-col w-[800px] h-[800px] max-h-[90vh] bg-[#f5f5f5] rounded-lg shadow-2xl overflow-hidden relative">
        
        {/* Chat Header */}
        <div className="h-[60px] border-b border-[#e7e7e7] flex items-center justify-between px-6 bg-[#f5f5f5] flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
             <div className="font-medium text-lg text-black">{botNickname}</div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-black/60 hover:text-black transition-colors p-2 hover:bg-gray-200 rounded-md"
            title="Settings"
          >
             <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#f5f5f5]">
          {messages.map((msg, index) => {
             // Logic to show timestamp if messages are far apart (mocked simply here)
             const showTime = index === 0 || (new Date(msg.timestamp).getTime() - new Date(messages[index-1].timestamp).getTime() > 60000);
             return (
               <React.Fragment key={msg.id}>
                 {showTime && (
                   <div className="flex justify-center my-4">
                     <span className="text-xs text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded">
                       {formatTime(new Date(msg.timestamp))}
                     </span>
                   </div>
                 )}
                 <ChatBubble 
                   message={msg} 
                   userAvatar={userAvatar}
                   botAvatar={botAvatar}
                 />
               </React.Fragment>
             );
          })}
          {isLoading && (
            <div className="flex items-center gap-2 ml-4 mb-4 mt-2">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="h-[160px] border-t border-[#e7e7e7] bg-[#f5f5f5] flex flex-col flex-shrink-0">
          
          {/* Toolbar */}
          <div className="h-10 px-4 flex items-center gap-4 text-gray-600">
            <button className="hover:text-black transition-colors"><Smile size={20} /></button>
            <button className="hover:text-black transition-colors"><Folder size={20} /></button>
            <button className="hover:text-black transition-colors"><Paperclip size={20} /></button>
          </div>

          {/* Textarea */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent px-5 py-2 resize-none text-lg text-black placeholder-gray-400 focus:outline-none"
            placeholder=""
          />

          {/* Footer / Send Button */}
          <div className="h-12 px-5 flex items-center justify-end">
            <span className="text-xs text-gray-400 mr-4">Press Enter to send</span>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`px-6 py-1.5 text-sm rounded-sm transition-colors border ${
                 input.trim() 
                 ? 'bg-[#e9e9e9] text-[#07c160] border-[#e9e9e9] hover:bg-[#d2d2d2]' 
                 : 'bg-[#e9e9e9] text-gray-400 border-[#e9e9e9] cursor-default'
              }`}
            >
              Send
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
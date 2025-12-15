import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
  showAvatar?: boolean;
  userAvatar?: string;
  botAvatar?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  showAvatar = true, 
  userAvatar = "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
  botAvatar = "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Gemini"
}) => {
  const isUser = message.role === 'user';
  const avatarSrc = isUser ? userAvatar : botAvatar;

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        {showAvatar && (
          <div className="flex-shrink-0">
            <img 
              src={avatarSrc}
              alt={isUser ? "User" : "Bot"} 
              className="w-9 h-9 rounded-sm bg-gray-200 object-cover"
            />
          </div>
        )}

        {/* Bubble */}
        <div className="flex flex-col">
          {/* Optional: Name display for groups (omitted for 1on1) */}
          
          <div className={`relative px-3 py-2 text-[15px] leading-relaxed rounded-md shadow-sm border ${
            isUser 
              ? 'bg-[#95ec69] border-[#95ec69] text-black' // WeChat Green
              : 'bg-white border-gray-200 text-gray-800'
          }`}>
             {/* Simple CSS triangle arrow could go here, but rounded squares are modern standard */}
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserAvatar: string;
  currentBotNickname: string;
  currentBotAvatar: string;
  onSave: (userAvatar: string, botNickname: string, botAvatar: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUserAvatar,
  currentBotNickname,
  currentBotAvatar,
  onSave,
}) => {
  // User State (Avatar only)
  const [userAvatar, setUserAvatar] = useState(currentUserAvatar);

  // Bot State
  const [botNickname, setBotNickname] = useState(currentBotNickname);
  const [botAvatar, setBotAvatar] = useState(currentBotAvatar);

  const userFileInputRef = useRef<HTMLInputElement>(null);
  const botFileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserAvatar(currentUserAvatar);
      setBotNickname(currentBotNickname);
      setBotAvatar(currentBotAvatar);
    }
  }, [isOpen, currentUserAvatar, currentBotNickname, currentBotAvatar]);

  const handleRandomizeAvatar = (type: 'user' | 'bot') => {
    const randomSeed = Math.random().toString(36).substring(7);
    if (type === 'user') {
      setUserAvatar(`https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}`);
    } else {
      setBotAvatar(`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${randomSeed}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'bot') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'user') setUserAvatar(reader.result);
          else setBotAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(userAvatar, botNickname, botAvatar);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[500px] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={botFileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'bot')}
        />
        <input 
          type="file" 
          ref={userFileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'user')}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800">Chat Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          
          {/* Partner Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Partner Profile</h3>
            <div className="flex gap-5">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                 <div className="relative group">
                  <img 
                    src={botAvatar} 
                    alt="Bot Avatar" 
                    className="w-24 h-24 rounded-full bg-gray-100 object-cover border-4 border-white shadow-md"
                  />
                </div>
              </div>

              {/* Fields */}
              <div className="flex-1 space-y-4 flex flex-col justify-center">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nickname</label>
                  <input
                    type="text"
                    value={botNickname}
                    onChange={(e) => setBotNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:border-[#07c160] focus:bg-white transition-all"
                    placeholder="Bot Name"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => botFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:text-[#07c160] hover:border-[#07c160] transition-all shadow-sm"
                  >
                    <Upload size={14} />
                    Upload Photo
                  </button>
                  <button 
                    onClick={() => handleRandomizeAvatar('bot')}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    <RefreshCw size={14} />
                    Random
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* User Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">My Avatar</h3>
            <div className="flex gap-5 items-center">
              {/* Avatar Preview */}
              <div className="relative group flex-shrink-0">
                <img 
                  src={userAvatar} 
                  alt="User Avatar" 
                  className="w-20 h-20 rounded-full bg-gray-100 object-cover border-4 border-white shadow-md"
                />
              </div>

              {/* Actions */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-sm text-gray-600 mb-2">Change your display avatar:</div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => userFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:text-[#07c160] hover:border-[#07c160] transition-all shadow-sm"
                  >
                    <Upload size={14} />
                    Upload Photo
                  </button>
                  <button 
                    onClick={() => handleRandomizeAvatar('user')}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    <RefreshCw size={14} />
                    Random
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-[#07c160] hover:bg-[#06ad56] rounded-md shadow-sm transition-colors"
          >
            Save All
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
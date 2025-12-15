import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Upload, Settings, User, Server, Cpu } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'model'>('profile');
  
  // Profile State
  const [userAvatar, setUserAvatar] = useState(settings.userAvatar);
  const [botNickname, setBotNickname] = useState(settings.botNickname);
  const [botAvatar, setBotAvatar] = useState(settings.botAvatar);

  // Model State
  const [aiProvider, setAiProvider] = useState(settings.aiProvider);
  const [ollamaModel, setOllamaModel] = useState(settings.ollamaModel);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(settings.ollamaBaseUrl);

  const userFileInputRef = useRef<HTMLInputElement>(null);
  const botFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUserAvatar(settings.userAvatar);
      setBotNickname(settings.botNickname);
      setBotAvatar(settings.botAvatar);
      setAiProvider(settings.aiProvider);
      setOllamaModel(settings.ollamaModel);
      setOllamaBaseUrl(settings.ollamaBaseUrl);
    }
  }, [isOpen, settings]);

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
    onSave({
      userAvatar,
      botNickname,
      botAvatar,
      aiProvider,
      ollamaModel,
      ollamaBaseUrl
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[500px] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Hidden File Inputs */}
        <input type="file" ref={botFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'bot')} />
        <input type="file" ref={userFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'user')} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'border-[#07c160] text-[#07c160]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <User size={16} /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('model')}
            className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'model' ? 'border-[#07c160] text-[#07c160]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Settings size={16} /> Local Model
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {activeTab === 'profile' ? (
            <>
              {/* Partner Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Partner Profile</h3>
                <div className="flex gap-5">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                     <div className="relative group">
                      <img src={botAvatar} alt="Bot Avatar" className="w-24 h-24 rounded-full bg-gray-100 object-cover border-4 border-white shadow-md"/>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 flex flex-col justify-center">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nickname</label>
                      <input
                        type="text"
                        value={botNickname}
                        onChange={(e) => setBotNickname(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:border-[#07c160] focus:bg-white transition-all"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => botFileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:text-[#07c160] hover:border-[#07c160] transition-all shadow-sm"><Upload size={14} /> Upload</button>
                      <button onClick={() => handleRandomizeAvatar('bot')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"><RefreshCw size={14} /> Random</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100"></div>

              {/* User Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">My Avatar</h3>
                <div className="flex gap-5 items-center">
                  <div className="relative group flex-shrink-0">
                    <img src={userAvatar} alt="User Avatar" className="w-20 h-20 rounded-full bg-gray-100 object-cover border-4 border-white shadow-md"/>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-sm text-gray-600 mb-2">Change your display avatar:</div>
                    <div className="flex gap-3">
                      <button onClick={() => userFileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:text-[#07c160] hover:border-[#07c160] transition-all shadow-sm"><Upload size={14} /> Upload</button>
                      <button onClick={() => handleRandomizeAvatar('user')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"><RefreshCw size={14} /> Random</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
               <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Local Provider</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setAiProvider('ollama')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        aiProvider === 'ollama' 
                        ? 'border-[#07c160] bg-[#f0fdf4]' 
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-gray-900"><Server size={18}/> Ollama</div>
                      <div className="text-xs text-gray-500 mt-1">Connects to local API (localhost)</div>
                    </button>
                    
                    <button 
                      onClick={() => setAiProvider('chrome_builtin')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        aiProvider === 'chrome_builtin' 
                        ? 'border-[#07c160] bg-[#f0fdf4]' 
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-gray-900"><Cpu size={18}/> Chrome AI</div>
                      <div className="text-xs text-gray-500 mt-1">Experimental built-in model</div>
                    </button>
                  </div>
               </div>

               {aiProvider === 'ollama' ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-orange-50 border border-orange-100 rounded-md p-3 text-xs text-orange-800">
                      <strong>Requirement:</strong> Run <code>OLLAMA_ORIGINS="*" ollama serve</code> in your terminal.
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Server URL</label>
                      <input
                        type="text"
                        value={ollamaBaseUrl}
                        onChange={(e) => setOllamaBaseUrl(e.target.value)}
                        placeholder="http://localhost:11434"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-800 focus:outline-none focus:border-[#07c160]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        placeholder="e.g., qwen2.5:7b"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-800 focus:outline-none focus:border-[#07c160]"
                      />
                    </div>
                 </div>
               ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-xs text-blue-800">
                    <strong>Experimental:</strong> Uses Chrome's built-in Nano model. Requires Chrome Canary or Dev version with specific flags enabled.
                  </div>
                </div>
               )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-[#07c160] hover:bg-[#06ad56] rounded-md shadow-sm transition-colors">Save All</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
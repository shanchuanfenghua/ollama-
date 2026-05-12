import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Upload, User, Server } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'connection' | 'mqtt'>('profile');
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  
  const userFileInputRef = useRef<HTMLInputElement>(null);
  const botFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setLocalSettings(settings);
  }, [isOpen, settings]);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleRandomizeAvatar = (target: 'userAvatar' | 'botAvatar') => {
    const seed = Math.random().toString(36).substring(7);
    const type = target === 'userAvatar' ? 'avataaars' : 'bottts-neutral';
    updateSetting(target, `https://api.dicebear.com/9.x/${type}/svg?seed=${seed}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'userAvatar' | 'botAvatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') updateSetting(target, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[500px] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <input type="file" ref={botFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'botAvatar')} />
        <input type="file" ref={userFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'userAvatar')} />

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-800">设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 px-6">
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={16} />} label="个人资料" />
          <TabButton active={activeTab === 'connection'} onClick={() => setActiveTab('connection')} icon={<Server size={16} />} label="模型设置" />
          <TabButton active={activeTab === 'mqtt'} onClick={() => setActiveTab('mqtt')} icon={<RefreshCw size={16} />} label="MQTT设置" />
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {activeTab === 'profile' ? (
            <>
              <ProfileSection 
                title="助手设置"
                avatar={localSettings.botAvatar}
                nickname={localSettings.botNickname}
                onNicknameChange={(val: string) => updateSetting('botNickname', val)}
                onUpload={() => botFileInputRef.current?.click()}
                onRandom={() => handleRandomizeAvatar('botAvatar')}
              />
              <div className="border-t border-gray-100"></div>
              <ProfileSection 
                title="我的设置"
                avatar={localSettings.userAvatar}
                isUser={true}
                onUpload={() => userFileInputRef.current?.click()}
                onRandom={() => handleRandomizeAvatar('userAvatar')}
              />
            </>
          ) : activeTab === 'connection' ? (
            <div className="space-y-6">
               <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#07c160] rounded-lg p-4">
                  <div className="text-[#07c160] mt-0.5"><Server size={20} /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Ollama 本地服务</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      应用将连接到您的本地 Ollama 实效模型。
                    </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <InputGroup 
                    label="服务器地址 (URL)" 
                    value={localSettings.baseUrl} 
                    onChange={(v: string) => updateSetting('baseUrl', v)} 
                    placeholder="http://localhost:11434"
                  />
                  <InputGroup 
                    label="模型名称 (Model)" 
                    value={localSettings.model} 
                    onChange={(v: string) => updateSetting('model', v)} 
                    placeholder="qwen2.5:7b"
                  />
               </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-500 mt-0.5"><RefreshCw size={20} /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900">Mosquitto MQTT</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      启用 MQTT 后，您的聊天消息将同步到指定的 Topic。
                    </p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                    <span className="text-sm text-gray-700 font-medium">启用 MQTT 同步</span>
                    <button 
                      onClick={() => updateSetting('mqttEnabled', !localSettings.mqttEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${localSettings.mqttEnabled ? 'bg-[#07c160]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.mqttEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <InputGroup 
                    label="MQTT 服务器 (WebSockets URL)" 
                    value={localSettings.mqttUrl} 
                    onChange={(v: string) => updateSetting('mqttUrl', v)} 
                    placeholder="ws://localhost:9001"
                  />
                  <InputGroup 
                    label="订阅/发布 Topic" 
                    value={localSettings.mqttTopic} 
                    onChange={(v: string) => updateSetting('mqttTopic', v)} 
                    placeholder="chat/ollama"
                  />
               </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 mt-auto">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md">取消</button>
          <button onClick={() => { onSave(localSettings); onClose(); }} className="px-6 py-2 text-sm font-medium text-white bg-[#07c160] hover:bg-[#06ad56] rounded-md shadow-sm">保存配置</button>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${active ? 'border-[#07c160] text-[#07c160]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
  >
    {icon} {label}
  </button>
);

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-800 focus:outline-none focus:border-[#07c160]"
    />
  </div>
);

const ProfileSection = ({ title, avatar, nickname, onNicknameChange, onUpload, onRandom, isUser }: any) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
    <div className="flex gap-5 items-center">
      <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full bg-gray-100 object-cover border-4 border-white shadow-md flex-shrink-0"/>
      <div className="flex-1 space-y-3">
        {!isUser && (
          <input
            type="text"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 focus:outline-none focus:border-[#07c160]"
            placeholder="昵称"
          />
        )}
        <div className="flex gap-3">
          <button onClick={onUpload} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:border-[#07c160] hover:text-[#07c160] transition-all"><Upload size={14} /> 上传</button>
          <button onClick={onRandom} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-all"><RefreshCw size={14} /> 随机</button>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsModal;
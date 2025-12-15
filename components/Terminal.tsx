import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
  isOpen: boolean;
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ logs, isOpen, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`flex flex-col bg-black/90 text-green-500 font-mono text-xs md:text-sm shadow-2xl overflow-hidden backdrop-blur-sm border-t-2 border-green-800 ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          <span className="ml-2 text-gray-400">root@neural-core:~</span>
        </div>
        <div className="text-gray-500">zsh</div>
      </div>

      {/* Logs Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 terminal-scroll space-y-1"
      >
        {logs.map((log) => (
          <div key={log.id} className="break-words opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-gray-500">[{log.timestamp}]</span>
            <span className={`mx-2 font-bold ${
              log.level === 'ERROR' ? 'text-red-500' :
              log.level === 'WARN' ? 'text-yellow-500' :
              log.level === 'API' ? 'text-blue-400' :
              log.level === 'DEBUG' ? 'text-purple-400' :
              'text-green-400'
            }`}>
              {log.level}
            </span>
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-600 italic animate-pulse">Waiting for system events...</div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
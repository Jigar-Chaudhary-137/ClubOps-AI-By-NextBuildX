import React from 'react';
import { User, Sparkles, Database, FileText, CheckCircle2 } from 'lucide-react';
import AIBadge from './AIBadge';
import AIIcon from './AIIcon';
import AIMessageActions from './AIMessageActions';

export default function AIMessage({ message, onActionClick }) {
  if (!message) return null;

  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-xl flex items-start space-x-3 flex-row-reverse space-x-reverse">
          <div className="w-8 h-8 rounded-xl bg-[#151D2E] border border-[#263247] flex items-center justify-center text-gray-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="bg-indigo-600/20 border border-indigo-500/30 text-white rounded-2xl rounded-tr-none px-4 py-3 text-sm leading-relaxed shadow-sm">
            <div className="whitespace-pre-wrap">{message.content}</div>
            <div className="text-[10px] text-indigo-300/70 text-right mt-1.5 font-mono">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI Assistant message
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-2xl flex items-start space-x-3 w-full">
        <AIIcon size="sm" />
        <div className="flex-1 space-y-3">
          <div className="bg-[#111827] border border-[#263247] rounded-2xl rounded-tl-none p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#263247]/60">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-white">ClubOps AI</span>
                <AIBadge size="sm">Operations Agent</AIBadge>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
              </span>
            </div>

            {/* Content area */}
            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>

            {/* Sources section if present */}
            {message.sources && message.sources.length > 0 && (
              <div className="pt-3 border-t border-[#263247]/60 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-gray-400">
                  <Database className="w-3 h-3 text-indigo-400" />
                  <span>Knowledge Sources Grounded</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {message.sources.map((src, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#151D2E] border border-[#263247] text-[10px] text-gray-300"
                    >
                      <FileText className="w-2.5 h-2.5 text-gray-400" />
                      <span>{src.title || src}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <AIMessageActions
              messageContent={message.content}
              onActionTrigger={onActionClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

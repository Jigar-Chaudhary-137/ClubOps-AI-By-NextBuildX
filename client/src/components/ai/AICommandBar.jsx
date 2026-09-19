import React, { useState } from 'react';
import { Sparkles, Send, CornerDownLeft, AlertCircle, Info } from 'lucide-react';
import Button from '../ui/Button';

export default function AICommandBar({
  onSubmit,
  disabled = false,
  placeholder = 'Ask ClubOps AI about your club...',
  className = '',
  selectedContext = 'All Club Data',
}) {
  const [input, setInput] = useState('');
  const [notice, setNotice] = useState(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    // Trigger transparent feedback
    setNotice('AI assistance will be available once the AI service is connected.');
    if (onSubmit) {
      onSubmit(trimmed);
    }
    setInput('');

    setTimeout(() => {
      setNotice(null);
    }, 6000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative rounded-2xl bg-[#111827] border border-[#263247] p-2.5 sm:p-3.5 shadow-xl focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
        {/* Top bar indicators */}
        <div className="flex items-center justify-between px-2 pb-2 text-[11px] text-gray-400 border-b border-[#263247]/60">
          <div className="flex items-center space-x-1.5 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="font-semibold text-white">AI Operations Console</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#151D2E] border border-[#263247] text-[10px] text-gray-300">
            Context: {selectedContext}
          </span>
        </div>

        {/* Input textarea */}
        <div className="pt-2 px-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={2}
            className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 resize-none outline-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between pt-2 px-1 border-t border-[#263247]/40 mt-1">
          <span className="text-[10px] text-gray-500 flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#151D2E] border border-[#263247] text-[10px] font-mono text-gray-400">Enter</kbd>
            <span>to send</span>
            <span className="mx-1">•</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#151D2E] border border-[#263247] text-[10px] font-mono text-gray-400">Shift + Enter</kbd>
            <span>for newline</span>
          </span>

          <Button
            variant="ai"
            size="sm"
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send
          </Button>
        </div>
      </div>

      {/* Transparent notice */}
      {notice && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-start space-x-2.5 text-xs text-indigo-200 animate-fadeIn">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Notice: </span>
            {notice}
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Bot, Sparkles, MessageSquare, Compass, ArrowRight } from 'lucide-react';
import AIMessage from './AIMessage';
import Button from '../ui/Button';

export default function AIConversation({
  messages = [],
  onPromptClick,
  onExploreSuggestions,
  onActionClick,
  className = '',
}) {
  if (!messages || messages.length === 0) {
    return (
      <div className={`bg-[#111827] border border-[#263247] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden ${className}`}>
        {/* Subtle glow accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-xl shadow-indigo-500/10">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              How can I help with your club operations?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Ask about events, tasks, meetings, documents, volunteers, risks, or announcements. ClubOps AI connects across your entire operational workspace.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onPromptClick && (
              <Button
                variant="ai"
                size="sm"
                onClick={() => onPromptClick('Summarize my upcoming events')}
                leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              >
                Ask ClubOps AI
              </Button>
            )}
            {onExploreSuggestions && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExploreSuggestions}
                leftIcon={<Compass className="w-3.5 h-3.5" />}
              >
                Explore Suggestions
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((msg, idx) => (
        <AIMessage
          key={msg.id || idx}
          message={msg}
          onActionClick={onActionClick}
        />
      ))}
    </div>
  );
}

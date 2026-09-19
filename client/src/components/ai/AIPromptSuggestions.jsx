import React from 'react';
import {
  Calendar,
  AlertTriangle,
  FileText,
  Users2,
  Clock,
  Megaphone,
  Compass,
  ArrowRight,
} from 'lucide-react';

const promptPresets = [
  {
    icon: Calendar,
    category: 'Events',
    text: 'Summarize my upcoming events',
    color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  },
  {
    icon: AlertTriangle,
    category: 'Risks',
    text: 'What risks need attention?',
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  {
    icon: FileText,
    category: 'Documents',
    text: 'Find information about our club policies',
    color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  },
  {
    icon: Users2,
    category: 'Meetings',
    text: 'Summarize recent meeting decisions',
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  },
  {
    icon: Clock,
    category: 'Tasks',
    text: 'What tasks are overdue?',
    color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  },
  {
    icon: Megaphone,
    category: 'Comms',
    text: 'Help me prepare an event announcement',
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: Compass,
    category: 'Operations',
    text: 'What should I focus on today?',
    color: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20',
  },
];

export default function AIPromptSuggestions({ onSelectPrompt, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-semibold uppercase tracking-wider text-gray-300">
          Suggested Inquiries
        </span>
        <span className="text-[11px] text-gray-500">Starter operational prompts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {promptPresets.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt && onSelectPrompt(item.text)}
              className="text-left p-2.5 rounded-xl bg-[#111827] hover:bg-[#151D2E] border border-[#263247] hover:border-indigo-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <div className={`p-1.5 rounded-lg border shrink-0 ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="text-xs text-gray-200 group-hover:text-white font-medium block truncate">
                    {item.text}
                  </span>
                  <span className="text-[10px] text-gray-500 block">
                    {item.category}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Copy,
  RefreshCw,
  Database,
  CheckSquare,
  Megaphone,
  AlertTriangle,
  Bookmark,
  Check,
  Info,
} from 'lucide-react';

export default function AIMessageActions({ messageContent = '', onActionTrigger }) {
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleCopy = () => {
    if (messageContent) {
      navigator.clipboard.writeText(messageContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAction = (actionName, infoText) => {
    setNotice(infoText);
    if (onActionTrigger) {
      onActionTrigger(actionName);
    }
    setTimeout(() => {
      setNotice(null);
    }, 5000);
  };

  return (
    <div className="space-y-2 pt-2 border-t border-[#263247]/50">
      {notice && (
        <div className="p-2 bg-indigo-950/40 border border-indigo-500/30 rounded-lg flex items-start space-x-2 text-[11px] text-indigo-200">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-[#151D2E] hover:bg-[#263247] hover:text-white border border-[#263247] transition-colors flex items-center space-x-1"
          title="Copy message"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <button
          onClick={() => handleAction('regenerate', 'AI response regeneration will be available once the Gemini service is connected.')}
          className="p-1.5 rounded-lg bg-[#151D2E] hover:bg-[#263247] hover:text-white border border-[#263247] transition-colors flex items-center space-x-1"
          title="Regenerate"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="text-[11px]">Regenerate</span>
        </button>

        <button
          onClick={() => handleAction('sources', 'Knowledge source citations will be linked once the RAG vector store is connected.')}
          className="p-1.5 rounded-lg bg-[#151D2E] hover:bg-[#263247] hover:text-white border border-[#263247] transition-colors flex items-center space-x-1"
          title="View Sources"
        >
          <Database className="w-3.5 h-3.5" />
          <span className="text-[11px]">Sources</span>
        </button>

        <span className="text-[#263247] mx-1">|</span>

        {/* Operational Conversion Shortcuts */}
        <button
          onClick={() => handleAction('create_task', 'Creating task from AI output...')}
          className="p-1.5 rounded-lg bg-[#151D2E] hover:bg-indigo-600/20 text-indigo-300 border border-[#263247] hover:border-indigo-500/30 transition-all flex items-center space-x-1"
          title="Turn into Task"
        >
          <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px]">Create Task</span>
        </button>

        <button
          onClick={() => handleAction('create_announcement', 'Creating announcement draft from AI output...')}
          className="p-1.5 rounded-lg bg-[#151D2E] hover:bg-purple-600/20 text-purple-300 border border-[#263247] hover:border-purple-500/30 transition-all flex items-center space-x-1"
          title="Turn into Announcement"
        >
          <Megaphone className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px]">Create Announcement</span>
        </button>

        <button
          onClick={() => handleAction('add_risk', 'Logging risk item from AI output...')}
          className="p-1.5 rounded-lg bg-[#151D2E] hover:bg-amber-600/20 text-amber-300 border border-[#263247] hover:border-amber-500/30 transition-all flex items-center space-x-1"
          title="Log as Risk"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px]">Add Risk</span>
        </button>

        <button
          onClick={() => handleAction('save_insight', 'Saving insight to operational knowledge base...')}
          className="p-1.5 rounded-lg bg-[#151D2E] hover:bg-[#263247] hover:text-white border border-[#263247] transition-colors flex items-center space-x-1"
          title="Save Insight"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="text-[11px]">Save</span>
        </button>
      </div>
    </div>
  );
}

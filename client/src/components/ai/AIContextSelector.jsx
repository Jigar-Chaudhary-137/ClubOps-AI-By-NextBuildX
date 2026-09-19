import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  Calendar,
  CheckSquare,
  Users,
  Users2,
  FileText,
  AlertTriangle,
  Megaphone,
  Check,
} from 'lucide-react';

const contextOptions = [
  { id: 'all', label: 'All Club Data', icon: Layers, desc: 'Cross-module reasoning across entire club' },
  { id: 'events', label: 'Events', icon: Calendar, desc: 'Schedules, logistics, and milestone timelines' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, desc: 'Action items, assignees, and deadlines' },
  { id: 'volunteers', label: 'Volunteers', icon: Users, desc: 'Roster, role allocation, and availability' },
  { id: 'meetings', label: 'Meetings', icon: Users2, desc: 'Agendas, minutes, and transcripts' },
  { id: 'documents', label: 'Documents', icon: FileText, desc: 'Policies, guidelines, and constitutions' },
  { id: 'risks', label: 'Risks', icon: AlertTriangle, desc: 'Operational hazards and mitigations' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, desc: 'Multi-channel broadcasts and drafts' },
];

export default function AIContextSelector({
  selectedContext = 'all',
  onSelectContext,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const current = contextOptions.find((c) => c.id === selectedContext) || contextOptions[0];
  const CurrentIcon = current.icon;

  const handleSelect = (id) => {
    if (onSelectContext) {
      onSelectContext(id);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-gray-400">AI Context:</span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#111827] hover:bg-[#151D2E] border border-[#263247] hover:border-indigo-500/40 text-xs font-medium text-white transition-all shadow-sm"
        >
          <CurrentIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>{current.label}</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#111827] border border-[#263247] shadow-2xl p-1.5 z-50 animate-fadeIn">
            <div className="px-3 py-2 border-b border-[#263247]/60 text-[11px] text-gray-400">
              Select knowledge scope for AI reasoning:
            </div>
            <div className="py-1 max-h-64 overflow-y-auto space-y-0.5">
              {contextOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = opt.id === selectedContext;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                        : 'text-gray-300 hover:bg-[#151D2E] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`} />
                      <div className="truncate">
                        <span className="font-medium block truncate">{opt.label}</span>
                        <span className="text-[10px] text-gray-400 block truncate">{opt.desc}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

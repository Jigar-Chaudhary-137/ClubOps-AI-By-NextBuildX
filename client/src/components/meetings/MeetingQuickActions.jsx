import React from 'react';
import { Plus, FileText, Upload, Sparkles, CheckSquare, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

export default function MeetingQuickActions({
  onNewMeeting,
  onAddNotes,
  onUploadTranscript,
  onAnalyzeMeeting,
  onCreateTasks,
  className = ''
}) {
  const actions = [
    {
      label: 'New Meeting',
      description: 'Schedule another meeting session',
      icon: <Plus className="w-4 h-4 text-[#818CF8]" />,
      onClick: onNewMeeting
    },
    {
      label: 'Add Notes',
      description: 'Open notes editor for discussion points',
      icon: <FileText className="w-4 h-4 text-[#818CF8]" />,
      onClick: onAddNotes
    },
    {
      label: 'Upload Transcript',
      description: 'Import audio or text transcript file',
      icon: <Upload className="w-4 h-4 text-[#818CF8]" />,
      onClick: onUploadTranscript
    },
    {
      label: 'Analyze Meeting',
      description: 'Trigger AI intelligence analysis',
      icon: <Sparkles className="w-4 h-4 text-[#A78BFA]" />,
      onClick: onAnalyzeMeeting,
      highlight: true
    },
    {
      label: 'Create Tasks',
      description: 'Promote action items to task board',
      icon: <CheckSquare className="w-4 h-4 text-[#4ADE80]" />,
      onClick: onCreateTasks
    }
  ];

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((act, idx) => (
          <button
            key={idx}
            type="button"
            onClick={act.onClick}
            className={`
              w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all duration-150 group
              ${act.highlight
                ? 'bg-gradient-to-r from-[#6366F1]/15 to-[#8B5CF6]/15 border-[#8B5CF6]/30 hover:border-[#8B5CF6]/50'
                : 'bg-[#111827]/70 border-[#263247] hover:border-[#374151] hover:bg-[#151D2E]'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-[#151D2E] border border-[#263247]">
                {act.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-[#818CF8] transition-colors">
                  {act.label}
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  {act.description}
                </p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

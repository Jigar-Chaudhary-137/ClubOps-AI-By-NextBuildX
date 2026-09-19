import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Users, ArrowRight, AlertTriangle, Info } from 'lucide-react';

const AIAnnouncementSuggestions = ({ onSelectSuggestion }) => {
  const [notice, setNotice] = useState(null);

  const suggestions = [
    {
      id: 'sugg-1',
      title: 'Send 48-Hour Event Logistics Briefing',
      trigger: 'TechSprint Hackathon starts in 2 days',
      audience: 'Event Participants',
      channels: ['Email', 'In-App'],
      priority: 'high',
      rationale: 'Participant check-in instructions and Discord server links have not been broadcast yet.',
      draftTitle: 'TechSprint Hackathon — 48h Final Logistics & Check-In Guide',
    },
    {
      id: 'sugg-2',
      title: 'Remind Volunteers of Pre-Event Orientation',
      trigger: 'Logistics Briefing meeting tomorrow',
      audience: 'Volunteers',
      channels: ['WhatsApp', 'Push Notification'],
      priority: 'medium',
      rationale: '8 volunteer team leads have not confirmed their attendance for the Friday walkthrough.',
      draftTitle: 'Reminder: Mandatory Volunteer Walkthrough Tomorrow at 5 PM',
    },
    {
      id: 'sugg-3',
      title: 'Announce Open Core Committee Applications',
      trigger: 'Spring semester recruitment window opens next week',
      audience: 'Entire Club',
      channels: ['In-App', 'Email'],
      priority: 'low',
      rationale: 'Early promotion boosts qualified applicant engagement by over 35%.',
      draftTitle: 'Join the Core Team — Spring Committee Applications Now Open!',
    },
  ];

  const handleApply = (sugg) => {
    setNotice(`AI announcement generation will be available once the Gemini service is connected. "${sugg.title}" selected.`);
    if (onSelectSuggestion) {
      onSelectSuggestion(sugg);
    }
    setTimeout(() => {
      setNotice(null);
    }, 6000);
  };

  return (
    <div className="bg-[#111827] border border-[#263247] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Suggested Announcements</h4>
            <p className="text-xs text-gray-400">Proactive communication alerts driven by event timelines</p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="mb-3 p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-start space-x-2 text-xs text-purple-200">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="space-y-3">
        {suggestions.map((sugg) => (
          <div
            key={sugg.id}
            className="p-3.5 rounded-xl bg-[#151D2E]/60 border border-[#263247] hover:border-purple-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  sugg.priority === 'high' ? 'bg-amber-400' : sugg.priority === 'medium' ? 'bg-indigo-400' : 'bg-slate-400'
                }`} />
                <h5 className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {sugg.title}
                </h5>
              </div>
              <p className="text-[11px] text-gray-400">
                {sugg.rationale}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-gray-400">
                <span className="px-2 py-0.5 rounded bg-[#0B1020] border border-[#263247] text-gray-300">
                  {sugg.trigger}
                </span>
                <span className="text-purple-400 font-medium">
                  Audience: {sugg.audience}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleApply(sugg)}
              className="shrink-0 inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
            >
              <span>Draft message</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAnnouncementSuggestions;

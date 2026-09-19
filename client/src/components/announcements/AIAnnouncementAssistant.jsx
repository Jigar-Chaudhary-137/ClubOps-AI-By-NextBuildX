import React, { useState } from 'react';
import { Sparkles, Bot, ArrowRight, Wand2, Info, Loader2 } from 'lucide-react';
import { generateAnnouncementContent } from '../../services/api/announcements';

const AIAnnouncementAssistant = ({ onApplyPrompt }) => {
  const [loadingPrompt, setLoadingPrompt] = useState(null);
  const [notice, setNotice] = useState(null);

  const samplePrompts = [
    {
      title: 'Urgent Weather & Venue Update',
      desc: 'Create an urgent change of venue alert for TechSprint participants.',
      prompt: 'Draft an urgent venue relocation notification for TechSprint Hackathon attendees with updated check-in instructions.',
    },
    {
      title: 'Volunteer Callout',
      desc: 'Draft an enthusiastic recruitment message for booth coordinators.',
      prompt: 'Write an inspiring volunteer callout for Hackathon check-in and mentor coordination teams.',
    },
    {
      title: 'Registration Deadline Reminder',
      desc: '24-hour countdown alert with instructions to finalize team rosters.',
      prompt: 'Draft a 24-hour final registration reminder emphasizing team size limits and Discord verification.',
    },
    {
      title: 'Sponsor Appreciation & Recap',
      desc: 'Post-event highlight recognizing keynote speakers and sponsors.',
      prompt: 'Compose a professional gratitude announcement to club sponsors highlighting participant attendance and project milestones.',
    },
  ];

  const handleSelectPrompt = async (promptText) => {
    setLoadingPrompt(promptText);
    setNotice(null);
    try {
      const res = await generateAnnouncementContent(promptText, { targetAudience: 'all', tone: 'professional' });
      const generated = res?.data || res || {};
      if (onApplyPrompt) {
        onApplyPrompt(generated.content || promptText, generated);
      }
    } catch (err) {
      console.error('AI Announcement generation error:', err);
      if (onApplyPrompt) {
        onApplyPrompt(promptText);
      }
    } finally {
      setLoadingPrompt(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#151D2E] to-[#111827] border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                AI Announcement Assistant
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Gemini Active
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Draft targeted messages, adapt tone, and generate channel-tailored reminders in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Prompt Suggestions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {samplePrompts.map((item, idx) => {
            const isLoading = loadingPrompt === item.prompt;
            return (
              <button
                key={idx}
                onClick={() => handleSelectPrompt(item.prompt)}
                disabled={Boolean(loadingPrompt)}
                className="text-left p-3.5 rounded-xl bg-[#0B1020]/60 hover:bg-[#151D2E] border border-[#263247] hover:border-indigo-500/40 transition-all duration-200 group flex flex-col justify-between disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-200 group-hover:text-indigo-300 mb-1">
                    <span>{item.title}</span>
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-indigo-400/80 font-medium flex items-center space-x-1">
                  <span>{isLoading ? 'Generating...' : 'Use prompt'}</span>
                  {!isLoading && <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIAnnouncementAssistant;

import React from 'react';
import { Users, UserCheck, Shield, Award, UserPlus, Info } from 'lucide-react';

const audiences = [
  {
    id: 'Entire Club',
    name: 'Entire Club',
    description: 'All active club members and participants',
    icon: <Users className="w-4 h-4 text-[#818CF8]" />
  },
  {
    id: 'Event Participants',
    name: 'Event Participants',
    description: 'Registered attendees for selected event',
    icon: <UserCheck className="w-4 h-4 text-[#38BDF8]" />
  },
  {
    id: 'Volunteers',
    name: 'Volunteers',
    description: 'Active volunteer roster and shift workers',
    icon: <Award className="w-4 h-4 text-[#4ADE80]" />
  },
  {
    id: 'Organizers',
    name: 'Organizers',
    description: 'Core executive team and committee leads',
    icon: <Shield className="w-4 h-4 text-[#FBBF24]" />
  },
  {
    id: 'Trainers',
    name: 'Trainers',
    description: 'Workshop leads, mentors, and speakers',
    icon: <Award className="w-4 h-4 text-[#A78BFA]" />
  },
  {
    id: 'Custom Audience',
    name: 'Custom Audience',
    description: 'Manually selected members or tags',
    icon: <UserPlus className="w-4 h-4 text-[#F472B6]" />
  }
];

export default function AnnouncementAudienceSelector({
  selectedAudience = 'Entire Club',
  onChange,
  className = ''
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {audiences.map((aud) => {
          const isSelected = selectedAudience === aud.id;
          return (
            <button
              key={aud.id}
              type="button"
              onClick={() => onChange?.(aud.id)}
              className={`
                p-3 rounded-xl border text-left transition-all flex items-start gap-3
                ${isSelected
                  ? 'bg-[#6366F1]/15 border-[#6366F1] shadow-sm'
                  : 'bg-[#111827] border-[#263247] hover:border-[#374151] hover:bg-[#151D2E]'}
              `}
            >
              <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-[#6366F1]/20' : 'bg-[#151D2E]'}`}>
                {aud.icon}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#F8FAFC]'}`}>
                  {aud.name}
                </p>
                <p className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                  {aud.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedAudience === 'Custom Audience' && (
        <div className="p-3.5 rounded-xl bg-[#111827] border border-[#263247] text-xs text-[#94A3B8] flex items-center gap-2 animate-fadeIn">
          <Info className="w-4 h-4 text-[#818CF8] shrink-0" />
          <span>Audience members will appear after the club member service is connected.</span>
        </div>
      )}
    </div>
  );
}

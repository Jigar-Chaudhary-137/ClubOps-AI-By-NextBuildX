import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, Shield, Award, UserPlus, Info, Check, Search, Calendar, AlertCircle } from 'lucide-react';
import { getClubMembers } from '../../services/api/announcements';

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
    description: 'Registered attendees and team on selected event',
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
    description: 'Manually selected club members',
    icon: <UserPlus className="w-4 h-4 text-[#F472B6]" />
  }
];

export default function AnnouncementAudienceSelector({
  selectedAudiences = ['Entire Club'],
  onChange,
  events = [],
  selectedEvent = '',
  onEventChange,
  customUserIds = [],
  onCustomUsersChange,
  className = ''
}) {
  // Normalize selected audiences array
  const currentSelected = Array.isArray(selectedAudiences)
    ? selectedAudiences
    : (selectedAudiences ? [selectedAudiences] : ['Entire Club']);

  const [clubMembers, setClubMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  // Fetch club members if custom audience is selected
  useEffect(() => {
    if (currentSelected.includes('Custom Audience') && clubMembers.length === 0) {
      let isMounted = true;
      setLoadingMembers(true);
      getClubMembers()
        .then((res) => {
          if (isMounted) {
            const data = res?.data || res || [];
            setClubMembers(Array.isArray(data) ? data : []);
          }
        })
        .catch((err) => {
          console.error('Failed to load club members:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingMembers(false);
        });
      return () => { isMounted = false; };
    }
  }, [currentSelected, clubMembers.length]);

  const handleToggleAudience = (audienceId) => {
    let next;
    if (currentSelected.includes(audienceId)) {
      next = currentSelected.filter((id) => id !== audienceId);
      // Ensure at least one is selected or allow empty with validation
      if (next.length === 0) {
        next = [audienceId]; // Keep at least one selected
      }
    } else {
      next = [...currentSelected, audienceId];
    }
    onChange?.(next);
  };

  const handleToggleCustomUser = (userId) => {
    const current = Array.isArray(customUserIds) ? customUserIds : [];
    let next;
    if (current.includes(userId)) {
      next = current.filter((id) => id !== userId);
    } else {
      next = [...current, userId];
    }
    onCustomUsersChange?.(next);
  };

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return clubMembers;
    const q = memberSearch.toLowerCase();
    return clubMembers.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.role || '').toLowerCase().includes(q)
    );
  }, [clubMembers, memberSearch]);

  const requiresEvent = currentSelected.includes('Event Participants') || currentSelected.includes('Volunteers');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Multi-Select Audience Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {audiences.map((aud) => {
          const isSelected = currentSelected.includes(aud.id);
          return (
            <button
              key={aud.id}
              type="button"
              onClick={() => handleToggleAudience(aud.id)}
              className={`
                p-3 rounded-xl border text-left transition-all flex items-start gap-3 relative
                ${isSelected
                  ? 'bg-[#6366F1]/15 border-[#6366F1] shadow-sm'
                  : 'bg-[#111827] border-[#263247] hover:border-[#374151] hover:bg-[#151D2E]'}
              `}
            >
              {/* Checkbox indicator */}
              <div
                className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-[#6366F1] border-[#6366F1] text-white'
                    : 'border-[#475569] bg-[#1E293B]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              {/* Icon */}
              <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#6366F1]/20' : 'bg-[#151D2E]'}`}>
                {aud.icon}
              </div>

              {/* Title & Description */}
              <div className="min-w-0 flex-1">
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

      {/* Event Selector requirement when Event Participants or Volunteers is selected */}
      {requiresEvent && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
              Target Event (Required for Event/Volunteer audience resolution)
            </label>
            {!selectedEvent && (
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Event selection required
              </span>
            )}
          </div>
          <select
            value={selectedEvent}
            onChange={(e) => onEventChange?.(e.target.value)}
            className="w-full bg-[#151D2E] border border-[#263247] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6366F1]"
          >
            <option value="">-- Choose Event --</option>
            {events.map((evt) => (
              <option key={evt.id || evt._id} value={evt.id || evt._id}>
                {evt.name || evt.title}
              </option>
            ))}
          </select>
          {!selectedEvent && (
            <p className="text-[11px] text-gray-400">
              Select an event to resolve participants or assigned volunteers from that event roster.
            </p>
          )}
        </div>
      )}

      {/* Custom Audience Searchable Member Selector */}
      {currentSelected.includes('Custom Audience') && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#F472B6]" />
              <h4 className="text-xs font-semibold text-white">Select Club Members</h4>
            </div>
            <span className="text-[11px] font-mono text-indigo-400">
              Selected: {(customUserIds || []).length} members
            </span>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search members by name, email, or role..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full bg-[#151D2E] border border-[#263247] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          {/* Member List */}
          {loadingMembers ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Loading club members from MongoDB...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              No matching club members found.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#263247]/40">
              {filteredMembers.map((member) => {
                const isChecked = (customUserIds || []).includes(member._id);
                return (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => handleToggleCustomUser(member._id)}
                    className={`w-full p-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                      isChecked ? 'bg-indigo-950/40 border border-indigo-500/30' : 'hover:bg-[#151D2E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-[#6366F1] border-[#6366F1] text-white'
                            : 'border-[#475569] bg-[#1E293B]'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{member.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{member.email}</p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#151D2E] text-gray-300 border border-[#263247]">
                      {member.role}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


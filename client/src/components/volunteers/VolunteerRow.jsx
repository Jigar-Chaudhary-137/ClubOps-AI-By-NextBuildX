import React from 'react';
import { ArrowRight, Calendar, ShieldCheck, Mail } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import VolunteerAvailabilityBadge from './VolunteerAvailabilityBadge';
import SkillTag from './SkillTag';
import VolunteerWorkload from './VolunteerWorkload';

export default function VolunteerRow({
  volunteer,
  onView
}) {
  if (!volunteer) return null;

  const {
    id,
    name = 'Unnamed Volunteer',
    role = 'Volunteer',
    email = '',
    phone = '',
    availability = 'available',
    skills = [],
    assignedEvent = null,
    workload = null,
    updatedAt = '—'
  } = volunteer;

  const getAvatarStatus = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'available') return 'online';
    if (s === 'busy' || s === 'assigned') return 'busy';
    return 'offline';
  };

  return (
    <tr className="border-b border-[#263247]/60 hover:bg-[#1E293B]/40 transition-colors group">
      {/* Volunteer Member */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={name}
            size="sm"
            status={getAvatarStatus(availability)}
          />
          <div className="min-w-0">
            <span className="font-semibold text-sm text-white group-hover:text-[#818CF8] transition-colors truncate block">
              {name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {email && (
                <span className="text-xs text-[#94A3B8] truncate block">
                  {email}
                </span>
              )}
              {phone ? (
                <span className="text-[11px] text-[#34D399] font-mono">
                  • {phone}
                </span>
              ) : (
                <span className="text-[11px] text-amber-400/70">
                  • No WhatsApp
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#6366F1]" />
          {role}
        </span>
      </td>

      {/* Availability */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <VolunteerAvailabilityBadge availability={availability} size="sm" />
      </td>

      {/* Skills */}
      <td className="py-3.5 px-4 max-w-[200px]">
        {skills && skills.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 2).map((skill, idx) => (
              <SkillTag key={idx} skill={skill} compact />
            ))}
            {skills.length > 2 && (
              <span className="text-[10px] text-[#94A3B8] self-center">
                +{skills.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-[#64748B] italic">—</span>
        )}
      </td>

      {/* Assigned Event */}
      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#94A3B8]">
        {assignedEvent ? (
          <span className="inline-flex items-center gap-1.5 text-white font-medium">
            <Calendar className="w-3 h-3 text-[#818CF8]" />
            {assignedEvent}
          </span>
        ) : (
          <span className="text-[#64748B] italic">Unassigned</span>
        )}
      </td>

      {/* Workload */}
      <td className="py-3.5 px-4 min-w-[120px]">
        <VolunteerWorkload workload={workload} compact />
      </td>

      {/* Last Updated */}
      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#94A3B8]">
        {updatedAt}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView ? onView(id) : null}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View
        </Button>
      </td>
    </tr>
  );
}

import React from 'react';
import { Mail, Phone, Calendar, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import VolunteerAvailabilityBadge from './VolunteerAvailabilityBadge';
import SkillTag from './SkillTag';
import VolunteerWorkload from './VolunteerWorkload';

export default function VolunteerCard({
  volunteer,
  onView,
  className = ''
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
    workload = null
  } = volunteer;

  // Map availability to avatar status dot
  const getAvatarStatus = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'available') return 'online';
    if (s === 'busy' || s === 'assigned') return 'busy';
    return 'offline';
  };

  return (
    <Card
      hoverEffect
      className={`border-[#263247] hover:border-[#374151] bg-[#151D2E] transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Top: Avatar, Name, Role & Availability */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={name}
              size="md"
              status={getAvatarStatus(availability)}
            />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate hover:text-[#818CF8] transition-colors">
                {name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8] font-medium">
                  <ShieldCheck className="w-3 h-3 text-[#6366F1]" />
                  {role}
                </span>
              </div>
            </div>
          </div>
          <VolunteerAvailabilityBadge availability={availability} size="sm" />
        </div>

        {/* Contact Info */}
        {(email || phone) && (
          <div className="space-y-1 text-xs text-[#94A3B8] pt-1">
            {email && (
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                <span className="truncate">{phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Assigned Event */}
        <div className="p-2.5 rounded-lg bg-[#111827] border border-[#263247]/70 text-xs">
          <span className="text-[#64748B] block text-[11px] font-semibold uppercase tracking-wider mb-0.5">
            Assigned Event
          </span>
          <div className="flex items-center gap-1.5 text-white font-medium truncate">
            <Calendar className="w-3.5 h-3.5 text-[#818CF8] shrink-0" />
            <span className="truncate">
              {assignedEvent || '— (Unassigned)'}
            </span>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
            Skills
          </span>
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-14 overflow-hidden">
              {skills.slice(0, 4).map((skill, idx) => (
                <SkillTag key={idx} skill={skill} compact />
              ))}
              {skills.length > 4 && (
                <span className="text-[10px] text-[#94A3B8] self-center px-1">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#64748B] italic">No skills listed</p>
          )}
        </div>

        {/* Current Workload */}
        <div className="pt-1">
          <VolunteerWorkload workload={workload} compact />
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-[#263247]/60">
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-between"
            onClick={() => onView ? onView(id) : null}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

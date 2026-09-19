import React from 'react';
import { Users, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import VolunteerRow from './VolunteerRow';

export default function VolunteerList({
  volunteers = [],
  onViewVolunteer,
  onOpenAddModal,
  onOpenAIAssignment,
  className = ''
}) {
  if (!volunteers || volunteers.length === 0) {
    return (
      <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
        <CardContent className="p-8 sm:p-14">
          <EmptyState
            icon={<Users className="w-8 h-8 text-[#818CF8]" />}
            title="No volunteers yet"
            description="Add your club members to start organizing responsibilities, skills, availability, and event assignments."
            action={
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onOpenAddModal}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Volunteer
                </Button>
                <Button
                  variant="ai"
                  size="md"
                  onClick={onOpenAIAssignment}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Ask AI to Plan Assignments
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-[#263247] bg-[#151D2E] overflow-hidden ${className}`}>
      {/* Contained horizontal scroll to prevent page-level overflow on mobile */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#263247] bg-[#111827]/70 text-xs font-semibold text-[#94A3B8]">
              <th className="py-3 px-4">Volunteer Member</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Availability</th>
              <th className="py-3 px-4">Skills</th>
              <th className="py-3 px-4">Assigned Event</th>
              <th className="py-3 px-4">Workload</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((volunteer) => (
              <VolunteerRow
                key={volunteer.id}
                volunteer={volunteer}
                onView={onViewVolunteer}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

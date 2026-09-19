import React from 'react';
import { Users, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import VolunteerCard from './VolunteerCard';

export default function VolunteerGrid({
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
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${className}`}>
      {volunteers.map((volunteer) => (
        <VolunteerCard
          key={volunteer.id}
          volunteer={volunteer}
          onView={onViewVolunteer}
        />
      ))}
    </div>
  );
}

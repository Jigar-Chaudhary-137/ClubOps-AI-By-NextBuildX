import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Sparkles,
  LayoutGrid,
  List,
  Users,
  Activity,
  UserCheck,
  X
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { Card, CardContent } from '../../components/ui/Card';
import { AIBadge } from '../../components/ai';
import {
  VolunteerGrid,
  VolunteerList,
  AddVolunteerModal,
  VolunteerAssignmentPanel,
  AIVolunteerAssignment,
  VolunteerWorkload,
  VolunteerQuickActions
} from '../../components/volunteers';

const availabilityFilterOptions = [
  { value: 'all', label: 'All Availabilities' },
  { value: 'Available', label: 'Available' },
  { value: 'Busy', label: 'Busy' },
  { value: 'Unavailable', label: 'Unavailable' }
];

const roleFilterOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'Organizer', label: 'Organizer' },
  { value: 'Coordinator', label: 'Coordinator' },
  { value: 'Volunteer', label: 'Volunteer' }
];

const skillFilterOptions = [
  { value: 'all', label: 'All Skills' }
];

const eventAssignmentFilterOptions = [
  { value: 'all', label: 'All Volunteers' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' }
];

const sortOptions = [
  { value: 'recently_added', label: 'Recently Added' },
  { value: 'name', label: 'Name' },
  { value: 'availability', label: 'Availability' },
  { value: 'workload', label: 'Workload' }
];

export default function VolunteersPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState(false);

  // Filters state (operating at UI level, no backend data required)
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [eventAssignmentFilter, setEventAssignmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recently_added');

  // Currently no backend volunteer data exists (clean empty state)
  const volunteers = [];

  const handleViewVolunteer = (volunteerId) => {
    navigate(`/volunteers/${volunteerId}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Volunteers
            </h1>
            <AIBadge size="sm">Talent & Operations</AIBadge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Manage your club members, skills, availability, and event responsibilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ai"
            size="sm"
            onClick={() => setIsAIModalOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            AI Assignment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Volunteer
          </Button>
        </div>
      </div>

      {/* 2. Volunteer Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search volunteers..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Switcher Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              <div className="flex items-center p-1 rounded-lg bg-[#111827] border border-[#263247]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#1E293B] text-white shadow-sm'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#1E293B] text-white shadow-sm'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                  aria-label="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills / Selectors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 border-t border-[#263247]/50">
            <Select
              options={availabilityFilterOptions}
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            />
            <Select
              options={roleFilterOptions}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
            <Select
              options={skillFilterOptions}
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
            <Select
              options={eventAssignmentFilterOptions}
              value={eventAssignmentFilter}
              onChange={(e) => setEventAssignmentFilter(e.target.value)}
            />
            <div className="col-span-2 sm:col-span-1">
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Volunteer Views: Grid View or List View */}
      {viewMode === 'grid' ? (
        <VolunteerGrid
          volunteers={volunteers}
          onViewVolunteer={handleViewVolunteer}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenAIAssignment={() => setIsAIModalOpen(true)}
        />
      ) : (
        <VolunteerList
          volunteers={volunteers}
          onViewVolunteer={handleViewVolunteer}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenAIAssignment={() => setIsAIModalOpen(true)}
        />
      )}

      {/* 4. Volunteer Operations Shortcuts */}
      <VolunteerQuickActions
        onAddVolunteer={() => setIsAddModalOpen(true)}
        onAssignToEvent={() => setIsAssignmentModalOpen(true)}
        onAIAssignment={() => setIsAIModalOpen(true)}
        onViewWorkload={() => setIsWorkloadModalOpen(true)}
      />

      {/* 5. Add Volunteer Modal */}
      <AddVolunteerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* 6. AI Volunteer Assignment Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        size="xl"
      >
        <AIVolunteerAssignment onClose={() => setIsAIModalOpen(false)} />
      </Modal>

      {/* 7. Assign to Event Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        size="lg"
      >
        <VolunteerAssignmentPanel
          onAssignmentComplete={() => setIsAssignmentModalOpen(false)}
        />
      </Modal>

      {/* 8. View Workload Overview Modal */}
      <Modal
        isOpen={isWorkloadModalOpen}
        onClose={() => setIsWorkloadModalOpen(false)}
        title="Volunteer Workload Overview"
        description="Monitor team capacity, distribution of tasks, and event assignments"
        size="md"
        footer={
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsWorkloadModalOpen(false)}
          >
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-[#111827] border border-[#263247] text-xs text-[#94A3B8] leading-relaxed flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-[#818CF8] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Workload Intelligence:</span>{' '}
              Team capacity metrics will calculate dynamically from active tasks and event allocations once data sources are connected.
            </div>
          </div>
          <VolunteerWorkload workload={null} />
        </div>
      </Modal>
    </div>
  );
}

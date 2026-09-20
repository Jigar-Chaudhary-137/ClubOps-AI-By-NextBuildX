import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';
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
import { getVolunteers, createVolunteer } from '../../services/api/volunteers';

const availabilityFilterOptions = [
  { value: 'all', label: 'All Availabilities' },
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'busy', label: 'Busy' },
  { value: 'unavailable', label: 'Unavailable' }
];

const roleFilterOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'Organizer', label: 'Organizer' },
  { value: 'Coordinator', label: 'Coordinator' },
  { value: 'Volunteer', label: 'Volunteer' }
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
  const [rawVolunteers, setRawVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [eventAssignmentFilter, setEventAssignmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recently_added');

  const fetchVolunteersList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getVolunteers();
      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.volunteers || [];
      setRawVolunteers(list);
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load volunteers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolunteersList();
  }, [fetchVolunteersList]);

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCreateVolunteer = async (payload) => {
    const result = await createVolunteer(payload);
    await fetchVolunteersList();
    setToast({
      type: 'success',
      title: 'Volunteer Added Successfully',
      message: `Volunteer "${payload.name || 'Member'}" has been added to the club workspace.`
    });
    return result;
  };

  const handleViewVolunteer = (volunteerId) => {
    navigate(`/volunteers/${volunteerId}`);
  };

  const formattedVolunteers = useMemo(() => {
    return rawVolunteers.map((v) => ({
      id: v._id,
      _id: v._id,
      name: v.user?.name || v.name || 'Club Volunteer',
      role: v.user?.role
        ? v.user.role.charAt(0).toUpperCase() + v.user.role.slice(1)
        : (v.department || 'Volunteer'),
      email: v.user?.email || v.email || '',
      phone: v.user?.whatsappNumber || v.user?.phone || v.phone || '',
      availability: v.availability || 'available',
      skills: Array.isArray(v.skills) ? v.skills : [],
      department: v.department || 'General',
      assignedEvent: v.event?.title || (typeof v.event === 'string' ? v.event : null),
      workload: {
        activeTasks: v.assignedTasksCount || 0,
        status: (v.assignedTasksCount || 0) > 3 ? 'Overloaded' : (v.assignedTasksCount || 0) > 0 ? 'Optimal' : 'Light'
      },
      updatedAt: v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() : '—',
      raw: v
    }));
  }, [rawVolunteers]);

  const skillFilterOptions = useMemo(() => {
    const allSkills = new Set();
    rawVolunteers.forEach((v) => {
      if (Array.isArray(v.skills)) {
        v.skills.forEach((s) => allSkills.add(s));
      }
    });
    return [
      { value: 'all', label: 'All Skills' },
      ...Array.from(allSkills).map((s) => ({ value: s, label: s }))
    ];
  }, [rawVolunteers]);

  const filteredVolunteers = useMemo(() => {
    return formattedVolunteers
      .filter((vol) => {
        const matchesSearch =
          !searchQuery.trim() ||
          vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vol.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vol.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          vol.department.toLowerCase().includes(searchQuery.toLowerCase());

        const normAvailability = (vol.availability || '').toLowerCase();
        const filterNormAvailability = availabilityFilter.toLowerCase();
        const matchesAvailability =
          availabilityFilter === 'all' || normAvailability === filterNormAvailability;

        const normRole = (vol.role || '').toLowerCase();
        const filterNormRole = roleFilter.toLowerCase();
        const matchesRole =
          roleFilter === 'all' || normRole === filterNormRole;

        const matchesSkill =
          skillFilter === 'all' ||
          vol.skills.some((s) => s.toLowerCase() === skillFilter.toLowerCase());

        const matchesEventAssignment =
          eventAssignmentFilter === 'all' ||
          (eventAssignmentFilter === 'assigned' && Boolean(vol.assignedEvent)) ||
          (eventAssignmentFilter === 'unassigned' && !vol.assignedEvent);

        return matchesSearch && matchesAvailability && matchesRole && matchesSkill && matchesEventAssignment;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'availability') {
          return a.availability.localeCompare(b.availability);
        }
        if (sortBy === 'workload') {
          return (b.workload?.activeTasks || 0) - (a.workload?.activeTasks || 0);
        }
        return new Date(b.raw?.createdAt || 0) - new Date(a.raw?.createdAt || 0);
      });
  }, [formattedVolunteers, searchQuery, availabilityFilter, roleFilter, skillFilter, eventAssignmentFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

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
            variant="secondary"
            size="sm"
            onClick={fetchVolunteersList}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
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

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchVolunteersList}>
            Retry
          </Button>
        </div>
      )}

      {/* 2. Volunteer Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search volunteers by name, skill, email..."
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

          {/* Filter Selectors Grid */}
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
          volunteers={filteredVolunteers}
          onViewVolunteer={handleViewVolunteer}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenAIAssignment={() => setIsAIModalOpen(true)}
        />
      ) : (
        <VolunteerList
          volunteers={filteredVolunteers}
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
        onSave={handleCreateVolunteer}
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
          onAssignmentComplete={() => {
            setIsAssignmentModalOpen(false);
            fetchVolunteersList();
          }}
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
              Team capacity metrics calculate dynamically from active tasks and event allocations.
            </div>
          </div>
          <VolunteerWorkload workload={{ activeTasks: rawVolunteers.reduce((acc, v) => acc + (v.assignedTasksCount || 0), 0) }} />
        </div>
      </Modal>
    </div>
  );
}


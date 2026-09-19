import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Search, Sparkles, Filter, SlidersHorizontal, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { AIBadge } from '../../components/ai';
import { CreateEventModal } from '../../components/events';

const statusFilterOptions = [
  { value: 'all', label: 'All Events' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' }
];

const sortOptions = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'date', label: 'Event Date' },
  { value: 'name', label: 'Name' }
];

export default function EventsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Currently no backend data exists
  const events = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Events
            </h1>
            <AIBadge size="sm">Lifecycle Hub</AIBadge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Plan, organize, and track your club events from one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/ai">
            <Button
              variant="ai"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              AI Event Planner
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Event
          </Button>
        </div>
      </div>

      {/* Events Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search events..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <div className="w-full sm:w-40">
                <Select
                  options={statusFilterOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-44">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Content Area */}
      {events.length === 0 ? (
        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-8 sm:p-14">
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-[#818CF8]" />}
              title="No events yet"
              description="Create your first event to start managing tasks, volunteers, meetings, deadlines, and risks in one place."
              action={
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsCreateModalOpen(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Create Your First Event
                  </Button>
                  <Link to="/ai">
                    <Button
                      variant="ai"
                      size="md"
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      Ask AI to Plan an Event
                    </Button>
                  </Link>
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Reserved for mapped EventCard instances once backend is connected */}
        </div>
      )}

      {/* Reusable Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

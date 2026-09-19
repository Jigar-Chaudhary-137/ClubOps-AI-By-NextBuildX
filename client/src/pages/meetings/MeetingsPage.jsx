import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Sparkles, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  MeetingList,
  CreateMeetingModal
} from '../../components/meetings';

const meetingTypeFilterOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Review', label: 'Review' },
  { value: 'Team Meeting', label: 'Team Meeting' },
  { value: 'Committee', label: 'Committee' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Other', label: 'Other' }
];

const eventFilterOptions = [
  { value: 'all', label: 'All Events' }
];

const processingStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'Not Processed', label: 'Not Processed' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Processed', label: 'Processed' }
];

const sortOptions = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'date', label: 'Meeting Date' },
  { value: 'name', label: 'Name' }
];

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Toolbar filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Since backend is not connected yet, meeting list starts empty
  const meetings = [];

  const handleOpenIntelligence = () => {
    // Navigate to new session meeting intelligence workspace
    navigate('/meetings/intelligence');
  };

  const handleViewMeeting = (id) => {
    navigate(`/meetings/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Meetings
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Capture decisions, action items, and important context from every club meeting.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ai"
            size="sm"
            onClick={handleOpenIntelligence}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Meeting Intelligence
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Meeting
          </Button>
        </div>
      </div>

      {/* Meeting Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search meetings..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-36">
                <Select
                  options={eventFilterOptions}
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  options={meetingTypeFilterOptions}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  options={processingStatusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-40">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center p-1 rounded-lg bg-[#111827] border border-[#263247]">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="Table view"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[#151D2E] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#151D2E] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meeting List or Empty State */}
      <MeetingList
        meetings={meetings}
        viewMode={viewMode}
        onViewMeeting={handleViewMeeting}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onProcessNotes={handleOpenIntelligence}
      />

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

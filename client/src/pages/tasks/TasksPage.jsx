import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Sparkles,
  List,
  Columns,
  Filter,
  CheckSquare
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { AIBadge } from '../../components/ai';
import {
  TaskList,
  TaskBoard,
  CreateTaskModal,
  TaskQuickActions
} from '../../components/tasks';

const statusFilterOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Blocked', label: 'Blocked' }
];

const priorityFilterOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'Low', label: 'Low Priority' },
  { value: 'Medium', label: 'Medium Priority' },
  { value: 'High', label: 'High Priority' },
  { value: 'Urgent', label: 'Urgent' }
];

const assigneeFilterOptions = [
  { value: 'all', label: 'All Assignees' },
  { value: 'unassigned', label: 'Unassigned' }
];

const eventFilterOptions = [
  { value: 'all', label: 'All Events' }
];

const sortOptions = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created Date' }
];

export default function TasksPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Currently no backend data exists
  const tasks = [];

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Tasks
            </h1>
            <AIBadge size="sm">Work Breakdown</AIBadge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Track responsibilities, deadlines, and work across your club events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/ai">
            <Button
              variant="ai"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Ask AI
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* 2. Tasks Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search tasks..."
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
                <button
                  type="button"
                  onClick={() => setViewMode('board')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'board'
                      ? 'bg-[#1E293B] text-white shadow-sm'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                  aria-label="Board View"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Board</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills / Selectors Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1 border-t border-[#263247]/50">
            <Select
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={priorityFilterOptions}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            />
            <Select
              options={assigneeFilterOptions}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            />
            <Select
              options={eventFilterOptions}
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
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

      {/* 3. Task Views: List View or Board View */}
      {viewMode === 'list' ? (
        <TaskList
          tasks={tasks}
          onViewTask={handleViewTask}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <TaskBoard
          tasks={tasks}
          onViewTask={handleViewTask}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* 4. Task Operations Shortcuts */}
      <TaskQuickActions
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* 5. Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

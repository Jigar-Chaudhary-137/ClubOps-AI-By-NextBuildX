import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Sparkles,
  List,
  Columns,
  Filter,
  CheckSquare,
  RefreshCw,
  AlertCircle
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
  TaskQuickActions,
  AITaskExtractionModal
} from '../../components/tasks';
import { getTasks, createTask, updateTaskStatus } from '../../services/api/tasks';
import { getEvents } from '../../services/api/events';
import { normalizeApiError } from '../../services/api/client';

const statusFilterOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const priorityFilterOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' }
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
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false);

  // Data states
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Load events for filter dropdown & task modals
  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        const res = await getEvents();
        if (isMounted && res?.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.events || []);
          setEvents(list);
        }
      } catch (e) {
        console.warn('Failed to load events for task filter:', e.message);
      }
    };
    loadEvents();
    return () => { isMounted = false; };
  }, []);

  const eventFilterOptions = [
    { value: 'all', label: 'All Events' },
    ...events.map((e) => ({ value: e._id || e.id, label: e.title || e.name || 'Untitled Event' }))
  ];

  // Fetch real tasks from backend
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (eventFilter !== 'all') params.event = eventFilter;

      const res = await getTasks(params);
      let taskList = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.tasks || res?.tasks || []);

      // Client-side sort mapping
      if (sortBy === 'dueDate') {
        taskList.sort((a, b) => new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999'));
      } else if (sortBy === 'priority') {
        const pOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        taskList.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
      } else if (sortBy === 'created') {
        taskList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        taskList.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      }

      setTasks(taskList);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(normalizeApiError(err, 'Failed to load tasks. Please check your session.'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, eventFilter, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTaskSave = async (payload) => {
    const res = await createTask(payload);
    await fetchTasks();
    return res;
  };

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
            Track responsibilities, deadlines, and deliverables across your club operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ai"
            size="sm"
            onClick={() => setIsExtractModalOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Ask AI to Extract Tasks
          </Button>

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-[#263247]/50">
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
              options={eventFilterOptions}
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchTasks}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2 bg-[#151D2E] rounded-xl border border-[#263247]">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading tasks...</span>
        </div>
      ) : (
        /* 3. Task Views: List View or Board View */
        viewMode === 'list' ? (
          <TaskList
            tasks={tasks}
            onViewTask={handleViewTask}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenExtractModal={() => setIsExtractModalOpen(true)}
          />
        ) : (
          <TaskBoard
            tasks={tasks}
            onViewTask={handleViewTask}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )
      )}

      {/* 4. Task Operations Shortcuts */}
      <TaskQuickActions
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenExtractModal={() => setIsExtractModalOpen(true)}
      />

      {/* 5. Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTaskSave}
        events={events}
      />

      {/* 6. Ask AI to Extract Tasks Modal */}
      <AITaskExtractionModal
        isOpen={isExtractModalOpen}
        onClose={() => setIsExtractModalOpen(false)}
        onTasksCreated={fetchTasks}
      />
    </div>
  );
}

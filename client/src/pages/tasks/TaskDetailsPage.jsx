import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitBranch,
  ShieldAlert,
  FileEdit,
  UserCheck,
  Check
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { AIBadge, AIIcon } from '../../components/ai';
import {
  TaskStatusBadge,
  TaskPriorityBadge,
  AITaskIndicator,
  CreateTaskModal
} from '../../components/tasks';
import { getTaskById, updateTaskStatus, deleteTask } from '../../services/api/tasks';

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    async function loadTask() {
      if (!taskId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getTaskById(taskId);
        if (res?.data) {
          setTask(res.data);
        }
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [taskId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      const res = await updateTaskStatus(taskId, newStatus);
      if (res?.data) {
        setTask(res.data);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      navigate('/tasks');
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading task data from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-4">
        <Link to="/tasks" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </Link>
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">Task Not Found</h3>
            <p className="text-xs text-rose-200">{error || 'The requested task could not be retrieved from the database.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignedUser = typeof task.assignedTo === 'object' ? task.assignedTo?.name : 'Unassigned';
  const eventTitle = typeof task.event === 'object' ? task.event?.title : (typeof task.eventId === 'object' ? task.eventId?.title : 'General Task');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">Task ID: #{task._id ? task._id.substring(0, 8) : taskId}</Badge>
          <Badge variant="primary" dot>MongoDB Connected</Badge>
        </div>
      </div>

      {/* Task Header */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
                {task.source === 'meeting' || task.aiGenerated ? <AITaskIndicator /> : null}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {task.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {task.status !== 'completed' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  disabled={statusUpdating}
                  onClick={() => handleStatusChange('completed')}
                >
                  Mark Done
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit className="w-3.5 h-3.5" />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Task
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Details & AI Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Task Information & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Specifications Card */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div>
                <CardTitle>Task Specifications</CardTitle>
                <CardDescription>Deliverable parameters and constraints</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
                  Description
                </span>
                <p className="text-xs sm:text-sm text-white leading-relaxed p-3.5 rounded-lg bg-[#111827] border border-[#263247]">
                  {task.description || 'No detailed specifications provided for this task.'}
                </p>
              </div>

              {/* Metadata 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                    <span>Linked Event</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">{eventTitle || 'General'}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <User className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>Assigned Owner</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">{assignedUser || 'Unassigned'}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Target Due Date</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline set'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">
                    {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Status Setter */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Move task through operational workflow</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'todo', label: 'To Do' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'review', label: 'In Review' },
                  { key: 'completed', label: 'Completed' }
                ].map((s) => (
                  <Button
                    key={s.key}
                    variant={task.status === s.key ? 'primary' : 'outline'}
                    size="sm"
                    disabled={statusUpdating || task.status === s.key}
                    onClick={() => handleStatusChange(s.key)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Task Assistance */}
        <div className="space-y-6">
          <Card className="border-[#8B5CF6]/30 bg-gradient-to-b from-[#171A2E]/90 to-[#151D2E] shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <AIIcon size="sm" />
                  <div>
                    <CardTitle className="text-sm">AI Task Assistance</CardTitle>
                    <CardDescription>Operational copilot</CardDescription>
                  </div>
                </div>
                <AIBadge size="sm">Gemini AI</AIBadge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">
                Use ClubOps Operations Agent to automate task refinement and cross-team execution:
              </p>

              <Link to="/ai" className="block">
                <Button
                  variant="ai"
                  size="sm"
                  className="w-full justify-start text-xs"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Consult Operations Agent
                </Button>
              </Link>

              <Link to="/risks" className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                  leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-[#F87171]" />}
                >
                  Run Risk Intelligence Scan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Task Modal */}
      <CreateTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

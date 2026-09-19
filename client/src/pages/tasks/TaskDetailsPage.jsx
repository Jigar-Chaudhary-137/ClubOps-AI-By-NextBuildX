import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Edit,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitBranch,
  ShieldAlert,
  FileEdit,
  UserCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { AIBadge, AIIcon, AIInsightCard } from '../../components/ai';
import {
  TaskStatusBadge,
  TaskPriorityBadge,
  AITaskIndicator,
  CreateTaskModal
} from '../../components/tasks';

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
          <Badge variant="neutral">Task ID: #{taskId}</Badge>
          <Badge variant="primary" dot>Awaiting Integration</Badge>
        </div>
      </div>

      {/* Backend Integration Info Banner */}
      <div className="p-3.5 rounded-xl bg-[#151D2E] border border-[#263247] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6366F1]/10 text-[#818CF8] flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">Task Details Preview:</span>{' '}
            Live task record #{taskId} will be dynamically retrieved from the backend API in the upcoming integration phase.
          </div>
        </div>
        <Link to="/ai">
          <Button variant="ai" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            AI Task Agent
          </Button>
        </Link>
      </div>

      {/* Task Header */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <TaskStatusBadge status="To Do" />
                <TaskPriorityBadge priority="Medium" />
                <AITaskIndicator />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Operational Task Details
              </h1>

              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                Task specifications, dependencies, assignees, and real-time execution progress.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit className="w-3.5 h-3.5" />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Task
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
                <p className="text-xs sm:text-sm text-white leading-relaxed p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  Detailed description and deliverables will populate here when selected from the tasks repository.
                </p>
              </div>

              {/* Metadata 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                    <span>Linked Event</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">—</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <User className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>Assigned Owner</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">Unassigned</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Target Due Date</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">—</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">—</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity / History Log */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div>
                <CardTitle>Activity & Execution History</CardTitle>
                <CardDescription>Status updates, comments, and task modifications</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Clock className="w-6 h-6 text-[#818CF8]" />}
                title="No activity recorded yet"
                description="Task activity will appear here once connected to the backend."
              />
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
                    <CardDescription>Operational copilot tools</CardDescription>
                  </div>
                </div>
                <AIBadge size="sm">Copilot</AIBadge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">
                ClubOps AI can analyze this task to propose optimizations, assignees, or sub-deliverables:
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                leftIcon={<GitBranch className="w-3.5 h-3.5 text-[#818CF8]" />}
                disabled
              >
                Break into Subtasks
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                leftIcon={<Clock className="w-3.5 h-3.5 text-[#F59E0B]" />}
                disabled
              >
                Suggest Realistic Deadline
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                leftIcon={<UserCheck className="w-3.5 h-3.5 text-[#4ADE80]" />}
                disabled
              >
                Suggest Optimal Assignee
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                leftIcon={<FileEdit className="w-3.5 h-3.5 text-[#38BDF8]" />}
                disabled
              >
                Refine Task Description
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-[#F87171]" />}
                disabled
              >
                Check for Operational Risks
              </Button>

              <div className="pt-3 mt-1 border-t border-[#263247]/60 text-[11px] text-[#64748B]">
                AI operations copilot will connect to Gemini API in later backend phases.
              </div>
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

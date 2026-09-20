import React from 'react';
import { Calendar, User, Tag, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import AITaskIndicator from './AITaskIndicator';

export default function TaskCard({
  task,
  onView,
  onEdit,
  className = ''
}) {
  if (!task) return null;

  const id = task._id || task.id;
  const title = task.title || 'Untitled Task';
  const description = task.description;
  const status = task.status || 'To Do';
  const priority = task.priority || 'Medium';

  // Safely extract assignee display name
  const assigneeDisplay = typeof task.assignee === 'object' && task.assignee !== null
    ? (task.assignee.name || task.assignee.email || 'Unassigned')
    : typeof task.assignedTo === 'object' && task.assignedTo !== null
      ? (task.assignedTo.name || task.assignedTo.email || 'Unassigned')
      : (task.assignee || task.assignedTo || 'Unassigned');

  // Safely extract event display name
  const eventDisplay = typeof task.event === 'object' && task.event !== null
    ? (task.event.title || task.event.name || null)
    : task.event;

  // Safely extract due date
  const dueDateDisplay = task.dueDate && task.dueDate !== '—'
    ? (typeof task.dueDate === 'string' && task.dueDate.includes('T')
        ? new Date(task.dueDate).toLocaleDateString()
        : task.dueDate)
    : null;

  const aiGenerated = Boolean(task.aiGenerated);
  const isOverdue = Boolean(task.isOverdue);

  return (
    <Card
      hoverEffect
      className={`border-[#263247] hover:border-[#374151] bg-[#151D2E] transition-all duration-200 ${className}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Badges & Indicators Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <TaskPriorityBadge priority={priority} size="sm" />
            {aiGenerated && <AITaskIndicator size="sm" />}
          </div>
          <TaskStatusBadge status={status} size="sm" />
        </div>

        {/* Task Title & Description */}
        <div>
          <h4
            onClick={() => onView ? onView(id) : null}
            className="text-sm font-semibold text-white tracking-tight cursor-pointer hover:text-[#818CF8] transition-colors line-clamp-2"
          >
            {title}
          </h4>
          {description && (
            <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Metadata: Event, Assignee, Due Date */}
        <div className="space-y-1.5 pt-2 border-t border-[#263247]/60 text-xs text-[#94A3B8]">
          {eventDisplay && (
            <div className="flex items-center gap-2 truncate">
              <Tag className="w-3.5 h-3.5 text-[#818CF8] shrink-0" />
              <span className="truncate">{eventDisplay}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="truncate">{assigneeDisplay}</span>
            </div>

            {dueDateDisplay && (
              <div className={`flex items-center gap-1 shrink-0 ${isOverdue ? 'text-[#EF4444] font-medium' : 'text-[#94A3B8]'}`}>
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                <span>{dueDateDisplay}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {onView && (
          <button
            type="button"
            onClick={() => onView(id)}
            className="w-full text-left text-xs font-medium text-[#818CF8] hover:text-white flex items-center justify-between pt-1 group"
          >
            <span>View Task Details</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}

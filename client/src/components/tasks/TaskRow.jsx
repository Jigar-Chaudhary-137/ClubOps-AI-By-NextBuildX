import React from 'react';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import AITaskIndicator from './AITaskIndicator';

export default function TaskRow({
  task,
  onView,
  onEdit
}) {
  if (!task) return null;

  const id = task._id || task.id;
  const title = task.title || 'Untitled Task';
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
    ? (task.event.title || task.event.name || '—')
    : (task.event || '—');

  // Safely extract due date
  const dueDateDisplay = task.dueDate && task.dueDate !== '—'
    ? (typeof task.dueDate === 'string' && task.dueDate.includes('T')
        ? new Date(task.dueDate).toLocaleDateString()
        : task.dueDate)
    : '—';

  // Safely extract updated date
  const updatedAtDisplay = task.updatedAt && task.updatedAt !== '—'
    ? (typeof task.updatedAt === 'string' && task.updatedAt.includes('T')
        ? new Date(task.updatedAt).toLocaleDateString()
        : task.updatedAt)
    : '—';

  const aiGenerated = Boolean(task.aiGenerated);

  return (
    <tr className="border-b border-[#263247]/60 hover:bg-[#151D2E]/80 transition-colors">
      {/* Title & AI Indicator */}
      <td className="py-3 px-4 min-w-[200px]">
        <div className="flex flex-col gap-1">
          <span
            onClick={() => onView ? onView(id) : null}
            className="text-sm font-semibold text-white cursor-pointer hover:text-[#818CF8] transition-colors line-clamp-1"
          >
            {title}
          </span>
          {aiGenerated && (
            <div className="flex items-center">
              <AITaskIndicator size="sm" />
            </div>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-4 whitespace-nowrap">
        <TaskStatusBadge status={status} size="sm" />
      </td>

      {/* Priority */}
      <td className="py-3 px-4 whitespace-nowrap">
        <TaskPriorityBadge priority={priority} size="sm" />
      </td>

      {/* Assignee */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{assigneeDisplay}</span>
        </div>
      </td>

      {/* Event */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{eventDisplay}</span>
        </div>
      </td>

      {/* Due Date */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{dueDateDisplay}</span>
        </div>
      </td>

      {/* Last Updated */}
      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap font-mono">
        {updatedAtDisplay}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => onView ? onView(id) : null}
          className="text-xs font-medium text-[#818CF8] hover:text-white inline-flex items-center gap-1 transition-colors"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}


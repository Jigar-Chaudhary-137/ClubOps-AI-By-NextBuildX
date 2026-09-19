import React, { useState } from 'react';
import { CheckSquare, Plus, Sparkles, Columns3, ListFilter, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-t-[#94A3B8]' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-[#6366F1]' },
  { id: 'review', title: 'Review / Blocked', color: 'border-t-[#F59E0B]' },
  { id: 'done', title: 'Completed', color: 'border-t-[#22C55E]' }
];

export default function TasksPage() {
  const [viewMode, setViewMode] = useState('kanban');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Task Operations
            </h1>
            <Badge variant="primary">Work Breakdown</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Assign tasks, track dependencies, and manage deadlines across team leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-[#151D2E] p-1 rounded-lg border border-[#263247]">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              aria-label="Kanban View"
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              aria-label="List View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="ai"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            disabled
          >
            Extract from Notes
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            disabled
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Architecture Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className={`
              flex flex-col bg-[#151D2E] border border-[#263247] rounded-xl overflow-hidden
              border-t-2 ${col.color} min-h-[380px]
            `}
          >
            <div className="p-3.5 border-b border-[#263247]/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F8FAFC]">
                {col.title}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#111827] text-[#94A3B8] font-mono">
                0
              </span>
            </div>

            <div className="p-3 flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-[#64748B]">No tasks in this stage</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

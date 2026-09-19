import React from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const columns = [
  { id: 'To Do', title: 'To Do', color: 'border-t-[#94A3B8]', badge: 'bg-[#94A3B8]/15 text-[#94A3B8]' },
  { id: 'In Progress', title: 'In Progress', color: 'border-t-[#6366F1]', badge: 'bg-[#6366F1]/15 text-[#818CF8]' },
  { id: 'Completed', title: 'Completed', color: 'border-t-[#22C55E]', badge: 'bg-[#22C55E]/15 text-[#4ADE80]' },
  { id: 'Blocked', title: 'Blocked', color: 'border-t-[#EF4444]', badge: 'bg-[#EF4444]/15 text-[#F87171]' }
];

export default function TaskBoard({
  tasks = [],
  onViewTask,
  onOpenCreateModal,
  className = ''
}) {
  return (
    <div className={`overflow-x-auto pb-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-w-full xl:min-w-0">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`
                flex flex-col bg-[#151D2E] border border-[#263247] rounded-xl overflow-hidden
                border-t-2 ${col.color} min-h-[420px] shadow-sm
              `}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-[#263247]/60 flex items-center justify-between bg-[#111827]/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white tracking-tight">
                    {col.title}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="p-1 text-[#94A3B8] hover:text-white rounded-md hover:bg-[#1E293B] transition-colors"
                  aria-label={`Add task to ${col.title}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column Content */}
              <div className="p-3 flex-1 flex flex-col space-y-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#263247]/60 rounded-lg">
                    <p className="text-xs text-[#64748B] font-medium">
                      No tasks here
                    </p>
                    <span className="text-[10px] text-[#475569] mt-0.5">
                      Ready for assignments
                    </span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onView={onViewTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

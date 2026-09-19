import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import TaskRow from './TaskRow';

export default function TaskList({
  tasks = [],
  onViewTask,
  onOpenCreateModal,
  className = ''
}) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
        <CardContent className="p-8 sm:p-14">
          <EmptyState
            icon={<CheckSquare className="w-8 h-8 text-[#818CF8]" />}
            title="No tasks yet"
            description="Create your first task or let ClubOps AI turn meeting action items into tasks."
            action={
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onOpenCreateModal}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Task
                </Button>
                <Link to="/meetings">
                  <Button
                    variant="ai"
                    size="md"
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Ask AI to Extract Tasks
                  </Button>
                </Link>
              </div>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-[#263247] bg-[#151D2E] overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#263247] bg-[#111827]/70 text-xs font-semibold text-[#94A3B8]">
              <th className="py-3 px-4">Task Deliverable</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onView={onViewTask}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

import React from 'react';
import { CheckSquare, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import ActionItemCard from './ActionItemCard';

export default function MeetingActionItems({
  actionItems = [],
  onAnalyze,
  onCreateTask,
  onEditItem,
  onDismissItem,
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Action Items</CardTitle>
            {actionItems.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/30">
                {actionItems.length}
              </span>
            )}
          </div>
          <CardDescription>
            Tasks identified from the meeting.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {actionItems.length === 0 ? (
          <div className="py-6 sm:py-8">
            <EmptyState
              icon={<CheckSquare className="w-7 h-7 text-[#818CF8]" />}
              title="No action items have been extracted yet."
              description="Analyze meeting notes to identify actionable work."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {actionItems.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                onCreateTask={onCreateTask}
                onEdit={onEditItem}
                onDismiss={onDismissItem}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

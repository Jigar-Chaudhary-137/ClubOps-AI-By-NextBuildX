import React from 'react';
import { Calendar, Plus, Sparkles, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function EventsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Events Management
            </h1>
            <Badge variant="primary">Lifecycle Hub</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Plan, organize milestones, and track execution for club events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ai"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            disabled
          >
            AI Plan Generator
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            disabled
          >
            Create Event
          </Button>
        </div>
      </div>

      {/* Filter Tabs Structure */}
      <div className="flex items-center gap-2 border-b border-[#263247] pb-3">
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30"
        >
          All Events (0)
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#94A3B8] hover:text-white transition-colors"
        >
          Planning
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#94A3B8] hover:text-white transition-colors"
        >
          In Progress
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#94A3B8] hover:text-white transition-colors"
        >
          Completed
        </button>
      </div>

      {/* Content Container */}
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-[#818CF8]" />}
            title="No events scheduled yet"
            description="Create your first event or use the AI Event Planner to generate a structured operational timeline from a simple topic description."
            action={
              <Button variant="outline" size="sm" disabled leftIcon={<Plus className="w-4 h-4" />}>
                Create Initial Event
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

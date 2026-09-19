import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, Users, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { AIInsightCard } from '../../components/ai';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Executive Dashboard
            </h1>
            <Badge variant="primary">Workspace Overview</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Unified event operations, operational signals, and AI assistance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            Export Summary
          </Button>
          <Button
            variant="ai"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            disabled
          >
            Run AI Assessment
          </Button>
        </div>
      </div>

      {/* AI Intelligence Showcase Card */}
      <AIInsightCard
        title="AI Operational Intelligence Layer"
        subtitle="Active Monitoring Foundation"
        badgeText="Core Concept"
        action={
          <Button variant="ghost" size="sm" disabled>
            View Active Rules
          </Button>
        }
      >
        ClubOps AI continuously cross-correlates event milestones, action items extracted from meeting transcripts, volunteer workloads, and risk factors to surface actionable proposals for organizers.
      </AIInsightCard>

      {/* Metric Cards Structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8]">Active Events</span>
              <div className="p-2 rounded-lg bg-[#6366F1]/10 text-[#818CF8]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-[11px] text-[#94A3B8] mt-1">No active events yet</p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8]">Pending Tasks</span>
              <div className="p-2 rounded-lg bg-[#22C55E]/10 text-[#4ADE80]">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-[11px] text-[#94A3B8] mt-1">Awaiting event creation</p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8]">Active Volunteers</span>
              <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#A78BFA]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">—</div>
            <p className="text-[11px] text-[#94A3B8] mt-1">Roster unassigned</p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8]">Risk Level</span>
              <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#FBBF24]">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">Nominal</div>
            <p className="text-[11px] text-[#94A3B8] mt-1">No critical warnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Workspace Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Event Operations Feed</CardTitle>
              <CardDescription>Live timeline of tasks, assignments, and updates</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<LayoutDashboard className="w-6 h-6" />}
              title="Workspace Ready"
              description="Events created or imported from meeting notes will display operations progress and activity metrics here."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Operational Signals</CardTitle>
              <CardDescription>Pending decisions & alerts</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<AlertTriangle className="w-6 h-6" />}
              title="All Clear"
              description="AI will automatically flag upcoming bottlenecks, unassigned dependencies, and overdue milestones."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

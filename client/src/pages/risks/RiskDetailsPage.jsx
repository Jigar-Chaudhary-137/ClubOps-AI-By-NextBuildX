import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Tag,
  User,
  Calendar,
  Clock,
  Edit,
  MoreVertical,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  RiskSeverityBadge,
  RiskStatusBadge,
  RiskProbabilityImpact,
  RiskScoreIndicator,
  RiskDetailsPanel,
  RiskMitigationPlan,
  RiskOwnerPanel,
  RiskTimeline,
  RiskQuickActions,
  AIRiskInsight,
  AIRiskSuggestions,
  CreateRiskModal
} from '../../components/risks';

export default function RiskDetailsPage() {
  const { riskId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Backend integration placeholder
  const risk = null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/risks"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Risks</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">ID: {riskId}</Badge>
        </div>
      </div>

      {/* Header Card */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <RiskSeverityBadge severity="Medium" size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <RiskStatusBadge status="Open" size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Category: —</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                —
              </h1>

              <p className="text-xs text-[#94A3B8]">
                Risk information will appear once connected to the risk service.
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4 text-[#94A3B8]" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Matrix Section */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardHeader className="pb-3 border-b border-[#263247]/60">
          <CardTitle className="text-sm">Risk Assessment Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RiskProbabilityImpact probability="—" impact="—" />
            <RiskScoreIndicator score="—" />
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Target Resolution</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">—</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Details, Mitigation, AI Intelligence */}
        <div className="lg:col-span-7 space-y-6">
          <RiskDetailsPanel />
          <RiskMitigationPlan />
          <AIRiskInsight />
          <AIRiskSuggestions />
        </div>

        {/* Right Column (5 cols): Owner, Actions, Activity Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <RiskOwnerPanel />
          <RiskQuickActions
            onEditRisk={() => setIsEditModalOpen(true)}
          />
          <RiskTimeline />
        </div>
      </div>

      {/* Edit/Create Risk Modal */}
      <CreateRiskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

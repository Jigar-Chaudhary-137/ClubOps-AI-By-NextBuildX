import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Sparkles,
  LayoutGrid,
  List,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  RiskList,
  CreateRiskModal,
  AIRiskInsight,
  AIRiskSuggestions
} from '../../components/risks';

const severityFilterOptions = [
  { value: 'all', label: 'All Severity' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

const statusFilterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Open', label: 'Open' },
  { value: 'Monitoring', label: 'Monitoring' },
  { value: 'Mitigated', label: 'Mitigated' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Closed', label: 'Closed' }
];

const categoryFilterOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'People', label: 'People' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Financial', label: 'Financial' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Venue', label: 'Venue' },
  { value: 'Security', label: 'Security' },
  { value: 'Other', label: 'Other' }
];

const eventFilterOptions = [
  { value: 'all', label: 'All Events' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest Risk' },
  { value: 'lowest', label: 'Lowest Risk' },
  { value: 'updated', label: 'Recently Updated' }
];

export default function RisksPage() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [notice, setNotice] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Since backend is not connected yet, risks list is empty
  const risks = [];

  const handleAnalyzeRisks = () => {
    setNotice('AI risk analysis will be available once the backend AI service is connected.');
    setTimeout(() => setNotice(null), 5000);
  };

  const handleViewRisk = (id) => {
    navigate(`/risks/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Risk Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Identify, assess, and manage operational risks across your club events.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ai"
            size="sm"
            onClick={handleAnalyzeRisks}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Analyze Risks
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Risk
          </Button>
        </div>
      </div>

      {/* Integration Notice */}
      {notice && (
        <div className="p-3.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">AI Risk Analysis:</span> {notice}
          </div>
        </div>
      )}

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Total Risks</span>
              <AlertTriangle className="w-4 h-4 text-[#818CF8]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">—</p>
            <p className="text-[11px] text-[#64748B]">Available after risks are connected.</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">High Risk</span>
              <AlertOctagon className="w-4 h-4 text-[#F87171]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">—</p>
            <p className="text-[11px] text-[#64748B]">High-severity risks requiring attention.</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Open Risks</span>
              <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">—</p>
            <p className="text-[11px] text-[#64748B]">Risks currently being tracked.</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Mitigation Progress</span>
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">—</p>
            <p className="text-[11px] text-[#64748B]">Available after risk data is connected.</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Risk Intelligence Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIRiskInsight />
        <AIRiskSuggestions />
      </div>

      {/* Risk Filter Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search risks..."
                leftIcon={<Search className="w-4 h-4 text-[#94A3B8]" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-32">
                <Select
                  options={severityFilterOptions}
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-32">
                <Select
                  options={statusFilterOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  options={categoryFilterOptions}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-32">
                <Select
                  options={eventFilterOptions}
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>

              {/* Grid / List Switcher */}
              <div className="flex items-center p-1 rounded-lg bg-[#111827] border border-[#263247]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#151D2E] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="List view"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[#151D2E] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk List / Grid (renders empty state when risks = []) */}
      <RiskList
        risks={risks}
        viewMode={viewMode}
        onViewRisk={handleViewRisk}
        onCreateRisk={() => setIsCreateModalOpen(true)}
        onAnalyzeRisks={handleAnalyzeRisks}
      />

      {/* Create Risk Modal */}
      <CreateRiskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

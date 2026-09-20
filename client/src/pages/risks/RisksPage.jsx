import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  AlertCircle,
  RefreshCw
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
import { getRisks, analyzeRisk, analyzeAllRisks } from '../../services/api/risks';
import { getEvents } from '../../services/api/events';

const severityFilterOptions = [
  { value: 'all', label: 'All Severity' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

const statusFilterOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'identified', label: 'Identified / Open' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'mitigating', label: 'Mitigating' },
  { value: 'mitigated', label: 'Mitigated' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'resolved', label: 'Resolved' }
];

const categoryFilterOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'people', label: 'People' },
  { value: 'technical', label: 'Technical' },
  { value: 'financial', label: 'Financial' },
  { value: 'budget', label: 'Budget' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'communication', label: 'Communication' },
  { value: 'venue', label: 'Venue' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest Risk' },
  { value: 'lowest', label: 'Lowest Risk' },
  { value: 'updated', label: 'Recently Updated' }
];

const severityWeights = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export default function RisksPage() {
  const navigate = useNavigate();
  const [risks, setRisks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load real risks & events from MongoDB
  const fetchRiskData = useCallback(async () => {
    try {
      setLoading(true);
      const [risksRes, eventsRes] = await Promise.all([
        getRisks(),
        getEvents().catch(() => ({ data: [] }))
      ]);

      const rawRisks = Array.isArray(risksRes?.data) ? risksRes.data : [];
      const normalizedRisks = rawRisks.map((r) => {
        const rawSev = (r.severity || 'medium').toLowerCase();
        const rawStat = (r.status || 'identified').toLowerCase();
        const rawProb = (r.probability || 'medium').toLowerCase();
        const rawImpact = (r.impact || (['critical', 'high'].includes(rawSev) ? 'high' : rawSev === 'medium' ? 'medium' : 'low')).toLowerCase();

        const pWeight = rawProb === 'high' ? 3 : rawProb === 'medium' ? 2 : 1;
        const iWeight = rawImpact === 'high' ? 3 : rawImpact === 'medium' ? 2 : 1;
        const score = r.riskScore || (pWeight * iWeight);

        return {
          id: r._id || r.id,
          _id: r._id || r.id,
          title: r.title || 'Untitled Risk',
          description: r.description || '',
          severity: rawSev.charAt(0).toUpperCase() + rawSev.slice(1),
          rawSeverity: rawSev,
          status: rawStat.charAt(0).toUpperCase() + rawStat.slice(1),
          rawStatus: rawStat,
          category: r.category ? r.category.charAt(0).toUpperCase() + r.category.slice(1) : 'Logistics',
          rawCategory: (r.category || 'logistics').toLowerCase(),
          event: r.event?.title || (typeof r.event === 'string' ? r.event : 'General'),
          eventId: r.event?._id || (typeof r.event === 'string' ? r.event : null),
          owner: r.owner?.name || (typeof r.owner === 'string' ? r.owner : 'Unassigned'),
          probability: rawProb.charAt(0).toUpperCase() + rawProb.slice(1),
          impact: rawImpact.charAt(0).toUpperCase() + rawImpact.slice(1),
          riskScore: score,
          mitigationPlan: r.mitigationPlan || '',
          mitigationProgress: ['mitigated', 'resolved', 'closed'].includes(rawStat)
            ? '100%'
            : r.mitigationPlan
              ? 'In Progress'
              : 'Pending',
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Recently',
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          aiIdentified: Boolean(r.aiDetected),
          raw: r
        };
      });

      setRisks(normalizedRisks);

      const rawEvents = Array.isArray(eventsRes?.data) ? eventsRes.data : [];
      setEvents(rawEvents);
    } catch (err) {
      console.error('Failed to load risk registry data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  // Handle live AI Risk Analysis
  const handleAnalyzeRisks = async () => {
    setIsAnalyzing(true);
    setAiError(null);
    setNotice('AI is analyzing your club risks...');

    try {
      // Find event to analyze: either selected event filter, or first event, or 'all'
      let targetEventId = 'all';
      if (eventFilter !== 'all') {
        targetEventId = eventFilter;
      } else if (events.length > 0) {
        targetEventId = events[0]._id || events[0].id || 'all';
      }

      const res = await analyzeRisk(targetEventId);
      if (res?.data) {
        setAiAnalysis(res.data);
        setNotice('AI Risk Analysis is available for the current club risks.');
      } else {
        setNotice('AI Risk Analysis is available for the current club risks.');
      }
    } catch (err) {
      console.error('AI risk analysis failed:', err);
      const errMsg = 'Unable to analyze risks right now. Please try again.';
      setAiError(errMsg);
      setNotice(errMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewRisk = (id) => {
    navigate(`/risks/${id}`);
  };

  // Derive event filter options from loaded events
  const eventFilterOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Events' },
      ...events.map((e) => ({
        value: e._id || e.id,
        label: e.title || e.name || 'Event'
      }))
    ];
  }, [events]);

  // Derive real statistics from backend risk items
  const stats = useMemo(() => {
    const total = risks.length;
    const high = risks.filter((r) => ['high', 'critical'].includes(r.rawSeverity)).length;
    const open = risks.filter((r) => !['mitigated', 'resolved', 'closed', 'accepted'].includes(r.rawStatus)).length;
    const mitigated = risks.filter((r) => ['mitigated', 'resolved', 'closed'].includes(r.rawStatus)).length;
    const progressPct = total > 0 ? Math.round((mitigated / total) * 100) : 0;

    return {
      total,
      high,
      open,
      mitigated,
      progressPct
    };
  }, [risks]);

  // Filter & Sort risks
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesDesc = r.description.toLowerCase().includes(query);
        const matchesCategory = r.category.toLowerCase().includes(query);
        const matchesEvent = r.event.toLowerCase().includes(query);
        const matchesOwner = r.owner.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesEvent && !matchesOwner) {
          return false;
        }
      }

      // Severity filter
      if (severityFilter !== 'all' && r.rawSeverity !== severityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'identified' && !['identified', 'open'].includes(r.rawStatus)) {
          return false;
        }
        if (statusFilter !== 'identified' && r.rawStatus !== statusFilter) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'all' && r.rawCategory !== categoryFilter) {
        return false;
      }

      // Event filter
      if (eventFilter !== 'all' && r.eventId !== eventFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'highest') return (b.riskScore || 0) - (a.riskScore || 0);
      if (sortBy === 'lowest') return (a.riskScore || 0) - (b.riskScore || 0);
      if (sortBy === 'updated') return b.createdAt - a.createdAt;
      return 0;
    });
  }, [risks, searchQuery, severityFilter, statusFilter, categoryFilter, eventFilter, sortBy]);

  // Format AI suggestions
  const aiSuggestions = useMemo(() => {
    if (aiAnalysis?.risks && Array.isArray(aiAnalysis.risks) && aiAnalysis.risks.length > 0) {
      return aiAnalysis.risks.map((r) => ({
        title: r.title,
        description: r.mitigationPlan || r.description || r.reasoning,
        type: (r.severity ? r.severity.toUpperCase() : 'COUNTERMEASURE'),
        severity: r.severity
      }));
    }
    return [];
  }, [aiAnalysis]);

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
            isLoading={isAnalyzing}
            leftIcon={!isAnalyzing ? <Sparkles className="w-3.5 h-3.5" /> : null}
          >
            {isAnalyzing ? 'Analyzing Risks...' : 'Analyze Risks'}
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

      {/* Live AI Risk Analysis Banner */}
      {notice && (
        <div className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 animate-fadeIn ${
          aiError
            ? 'bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171]'
            : isAnalyzing
              ? 'bg-[#6366F1]/15 border border-[#6366F1]/40 text-[#818CF8]'
              : 'bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#818CF8]'
        }`}>
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin text-[#818CF8]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">
            <span className="font-semibold text-white">AI Risk Analysis:</span> {notice}
          </div>
        </div>
      )}

      {/* Real Risk Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Total Risks</span>
              <AlertTriangle className="w-4 h-4 text-[#818CF8]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">
              {loading ? '...' : stats.total}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {stats.total === 1 ? '1 active risk record tracked.' : `${stats.total} risk records tracked.`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">High Risk</span>
              <AlertOctagon className="w-4 h-4 text-[#F87171]" />
            </div>
            <p className="text-xl font-bold text-rose-400 font-mono">
              {loading ? '...' : stats.high}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {stats.high === 1 ? '1 high/critical risk requiring attention.' : `${stats.high} high/critical risks requiring attention.`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Open Risks</span>
              <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <p className="text-xl font-bold text-amber-300 font-mono">
              {loading ? '...' : stats.open}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {stats.open === 1 ? '1 risk currently being tracked.' : `${stats.open} risks currently being tracked.`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Mitigation Progress</span>
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <p className="text-xl font-bold text-[#4ADE80] font-mono">
              {loading ? '...' : `${stats.progressPct}%`}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {stats.total > 0 ? `${stats.mitigated} of ${stats.total} risks resolved/mitigated.` : 'No active risks logged.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Risk Intelligence Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIRiskInsight
          onAnalyze={handleAnalyzeRisks}
          isAnalyzing={isAnalyzing}
          analysisData={aiAnalysis}
          error={aiError}
        />
        <AIRiskSuggestions suggestions={aiSuggestions} />
      </div>

      {/* Risk Filter Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search risks by title, owner, category, or event..."
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

              <div className="w-full sm:w-36">
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

              <div className="w-full sm:w-36">
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

      {/* Risk List / Grid */}
      <RiskList
        risks={filteredRisks}
        viewMode={viewMode}
        onViewRisk={handleViewRisk}
        onCreateRisk={() => setIsCreateModalOpen(true)}
        onAnalyzeRisks={handleAnalyzeRisks}
      />

      {/* Create Risk Modal */}
      <CreateRiskModal
        isOpen={isCreateModalOpen}
        events={events}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={async (payload) => {
          await fetchRiskData();
        }}
      />
    </div>
  );
}

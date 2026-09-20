import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Tag,
  User,
  Calendar,
  Clock,
  Edit,
  Trash2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  RiskSeverityBadge,
  RiskStatusBadge,
  CreateRiskModal
} from '../../components/risks';
import { getRiskById, updateRiskStatus, deleteRisk } from '../../services/api/risks';

export default function RiskDetailsPage() {
  const { riskId } = useParams();
  const navigate = useNavigate();
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadRisk() {
      if (!riskId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getRiskById(riskId);
        if (res?.data) {
          setRisk(res.data);
        }
      } catch (err) {
        console.error('Error fetching risk details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load risk details');
      } finally {
        setLoading(false);
      }
    }
    loadRisk();
  }, [riskId]);

  const handleStatusToggle = async () => {
    const newStatus = risk.status === 'open' ? 'mitigated' : 'open';
    try {
      setUpdating(true);
      const res = await updateRiskStatus(riskId, newStatus);
      if (res?.data) {
        setRisk(res.data);
      }
    } catch (err) {
      console.error('Failed to update risk status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this risk record?')) return;
    try {
      await deleteRisk(riskId);
      navigate('/risks');
    } catch (err) {
      console.error('Failed to delete risk:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading risk radar analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !risk) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-4">
        <Link to="/risks" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Risks
        </Link>
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">Risk Not Found</h3>
            <p className="text-xs text-rose-200">{error || 'The requested risk record does not exist in the database.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskScore = risk.riskScore || (
    (risk.probability === 'high' ? 3 : risk.probability === 'medium' ? 2 : 1) *
    (risk.impact === 'high' ? 3 : risk.impact === 'medium' ? 2 : 1)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
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
          <Badge variant="neutral">ID: #{risk._id ? risk._id.substring(0, 8) : riskId}</Badge>
          <Badge variant="primary" dot>MongoDB Connected</Badge>
        </div>
      </div>

      {/* Header Card */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <RiskSeverityBadge severity={risk.severity || 'Medium'} size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <RiskStatusBadge status={risk.status || 'Open'} size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Category: {risk.category || 'Logistics'}</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {risk.title}
              </h1>

              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                {risk.description || 'Operational risk assessed by ClubOps AI.'}
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Button
                variant={risk.status === 'open' ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                disabled={updating}
                onClick={handleStatusToggle}
              >
                {risk.status === 'open' ? 'Mark Mitigated' : 'Reopen Risk'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleDelete}
              >
                Delete
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
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Probability & Impact</span>
              </div>
              <p className="text-sm font-semibold text-white capitalize">
                {risk.probability || 'Medium'} &bull; {risk.impact || 'Medium'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F87171]" />
                <span>Calculated Risk Score</span>
              </div>
              <p className="text-sm font-semibold text-rose-400 font-mono">
                {riskScore} / 9
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Assessed Date</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">
                {risk.createdAt ? new Date(risk.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          {/* Mitigation Strategy */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-1.5">
            <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Mitigation Action Plan
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {risk.mitigationPlan || 'No explicit mitigation steps submitted. Consult Gemini Operations Agent for automated contingency suggestions.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Risk Modal */}
      <CreateRiskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

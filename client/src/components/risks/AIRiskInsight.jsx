import React from 'react';
import { Sparkles, AlertCircle, ShieldAlert, Cpu, CheckCircle2, RefreshCw, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function AIRiskInsight({
  onAnalyze,
  isAnalyzing = false,
  analysisData = null,
  error = null,
  notice = null,
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] shadow-lg relative overflow-hidden ${className}`}>
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EF4444]" />

      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CardTitle>AI Risk Intelligence</CardTitle>
            <Badge variant="ai" size="sm">Operational Guardrail</Badge>
          </div>
          <CardDescription>
            Continuous detection of timeline compression, resource bottlenecks, and operational variance.
          </CardDescription>
        </div>

        <Button
          variant="ai"
          size="sm"
          onClick={onAnalyze}
          isLoading={isAnalyzing}
          leftIcon={!isAnalyzing ? <Sparkles className="w-3.5 h-3.5" /> : null}
        >
          {isAnalyzing ? 'Analyzing Risks...' : 'Analyze with AI'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Notice Banner */}
        {notice && (
          <div className="p-3.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">AI Analysis:</span> {notice}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#F87171] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Analysis Error:</span> {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="p-6 rounded-xl bg-[#111827] border border-[#263247] flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#818CF8] animate-spin" />
            <div>
              <p className="text-xs font-semibold text-white">AI is analyzing your club risks...</p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Evaluating task deadlines, volunteer capacities, and operational dependencies.</p>
            </div>
          </div>
        )}

        {/* Active AI Analysis Results */}
        {!isAnalyzing && analysisData && (
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Cpu className="w-4 h-4 text-[#818CF8]" />
                <span>Executive Assessment Summary</span>
              </div>
              {analysisData.overallRiskLevel && (
                <Badge
                  variant={analysisData.overallRiskLevel === 'high' || analysisData.overallRiskLevel === 'critical' ? 'danger' : 'warning'}
                  size="sm"
                >
                  Risk Level: {analysisData.overallRiskLevel.toUpperCase()}
                </Badge>
              )}
            </div>

            <p className="text-xs text-white leading-relaxed font-medium">
              {analysisData.summary}
            </p>

            {analysisData.analysisMetadata && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#263247]/60 text-[11px]">
                <div className="p-2 rounded bg-[#151D2E] border border-[#263247]">
                  <span className="text-[#94A3B8] block">Tasks Evaluated</span>
                  <span className="font-bold text-white font-mono">{analysisData.analysisMetadata.tasksAnalyzed ?? 0}</span>
                </div>
                <div className="p-2 rounded bg-[#151D2E] border border-[#263247]">
                  <span className="text-[#94A3B8] block">Volunteers Evaluated</span>
                  <span className="font-bold text-white font-mono">{analysisData.analysisMetadata.volunteersAnalyzed ?? 0}</span>
                </div>
                <div className="p-2 rounded bg-[#151D2E] border border-[#263247] col-span-2 sm:col-span-1">
                  <span className="text-[#94A3B8] block">Identified Factors</span>
                  <span className="font-bold text-[#818CF8] font-mono">{analysisData.risks?.length ?? 0}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default / Ready State (when no analysis has been executed yet) */}
        {!isAnalyzing && !analysisData && (
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Cpu className="w-4 h-4 text-[#818CF8]" />
              <span>Automated AI Risk Intelligence</span>
            </div>

            <p className="text-xs text-[#94A3B8]">
              ClubOps AI continuously evaluates:
            </p>

            <ul className="space-y-1.5 text-xs text-[#94A3B8] pl-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span>Potential operational risks and deadline collisions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span>Severity indicators and impact forecasting</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span>Affected event areas, venues, and logistics</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span>Recommended proactive mitigation actions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span>Related tasks, volunteer assignments, and resource dependencies</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

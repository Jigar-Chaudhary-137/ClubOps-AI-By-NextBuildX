import React from 'react';
import { Sparkles, Send, Terminal, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { AIBadge, AIIcon, AIInsightCard, AIActionSuggestion } from '../../components/ai';

export default function AIAssistantPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AI Event Operations Agent
            </h1>
            <AIBadge>Action-Oriented Assistant</AIBadge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Deeply integrated agent capable of executing operational mutations inside your club workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" dot>Agent Ready</Badge>
        </div>
      </div>

      {/* AI Tool-Execution Architecture Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AIInsightCard
          title="Direct Application Actions"
          subtitle="Beyond standard chat responses"
          badgeText="Differentiator"
        >
          Unlike passive chat models, the ClubOps AI Agent can translate organizer instructions directly into system actions: creating tasks, allocating volunteers, triggering risk re-evaluations, and modifying deadlines.
        </AIInsightCard>

        <AIInsightCard
          title="RAG-Grounded Answers"
          subtitle="Grounded in your club policies"
          badgeText="Knowledge Base"
        >
          Queries regarding venue guidelines, sponsorship deliverables, and club constitution are answered using semantic retrieval from your uploaded documentation.
        </AIInsightCard>
      </div>

      {/* Action Proposal Foundation Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            Action Proposal Architecture Preview
          </h3>
          <span className="text-xs text-[#94A3B8]">Foundation Component</span>
        </div>

        {/* Visual demo of AIActionSuggestion primitive without fake business data */}
        <AIActionSuggestion
          actionName="Sample Agent Action Container"
          description="Demonstration of the action proposal UI. When the Gemini model invokes tool calling in later stages, executable proposals will be rendered in this container for organizer confirmation."
          payloadSummary='{"action": "create_task", "title": "Venue Confirmation", "priority": "high"}'
        />
      </div>

      {/* Interactive Command Input Foundation */}
      <Card className="border-[#8B5CF6]/30 shadow-xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 bg-[#111827] border border-[#263247] rounded-xl p-2.5 focus-within:border-[#8B5CF6] focus-within:ring-1 focus-within:ring-[#8B5CF6] transition-all">
            <AIIcon size="sm" />
            <input
              type="text"
              placeholder="e.g. 'Create a high-priority task for sound system check and assign to Rahul'..."
              disabled
              className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none cursor-not-allowed"
            />
            <Button
              variant="ai"
              size="sm"
              disabled
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2.5 px-1">
            <span>AI agent execution engine will be wired to Gemini API in backend phases.</span>
            <span className="hidden sm:inline">Press Enter to prompt</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

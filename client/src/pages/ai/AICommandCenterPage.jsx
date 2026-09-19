import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Database,
  Search,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Info,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import {
  AIBadge,
  AIIcon,
  AICommandBar,
  AIConversation,
  AIPromptSuggestions,
  AIContextSelector,
  AIActionCard,
  AIActionConfirmation,
  AIExecutionStatus,
  AIOperationsSummary,
  AIKnowledgeSources,
  AIActivityTimeline,
  AIToolStatus,
} from '../../components/ai';
import { aiService } from '../../services/api/ai';
import { createTask } from '../../services/api/tasks';
import { createRisk } from '../../services/api/risks';
import { createAnnouncement } from '../../services/api/announcements';

export default function AICommandCenterPage() {
  const [selectedContext, setSelectedContext] = useState('all');
  const [conversationMessages, setConversationMessages] = useState([]);
  const [executionState, setExecutionState] = useState('ready');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [stagedAction, setStagedAction] = useState(null);
  const [globalNotice, setGlobalNotice] = useState(null);
  const [apiError, setApiError] = useState(null);

  const contextLabelMap = {
    all: 'All Club Data',
    events: 'Events',
    tasks: 'Tasks',
    volunteers: 'Volunteers',
    meetings: 'Meetings',
    documents: 'Documents',
    risks: 'Risks',
    announcements: 'Announcements',
  };

  const handleCommandSubmit = async (promptText) => {
    if (!promptText || !promptText.trim()) return;
    setApiError(null);

    // 1. Append User Message
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...conversationMessages, userMsg];
    setConversationMessages(updatedHistory);
    setExecutionState('thinking');

    try {
      // Prepare backend payload for /api/ai/agent/chat
      const chatHistory = conversationMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        content: m.content,
      }));

      const payload = {
        message: promptText.trim(),
        chatHistory,
        eventId: selectedContext !== 'all' ? selectedContext : null,
        dryRun: true,
      };

      const res = await aiService.chatWithAgent(payload.message, chatHistory, {
        eventId: payload.eventId,
        context: selectedContext,
      });

      const responseData = res?.data || res || {};

      // Build AI message
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: responseData.reply || responseData.content || responseData.message || 'Operational agent analysis complete.',
        sources: responseData.sources || responseData.citations || [],
        actionProposal: responseData.actionProposal || null,
        timestamp: new Date().toISOString(),
      };

      setConversationMessages((prev) => [...prev, aiMsg]);

      // Handle Action Proposal if generated
      if (responseData.actionProposal) {
        const proposal = {
          actionType: responseData.actionProposal.actionType || 'Execute Mutation',
          title: responseData.actionProposal.title || responseData.actionProposal.description || promptText,
          details: responseData.actionProposal.details || responseData.actionProposal.params ? JSON.stringify(responseData.actionProposal.params) : 'Parameters pending authorization',
          target: responseData.actionProposal.targetModule || 'Club Workspace',
          rawProposal: responseData.actionProposal,
        };
        setStagedAction(proposal);
        setExecutionState('waiting_confirmation');
      } else {
        setExecutionState('ready');
      }
    } catch (err) {
      console.error('AI agent chat error:', err);
      setExecutionState('failed');
      const errorMsg = err.response?.data?.message || err.message || 'AI agent request failed';
      setApiError(errorMsg);

      const errAiMsg = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `Operational Warning: ${errorMsg}. Please try rephrasing your request or adjusting your context scope.`,
        timestamp: new Date().toISOString(),
      };
      setConversationMessages((prev) => [...prev, errAiMsg]);
    }
  };

  const handleSelectPrompt = (promptText) => {
    handleCommandSubmit(promptText);
  };

  const handleReviewAction = (action) => {
    setStagedAction(action);
    setIsConfirmationOpen(true);
  };

  const handleExecuteConfirmedAction = async (actionToExecute) => {
    setExecutionState('executing');
    try {
      // 1. Direct module execution based on actionType
      const typeStr = (actionToExecute.actionType || '').toLowerCase();
      
      if (typeStr.includes('task')) {
        await createTask({
          title: actionToExecute.title,
          description: `Created via AI Command Center execution`,
          priority: 'medium',
        });
      } else if (typeStr.includes('risk')) {
        await createRisk({
          title: actionToExecute.title,
          category: 'operational',
          severity: 'medium',
        });
      } else if (typeStr.includes('announcement')) {
        await createAnnouncement({
          title: actionToExecute.title,
          content: actionToExecute.details || actionToExecute.title,
        });
      } else {
        // Fallback to agent tool execution
        await aiService.chatWithAgent(
          `Execute confirmed action: ${actionToExecute.title}`,
          [],
          { dryRun: false }
        );
      }

      setExecutionState('completed');
      setGlobalNotice(`Successfully executed action: "${actionToExecute.title}"`);
      setTimeout(() => setGlobalNotice(null), 5000);

      // Append system execution message to conversation
      const sysMsg = {
        id: `sys-${Date.now()}`,
        role: 'assistant',
        content: `✅ Action Executed: "${actionToExecute.title}" has been successfully created and recorded in the club workspace.`,
        timestamp: new Date().toISOString(),
      };
      setConversationMessages((prev) => [...prev, sysMsg]);
    } catch (err) {
      setExecutionState('failed');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AI Command Center
            </h1>
            <AIBadge>Operations Console</AIBadge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Understand your club operations, search your knowledge, and turn insights into actions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Human-in-the-Loop Enforced</span>
          </span>
        </div>
      </div>

      {/* Global Status Banner if triggered */}
      {globalNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Console Notice: </span>
            {globalNotice}
          </div>
        </div>
      )}

      {apiError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">API Error: </span>
            {apiError}
          </div>
        </div>
      )}

      {/* Connected Club Knowledge Visual Pipeline */}
      <Card className="border-[#263247] bg-gradient-to-r from-[#111827] via-[#151D2E] to-[#111827]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                Connected Club Knowledge Base
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                ClubOps AI uses uploaded club documents, meeting transcripts, events, tasks, and announcements to synthesize context-aware answers.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 self-start md:self-auto">
              Live RAG Engine
            </span>
          </div>

          {/* Visual Step Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-[#263247]/60">
            {[
              { step: '01', title: 'Club Data', desc: 'Docs, Meetings, Events' },
              { step: '02', title: 'Knowledge Processing', desc: 'Chunking & Embeddings' },
              { step: '03', title: 'Context Retrieval', desc: 'Semantic Vector Match' },
              { step: '04', title: 'AI Reasoning', desc: 'Cross-Module Synthesis' },
              { step: '05', title: 'Answer / Action', desc: 'Validated Human Review' },
            ].map((st, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-[#0B1020]/60 border border-[#263247] relative group"
              >
                <span className="text-[10px] font-mono text-indigo-400 block font-semibold">
                  {st.step}
                </span>
                <span className="text-xs font-medium text-white block mt-0.5 truncate">
                  {st.title}
                </span>
                <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                  {st.desc}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout (Main workspace + Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Command Input Foundation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <AIContextSelector
                selectedContext={selectedContext}
                onSelectContext={setSelectedContext}
              />
              <span className="text-[11px] text-gray-400 hidden sm:inline">
                Scope: {contextLabelMap[selectedContext] || 'All Club Data'}
              </span>
            </div>

            <AICommandBar
              onSubmit={handleCommandSubmit}
              selectedContext={contextLabelMap[selectedContext] || 'All Club Data'}
              disabled={executionState === 'thinking'}
            />
          </div>

          {/* Starter Operational Prompt Suggestions */}
          <AIPromptSuggestions onSelectPrompt={handleSelectPrompt} />

          {/* Conversation History / Empty State Area */}
          <AIConversation
            messages={conversationMessages}
            onPromptClick={handleCommandSubmit}
            onExploreSuggestions={() => {
              handleCommandSubmit('What operational risks need attention across our active events?');
            }}
          />

          {/* Action Proposal Foundation Card */}
          {stagedAction && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    AI Action Proposal
                  </h3>
                  <p className="text-xs text-gray-400">
                    Review AI-suggested actions before they modify your club workspace.
                  </p>
                </div>
                <span className="text-[10px] text-purple-400 font-mono">Tool Call Ready</span>
              </div>

              <AIActionCard
                action={stagedAction}
                onReview={handleReviewAction}
              />
            </div>
          )}

          {/* Security & Trust Banner */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] flex items-start space-x-3 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-gray-200 font-medium">Safe Operational Execution</p>
              <p className="text-[11px] leading-relaxed">
                ClubOps AI is designed as a supervised co-pilot. Informational questions are answered with grounded references, while actions that modify club data will always require explicit confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (1 col on desktop) */}
        <div className="space-y-6">
          {/* AI Execution Status Badge */}
          <AIExecutionStatus status={executionState} />

          {/* AI Operations Summary Panel */}
          <AIOperationsSummary />

          {/* Connected Knowledge Sources */}
          <AIKnowledgeSources />

          {/* AI Tool Capabilities Status */}
          <AIToolStatus />

          {/* AI Activity Timeline Log */}
          <AIActivityTimeline />
        </div>
      </div>

      {/* Confirmation Dialog for Human-in-the-Loop Safe Execution */}
      <AIActionConfirmation
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleExecuteConfirmedAction}
        action={stagedAction || undefined}
      />
    </div>
  );
}

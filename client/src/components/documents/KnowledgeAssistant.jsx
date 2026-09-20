import React, { useState } from 'react';
import { Sparkles, MessageSquare, AlertCircle, ArrowRight, BookOpen, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const suggestedQuestions = [
  'What should volunteers do before their shift?',
  'What are the common event risks?',
  'What are our event guidelines?',
  'What responsibilities are assigned to organizers?'
];

export default function KnowledgeAssistant({
  onAsk,
  isLoading = false,
  answerData = null,
  error = null,
  className = ''
}) {
  const [question, setQuestion] = useState('');
  const [notice, setNotice] = useState(null);

  const handleAsk = (queryText) => {
    const textToAsk = queryText || question;
    if (!textToAsk.trim()) return;
    onAsk?.(textToAsk);
  };

  const handleSuggestionClick = (q) => {
    setQuestion(q);
    handleAsk(q);
  };

  return (
    <Card className={`border-[#263247] bg-[#151D2E] shadow-lg relative overflow-hidden ${className}`}>
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#22C55E]" />

      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Ask ClubOps AI</CardTitle>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI Knowledge Assistant</span>
          </span>
        </div>
        <CardDescription>
          Ask questions about your club's documents and operational knowledge.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input & Ask Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <div className="flex-1">
            <Input
              placeholder="Ask a question about club guidelines, policies..."
              leftIcon={<MessageSquare className="w-4 h-4 text-[#818CF8]" />}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            variant="ai"
            size="md"
            isLoading={isLoading}
            leftIcon={!isLoading ? <Sparkles className="w-4 h-4" /> : null}
          >
            {isLoading ? 'Synthesizing...' : 'Ask AI'}
          </Button>
        </form>

        {/* Suggested Questions */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-[#94A3B8]">
            Suggested queries:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(q)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#151D2E] border border-[#263247] hover:border-[#8B5CF6]/40 text-[#94A3B8] hover:text-white transition-all text-left flex items-center gap-1.5"
              >
                <span>{q}</span>
                <ArrowRight className="w-3 h-3 text-[#64748B]" />
              </button>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] flex items-center gap-3 text-xs text-[#818CF8]">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>Retrieving indexed context chunks and synthesizing grounded answer...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#F87171] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Query Error:</span> {error}
            </div>
          </div>
        )}

        {/* Live Answer Card with Citations */}
        {answerData && !isLoading && (
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <BookOpen className="w-4 h-4 text-[#818CF8]" />
                <span>Grounded RAG Answer</span>
              </div>
              {answerData.citations?.length > 0 && (
                <Badge variant="ai" size="sm">
                  {answerData.citations.length} Source{answerData.citations.length > 1 ? 's' : ''} Cited
                </Badge>
              )}
            </div>

            <div className="text-xs text-white leading-relaxed whitespace-pre-wrap bg-[#151D2E]/80 p-3 rounded-lg border border-[#263247]">
              {answerData.answer}
            </div>

            {/* Citations List */}
            {answerData.citations && answerData.citations.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-[#263247]/60">
                <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Source Citations
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {answerData.citations.map((cite, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#151D2E] border border-[#263247] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-[#818CF8] shrink-0" />
                        <span className="text-white font-medium truncate">
                          {cite.documentTitle || cite.documentName || 'Club Document'}
                        </span>
                      </div>
                      {cite.similarity !== undefined && (
                        <span className="text-[10px] font-mono text-[#4ADE80] bg-[#22C55E]/10 px-1.5 py-0.5 rounded ml-2 shrink-0">
                          {(cite.similarity * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

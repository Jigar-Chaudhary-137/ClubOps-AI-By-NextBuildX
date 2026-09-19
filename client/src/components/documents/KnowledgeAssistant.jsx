import React, { useState } from 'react';
import { Sparkles, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

const suggestedQuestions = [
  'What are our event guidelines?',
  "What is the club's registration process?",
  'What responsibilities are assigned to organizers?'
];

export default function KnowledgeAssistant({
  onAsk,
  className = ''
}) {
  const [question, setQuestion] = useState('');
  const [notice, setNotice] = useState(null);

  const handleAsk = (queryText) => {
    const textToAsk = queryText || question;
    if (!textToAsk.trim()) return;
    setNotice('AI knowledge assistance will be available after RAG integration.');
    setTimeout(() => setNotice(null), 4500);
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
              placeholder="Ask a question..."
              leftIcon={<MessageSquare className="w-4 h-4 text-[#818CF8]" />}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="ai"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Ask AI
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
                className="text-xs px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#151D2E] border border-[#263247] hover:border-[#8B5CF6]/40 text-[#94A3B8] hover:text-white transition-all text-left flex items-center gap-1.5"
              >
                <span>{q}</span>
                <ArrowRight className="w-3 h-3 text-[#64748B]" />
              </button>
            ))}
          </div>
        </div>

        {/* Integration Notification */}
        {notice && (
          <div className="p-3.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white">Notice:</span> {notice}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

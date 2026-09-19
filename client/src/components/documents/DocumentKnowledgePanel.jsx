import React from 'react';
import { Sparkles, UploadCloud, Cpu, Database, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';

const lifecycleSteps = [
  {
    step: 1,
    title: 'Uploaded',
    description: 'Raw document received in repository',
    icon: <UploadCloud className="w-4 h-4 text-[#818CF8]" />
  },
  {
    step: 2,
    title: 'Processing',
    description: 'Text extraction & semantic chunking',
    icon: <Cpu className="w-4 h-4 text-[#818CF8]" />
  },
  {
    step: 3,
    title: 'Indexed',
    description: 'Vector embeddings created & stored',
    icon: <Database className="w-4 h-4 text-[#A78BFA]" />
  },
  {
    step: 4,
    title: 'Available to AI',
    description: 'Ready for real-time RAG context retrieval',
    icon: <Sparkles className="w-4 h-4 text-[#4ADE80]" />
  }
];

export default function DocumentKnowledgePanel({
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] shadow-lg relative overflow-hidden ${className}`}>
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#22C55E]" />

      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Club Knowledge</CardTitle>
          <Badge variant="ai" size="sm">RAG Lifecycle</Badge>
        </div>
        <CardDescription>
          This document can become part of the knowledge used by ClubOps AI.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visual Workflow Steps */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
            Indexing Pipeline
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {lifecycleSteps.map((s, idx) => (
              <div
                key={s.step}
                className="p-3.5 rounded-xl bg-[#111827] border border-[#263247] flex flex-col justify-between space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#151D2E] border border-[#263247] text-[#818CF8] text-xs font-bold font-mono flex items-center justify-center">
                    {s.step}
                  </span>
                  {s.icon}
                </div>

                <div>
                  <p className="text-xs font-semibold text-white">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-normal">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Retrieval Section */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border border-[#8B5CF6]/30 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A78BFA]" />
            <h4 className="text-sm font-semibold text-white">
              AI Retrieval
            </h4>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Once indexed, ClubOps AI can retrieve relevant information from this document when answering questions or assisting with club operations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

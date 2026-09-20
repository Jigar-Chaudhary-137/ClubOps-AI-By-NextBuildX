import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Brain,
  Layers,
  Clock,
  Briefcase,
  History,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { AIBadge, AIIcon } from '../ai';

const criteriaList = [
  {
    title: 'Skill match',
    description: 'Calculates semantic alignment between volunteer skills and task needs',
    icon: Brain,
    color: 'text-[#818CF8]'
  },
  {
    title: 'Availability',
    description: 'Verifies calendar slots, conflict checks, and availability status',
    icon: Clock,
    color: 'text-[#34D399]'
  },
  {
    title: 'Current workload',
    description: 'Balances active tasks across team members to prevent burnout',
    icon: Layers,
    color: 'text-[#FBBF24]'
  },
  {
    title: 'Event responsibility',
    description: 'Matches role requirements (coordinators vs. general logistics)',
    icon: Briefcase,
    color: 'text-[#60A5FA]'
  },
  {
    title: 'Previous assignments',
    description: 'Considers past event experience and historical track record',
    icon: History,
    color: 'text-[#A78BFA]'
  }
];

export default function AIVolunteerAssignment({
  className = '',
  onClose = null
}) {
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindMatches = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 600);
  };

  return (
    <Card
      className={`
        border-[#8B5CF6]/30 bg-gradient-to-b from-[#171A2E]/95 via-[#151D2E] to-[#111827]
        shadow-xl relative overflow-hidden ${className}
      `}
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AIIcon size="md" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">AI Volunteer Assignment</CardTitle>
                <AIBadge size="sm">Smart Allocation</AIBadge>
              </div>
              <CardDescription className="text-xs sm:text-sm mt-0.5 max-w-xl">
                Let ClubOps AI recommend volunteers based on skills, availability, workload, and event requirements.
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ai"
            size="sm"
            onClick={handleFindMatches}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="shrink-0"
          >
            Find Best Matches
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transparent state message when user clicks Find Best Matches */}
        {hasSearched && (
          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#8B5CF6]/30 text-xs text-[#E2E8F0] flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white">AI Assignment Readiness:</span>
              <p className="text-[#94A3B8] leading-relaxed">
                AI recommendations will be available after volunteer and event data are connected.
              </p>
            </div>
          </div>
        )}

        {/* Future Recommendation Criteria */}
        <div>
          <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-2.5">
            Future Recommendation Criteria
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {criteriaList.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-3 rounded-xl bg-[#111827]/70 border border-[#263247] hover:border-[#334155] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="text-xs font-semibold text-white">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] leading-snug">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-[#263247]/60 flex items-center justify-between text-[11px] text-[#64748B]">
          <span>Powered by ClubOps Operations Engine</span>
          <span>Gemini-powered volunteer match engine</span>
        </div>
      </CardContent>
    </Card>
  );
}

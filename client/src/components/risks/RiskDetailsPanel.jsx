import React from 'react';
import { Tag, User, Calendar, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import RiskCategoryBadge from './RiskCategoryBadge';

export default function RiskDetailsPanel({
  description = '—',
  category = '—',
  event = '—',
  owner = '—',
  createdAt = '—',
  updatedAt = '—',
  targetResolutionDate = '—',
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="pb-3 border-b border-[#263247]/60">
        <CardTitle className="text-sm">Risk Details & Context</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Description */}
        <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-1.5">
          <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#818CF8]" />
            <span>Description</span>
          </h4>
          <p className="text-sm text-white leading-relaxed">
            {description}
          </p>
          {description === '—' && (
            <p className="text-xs text-[#94A3B8] italic">
              Risk information will appear once connected to the risk service.
            </p>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
            <span className="text-[#94A3B8] block mb-1">Category</span>
            <span className="font-semibold text-white">{category}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
            <span className="text-[#94A3B8] block mb-1">Linked Event</span>
            <span className="font-semibold text-white">{event}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
            <span className="text-[#94A3B8] block mb-1">Risk Owner</span>
            <span className="font-semibold text-white">{owner}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
            <span className="text-[#94A3B8] block mb-1">Created Date</span>
            <span className="font-semibold text-white font-mono">{createdAt}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
            <span className="text-[#94A3B8] block mb-1">Last Updated</span>
            <span className="font-semibold text-white font-mono">{updatedAt}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
            <span className="text-[#94A3B8] block mb-1">Target Resolution</span>
            <span className="font-semibold text-white font-mono">{targetResolutionDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

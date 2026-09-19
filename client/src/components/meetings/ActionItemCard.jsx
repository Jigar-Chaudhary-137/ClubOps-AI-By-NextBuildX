import React, { useState } from 'react';
import { Sparkles, Calendar, User, CheckSquare, Edit3, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import AIConfidenceBadge from './AIConfidenceBadge';

export default function ActionItemCard({
  item,
  onCreateTask,
  onEdit,
  onDismiss,
  className = ''
}) {
  const [notice, setNotice] = useState(null);

  if (!item) return null;

  const {
    id,
    title = 'Untitled Action Item',
    owner = 'Unassigned',
    deadline = 'No deadline',
    priority = 'Medium',
    confidence = 'Medium'
  } = item;

  const priorityColors = {
    High: 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30',
    Medium: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30',
    Low: 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
  };

  const handleCreateTaskClick = () => {
    setNotice('Task creation will be connected after backend integration.');
    setTimeout(() => setNotice(null), 3500);
    onCreateTask?.(id);
  };

  return (
    <Card className={`border-[#263247] bg-[#111827] hover:border-[#374151] transition-all ${className}`}>
      <CardContent className="p-4 space-y-3">
        {/* Top Header: AI Indicator, Confidence & Priority */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r from-[#6366F1]/15 to-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30">
              <Sparkles className="w-3 h-3 text-[#A78BFA]" />
              <span>AI Suggested</span>
            </span>
            <AIConfidenceBadge confidence={confidence} size="sm" />
          </div>

          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${priorityColors[priority] || priorityColors.Medium}`}>
            {priority} Priority
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-white tracking-tight">
          {title}
        </h4>

        {/* Metadata: Suggested Owner & Deadline */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Owner: <strong className="text-white font-medium">{owner}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Deadline: <strong className="text-white font-medium">{deadline}</strong></span>
          </div>
        </div>

        {/* Integration Notification */}
        {notice && (
          <div className="p-2.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#263247]/60">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
            onClick={handleCreateTaskClick}
          >
            Create Task
          </Button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(id)}
              className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
              title="Edit action item"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDismiss?.(id)}
              className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#F87171] hover:bg-[#1E293B] transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

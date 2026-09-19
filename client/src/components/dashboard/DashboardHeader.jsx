import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../ui/Button';

export default function DashboardHeader() {
  // Format current date cleanly (e.g. "Saturday, Sep 19, 2026")
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Good morning, Organizer
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Here's what's happening across your club operations.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Date context pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151D2E] border border-[#263247] text-xs text-[#94A3B8] font-medium">
          <CalendarIcon className="w-3.5 h-3.5 text-[#818CF8]" />
          <span>{today}</span>
        </div>

        {/* AI Action Button */}
        <Link to="/ai">
          <Button
            variant="ai"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            AI Ops Agent
          </Button>
        </Link>

        {/* Primary Create Event Button */}
        <Link to="/events">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Event
          </Button>
        </Link>
      </div>
    </div>
  );
}

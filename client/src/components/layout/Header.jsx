import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Command,
  ChevronRight
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { NAVIGATION_ITEMS } from '../../constants/navigation';

export default function Header({ onMobileMenuOpen }) {
  const location = useLocation();

  // Determine current active item for page title / breadcrumbs
  const currentNav = NAVIGATION_ITEMS.find(
    (item) => item.path === location.pathname
  ) || { name: 'Operations', description: 'Event Workspace' };

  return (
    <header className="h-16 bg-[#111827]/80 backdrop-blur-md border-b border-[#263247] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Area: Mobile Menu Toggle & Title / Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#151D2E] focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span className="hover:text-white transition-colors">ClubOps</span>
            <ChevronRight className="w-3 h-3 text-[#475569]" />
            <span className="text-[#818CF8] font-medium truncate">
              {currentNav.name}
            </span>
          </div>
          <h2 className="text-base font-semibold text-[#F8FAFC] tracking-tight truncate">
            {currentNav.name}
          </h2>
        </div>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar Placeholder */}
        <div className="hidden md:flex items-center relative w-64">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events, tasks, notes..."
            disabled
            className="w-full bg-[#151D2E] text-xs text-[#F8FAFC] placeholder-[#64748B] pl-9 pr-8 py-2 rounded-lg border border-[#263247] cursor-not-allowed select-none"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono bg-[#1E293B] text-[#94A3B8] rounded border border-[#334155] pointer-events-none flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>

        {/* AI Assistant Quick Pill */}
        <Link
          to="/ai"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6366F1]/15 to-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-xs font-medium text-[#C4B5FD] hover:border-[#8B5CF6]/60 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#A78BFA] animate-pulse" />
          <span>AI Ops Agent</span>
        </Link>

        {/* Notifications Icon Placeholder */}
        <Tooltip content="Notifications (0 unread)" position="bottom">
          <button
            type="button"
            className="relative p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg hover:bg-[#151D2E] transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6366F1]" />
          </button>
        </Tooltip>

        {/* User Avatar */}
        <div className="pl-1 sm:pl-2 border-l border-[#263247]">
          <Avatar name="Organizer Lead" size="sm" status="online" />
        </div>
      </div>
    </header>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Command,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Shield,
  Building,
  ChevronDown
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onMobileMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, club, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Determine current active item for page title / breadcrumbs
  const currentNav = NAVIGATION_ITEMS.find(
    (item) => item.path === location.pathname
  ) || { name: 'Operations', description: 'Event Workspace' };

  const userName = user?.name || 'Club Lead';
  const userEmail = user?.email || 'lead@club.edu';
  const userRole = (user?.role || 'organizer').toUpperCase();
  const clubName = club?.name || user?.club?.name || 'ClubOps HQ';
  const clubCode = club?.code || user?.club?.code;

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

        {/* Notifications Icon */}
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

        {/* Authenticated User Menu Dropdown */}
        <div className="relative pl-1 sm:pl-2 border-l border-[#263247]" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#151D2E] transition-all focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 group"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label="User profile menu"
          >
            <Avatar name={userName} size="sm" status="online" />
            <div className="hidden md:flex flex-col text-left min-w-0 pr-1">
              <span className="text-xs font-semibold text-[#F8FAFC] truncate max-w-[120px] group-hover:text-white">
                {userName}
              </span>
              <span className="text-[10px] text-[#94A3B8] capitalize truncate max-w-[120px]">
                {user?.role || 'Organizer'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-white' : 'group-hover:text-[#94A3B8]'}`} />
          </button>

          {/* User Menu Popup */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#151D2E] border border-[#263247] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#263247]/60">
              {/* User Identity Header */}
              <div className="px-4 py-3 space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <Avatar name={userName} size="md" status="online" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-[#94A3B8] truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/30">
                    {userRole}
                  </span>
                  {clubCode && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] border border-[#263247]">
                      {clubCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Club Info */}
              <div className="px-4 py-2 text-xs text-[#94A3B8] flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                <span className="truncate">{clubName}</span>
              </div>

              {/* Action Menu */}
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-[#EF4444] hover:bg-[#EF4444]/15 hover:text-[#F87171] transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

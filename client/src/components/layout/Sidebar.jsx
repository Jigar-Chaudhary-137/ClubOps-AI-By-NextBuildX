import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Sliders,
  ShieldCheck,
  X
} from 'lucide-react';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-40
          flex flex-col bg-[#111827] border-r border-[#263247]
          transition-all duration-300 ease-in-out select-none
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#263247]/70">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white truncate">
                    ClubOps<span className="text-[#8B5CF6]">AI</span>
                  </span>
                </div>
                <span className="text-[11px] text-[#94A3B8] block truncate font-medium">
                  Event OS
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#151D2E]"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#151D2E] transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const content = (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) => `
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? item.isAi
                        ? 'bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/25 text-white border border-[#8B5CF6]/40 shadow-sm'
                        : 'bg-[#6366F1]/15 text-white border border-[#6366F1]/30 shadow-sm'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151D2E]/80'
                  }
                  ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                        isActive
                          ? item.isAi
                            ? 'text-[#A78BFA]'
                            : 'text-[#818CF8]'
                          : 'text-[#94A3B8] group-hover:text-[#F8FAFC]'
                      }`}
                    />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {item.isAi && (!isCollapsed || isMobileOpen) && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );

            return isCollapsed && !isMobileOpen ? (
              <Tooltip key={item.path} content={item.name} position="right">
                {content}
              </Tooltip>
            ) : (
              content
            );
          })}
        </nav>

        {/* User Profile Area at Bottom */}
        <div className="p-3 border-t border-[#263247]/70 bg-[#0B1020]/40">
          <div
            className={`
              flex items-center gap-3 p-2 rounded-xl transition-colors
              ${isCollapsed && !isMobileOpen ? 'justify-center p-1' : 'bg-[#151D2E]/70 border border-[#263247]/50'}
            `}
          >
            <Avatar name="Organizer" size="sm" status="online" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                  Club Lead
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                  <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
                  <span className="truncate">Organizer</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

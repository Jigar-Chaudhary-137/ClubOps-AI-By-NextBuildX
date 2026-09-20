import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, Activity } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-between relative overflow-x-hidden">
      {/* Background ambient lighting and grid patterns */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#6366F1]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #F8FAFC 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-[#6366F1]/20 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">
                ClubOps<span className="text-[#8B5CF6]">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30 hidden sm:inline-block">
                Workspace v0.1
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8] font-medium hidden sm:block">
              AI-Powered Autonomous Event Operations
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8] bg-[#151D2E]/80 border border-[#263247] px-3 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="font-mono text-[11px] text-[#CBD5E1]">Operational Grid Online</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 relative z-10 w-full max-w-7xl mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#64748B] border-t border-[#263247]/40 relative z-20">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} ClubOps AI. Built for high-velocity club operations.</span>
        </div>
        <div className="flex items-center gap-4 text-[#94A3B8]">
          <span className="hover:text-white transition-colors cursor-default">Autonomous Agents</span>
          <span>&bull;</span>
          <span className="hover:text-white transition-colors cursor-default">RAG Knowledge</span>
          <span>&bull;</span>
          <span className="hover:text-white transition-colors cursor-default">Multi-Channel Sync</span>
        </div>
      </footer>
    </div>
  );
}

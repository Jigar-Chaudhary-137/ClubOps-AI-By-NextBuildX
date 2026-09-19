import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6366F1]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              ClubOps<span className="text-[#8B5CF6]">AI</span>
            </h1>
            <p className="text-xs text-[#94A3B8] font-medium">
              AI-Powered Event Operations Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-[#64748B] relative z-10">
        ClubOps AI &bull; Google Developer Groups Hackathon
      </footer>
    </div>
  );
}

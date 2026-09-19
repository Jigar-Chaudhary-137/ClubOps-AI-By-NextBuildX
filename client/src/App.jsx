import React from 'react';

export default function App() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B1020] text-[#F8FAFC] p-6">
      <div className="max-w-md w-full bg-[#151D2E] border border-[#263247] rounded-xl p-8 text-center shadow-xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#6366F1]/10 text-[#6366F1] mb-4 text-xl font-bold">
          ⚡
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
          ClubOps AI
        </h1>
        <p className="text-sm text-[#94A3B8] mb-6">
          Initial project scaffold running successfully. Ready for feature implementation.
        </p>
        <div className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
          Frontend Online
        </div>
      </div>
    </main>
  );
}

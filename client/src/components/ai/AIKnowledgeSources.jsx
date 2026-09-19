import React, { useState, useEffect } from 'react';
import {
  FileText,
  Users2,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Megaphone,
  Users,
  Database,
} from 'lucide-react';
import { getDocuments } from '../../services/api/documents';
import { getMeetings } from '../../services/api/meetings';
import { getEvents } from '../../services/api/events';

export default function AIKnowledgeSources({ className = '' }) {
  const [docCount, setDocCount] = useState(0);
  const [meetingCount, setMeetingCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    async function loadCounts() {
      try {
        const [docRes, meetRes, evtRes] = await Promise.allSettled([
          getDocuments({ limit: 100 }),
          getMeetings({ limit: 100 }),
          getEvents({ limit: 100 }),
        ]);

        if (docRes.status === 'fulfilled') {
          const docs = docRes.value?.data || docRes.value?.documents || [];
          setDocCount(docs.length);
        }
        if (meetRes.status === 'fulfilled') {
          const meets = meetRes.value?.data || meetRes.value?.meetings || [];
          setMeetingCount(meets.length);
        }
        if (evtRes.status === 'fulfilled') {
          const evts = evtRes.value?.data || evtRes.value?.events || [];
          setEventCount(evts.length);
        }
      } catch (err) {
        console.error('Failed to fetch knowledge sources counts:', err);
      }
    }
    loadCounts();
  }, []);

  const knowledgeSources = [
    {
      name: 'Documents & Knowledge Base',
      icon: FileText,
      status: 'Indexed & Active',
      detail: `${docCount} documents in RAG vector store`,
    },
    {
      name: 'Meetings & Transcripts',
      icon: Users2,
      status: 'Active',
      detail: `${meetingCount} meeting transcripts logged`,
    },
    {
      name: 'Events & Schedules',
      icon: Calendar,
      status: 'Active',
      detail: `${eventCount} events connected to AI planning`,
    },
    {
      name: 'Tasks & Deliverables',
      icon: CheckSquare,
      status: 'Active',
      detail: 'Work breakdown & assignee tracking',
    },
    {
      name: 'Risks & Mitigations',
      icon: AlertTriangle,
      status: 'Active',
      detail: 'Operational risk intelligence engine',
    },
    {
      name: 'Announcements & Comms',
      icon: Megaphone,
      status: 'Active',
      detail: 'Multi-channel broadcast history',
    },
    {
      name: 'Volunteers & Rosters',
      icon: Users,
      status: 'Active',
      detail: 'Member roles & volunteer shifts',
    },
  ];

  return (
    <div className={`p-5 rounded-2xl bg-[#111827] border border-[#263247] shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-[#263247]">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            Connected Knowledge Sources
          </h4>
        </div>
        <span className="text-[10px] text-purple-400 font-mono">RAG Vector Store</span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        ClubOps AI grounds generated answers in approved club records using semantic vector retrieval.
      </p>

      <div className="space-y-2 pt-1">
        {knowledgeSources.map((src, index) => {
          const Icon = src.icon;
          return (
            <div
              key={index}
              className="p-2.5 rounded-xl bg-[#151D2E]/50 border border-[#263247] flex items-start justify-between gap-2"
            >
              <div className="flex items-start space-x-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#0B1020] border border-[#263247] text-indigo-400 shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-gray-200 block truncate">
                    {src.name}
                  </span>
                  <span className="text-[10px] text-gray-400 block leading-tight mt-0.5">
                    {src.detail}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                {src.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

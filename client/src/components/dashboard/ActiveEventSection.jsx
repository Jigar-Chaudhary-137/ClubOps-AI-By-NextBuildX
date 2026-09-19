import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { getEvents } from '../../services/api/events';

export default function ActiveEventSection() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActiveEvent() {
      try {
        const res = await getEvents({ limit: 1, status: 'planning' });
        const events = res?.data || res?.events || [];
        if (Array.isArray(events) && events.length > 0) {
          setActiveEvent(events[0]);
        } else {
          // fallback to any event
          const allRes = await getEvents({ limit: 1 });
          const allEvents = allRes?.data || allRes?.events || [];
          if (Array.isArray(allEvents) && allEvents.length > 0) {
            setActiveEvent(allEvents[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load active event:', err);
      } finally {
        setLoading(false);
      }
    }
    loadActiveEvent();
  }, []);

  if (activeEvent) {
    return (
      <Card className="border-[#6366F1]/40 bg-gradient-to-r from-[#151D2E] via-[#131B2C] to-[#151D2E] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6366F1]/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Badge variant="primary" dot>Active Event Workspace</Badge>
                <span className="text-xs text-[#64748B]">•</span>
                <span className="text-xs text-[#818CF8] font-mono font-medium">{activeEvent.category || 'Event'}</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {activeEvent.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed max-w-2xl">
                  {activeEvent.description || 'Live operational tracking and AI monitoring enabled.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8] pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#818CF8]" />
                  <span>
                    Start: {activeEvent.startDate ? new Date(activeEvent.startDate).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                  <span>Status: {activeEvent.status}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to={`/events/${activeEvent._id || activeEvent.id}`}>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Open Command Center
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#263247] hover:border-[#374151] transition-all bg-gradient-to-br from-[#151D2E] via-[#111827] to-[#151D2E] shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#6366F1]/5 rounded-full blur-3xl pointer-events-none" />

      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="neutral" dot>Active Event Workspace</Badge>
              <span className="text-xs text-[#64748B]">•</span>
              <span className="text-xs text-[#94A3B8] font-medium">Ready for Initialization</span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                No active event selected
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 leading-relaxed">
                Create an event to start managing your club operations, breaking down milestones, assigning volunteers, and enabling proactive AI risk monitoring.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-center gap-2.5 shrink-0">
            <Link to="/events" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                leftIcon={<Plus className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

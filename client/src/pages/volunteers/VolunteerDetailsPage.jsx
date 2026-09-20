import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Edit,
  Trash2,
  Activity,
  Layers,
  Wrench,
  CheckCircle2,
  FolderSync
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Toast from '../../components/ui/Toast';
import { AIBadge, AIIcon } from '../../components/ai';
import {
  VolunteerAvailabilityBadge,
  VolunteerWorkload,
  VolunteerAssignmentPanel,
  AddVolunteerModal,
  SkillTag
} from '../../components/volunteers';

export default function VolunteerDetailsPage() {
  const { volunteerId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignPanelOpen, setIsAssignPanelOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/volunteers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Volunteers</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">Volunteer ID: #{volunteerId}</Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchVolunteer}>
            Retry
          </Button>
        </div>
      )}

      {/* Volunteer Header Profile Card */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar
                name="—"
                size="lg"
                status="offline"
                className="w-14 h-14"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    —
                  </h1>
                  <Badge variant="neutral">—</Badge>
                  <VolunteerAvailabilityBadge availability="—" size="sm" />
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Club Member & Operational Volunteer Profile
                </p>
              </div>
            </div>

            {/* Actions: Edit & More */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit className="w-3.5 h-3.5" />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleDelete}
              >
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional In-Page Event Assignment Panel */}
      {isAssignPanelOpen && (
        <VolunteerAssignmentPanel
          volunteerId={volunteerId}
          volunteerName="this volunteer"
          onAssignmentComplete={() => setIsAssignPanelOpen(false)}
        />
      )}

      {/* Main Details & Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Profile Overview, Skills, Assignments, Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Overview Section */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#818CF8]" />
                <div>
                  <CardTitle>Profile Overview</CardTitle>
                  <CardDescription>Member contact and department info</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <User className="w-3.5 h-3.5 text-[#818CF8]" />
                    <span>Full Name</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">—</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6366F1]" />
                    <span>Role / Department</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">—</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Mail className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">—</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">—</p>
                </div>

                <div className="col-span-1 sm:col-span-2 p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
                    <span>Availability Status</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">—</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#38BDF8]" />
                <div>
                  <CardTitle>Skills & Competencies</CardTitle>
                  <CardDescription>Verified skillsets for operational matching</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Wrench className="w-6 h-6 text-[#38BDF8]" />}
                title="Skills will appear once volunteer data is connected."
                description="Technical, creative, and organizational skills will be listed here from the database."
              />
            </CardContent>
          </Card>

          {/* 3. Event Assignments Section */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4ADE80]" />
                <div>
                  <CardTitle>Event Assignments</CardTitle>
                  <CardDescription>Active and scheduled club event participations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Calendar className="w-6 h-6 text-[#4ADE80]" />}
                title="No event assignments available yet."
                description="Assigned events and team responsibilities will be displayed here once connected."
              />
            </CardContent>
          </Card>

          {/* 4. Activity Section */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#64748B]" />
                <div>
                  <CardTitle>Activity History</CardTitle>
                  <CardDescription>Log of assignments, updates, and interactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Clock className="w-6 h-6 text-[#818CF8]" />}
                title="Volunteer activity will appear once connected to the backend."
                description="Audit history and operational changes will synchronize dynamically."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Assignment Copilot */}
        <div className="space-y-6">
          {/* Current Workload Card */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F59E0B]" />
                <div>
                  <CardTitle>Current Workload</CardTitle>
                  <CardDescription>Capacity and active task distribution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <VolunteerWorkload workload={null} />
            </CardContent>
          </Card>

          {/* AI Volunteer Copilot Card */}
          <Card className="border-[#8B5CF6]/30 bg-gradient-to-b from-[#171A2E]/90 to-[#151D2E] shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <AIIcon size="sm" />
                  <div>
                    <CardTitle className="text-sm">Operations AI</CardTitle>
                    <CardDescription>Volunteer task matching</CardDescription>
                  </div>
                </div>
                <AIBadge size="sm">Gemini AI</AIBadge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-3">
                Ask the Operations Agent to assign pending event tasks matching {volunteer.name}'s skill profile:
              </p>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />}
                disabled
              >
                Recommend Matching Events
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                leftIcon={<Layers className="w-3.5 h-3.5 text-[#34D399]" />}
                disabled
              >
                Analyze Workload Balance
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs border-[#263247] hover:border-[#8B5CF6]/40 text-[#F8FAFC]"
                leftIcon={<Wrench className="w-3.5 h-3.5 text-[#38BDF8]" />}
                disabled
              >
                Suggest Skill Development
              </Button>

              <div className="pt-3 mt-1 border-t border-[#263247]/60 text-[11px] text-[#64748B]">
                AI volunteer matching will connect to Gemini in later backend phases.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Volunteer Modal */}
      <AddVolunteerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdate}
      />
    </div>
  );
}


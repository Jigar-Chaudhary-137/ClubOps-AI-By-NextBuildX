import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  FolderSync,
  RefreshCw
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
import { getVolunteerById, updateVolunteer, deleteVolunteer } from '../../services/api/volunteers';

export default function VolunteerDetailsPage() {
  const { volunteerId } = useParams();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignPanelOpen, setIsAssignPanelOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVolunteer = useCallback(async () => {
    if (!volunteerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getVolunteerById(volunteerId);
      const volData = res?.data?.volunteer || res?.data || null;
      setVolunteer(volData);
    } catch (err) {
      console.error('Failed to fetch volunteer details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load volunteer profile');
    } finally {
      setIsLoading(false);
    }
  }, [volunteerId]);

  useEffect(() => {
    fetchVolunteer();
  }, [fetchVolunteer]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleUpdate = async (payload) => {
    try {
      await updateVolunteer(volunteerId, {
        availability: payload.availability,
        department: payload.department,
        skills: payload.skills,
        notes: payload.notes
      });
      await fetchVolunteer();
      setToast({
        type: 'success',
        title: 'Volunteer Updated',
        message: 'Volunteer profile updated successfully.'
      });
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this volunteer profile?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteVolunteer(volunteerId);
      navigate('/volunteers');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete volunteer');
      setIsDeleting(false);
    }
  };

  const name = volunteer?.user?.name || volunteer?.name || 'Club Volunteer';
  const role = volunteer?.user?.role
    ? volunteer.user.role.charAt(0).toUpperCase() + volunteer.user.role.slice(1)
    : (volunteer?.department || 'Volunteer');
  const email = volunteer?.user?.email || volunteer?.email || '';
  const phone = volunteer?.user?.phone || volunteer?.phone || '';
  const availability = volunteer?.availability || 'available';
  const skills = Array.isArray(volunteer?.skills) ? volunteer.skills : [];
  const assignedEvent = volunteer?.event?.title || (typeof volunteer?.event === 'string' ? volunteer.event : null);
  const activeTasks = volunteer?.assignedTasksCount || 0;
  const notes = volunteer?.notes || '';

  const getAvatarStatus = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'available') return 'online';
    if (s === 'busy' || s === 'assigned') return 'busy';
    return 'offline';
  };

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
          <Badge variant="neutral">Volunteer ID: #{volunteerId?.slice(-6) || volunteerId}</Badge>
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
                name={name}
                size="lg"
                status={getAvatarStatus(availability)}
                className="w-14 h-14"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {name}
                  </h1>
                  <Badge variant="neutral">{role}</Badge>
                  <VolunteerAvailabilityBadge availability={availability} size="sm" />
                </div>
                <p className="text-xs text-[#94A3B8]">
                  {volunteer?.department ? `${volunteer.department} • ` : ''}Club Member & Operational Volunteer Profile
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
                variant="secondary"
                size="sm"
                onClick={() => setIsAssignPanelOpen(!isAssignPanelOpen)}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                {isAssignPanelOpen ? 'Hide Assignment' : 'Assign to Event'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleDelete}
                isLoading={isDeleting}
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
          volunteerName={name}
          onAssignmentComplete={() => {
            setIsAssignPanelOpen(false);
            fetchVolunteer();
          }}
        />
      )}

      {/* Main Details & Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Profile Overview, Skills, Assignments, Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Profile Overview Section */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#818CF8]" />
                <div>
                  <CardTitle>Profile Overview</CardTitle>
                  <CardDescription>Member details and contact information</CardDescription>
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
                  <p className="text-sm font-semibold text-white mt-1">{name}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6366F1]" />
                    <span>Role / Department</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">
                    {role} {volunteer?.department ? `(${volunteer.department})` : ''}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Mail className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">{email || '—'}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">{phone || '—'}</p>
                </div>

                <div className="col-span-1 sm:col-span-2 p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>Availability Status</span>
                    </div>
                    <VolunteerAvailabilityBadge availability={availability} size="sm" />
                  </div>
                  {notes && (
                    <p className="text-xs text-[#94A3B8] mt-2 pt-2 border-t border-[#263247]/60">
                      <span className="font-semibold text-white">Notes:</span> {notes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Skills Section */}
          <Card className="border-[#263247]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#38BDF8]" />
                <div>
                  <CardTitle>Skills & Competencies</CardTitle>
                  <CardDescription>Verified skillsets and operational capabilities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {skills && skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <SkillTag key={idx} skill={skill} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Wrench className="w-6 h-6 text-[#38BDF8]" />}
                  title="No skills listed yet"
                  description="Edit profile to add skills and competencies for this volunteer."
                />
              )}
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
              {assignedEvent ? (
                <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 text-[#4ADE80] flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{assignedEvent}</h4>
                      <p className="text-xs text-[#94A3B8]">Active Club Event Assignment</p>
                    </div>
                  </div>
                  <Badge variant="success">Assigned</Badge>
                </div>
              ) : (
                <EmptyState
                  icon={<Calendar className="w-6 h-6 text-[#4ADE80]" />}
                  title="No event assignments currently"
                  description="Use the 'Assign to Event' button to allocate this volunteer to an active event."
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workload & AI Copilot */}
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
              <VolunteerWorkload workload={{ activeTasks }} />
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
                Ask the Operations Agent to assign pending event tasks matching {name}&apos;s skill profile:
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

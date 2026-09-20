import React, { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { AIBadge, AIIcon } from '../../components/ai';
import {
  VolunteerAvailabilityBadge,
  VolunteerWorkload,
  VolunteerAssignmentPanel,
  AddVolunteerModal
} from '../../components/volunteers';
import { getVolunteerById, deleteVolunteer } from '../../services/api/volunteers';

export default function VolunteerDetailsPage() {
  const { volunteerId } = useParams();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignPanelOpen, setIsAssignPanelOpen] = useState(false);

  useEffect(() => {
    async function loadVolunteer() {
      if (!volunteerId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getVolunteerById(volunteerId);
        if (res?.data) {
          setVolunteer(res.data);
        }
      } catch (err) {
        console.error('Error fetching volunteer details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load volunteer profile');
      } finally {
        setLoading(false);
      }
    }
    loadVolunteer();
  }, [volunteerId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove this volunteer?')) return;
    try {
      await deleteVolunteer(volunteerId);
      navigate('/volunteers');
    } catch (err) {
      console.error('Failed to delete volunteer:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading volunteer profile from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-4">
        <Link to="/volunteers" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Volunteers
        </Link>
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">Volunteer Not Found</h3>
            <p className="text-xs text-rose-200">{error || 'The requested volunteer record does not exist.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
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
          <Badge variant="neutral">ID: #{volunteer._id?.substring(0, 8)}</Badge>
          <Badge variant="primary" dot>MongoDB Connected</Badge>
        </div>
      </div>

      {/* Volunteer Header Profile Card */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar
                name={volunteer.name}
                size="lg"
                status="online"
                className="w-14 h-14"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {volunteer.name}
                  </h1>
                  <Badge variant="neutral">{volunteer.role || 'Volunteer'}</Badge>
                  <VolunteerAvailabilityBadge availability={volunteer.availability || 'Available'} size="sm" />
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Club Member &bull; {volunteer.department || 'Operations Team'}
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
                  <p className="text-sm font-semibold text-white mt-1">{volunteer.name}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6366F1]" />
                    <span>Role</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1 capitalize">{volunteer.role || 'Volunteer'}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Mail className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">{volunteer.email}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Phone Number</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1">{volunteer.phone || 'Not specified'}</p>
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
              {volunteer.skills && volunteer.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {volunteer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No skills tagged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Assignment Copilot */}
        <div className="space-y-6">
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

              <Link to="/ai" className="block">
                <Button
                  variant="ai"
                  size="sm"
                  className="w-full justify-start text-xs"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Match Tasks with Agent
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Volunteer Modal */}
      <AddVolunteerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Send,
  Clock,
  User,
  Tag,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Users,
  Radio,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  AnnouncementStatusBadge,
  AnnouncementChannelBadge,
  AnnouncementAudienceBadge,
  AnnouncementPreview
} from '../../components/announcements';
import { getAnnouncementById, publishAnnouncement, deleteAnnouncement } from '../../services/api/announcements';

export default function AnnouncementDetailsPage() {
  const { announcementId } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    async function loadAnnouncement() {
      if (!announcementId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getAnnouncementById(announcementId);
        if (res?.data) {
          setAnnouncement(res.data);
        }
      } catch (err) {
        console.error('Error fetching announcement details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load announcement');
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncement();
  }, [announcementId]);

  const handleBroadcast = async () => {
    try {
      setBroadcasting(true);
      const res = await publishAnnouncement(announcementId);
      if (res?.data) {
        setAnnouncement(res.data);
      } else {
        setAnnouncement(prev => ({ ...prev, status: 'published', publishedAt: new Date().toISOString() }));
      }
      setNotice('Announcement broadcasted successfully to all target channels.');
      setTimeout(() => setNotice(null), 5000);
    } catch (err) {
      console.error('Failed to broadcast announcement:', err);
      setNotice('Error broadcasting: ' + (err.response?.data?.message || err.message));
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(announcementId);
      navigate('/announcements');
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading announcement from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-4">
        <Link to="/announcements" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Announcements
        </Link>
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">Announcement Not Found</h3>
            <p className="text-xs text-rose-200">{error || 'The requested announcement could not be retrieved from the database.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const channels = Array.isArray(announcement.channels) ? announcement.channels : [announcement.channel || 'in_app'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div className="flex items-center space-x-3">
          <Link
            to="/announcements"
            className="p-2 rounded-xl bg-[#151D2E] hover:bg-[#263247] text-gray-400 hover:text-white border border-[#263247] transition-all"
            title="Back to Announcements"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">#{announcement._id?.substring(0, 8)}</span>
              <AnnouncementStatusBadge status={announcement.status || 'draft'} />
              <AnnouncementAudienceBadge audience={announcement.targetAudience || announcement.audience || 'entire_club'} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-1">
              {announcement.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {announcement.status !== 'published' && (
            <Button
              variant="primary"
              size="sm"
              disabled={broadcasting}
              onClick={handleBroadcast}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              {broadcasting ? 'Broadcasting...' : 'Broadcast Now'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
            onClick={handleDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5 animate-fadeIn">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Status:</span> {notice}
          </div>
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Section (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Content Card */}
          <div className="bg-[#111827] border border-[#263247] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#263247]">
              <h3 className="text-sm font-semibold text-white">Announcement Message</h3>
              <div className="flex items-center space-x-1">
                {channels.map((ch) => (
                  <AnnouncementChannelBadge key={ch} channel={ch} size="sm" />
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
              {announcement.content || announcement.message}
            </div>
          </div>

          {/* Multi-Channel Live Preview */}
          <div className="bg-[#111827] border border-[#263247] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-4">
              Multi-Channel Live Preview
            </h3>
            <AnnouncementPreview
              title={announcement.title}
              message={announcement.content || announcement.message}
              channels={channels}
              audience={announcement.targetAudience || announcement.audience}
              eventName={announcement.event?.title}
              scheduledFor={announcement.scheduledFor}
            />
          </div>
        </div>

        {/* Right / Sidebar Section (1 col) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-[#111827] border border-[#263247] rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 pb-2 border-b border-[#263247]">
              Dispatch Details
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Status</span>
                <AnnouncementStatusBadge status={announcement.status || 'draft'} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Channel</span>
                <span className="text-gray-200 font-medium capitalize">{channels.join(', ')}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Target</span>
                <span className="text-indigo-300 font-medium capitalize">
                  {announcement.targetAudience || announcement.audience || 'All Members'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-400">
                  {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : 'Recently'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

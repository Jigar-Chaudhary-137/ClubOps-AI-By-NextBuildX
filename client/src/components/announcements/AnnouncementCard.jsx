import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';
import AnnouncementStatusBadge from './AnnouncementStatusBadge';
import AnnouncementChannelBadge from './AnnouncementChannelBadge';
import AnnouncementAudienceBadge from './AnnouncementAudienceBadge';

const AnnouncementCard = ({ announcement }) => {
  if (!announcement) return null;

  const id = announcement._id || announcement.id;
  const title = announcement.title;
  const message = announcement.content || announcement.message;
  const status = announcement.status || 'draft';
  const channels = Array.isArray(announcement.channels) && announcement.channels.length > 0
    ? announcement.channels
    : [announcement.channel || 'in_app'];
  const audience = announcement.targetAudiences && announcement.targetAudiences.length > 0
    ? announcement.targetAudiences
    : (announcement.targetAudience || announcement.audience || 'Entire Club');
  const eventName = announcement.eventName || announcement.event?.title;
  const scheduledFor = announcement.scheduledFor;
  const publishedAt = announcement.publishedAt;
  const authorName = announcement.createdBy?.name || announcement.authorName || 'Club Organizer';
  const createdAt = announcement.createdAt;

  return (
    <div className="bg-[#111827] border border-[#263247] rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <AnnouncementStatusBadge status={status} />
            <AnnouncementAudienceBadge audience={audience} />
          </div>
          {eventName && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 truncate max-w-[150px]">
              <Tag className="w-3 h-3 text-slate-400" />
              <span className="truncate">{eventName}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <Link 
          to={`/announcements/${id}`}
          className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 block mb-2"
        >
          {title}
        </Link>

        {/* Excerpt */}
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {message || 'No message content provided.'}
        </p>

        {/* Channels */}
        <div className="flex flex-wrap gap-1 mb-4">
          {channels.map((ch) => (
            <AnnouncementChannelBadge key={ch} channel={ch} size="sm" />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#263247]/60 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-2 truncate">
          <span className="flex items-center space-x-1 truncate">
            <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="truncate">{authorName}</span>
          </span>
          {scheduledFor && (
            <span className="flex items-center space-x-1 text-purple-400 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(scheduledFor).toLocaleDateString()}</span>
            </span>
          )}
          {!scheduledFor && publishedAt && (
            <span className="flex items-center space-x-1 text-emerald-400 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(publishedAt).toLocaleDateString()}</span>
            </span>
          )}
        </div>

        <Link
          to={`/announcements/${id}`}
          className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 font-medium shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default AnnouncementCard;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Clock, Calendar } from 'lucide-react';
import AnnouncementStatusBadge from './AnnouncementStatusBadge';
import AnnouncementChannelBadge from './AnnouncementChannelBadge';
import AnnouncementAudienceBadge from './AnnouncementAudienceBadge';

const AnnouncementRow = ({ announcement }) => {
  if (!announcement) return null;

  const {
    id,
    title,
    message,
    status = 'draft',
    channels = ['in_app'],
    audience = 'entire_club',
    eventName,
    scheduledFor,
    publishedAt,
    authorName = 'Organizer',
    updatedAt,
    createdAt,
  } = announcement;

  const dateDisplay = scheduledFor 
    ? { label: 'Scheduled', val: new Date(scheduledFor).toLocaleDateString(), isSched: true }
    : publishedAt 
      ? { label: 'Published', val: new Date(publishedAt).toLocaleDateString(), isSched: false }
      : { label: 'Created', val: new Date(createdAt || Date.now()).toLocaleDateString(), isSched: false };

  return (
    <tr className="border-b border-[#263247]/60 hover:bg-[#151D2E]/40 transition-colors">
      {/* Title & Preview */}
      <td className="py-3.5 px-4 max-w-xs">
        <Link
          to={`/announcements/${id}`}
          className="font-medium text-white hover:text-indigo-400 transition-colors block truncate text-sm"
        >
          {title}
        </Link>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {message || 'No description'}
        </p>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <AnnouncementStatusBadge status={status} />
      </td>

      {/* Channels */}
      <td className="py-3.5 px-4">
        <div className="flex flex-wrap gap-1 max-w-[160px]">
          {channels.map((ch) => (
            <AnnouncementChannelBadge key={ch} channel={ch} size="sm" />
          ))}
        </div>
      </td>

      {/* Audience */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <AnnouncementAudienceBadge audience={audience} />
      </td>

      {/* Event */}
      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-300">
        {eventName ? (
          <span className="flex items-center space-x-1 truncate max-w-[130px] px-2 py-0.5 rounded bg-[#151D2E] border border-[#263247]">
            <Tag className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="truncate">{eventName}</span>
          </span>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </td>

      {/* Schedule / Date */}
      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
        <div className="flex items-center space-x-1.5 text-gray-300">
          {dateDisplay.isSched ? (
            <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          ) : (
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}
          <span>{dateDisplay.val}</span>
        </div>
      </td>

      {/* Author */}
      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-400">
        {authorName}
      </td>

      {/* Action */}
      <td className="py-3.5 px-4 whitespace-nowrap text-right text-xs">
        <Link
          to={`/announcements/${id}`}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#151D2E] hover:bg-indigo-600/20 text-indigo-400 border border-[#263247] hover:border-indigo-500/30 transition-all"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </td>
    </tr>
  );
};

export default AnnouncementRow;

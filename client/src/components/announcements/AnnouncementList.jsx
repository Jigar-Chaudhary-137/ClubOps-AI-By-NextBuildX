import React from 'react';
import { Bell, Plus, Megaphone } from 'lucide-react';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementRow from './AnnouncementRow';

const AnnouncementList = ({
  announcements = [],
  viewMode = 'grid',
  onCreateClick,
}) => {
  if (announcements.length === 0) {
    return (
      <div className="bg-[#111827] border border-[#263247] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Megaphone className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No announcements found</h3>
        <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
          No club announcements match your current filter, or none have been drafted yet. Broadcast updates across in-app feeds, email, WhatsApp, SMS, or push alerts.
        </p>
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        )}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {announcements.map((item) => (
          <AnnouncementCard key={item.id} announcement={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#263247] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#151D2E] text-xs uppercase text-gray-400 border-b border-[#263247]">
            <tr>
              <th scope="col" className="py-3 px-4">Announcement</th>
              <th scope="col" className="py-3 px-4">Status</th>
              <th scope="col" className="py-3 px-4">Channels</th>
              <th scope="col" className="py-3 px-4">Audience</th>
              <th scope="col" className="py-3 px-4">Event</th>
              <th scope="col" className="py-3 px-4">Date / Schedule</th>
              <th scope="col" className="py-3 px-4">Author</th>
              <th scope="col" className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#263247]/50">
            {announcements.map((item) => (
              <AnnouncementRow key={item.id} announcement={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnouncementList;

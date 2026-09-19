import React, { useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import AnnouncementComposer from './AnnouncementComposer';

const CreateAnnouncementModal = ({ isOpen, onClose, onSave, initialPrompt = '', events = [] }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#111827] border border-[#263247] rounded-2xl shadow-2xl overflow-hidden my-8 z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#263247] bg-[#151D2E]/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create Announcement</h2>
              <p className="text-xs text-gray-400">Draft, configure audience & channels, and publish or schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#263247] transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnnouncementComposer
            events={events}
            initialPrompt={initialPrompt}
            onSubmit={async (data) => {
              if (onSave) {
                await onSave(data);
              }
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;

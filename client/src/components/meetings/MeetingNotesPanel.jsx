import React, { useState } from 'react';
import { FileText, Upload, Save, Sparkles, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import TranscriptUpload from './TranscriptUpload';

export default function MeetingNotesPanel({
  initialNotes = '',
  onSaveNotes,
  className = ''
}) {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'transcript'
  const [notesText, setNotesText] = useState(initialNotes);
  const [saveNotice, setSaveNotice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Word and character count
  const charCount = notesText.length;
  const wordCount = notesText.trim() ? notesText.trim().split(/\s+/).length : 0;

  const handleSaveNotes = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveNotice('Meeting notes updated successfully.');
      setTimeout(() => setSaveNotice(null), 4000);
      onSaveNotes?.(notesText);
    }, 400);
  };

  const handleQuickPaste = () => {
    setActiveTab('notes');
  };

  const handleQuickUpload = () => {
    setActiveTab('transcript');
  };

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Meeting Notes & Transcript</CardTitle>
          <CardDescription>
            Input notes or ingest audio transcripts to power AI action extraction and risk detection.
          </CardDescription>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-[#111827] border border-[#263247] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${activeTab === 'notes'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'}
            `}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transcript')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${activeTab === 'transcript'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-white'}
            `}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Transcript</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Helper Banner when no notes and no transcript */}
        {!notesText.trim() && activeTab === 'notes' && (
          <div className="p-3.5 rounded-lg bg-[#111827] border border-[#263247] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0" />
              <span>Add meeting notes or upload a transcript to unlock Meeting Intelligence.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickPaste}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Paste Notes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickUpload}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload Transcript
              </Button>
            </div>
          </div>
        )}

        {/* Tab 1: Notes Mode */}
        {activeTab === 'notes' && (
          <div className="space-y-3">
            <Textarea
              placeholder="Paste meeting notes here..."
              rows={9}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="font-sans text-sm leading-relaxed"
            />

            {/* Counts & Save Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3 text-xs text-[#64748B] font-mono">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} characters</span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  onClick={handleSaveNotes}
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  Save Notes
                </Button>
              </div>
            </div>

            {/* Save notice */}
            {saveNotice && (
              <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Transcript Mode */}
        {activeTab === 'transcript' && (
          <TranscriptUpload />
        )}
      </CardContent>
    </Card>
  );
}

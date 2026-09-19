import React from 'react';
import { Video, Sparkles, FileText, Upload, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Textarea from '../../components/ui/Textarea';

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Meeting Intelligence & Transcripts
            </h1>
            <Badge variant="primary">Action Extractor</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Ingest meeting notes, extract action items, and detect owners automatically
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            disabled
          >
            Log New Meeting
          </Button>
        </div>
      </div>

      {/* Ingestion Box Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Transcript & Notes Ingestion</CardTitle>
              <CardDescription>
                Paste meeting minutes or discussion raw notes for AI processing
              </CardDescription>
            </div>
            <Badge variant="ai">AI Parser</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste raw meeting notes or audio transcript here (e.g., 'Discussed sponsorship targets with Rahul, target $2000 by next Friday; Ananya will follow up on auditorium booking...')"
              rows={6}
              disabled
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#94A3B8]">
                AI will identify action items, owners, and deadlines on submit.
              </span>
              <Button
                variant="ai"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4" />}
                disabled
              >
                Extract Action Items
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Processing Pipeline Preview */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Extraction Pipeline</CardTitle>
              <CardDescription>Automated processing steps</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-[#94A3B8]">
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center font-bold text-xs">1</span>
              <span>Context & meeting intent analysis</span>
            </div>
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 text-[#A78BFA] flex items-center justify-center font-bold text-xs">2</span>
              <span>Action item & owner resolution</span>
            </div>
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#22C55E]/20 text-[#4ADE80] flex items-center justify-center font-bold text-xs">3</span>
              <span>Deadline parsing & task proposal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting History Container */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Meeting Records</CardTitle>
            <CardDescription>Processed minutes and historical logs</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Video className="w-7 h-7 text-[#818CF8]" />}
            title="No meetings logged yet"
            description="Log your first organizing committee meeting to see action items extracted and mapped to the task board."
          />
        </CardContent>
      </Card>
    </div>
  );
}

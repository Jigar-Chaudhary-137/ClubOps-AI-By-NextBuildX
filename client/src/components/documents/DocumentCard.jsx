import React from 'react';
import { FileText, Calendar, Tag, HardDrive, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import DocumentProcessingBadge from './DocumentProcessingBadge';
import KnowledgeStatusBadge from './KnowledgeStatusBadge';

const fileTypeIcons = {
  pdf: 'text-[#EF4444]',
  docx: 'text-[#3B82F6]',
  doc: 'text-[#3B82F6]',
  txt: 'text-[#10B981]',
  other: 'text-[#818CF8]'
};

export default function DocumentCard({
  document,
  onView,
  className = ''
}) {
  if (!document) return null;

  const {
    id,
    name = 'Untitled Document',
    fileType = 'PDF',
    fileSize = '—',
    category = 'General',
    uploadDate = '—',
    updatedAt = '—',
    processingStatus = 'Not Processed',
    knowledgeStatus = 'Not Added'
  } = document;

  const iconColor = fileTypeIcons[fileType?.toLowerCase()] || fileTypeIcons.other;

  return (
    <Card
      hoverEffect
      className={`border-[#263247] hover:border-[#374151] bg-[#151D2E] transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Header: Processing & Knowledge status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <DocumentProcessingBadge status={processingStatus} size="sm" />
          <KnowledgeStatusBadge status={knowledgeStatus} size="sm" />
        </div>

        {/* Title & Metadata */}
        <div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#111827] border border-[#263247] shrink-0">
              <FileText className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                onClick={() => onView?.(id)}
                className="text-base font-bold text-white tracking-tight line-clamp-1 hover:text-[#818CF8] cursor-pointer transition-colors"
                title={name}
              >
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] border border-[#263247] uppercase">
                  {fileType}
                </span>
                <span className="text-xs text-[#64748B]">•</span>
                <span className="text-xs text-[#94A3B8]">{fileSize}</span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 space-y-1.5 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="truncate">Category: <strong className="text-white font-medium">{category}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="truncate">Uploaded: {uploadDate}</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 border-t border-[#263247]/60">
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-between"
            onClick={() => onView?.(id)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

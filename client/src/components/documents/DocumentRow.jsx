import React from 'react';
import { FileText, ArrowRight, Calendar, Tag } from 'lucide-react';
import DocumentProcessingBadge from './DocumentProcessingBadge';
import KnowledgeStatusBadge from './KnowledgeStatusBadge';

const fileTypeColors = {
  pdf: 'text-[#EF4444]',
  docx: 'text-[#3B82F6]',
  doc: 'text-[#3B82F6]',
  txt: 'text-[#10B981]',
  other: 'text-[#818CF8]'
};

export default function DocumentRow({
  document,
  onView
}) {
  if (!document) return null;

  const {
    id,
    name = 'Untitled Document',
    fileType = 'PDF',
    category = 'General',
    fileSize = '—',
    processingStatus = 'Not Processed',
    uploadDate = '—',
    updatedAt = '—',
    knowledgeStatus = 'Not Added'
  } = document;

  const iconColor = fileTypeColors[fileType?.toLowerCase()] || fileTypeColors.other;

  return (
    <tr className="border-b border-[#263247]/60 hover:bg-[#151D2E]/80 transition-colors">
      {/* Name & Icon */}
      <td className="py-3 px-4 min-w-[220px]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-[#111827] border border-[#263247] shrink-0">
            <FileText className={`w-4 h-4 ${iconColor}`} />
          </div>
          <button
            type="button"
            onClick={() => onView?.(id)}
            className="text-sm font-semibold text-white text-left hover:text-[#818CF8] transition-colors line-clamp-1"
          >
            {name}
          </button>
        </div>
      </td>

      {/* Type */}
      <td className="py-3 px-4 text-xs font-mono text-[#94A3B8] whitespace-nowrap uppercase">
        {fileType}
      </td>

      {/* Category */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{category}</span>
        </div>
      </td>

      {/* Size */}
      <td className="py-3 px-4 text-xs font-mono text-[#94A3B8] whitespace-nowrap">
        {fileSize}
      </td>

      {/* Processing Status */}
      <td className="py-3 px-4 whitespace-nowrap">
        <DocumentProcessingBadge status={processingStatus} size="sm" />
      </td>

      {/* Knowledge Status */}
      <td className="py-3 px-4 whitespace-nowrap">
        <KnowledgeStatusBadge status={knowledgeStatus} size="sm" />
      </td>

      {/* Upload Date */}
      <td className="py-3 px-4 text-xs text-[#94A3B8] whitespace-nowrap font-mono">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{uploadDate}</span>
        </div>
      </td>

      {/* Last Updated */}
      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap font-mono">
        {updatedAt}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => onView?.(id)}
          className="text-xs font-medium text-[#818CF8] hover:text-white inline-flex items-center gap-1 transition-colors"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

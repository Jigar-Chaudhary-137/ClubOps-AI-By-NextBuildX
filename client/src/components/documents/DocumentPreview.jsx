import React from 'react';
import { FileText, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';

export default function DocumentPreview({
  fileName = 'Document',
  fileType = 'PDF',
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm">Document Preview</CardTitle>
          <CardDescription>
            Live reading viewer and extracted plain-text representation.
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111827] border border-[#263247] text-xs text-[#94A3B8] font-mono">
          <FileText className="w-3.5 h-3.5 text-[#818CF8]" />
          <span>{fileType.toUpperCase()}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="py-12 sm:py-16 border-2 border-dashed border-[#263247] rounded-xl bg-[#111827]/40 flex flex-col items-center justify-center text-center p-6">
          <EmptyState
            icon={<Eye className="w-8 h-8 text-[#818CF8]" />}
            title="Document preview will appear after document processing is connected."
            description="Once ingested into the processing pipeline, text chunks and document layout will be rendered here."
          />
        </div>
      </CardContent>
    </Card>
  );
}

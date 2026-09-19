import React from 'react';
import { BookOpen, Upload, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import DocumentCard from './DocumentCard';
import DocumentRow from './DocumentRow';

export default function DocumentList({
  documents = [],
  viewMode = 'grid', // 'grid' | 'table'
  onViewDocument,
  onUploadDocument,
  onAskKnowledge,
  className = ''
}) {
  if (!documents || documents.length === 0) {
    return (
      <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
        <CardContent className="p-8 sm:p-14">
          <EmptyState
            icon={<BookOpen className="w-8 h-8 text-[#818CF8]" />}
            title="Your club knowledge starts here"
            description="Upload club documents, guides, policies, event plans, and other important resources to build your AI-ready knowledge base."
            action={
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onUploadDocument}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Upload First Document
                </Button>
                <Button
                  variant="ai"
                  size="md"
                  onClick={onAskKnowledge}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Ask Club Knowledge
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onView={onViewDocument}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={`border-[#263247] bg-[#151D2E] overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#263247] bg-[#111827]/70 text-xs font-semibold text-[#94A3B8]">
              <th className="py-3 px-4">Document</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Knowledge</th>
              <th className="py-3 px-4">Uploaded</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                onView={onViewDocument}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

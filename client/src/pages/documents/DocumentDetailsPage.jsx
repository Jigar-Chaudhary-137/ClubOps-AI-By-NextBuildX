import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  HardDrive,
  Eye,
  Edit,
  MoreVertical,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  DocumentProcessingBadge,
  KnowledgeStatusBadge,
  DocumentPreview,
  DocumentKnowledgePanel,
  DocumentQuickActions,
  DocumentActivity,
  UploadDocumentModal
} from '../../components/documents';

export default function DocumentDetailsPage() {
  const { documentId } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Backend integration placeholder
  const document = null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Club Knowledge</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">ID: {documentId}</Badge>
        </div>
      </div>

      {/* Header Card */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <DocumentProcessingBadge status="Not Processed" size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <KnowledgeStatusBadge status="Not Added" size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>File Type: —</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                —
              </h1>

              <p className="text-xs text-[#94A3B8]">
                Document information will appear once connected.
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="More actions"
              >
                <MoreVertical className="w-4 h-4 text-[#94A3B8]" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Overview Section */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardHeader className="pb-3 border-b border-[#263247]/60">
          <CardTitle className="text-sm">Document Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <FileText className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>File Type & Size</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">—</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Category</span>
              </div>
              <p className="text-sm font-semibold text-white">—</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Eye className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Visibility</span>
              </div>
              <p className="text-sm font-semibold text-white">—</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Uploaded Date</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">—</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Last Updated</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">—</p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Knowledge Status</span>
              </div>
              <p className="text-sm font-semibold text-white">—</p>
            </div>
          </div>

          {/* Description & Empty Note */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#263247] space-y-1.5">
            <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Description
            </h4>
            <p className="text-xs text-[#94A3B8] italic">
              Document information will appear once connected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Preview & Knowledge Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <DocumentPreview />
          <DocumentKnowledgePanel />
        </div>

        {/* Right / Secondary Column: Actions & Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <DocumentQuickActions
            onUploadDocument={() => setIsEditModalOpen(true)}
          />
          <DocumentActivity />
        </div>
      </div>

      {/* Upload/Edit Modal */}
      <UploadDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

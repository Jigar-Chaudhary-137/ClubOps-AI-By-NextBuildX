import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Tag,
  HardDrive,
  Eye,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  DocumentProcessingBadge,
  KnowledgeStatusBadge,
  UploadDocumentModal
} from '../../components/documents';
import { getDocumentById, deleteDocument, addToKnowledge, removeFromKnowledge } from '../../services/api/documents';

export default function DocumentDetailsPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingKnowledge, setUpdatingKnowledge] = useState(false);

  useEffect(() => {
    async function loadDoc() {
      if (!documentId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getDocumentById(documentId);
        if (res?.data) {
          setDocument(res.data);
        }
      } catch (err) {
        console.error('Error fetching document details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [documentId]);

  const handleToggleKnowledge = async () => {
    try {
      setUpdatingKnowledge(true);
      if (document.isKnowledgeBase) {
        await removeFromKnowledge(documentId);
        setDocument(prev => ({ ...prev, isKnowledgeBase: false }));
      } else {
        await addToKnowledge(documentId);
        setDocument(prev => ({ ...prev, isKnowledgeBase: true }));
      }
    } catch (err) {
      console.error('Failed to update knowledge status:', err);
    } finally {
      setUpdatingKnowledge(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document from the knowledge base?')) return;
    try {
      await deleteDocument(documentId);
      navigate('/documents');
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading document metadata and RAG index...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-4">
        <Link to="/documents" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Club Knowledge
        </Link>
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">Document Not Found</h3>
            <p className="text-xs text-rose-200">{error || 'The requested document record does not exist.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
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
          <Badge variant="neutral">ID: #{document._id ? document._id.substring(0, 8) : documentId}</Badge>
          <Badge variant="primary" dot>RAG Ready</Badge>
        </div>
      </div>

      {/* Header Card */}
      <Card className="border-[#263247] bg-[#151D2E] shadow-xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <DocumentProcessingBadge status={document.processed ? 'Processed' : 'Ready'} size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <KnowledgeStatusBadge status={document.isKnowledgeBase ? 'In Knowledge Base' : 'General File'} size="sm" />
                <span className="text-xs text-[#64748B]">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span>Category: {document.category || 'General'}</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {document.title || document.filename}
              </h1>

              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                {document.description || 'Uploaded file indexed into the ClubOps AI knowledge base for RAG context extraction.'}
              </p>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Button
                variant={document.isKnowledgeBase ? 'secondary' : 'primary'}
                size="sm"
                leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                disabled={updatingKnowledge}
                onClick={handleToggleKnowledge}
              >
                {document.isKnowledgeBase ? 'Remove from RAG' : 'Include in RAG'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Overview Section */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardHeader className="pb-3 border-b border-[#263247]/60">
          <CardTitle className="text-sm">Document Overview & Vector Indexing</CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <FileText className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>File Size</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">
                {document.fileSize ? `${(document.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Tag className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Vector Chunks</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">
                {document.chunks?.length ?? (document.chunkCount || 1)} Chunks
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Eye className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>RAG Status</span>
              </div>
              <p className="text-sm font-semibold text-emerald-400">
                {document.isKnowledgeBase ? 'Active in RAG' : 'Not Indexed'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111827] border border-[#263247]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Uploaded</span>
              </div>
              <p className="text-sm font-semibold text-white font-mono">
                {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload/Edit Modal */}
      <UploadDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

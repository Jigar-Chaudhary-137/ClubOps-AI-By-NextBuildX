import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Search,
  Sparkles,
  LayoutGrid,
  List,
  FileText,
  Database,
  Cpu,
  Clock,
  BookOpen
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  DocumentList,
  UploadDocumentModal,
  KnowledgeSearch,
  KnowledgeAssistant
} from '../../components/documents';

const documentTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'PDF', label: 'PDF' },
  { value: 'DOCX', label: 'DOCX' },
  { value: 'TXT', label: 'TXT' },
  { value: 'Other', label: 'Other' }
];

const categoryFilterOptions = [
  { value: 'all', label: 'All Categories' }
];

const processingStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'Ready', label: 'Ready' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Not Processed', label: 'Not Processed' }
];

const sortOptions = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'added', label: 'Recently Added' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'File Size' }
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Since backend is not connected yet, documents list is empty
  const documents = [];

  const handleAskKnowledge = () => {
    // Scroll smoothly to knowledge assistant
    const el = document.getElementById('knowledge-assistant-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewDocument = (id) => {
    navigate(`/documents/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#263247]/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            Club Knowledge
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Store, organize, and prepare your club's knowledge for AI-powered assistance.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ai"
            size="sm"
            onClick={handleAskKnowledge}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Ask Club Knowledge
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Knowledge Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Documents</span>
              <FileText className="w-4 h-4 text-[#818CF8]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">—</p>
            <p className="text-[11px] text-[#64748B]">Available after documents are connected.</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Knowledge Sources</span>
              <Database className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">—</p>
            <p className="text-[11px] text-[#64748B]">Available after documents are connected.</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Processing</span>
              <Cpu className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">—</p>
            <p className="text-[11px] text-[#64748B]">Available after documents are connected.</p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Last Updated</span>
              <Clock className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">—</p>
            <p className="text-[11px] text-[#64748B]">Available after documents are connected.</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & AI Query Surfaces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="knowledge-assistant-section">
        <KnowledgeSearch />
        <KnowledgeAssistant />
      </div>

      {/* Document Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search documents..."
                leftIcon={<Search className="w-4 h-4 text-[#94A3B8]" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-36">
                <Select
                  options={documentTypeOptions}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  options={categoryFilterOptions}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  options={processingStatusOptions}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-40">
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>

              {/* Grid / List Switcher */}
              <div className="flex items-center p-1 rounded-lg bg-[#111827] border border-[#263247]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#151D2E] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  aria-label="List view"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[#151D2E] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List / Grid (renders empty state when documents = []) */}
      <DocumentList
        documents={documents}
        viewMode={viewMode}
        onViewDocument={handleViewDocument}
        onUploadDocument={() => setIsUploadModalOpen(true)}
        onAskKnowledge={handleAskKnowledge}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}

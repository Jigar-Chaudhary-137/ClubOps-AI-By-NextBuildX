import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  BookOpen,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  DocumentList,
  UploadDocumentModal,
  KnowledgeSearch,
  KnowledgeAssistant,
  KnowledgeSearchResults
} from '../../components/documents';
import {
  getDocuments,
  searchKnowledge,
  askKnowledgeAssistant
} from '../../services/api/documents';

const documentTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'txt', label: 'TXT' },
  { value: 'md', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'other', label: 'Other' }
];

const categoryFilterOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General / Policies' },
  { value: 'guidelines', label: 'Guidelines' },
  { value: 'rules', label: 'Rules' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'budget', label: 'Budget' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' }
];

const processingStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'ready', label: 'Ready / Processed' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
  { value: 'not processed', label: 'Not Processed' }
];

const sortOptions = [
  { value: 'updated', label: 'Recently Updated' },
  { value: 'added', label: 'Recently Added' },
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'File Size' }
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Semantic RAG search states
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // AI Knowledge Assistant query states
  const [isAsking, setIsAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [askError, setAskError] = useState(null);

  const pollingRef = useRef(null);

  // Normalize backend documents
  const normalizeDocuments = (rawList) => {
    return (Array.isArray(rawList) ? rawList : []).map((doc) => {
      const ext = doc.fileType || (doc.title?.includes('.') ? doc.title.split('.').pop() : 'other');
      const rawStatus = (doc.ingestionStatus || 'pending').toLowerCase();

      let processingStatus = 'Not Processed';
      if (rawStatus === 'processed') processingStatus = 'Ready';
      else if (rawStatus === 'processing' || rawStatus === 'pending') processingStatus = 'Processing';
      else if (rawStatus === 'failed') processingStatus = 'Failed';

      let knowledgeStatus = 'Not Added';
      if (doc.isKnowledgeBase) {
        if (rawStatus === 'processed') knowledgeStatus = 'Ready';
        else if (rawStatus === 'processing' || rawStatus === 'pending') knowledgeStatus = 'Preparing';
        else if (rawStatus === 'failed') knowledgeStatus = 'Unavailable';
        else knowledgeStatus = 'Ready';
      }

      const rawCategory = (doc.category || 'general').toLowerCase();
      const displayCategory = doc.category
        ? doc.category.charAt(0).toUpperCase() + doc.category.slice(1)
        : 'General';

      return {
        id: doc._id || doc.id,
        _id: doc._id || doc.id,
        name: doc.title || 'Untitled Document',
        title: doc.title || 'Untitled Document',
        description: doc.description || '',
        fileType: ext.toUpperCase(),
        rawFileType: ext.toLowerCase(),
        fileSize: doc.fileSize
          ? `${(doc.fileSize / 1024).toFixed(1)} KB`
          : doc.extractedCharacterCount
            ? `${Math.round(doc.extractedCharacterCount / 1000)}k chars`
            : '—',
        category: displayCategory,
        rawCategory: rawCategory,
        uploadDate: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recently',
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Recently',
        createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        updatedAtDate: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
        processingStatus,
        rawStatus,
        knowledgeStatus,
        isKnowledgeBase: Boolean(doc.isKnowledgeBase),
        chunkCount: doc.chunkCount || doc.chunks?.length || 0,
        raw: doc
      };
    });
  };

  // Fetch documents from backend
  const fetchDocumentData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const res = await getDocuments();

      let rawDocs = [];
      if (Array.isArray(res?.data)) {
        rawDocs = res.data;
      } else if (Array.isArray(res?.data?.documents)) {
        rawDocs = res.data.documents;
      } else if (Array.isArray(res?.documents)) {
        rawDocs = res.documents;
      } else if (Array.isArray(res)) {
        rawDocs = res;
      }

      const normalized = normalizeDocuments(rawDocs);
      setDocuments(normalized);

      // Check if any document is currently in 'processing' or 'pending' state
      const hasUnfinished = normalized.some((d) => ['processing', 'pending'].includes(d.rawStatus));
      if (hasUnfinished) {
        if (!pollingRef.current) {
          pollingRef.current = setInterval(() => {
            fetchDocumentData(true);
          }, 3000);
        }
      } else {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      if (!isSilent) {
        setError('Unable to load documents. Please try again.');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentData();
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchDocumentData]);

  // Handle Semantic RAG Search
  const handleSearchKnowledge = async (queryText) => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await searchKnowledge(queryText);
      const rawResults = Array.isArray(res?.data?.chunks)
        ? res.data.chunks
        : Array.isArray(res?.data)
          ? res.data
          : [];

      const formatted = rawResults.map((chunk, idx) => ({
        id: chunk._id || chunk.chunkIndex || idx,
        documentName: chunk.documentTitle || chunk.title || 'Club Document',
        documentId: chunk.documentId || chunk.document || '',
        category: chunk.category || 'Knowledge Base',
        excerpt: chunk.text || chunk.content || '',
        score: chunk.similarity !== undefined ? chunk.similarity : (chunk.score || 0.85)
      }));

      setSearchResults(formatted);

      // Scroll to results if present
      const el = document.getElementById('knowledge-results-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Semantic search failed:', err);
      setSearchError(err.response?.data?.message || err.message || 'Semantic search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle AI Knowledge Assistant Query
  const handleAskKnowledge = async (queryText) => {
    setIsAsking(true);
    setAskError(null);
    try {
      const res = await askKnowledgeAssistant(queryText);
      if (res?.data) {
        setAiAnswer({
          query: queryText,
          answer: res.data.answer || res.data.response || 'No answer generated.',
          citations: res.data.citations || [],
          totalSourcesFound: res.data.totalSourcesFound || 0
        });
      }
    } catch (err) {
      console.error('Ask Knowledge AI failed:', err);
      setAskError(err.response?.data?.message || err.message || 'Failed to synthesize answer');
    } finally {
      setIsAsking(false);
    }
  };

  const handleViewDocument = (id) => {
    navigate(`/documents/${id}`);
  };

  // Derived Overview Statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const knowledgeSources = documents.filter((d) => d.isKnowledgeBase).length;
    const processing = documents.filter((d) => ['processing', 'pending'].includes(d.rawStatus)).length;
    
    let lastUpdatedFormatted = '—';
    if (documents.length > 0) {
      const sortedByDate = [...documents].sort((a, b) => b.updatedAtDate - a.updatedAtDate);
      lastUpdatedFormatted = sortedByDate[0].updatedAt;
    }

    return {
      total,
      knowledgeSources,
      processing,
      lastUpdated: lastUpdatedFormatted
    };
  }, [documents]);

  // Filter & Sort Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(query);
        const matchesDesc = d.description.toLowerCase().includes(query);
        const matchesCat = d.category.toLowerCase().includes(query);
        const matchesType = d.fileType.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesType) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all' && d.rawFileType !== typeFilter.toLowerCase()) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && d.rawCategory !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const statusMap = {
          ready: 'Ready',
          processing: 'Processing',
          failed: 'Failed',
          'not processed': 'Not Processed'
        };
        if (d.processingStatus !== statusMap[statusFilter]) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'updated') return b.updatedAtDate - a.updatedAtDate;
      if (sortBy === 'added') return b.createdAt - a.createdAt;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return (b.chunkCount || 0) - (a.chunkCount || 0);
      return 0;
    });
  }, [documents, searchQuery, typeFilter, categoryFilter, statusFilter, sortBy]);

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
            onClick={() => {
              const el = document.getElementById('knowledge-assistant-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
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

      {/* Error Banner with Retry */}
      {error && (
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#F87171] flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchDocumentData()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Real Knowledge Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Documents</span>
              <FileText className="w-4 h-4 text-[#818CF8]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">
              {loading ? '...' : stats.total}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {stats.total === 1
                ? '1 document in repository.'
                : stats.total > 0
                  ? `${stats.total} documents in repository.`
                  : 'No documents uploaded yet.'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Knowledge Sources</span>
              <Database className="w-4 h-4 text-[#A78BFA]" />
            </div>
            <p className="text-xl font-bold text-[#A78BFA] font-mono">
              {loading ? '...' : stats.knowledgeSources}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {stats.knowledgeSources === 1
                ? '1 active AI knowledge source.'
                : stats.knowledgeSources > 0
                  ? `${stats.knowledgeSources} active AI knowledge sources.`
                  : 'No documents added to RAG.'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Processing</span>
              <Cpu className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <p className="text-xl font-bold text-amber-300 font-mono">
              {loading ? '...' : stats.processing}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {stats.processing > 0
                ? `${stats.processing} document(s) indexing.`
                : 'All documents indexed & ready.'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#263247] bg-[#151D2E]">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="text-xs font-medium">Last Updated</span>
              <Clock className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <p className="text-xl font-bold text-white font-mono">
              {loading ? '...' : stats.lastUpdated}
            </p>
            <p className="text-[11px] text-[#64748B]">
              {stats.total > 0
                ? `Latest change: ${stats.lastUpdated}`
                : 'No document activity yet.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & AI Query Surfaces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="knowledge-assistant-section">
        <KnowledgeSearch
          onSearch={handleSearchKnowledge}
          isLoading={isSearching}
        />
        <KnowledgeAssistant
          onAsk={handleAskKnowledge}
          isLoading={isAsking}
          answerData={aiAnswer}
          error={askError}
        />
      </div>

      {/* Semantic Search Results (if search executed) */}
      {searchResults && (
        <div id="knowledge-results-section">
          <KnowledgeSearchResults
            results={searchResults}
            onOpenDocument={handleViewDocument}
          />
        </div>
      )}

      {/* Document Toolbar */}
      <Card className="border-[#263247] bg-[#151D2E]">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search documents by title, description, or category..."
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

              <div className="w-full sm:w-40">
                <Select
                  options={categoryFilterOptions}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-40">
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

      {/* Document List / Grid */}
      <DocumentList
        documents={filteredDocuments}
        viewMode={viewMode}
        onViewDocument={handleViewDocument}
        onUploadDocument={() => setIsUploadModalOpen(true)}
        onAskKnowledge={() => {
          const el = document.getElementById('knowledge-assistant-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={async () => {
          await fetchDocumentData();
        }}
      />
    </div>
  );
}

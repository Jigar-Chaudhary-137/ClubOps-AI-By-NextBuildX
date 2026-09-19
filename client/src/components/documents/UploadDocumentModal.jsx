import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';

const categoryOptions = [
  { value: 'Policies', label: 'Policies' },
  { value: 'Event Planning', label: 'Event Planning' },
  { value: 'Guidelines', label: 'Guidelines' },
  { value: 'Training', label: 'Training' },
  { value: 'Club Information', label: 'Club Information' },
  { value: 'Meeting Notes', label: 'Meeting Notes' },
  { value: 'Reports', label: 'Reports' },
  { value: 'Other', label: 'Other' }
];

const visibilityOptions = [
  { value: 'Club Members', label: 'Club Members' },
  { value: 'Organizers Only', label: 'Organizers Only' }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];

export default function UploadDocumentModal({
  isOpen,
  onClose
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Policies',
    description: '',
    visibility: 'Club Members',
    addToKnowledge: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState(false);

  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrors((prev) => ({
        ...prev,
        file: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.'
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        file: 'File exceeds 10 MB limit. Please select a smaller file.'
      }));
      return;
    }

    // Clear file errors
    setErrors((prev) => ({ ...prev, file: null }));
    setSelectedFile(file);

    // Auto populate document name if empty
    if (!formData.name.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      setFormData((prev) => ({ ...prev, name: baseName }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedFile) {
      newErrors.file = 'Please select a document file to upload.';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Document name is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedbackNotice(true);

      setTimeout(() => {
        setFeedbackNotice(false);
        handleModalClose();
      }, 2500);
    }, 500);
  };

  const handleModalClose = () => {
    setSelectedFile(null);
    setFormData({
      name: '',
      category: 'Policies',
      description: '',
      visibility: 'Club Members',
      addToKnowledge: true
    });
    setErrors({});
    setIsSubmitting(false);
    setFeedbackNotice(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Upload Document"
      description="Add documents to your repository and prepare them for Club Knowledge indexing."
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#64748B]">
            Maximum file size: 10 MB
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleModalClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Upload Document
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Backend Integration Info Banner */}
        <div className="p-3 rounded-lg bg-[#111827] border border-[#263247] text-xs text-[#94A3B8] leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Integration Status:</span>{' '}
            Document upload and processing will be connected in the next integration phase. Local validation is fully operational.
          </div>
        </div>

        {feedbackNotice && (
          <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#4ADE80] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Document upload and processing will be connected in the next integration phase.</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        {/* Drag & Drop Area or File Preview */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
              ${dragOver
                ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                : 'border-[#263247] bg-[#111827]/60 hover:border-[#6366F1]/50 hover:bg-[#151D2E]'}
              ${errors.file ? 'border-[#EF4444]' : ''}
            `}
          >
            <div className="flex flex-col items-center justify-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#6366F1]/15 text-[#818CF8] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Drop document here
                </p>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  or <span className="text-[#818CF8] font-medium underline underline-offset-2">Click to browse</span>
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#64748B]">
                <span className="px-2 py-0.5 rounded bg-[#151D2E] border border-[#263247] font-mono">PDF</span>
                <span className="px-2 py-0.5 rounded bg-[#151D2E] border border-[#263247] font-mono">DOCX</span>
                <span className="px-2 py-0.5 rounded bg-[#151D2E] border border-[#263247] font-mono">TXT</span>
                <span>(Max 10 MB)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#263247] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-[#151D2E] border border-[#263247] text-[#818CF8] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden text-xs">
                  <p className="font-semibold text-white truncate">{selectedFile.name}</p>
                  <p className="text-[#94A3B8] font-mono text-[11px]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.name.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F87171] hover:bg-[#151D2E] transition-colors"
                title="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#818CF8] bg-[#6366F1]/10 p-2.5 rounded-lg border border-[#6366F1]/20 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Document processing will be available after backend integration.</span>
            </p>
          </div>
        )}

        {errors.file && (
          <p className="text-xs text-[#EF4444]">{errors.file}</p>
        )}

        {/* Document Name */}
        <Input
          label="Document Name *"
          placeholder="e.g. Club Constitution 2026"
          value={formData.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
          }}
          error={errors.name}
          disabled={isSubmitting}
        />

        {/* Category & Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            disabled={isSubmitting}
          />
          <Select
            label="Visibility"
            options={visibilityOptions}
            value={formData.visibility}
            onChange={(e) => setFormData((prev) => ({ ...prev, visibility: e.target.value }))}
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="Describe what this document contains..."
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          disabled={isSubmitting}
        />

        {/* Add to Club Knowledge Toggle */}
        <div className="p-3.5 rounded-xl bg-[#111827] border border-[#263247] space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Make this document available to ClubOps AI</span>
              </span>
              <p className="text-[11px] text-[#94A3B8]">
                Documents added to Club Knowledge can later be retrieved by the AI assistant.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.addToKnowledge}
              onChange={(e) => setFormData((prev) => ({ ...prev, addToKnowledge: e.target.checked }))}
              className="w-4 h-4 rounded border-[#263247] bg-[#151D2E] text-[#6366F1] focus:ring-[#6366F1]"
              disabled={isSubmitting}
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}

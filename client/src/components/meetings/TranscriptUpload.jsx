import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';

export default function TranscriptUpload({
  onFileSelect,
  className = ''
}) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notice, setNotice] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setNotice('Transcript processing will be available after backend integration.');
    onFileSelect?.(file);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setNotice(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
        accept=".txt,.pdf,.docx"
        className="hidden"
      />

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200
          ${dragOver
            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-lg shadow-[#8B5CF6]/10'
            : 'border-[#263247] bg-[#111827]/60 hover:border-[#6366F1]/50 hover:bg-[#151D2E]'}
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#6366F1]/15 text-[#818CF8] flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Drop transcript here
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              or <span className="text-[#818CF8] font-medium underline underline-offset-2">Click to browse</span>
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#151D2E] border border-[#263247] text-[#94A3B8] font-mono">
              TXT
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#151D2E] border border-[#263247] text-[#94A3B8] font-mono">
              PDF
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#151D2E] border border-[#263247] text-[#94A3B8] font-mono">
              DOCX
            </span>
          </div>
        </div>
      </div>

      {/* File selected preview */}
      {selectedFile && (
        <div className="p-3 rounded-lg bg-[#151D2E] border border-[#263247] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <FileText className="w-4 h-4 text-[#818CF8] shrink-0" />
            <div className="overflow-hidden text-xs">
              <p className="font-semibold text-white truncate">{selectedFile.name}</p>
              <p className="text-[#94A3B8] font-mono text-[11px]">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notice */}
      {notice && (
        <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{notice}</div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { FileText, Upload, Folder, Search, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';

const categories = [
  { name: 'Club Guidelines & Constitution', count: 0 },
  { name: 'Sponsorship Packages & Templates', count: 0 },
  { name: 'Venue Rules & Security Forms', count: 0 },
  { name: 'Previous Event Retrospectives', count: 0 }
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Club Document & Knowledge Repository
            </h1>
            <Badge variant="primary">RAG Knowledge Base</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Centralized repository for club guidelines, sponsorship templates, and RAG retrieval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload className="w-4 h-4" />}
            disabled
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search documents or ask AI for grounded answers..."
            leftIcon={<Search className="w-4 h-4" />}
            disabled
          />
        </div>
      </div>

      {/* Category Folders Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => (
          <Card key={idx} hoverEffect>
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#818CF8] flex items-center justify-center shrink-0">
                <Folder className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                  {cat.name}
                </p>
                <p className="text-[11px] text-[#94A3B8]">
                  {cat.count} documents
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Document Records View */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Repository Files</CardTitle>
            <CardDescription>Documents indexed for AI semantic search</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<BookOpen className="w-7 h-7 text-[#818CF8]" />}
            title="Repository is empty"
            description="Upload PDF guides, sponsor contracts, or club protocols. The AI layer will embed these for grounded Q&A and policy checking."
            action={
              <Button variant="outline" size="sm" disabled leftIcon={<Upload className="w-4 h-4" />}>
                Upload First Document
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

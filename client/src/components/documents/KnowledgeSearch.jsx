import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function KnowledgeSearch({
  onSearch,
  className = ''
}) {
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState(null);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setNotice('Knowledge search will be available after document indexing and AI integration.');
    setTimeout(() => setNotice(null), 4500);
    onSearch?.(query);
  };

  return (
    <Card className={`border-[#263247] bg-[#151D2E] shadow-lg relative overflow-hidden ${className}`}>
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#22C55E]" />

      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Search Club Knowledge</CardTitle>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Semantic RAG</span>
          </span>
        </div>
        <CardDescription>
          Search policies, event plans, meeting notes, guidelines, and other club documents.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1">
            <Input
              placeholder="Ask something about your club..."
              leftIcon={<Search className="w-4 h-4 text-[#818CF8]" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="ai"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Search Knowledge
          </Button>
        </form>

        {notice && (
          <div className="p-3 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

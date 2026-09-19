import React from 'react';
import { Search, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';

export default function KnowledgeSearchResults({
  results = [],
  onOpenDocument,
  className = ''
}) {
  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Knowledge Search Results</CardTitle>
            {results.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/30">
                {results.length}
              </span>
            )}
          </div>
          <CardDescription>
            Semantic matches retrieved from indexed club documents.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {results.length === 0 ? (
          <div className="py-6 sm:py-8">
            <EmptyState
              icon={<Search className="w-7 h-7 text-[#818CF8]" />}
              title="No knowledge results yet."
              description="Search results will appear once your club knowledge is indexed."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((res, idx) => (
              <div
                key={res.id || idx}
                className="p-4 rounded-xl bg-[#111827] border border-[#263247] hover:border-[#374151] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#818CF8] shrink-0" />
                    <h4 className="text-sm font-semibold text-white truncate">
                      {res.documentName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="neutral" size="sm">{res.category || 'General'}</Badge>
                    {res.score && (
                      <span className="text-[11px] font-mono text-[#4ADE80] bg-[#22C55E]/10 border border-[#22C55E]/30 px-2 py-0.5 rounded-md">
                        {(res.score * 100).toFixed(0)}% Match
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-3 bg-[#151D2E]/60 p-2.5 rounded-lg border border-[#263247]/40 font-mono">
                  "{res.excerpt}"
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenDocument?.(res.documentId)}
                    className="text-xs font-medium text-[#818CF8] hover:text-white inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Open Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

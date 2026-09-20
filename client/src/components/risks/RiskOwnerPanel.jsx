import React, { useState } from 'react';
import { User, UserPlus, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';

export default function RiskOwnerPanel({
  owner = '—',
  className = ''
}) {
  const [notice, setNotice] = useState(null);

  const handleAssignOwner = () => {
    setNotice('Risk owner assignment options updated.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <Card className={`border-[#263247] bg-[#151D2E] ${className}`}>
      <CardHeader className="pb-3 border-b border-[#263247]/60">
        <CardTitle className="text-sm">Risk Owner</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {notice && (
          <div className="p-2.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#818CF8] flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="p-3.5 rounded-lg bg-[#111827] border border-[#263247] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#151D2E] border border-[#263247] flex items-center justify-center text-[#818CF8]">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white font-mono">{owner}</p>
            <p className="text-[11px] text-[#94A3B8]">
              Assigned operational risk owner.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={handleAssignOwner}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Assign Owner
        </Button>
      </CardContent>
    </Card>
  );
}

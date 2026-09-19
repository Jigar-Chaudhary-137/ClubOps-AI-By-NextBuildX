import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-[#151D2E] border border-[#263247] flex items-center justify-center text-[#818CF8] mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-[#94A3B8] max-w-md mb-6">
        The route you are trying to access does not exist in the ClubOps AI workspace.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

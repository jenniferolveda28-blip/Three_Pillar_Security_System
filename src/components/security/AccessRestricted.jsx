import React from 'react';
import { useGuestAuditor } from '@/lib/useGuestAuditor';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AccessRestricted({ feature }) {
  const { isGuestAuditor } = useGuestAuditor();
  if (!isGuestAuditor) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center bg-slate-900/60 border border-slate-700 rounded-2xl p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-400 mb-6">
          {feature} is not available for Guest Auditor accounts. This feature is locked for demonstration safety.
        </p>
        <Link to="/">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
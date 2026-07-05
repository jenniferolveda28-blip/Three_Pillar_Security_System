import React from 'react';
import { useAuditMode } from '@/lib/AuditModeContext';
import { ShieldAlert } from 'lucide-react';

export default function AuditModeBanner() {
  const { bypassActive } = useAuditMode();

  if (!bypassActive) return null;

  return (
    <div className="relative z-50 bg-red-600 text-white border-b-2 border-red-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse" />
        <span className="text-xs sm:text-sm font-bold tracking-wide">
          ⚠️ AUDIT MODE — Authentication bypassed for demonstration. Hardware prototype required for real biometric verification.
        </span>
      </div>
    </div>
  );
}
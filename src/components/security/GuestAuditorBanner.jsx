import React from 'react';
import { useGuestAuditor } from '@/lib/useGuestAuditor';
import { ShieldAlert, HardDrive, Lock } from 'lucide-react';

export default function GuestAuditorBanner() {
  const { isGuestAuditor } = useGuestAuditor();
  if (!isGuestAuditor) return null;

  return (
    <div className="bg-amber-500/10 border-y-2 border-amber-500/50 text-amber-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <HardDrive className="w-5 h-5 text-amber-400" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">GUEST AUDITOR</span>
        </div>
        <span className="text-xs text-amber-200/80">
          Demonstration access · Hardware prototype required for real biometric verification · PDF export, Security Logs, Investor CRM, and settings are restricted.
        </span>
      </div>
    </div>
  );
}
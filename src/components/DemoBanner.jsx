import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-amber-500 text-amber-950 border-b border-amber-600">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>⚠️ DEMO ENVIRONMENT — INTERNAL TESTING ONLY. Not for production use. Simulated security layer. Physical hardware prototype required for full functionality.</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 hover:bg-amber-600/30 rounded transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
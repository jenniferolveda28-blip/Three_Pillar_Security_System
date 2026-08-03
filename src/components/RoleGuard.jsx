import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function RoleGuard({ allow, children }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const role = user?.role;
  const permitted = allow.includes(role);

  if (!permitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
        <p className="text-slate-400">
          This report is restricted to authorized roles only. Your role ({role || 'none'}) does not grant access.
        </p>
      </div>
    );
  }

  return children;
}
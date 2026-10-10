import React from 'react';

export default function PartnerStatCard({ label, value, sublabel, icon: Icon, tone = 'cyan' }) {
  const toneMap = {
    cyan: 'from-cyan-500/15 border-cyan-500/30 text-cyan-300',
    emerald: 'from-emerald-500/15 border-emerald-500/30 text-emerald-300',
    amber: 'from-amber-500/15 border-amber-500/30 text-amber-300',
    rose: 'from-rose-500/15 border-rose-500/30 text-rose-300',
    violet: 'from-violet-500/15 border-violet-500/30 text-violet-300',
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${toneMap[tone]} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
        </div>
        {Icon && (
          <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-950/40 border border-slate-700 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
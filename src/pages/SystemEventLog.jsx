import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ScrollText, Search, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const eventTypeIcons = {
  key_rotation: Shield,
  access_granted: Shield,
  access_denied: Shield,
  dna_verified: Shield,
  suspicious_activity: Shield,
  universe_accessed: Shield,
};

const threatColors = {
  none: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export default function SystemEventLog() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [threatFilter, setThreatFilter] = useState('all');

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['secLogsEventLog'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 200),
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['metricsEventLog'],
    queryFn: () => base44.entities.AnalyticsMetric.list('-created_date', 200),
  });

  const isLoading = logsLoading || metricsLoading;
  if (isLoading) return <div className="p-8 text-slate-400">Loading system event log…</div>;

  // Merge logs and metrics into unified entries
  const logEntries = logs.map(l => ({
    id: l.id,
    timestamp: l.created_date,
    type: l.event_type,
    source: 'security_log',
    details: l.details || '',
    threat_level: l.threat_level || 'none',
    ip: l.ip_address || '',
    success: l.success !== false,
    universe: l.universe_id || '',
  }));

  const metricEntries = metrics.map(m => ({
    id: m.id,
    timestamp: m.created_date,
    type: m.metric_type,
    source: 'analytics',
    details: m.endpoint ? `${m.method || ''} ${m.endpoint}` : (m.error_type || ''),
    threat_level: m.success === false ? 'medium' : 'none',
    ip: m.ip_address || '',
    success: m.success !== false,
    universe: m.universe_id || '',
  }));

  const allEntries = [...logEntries, ...metricEntries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = allEntries.filter(e => {
    const matchSearch = !search || (e.type || '').toLowerCase().includes(search.toLowerCase()) || (e.details || '').toLowerCase().includes(search.toLowerCase()) || (e.ip || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    const matchThreat = threatFilter === 'all' || e.threat_level === threatFilter;
    return matchSearch && matchType && matchThreat;
  });

  const eventTypes = [...new Set(allEntries.map(e => e.type))].filter(Boolean);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-cyan-400" /> System Event Log
        </h1>
        <p className="text-slate-400 mt-1">Centralized log of all system-level events and user actions</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <CardTitle className="text-white">Event Log ({filtered.length})</CardTitle>
            <div className="flex-1" />
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…" className="bg-slate-900 border-slate-700 text-white pl-9 w-56" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
              <option value="all">All Types</option>
              {eventTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={threatFilter} onChange={e => setThreatFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
              <option value="all">All Threats</option>
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? <p className="text-slate-500 py-8 text-center">No events found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-left">
                    <th className="pb-3 pr-4">Timestamp</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Source</th>
                    <th className="pb-3 pr-4">Threat</th>
                    <th className="pb-3 pr-4">Details</th>
                    <th className="pb-3 pr-4">IP</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map(e => (
                    <tr key={e.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                      <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 pr-4 text-slate-200">{e.type?.replace(/_/g, ' ') || '—'}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="text-xs">{e.source}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={threatColors[e.threat_level] || threatColors.none}>{e.threat_level}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 max-w-xs truncate">{e.details || '—'}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{e.ip || '—'}</td>
                      <td className="py-3 pr-4">
                        {e.success ? <span className="text-green-400 text-xs">✓ Success</span> : <span className="text-red-400 text-xs">✗ Failed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 100 && <p className="text-slate-500 text-xs text-center py-4">Showing 100 of {filtered.length} events</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
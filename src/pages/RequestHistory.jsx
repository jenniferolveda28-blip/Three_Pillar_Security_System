import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Network, Search, Clock, AlertTriangle, CheckCircle, XCircle, FileDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportBulkPDF } from '@/components/reports/BulkPDFExport';

const statusConfig = {
  success: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle },
  failed: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: XCircle },
  pending: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/50', icon: Clock },
  routing: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: Network },
  processing: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50', icon: Clock },
  retry: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/50', icon: AlertTriangle },
};

export default function RequestHistory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = () => {
    setExporting(true);
    try {
      const avgLat = filtered.length > 0 ? Math.round(filtered.reduce((s, r) => s + (r.latency_ms || 0), 0) / filtered.length) : 0;
      exportBulkPDF(
        'API Request History',
        'All universal requests with routing outcomes and latency',
        [
          {
            sectionTitle: 'Summary Statistics',
            headers: [],
            rows: [],
            colWidths: [],
            summary: [
              { label: 'Total Requests', value: filtered.length },
              { label: 'Avg Latency', value: `${avgLat}ms` },
              { label: 'Successes', value: filtered.filter(r => r.status === 'success').length },
              { label: 'Failures', value: filtered.filter(r => r.status === 'failed').length },
              { label: 'Fallbacks', value: filtered.filter(r => r.fallback_used).length },
            ],
          },
          {
            sectionTitle: 'Request Log',
            headers: ['Intent', 'Routed To', 'Status', 'Latency', 'Fallback', 'AI Reasoning', 'Error'],
            colWidths: [50, 35, 25, 20, 20, 50, 50],
            rows: filtered.map(r => [
              (r.intent || '—').slice(0, 60),
              r.routed_to || '—',
              r.status || '—',
              r.latency_ms ? `${r.latency_ms}ms` : '—',
              r.fallback_used ? 'Yes' : 'No',
              (r.ai_reasoning || '—').slice(0, 60),
              (r.error_message || '—').slice(0, 60),
            ]),
          },
        ],
        `request-history-${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } finally { setExporting(false); }
  };

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['universalRequests'],
    queryFn: () => base44.entities.UniversalRequest.list('-created_date', 200),
  });

  const filtered = requests.filter(r => {
    const matchSearch = !search || (r.intent || '').toLowerCase().includes(search.toLowerCase()) || (r.routed_to || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const avgLatency = filtered.length > 0 ? Math.round(filtered.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / filtered.length) : 0;
  const successCount = filtered.filter(r => r.status === 'success').length;
  const failedCount = filtered.filter(r => r.status === 'failed').length;

  if (isLoading) return <div className="p-8 text-slate-400">Loading request history…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-cyan-400" /> API Request History
          </h1>
          <p className="text-slate-400 mt-1">Track all universal requests, routing outcomes, and latency metrics</p>
        </div>
        <Button onClick={handleExportPDF} disabled={exporting || filtered.length === 0} className="bg-cyan-600 hover:bg-cyan-700">
          {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
          {exporting ? 'Generating…' : 'Download PDF'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Total Requests</p>
            <p className="text-2xl font-bold text-white">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Avg Latency</p>
            <p className="text-2xl font-bold text-cyan-400">{avgLatency}ms</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Successes</p>
            <p className="text-2xl font-bold text-green-400">{successCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Failures</p>
            <p className="text-2xl font-bold text-red-400">{failedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <CardTitle className="text-white">Request Log</CardTitle>
            <div className="flex-1" />
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search intent or route…" className="bg-slate-900 border-slate-700 text-white pl-9 w-64" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="routing">Routing</option>
              <option value="processing">Processing</option>
              <option value="retry">Retry</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? <p className="text-slate-500 py-8 text-center">No requests found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-left">
                    <th className="pb-3 pr-4">Intent</th>
                    <th className="pb-3 pr-4">Routed To</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Latency</th>
                    <th className="pb-3 pr-4">Fallback</th>
                    <th className="pb-3 pr-4">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const cfg = statusConfig[r.status] || statusConfig.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={r.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                        <td className="py-3 pr-4 text-slate-200 max-w-xs truncate">{r.intent || '—'}</td>
                        <td className="py-3 pr-4 text-slate-300">{r.routed_to || '—'}</td>
                        <td className="py-3 pr-4">
                          <Badge className={cfg.color}><StatusIcon className="w-3 h-3 mr-1" /> {r.status}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={r.latency_ms > 1000 ? 'text-amber-400' : 'text-slate-300'}>{r.latency_ms ? `${r.latency_ms}ms` : '—'}</span>
                        </td>
                        <td className="py-3 pr-4">{r.fallback_used ? <Badge variant="destructive">Yes</Badge> : <span className="text-slate-500">No</span>}</td>
                        <td className="py-3 pr-4 text-red-400 max-w-xs truncate">{r.error_message || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
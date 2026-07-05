import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Activity, AlertTriangle, ShieldCheck, ShieldX, Globe, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useGuestAuditor } from '@/lib/useGuestAuditor';
import AccessRestricted from '@/components/security/AccessRestricted';

const EVENT_ICONS = {
  key_rotation: ShieldCheck,
  access_granted: ShieldCheck,
  access_denied: ShieldX,
  dna_verified: ShieldCheck,
  suspicious_activity: AlertTriangle,
  universe_accessed: Globe,
};

const THREAT_COLORS = {
  none: 'bg-slate-600',
  low: 'bg-blue-600',
  medium: 'bg-yellow-600',
  high: 'bg-orange-600',
  critical: 'bg-red-600',
};

export default function SystemLogs() {
  const { isGuestAuditor } = useGuestAuditor();
  const [search, setSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all');
  const [reqFilter, setReqFilter] = useState('all');

  const { data: logs = [] } = useQuery({
    queryKey: ['securityLogs_audit'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 200),
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['universalRequests_audit'],
    queryFn: () => base44.entities.UniversalRequest.list('-created_date', 200),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['analyticsMetrics_audit'],
    queryFn: () => base44.entities.AnalyticsMetric.list('-created_date', 200),
  });

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = !search ||
        l.event_type?.toLowerCase().includes(search.toLowerCase()) ||
        l.details?.toLowerCase().includes(search.toLowerCase()) ||
        l.ip_address?.toLowerCase().includes(search.toLowerCase()) ||
        l.universe_id?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = logFilter === 'all' ||
        (logFilter === 'success' && l.success) ||
        (logFilter === 'blocked' && !l.success) ||
        (logFilter === 'threat' && (l.threat_level === 'high' || l.threat_level === 'critical'));
      return matchesSearch && matchesFilter;
    });
  }, [logs, search, logFilter]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = !search ||
        r.intent?.toLowerCase().includes(search.toLowerCase()) ||
        r.routed_to?.toLowerCase().includes(search.toLowerCase()) ||
        r.ai_reasoning?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = reqFilter === 'all' || r.status === reqFilter;
      return matchesSearch && matchesFilter;
    });
  }, [requests, search, reqFilter]);

  if (isGuestAuditor) return <AccessRestricted feature="Security Logs" />;

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, 4, 40, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SYSTEM LOGS — AUDIT EXPORT', 12, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, 12, 30);
    doc.text(`Security Events: ${filteredLogs.length} | API Requests: ${filteredRequests.length}`, 12, 36);

    let y = 50;
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text('SECURITY LOG EVENTS', 12, y);
    y += 6;
    doc.setFontSize(8);
    filteredLogs.slice(0, 80).forEach(l => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setTextColor(100, 116, 139);
      doc.text(`[${l.threat_level?.toUpperCase() || 'NONE'}] ${l.event_type} — ${l.success ? 'SUCCESS' : 'BLOCKED'} — ${l.details || ''}`, 12, y);
      y += 5;
    });

    y += 6;
    doc.setFontSize(12);
    doc.setTextColor(6, 182, 212);
    doc.text('API REQUEST HISTORY', 12, y);
    y += 6;
    doc.setFontSize(8);
    filteredRequests.slice(0, 80).forEach(r => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setTextColor(100, 116, 139);
      doc.text(`[${r.status?.toUpperCase()}] ${r.intent} → ${r.routed_to || 'N/A'} (${r.latency_ms || '?'}ms)`, 12, y);
      y += 5;
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    toast.success('Audit log exported!');
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black gradient-text">System Logs</h1>
            <p className="text-slate-400 mt-1">Searchable audit trail of all system activities & API requests</p>
          </div>
          <Button onClick={handleExport} className="bg-cyan-600 hover:bg-cyan-500">
            <Download className="w-4 h-4 mr-2" /> Export Audit PDF
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Security Events', value: logs.length, icon: ShieldCheck, color: 'text-cyan-400' },
            { label: 'API Requests', value: requests.length, icon: Activity, color: 'text-emerald-400' },
            { label: 'Blocked Events', value: logs.filter(l => !l.success).length, icon: ShieldX, color: 'text-red-400' },
            { label: 'Critical Threats', value: logs.filter(l => l.threat_level === 'critical').length, icon: AlertTriangle, color: 'text-orange-400' },
          ].map((s, i) => (
            <Card key={i} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-5 flex items-center gap-4">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-slate-400 text-xs">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input className="bg-slate-800 border-slate-700 text-white pl-10" placeholder="Search events, IPs, intents, universes..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={logFilter} onValueChange={setLogFilter}>
            <SelectTrigger className="w-44 bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Log filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="success">Success Only</SelectItem>
              <SelectItem value="blocked">Blocked Only</SelectItem>
              <SelectItem value="threat">High/Critical Threats</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reqFilter} onValueChange={setReqFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Request filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Security Log Events ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredLogs.length === 0 && <p className="text-slate-500 text-center py-8">No matching log entries.</p>}
              {filteredLogs.map(l => {
                const Icon = EVENT_ICONS[l.event_type] || Activity;
                return (
                  <div key={l.id} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600">
                    <Icon className={`w-4 h-4 mt-0.5 ${l.success ? 'text-green-400' : 'text-red-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{l.event_type}</span>
                        <Badge className={`${THREAT_COLORS[l.threat_level] || 'bg-slate-600'} text-white text-xs`}>{l.threat_level || 'none'}</Badge>
                        <span className={`text-xs ${l.success ? 'text-green-400' : 'text-red-400'}`}>{l.success ? 'SUCCESS' : 'BLOCKED'}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{l.details || 'No details'}</p>
                      {l.universe_id && <p className="text-xs text-slate-500 mt-0.5">Universe: {l.universe_id}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {l.ip_address && <p className="text-xs text-slate-500">{l.ip_address}</p>}
                      <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />{l.created_date ? format(new Date(l.created_date), 'MMM d, HH:mm:ss') : '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <Activity className="w-5 h-5" /> API Request History ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredRequests.length === 0 && <p className="text-slate-500 text-center py-8">No matching requests.</p>}
              {filteredRequests.map(r => (
                <div key={r.id} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600">
                  <div className={`w-2 h-2 rounded-full mt-2 ${r.status === 'success' ? 'bg-green-400' : r.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{r.intent}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Routed to: {r.routed_to || 'N/A'} • {r.latency_ms || '?'}ms {r.fallback_used && '• FALLBACK'}</p>
                    {r.ai_reasoning && <p className="text-xs text-slate-500 mt-0.5 italic">{r.ai_reasoning}</p>}
                    {r.error_message && <p className="text-xs text-red-400 mt-0.5">{r.error_message}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className={`${r.status === 'success' ? 'bg-green-600' : r.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'} text-white text-xs`}>{r.status}</Badge>
                    <p className="text-xs text-slate-500 mt-1">{r.created_date ? format(new Date(r.created_date), 'MMM d, HH:mm:ss') : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
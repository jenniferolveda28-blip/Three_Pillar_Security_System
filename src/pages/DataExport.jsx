import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileDown, Download, Loader2, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const exportOptions = [
  { key: 'SecurityLog', label: 'Security Logs', entity: 'SecurityLog', icon: '🛡️' },
  { key: 'UniversalRequest', label: 'API Requests', entity: 'UniversalRequest', icon: '🌐' },
  { key: 'BehaviorAnomaly', label: 'Behavior Anomalies', entity: 'BehaviorAnomaly', icon: '🧠' },
  { key: 'CriminalActivityAlert', label: 'Criminal Alerts', entity: 'CriminalActivityAlert', icon: '🚨' },
  { key: 'AnalyticsMetric', label: 'Analytics Metrics', entity: 'AnalyticsMetric', icon: '📊' },
  { key: 'HardwareToken', label: 'Hardware Tokens', entity: 'HardwareToken', icon: '🔑' },
  { key: 'UniversalKey', label: 'Universal Keys', entity: 'UniversalKey', icon: '🗝️' },
  { key: 'Subscription', label: 'Subscriptions', entity: 'Subscription', icon: '💳' },
  { key: 'ScramblingSession', label: 'Scrambling Sessions', entity: 'ScramblingSession', icon: '🔄' },
  { key: 'AuditFeedback', label: 'Audit Feedback', entity: 'AuditFeedback', icon: '📝' },
];

function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const excludeKeys = ['id', 'created_date', 'updated_date', 'created_by_id'];
  const headers = Object.keys(data[0]).filter(k => !excludeKeys.includes(k));
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
    return `"${String(val).replace(/"/g, '""')}"`;
  };
  const csv = [headers.join(','), ...data.map(row => headers.map(h => escape(row[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataExport() {
  const [exporting, setExporting] = useState(null);
  const [counts, setCounts] = useState({});
  const [selected, setSelected] = useState(null);

  const { data: previewData = [], isLoading: previewLoading } = useQuery({
    queryKey: ['exportPreview', selected],
    queryFn: () => selected ? base44.entities[selected].list('-created_date', 5) : Promise.resolve([]),
    enabled: !!selected,
  });

  const handleExport = async (option) => {
    setExporting(option.key);
    try {
      const records = await base44.entities[option.entity].list('-created_date', 500);
      exportToCSV(records, `${option.label.toLowerCase().replace(/\s+/g, '-')}-export-${new Date().toISOString().slice(0, 10)}.csv`);
      setCounts({ ...counts, [option.key]: records.length });
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const handlePreview = (option) => {
    setSelected(selected === option.key ? null : option.key);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileDown className="w-8 h-8 text-cyan-400" /> Data Export Hub
        </h1>
        <p className="text-slate-400 mt-1">Export system logs and reports as CSV for external review</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map(opt => (
          <Card key={opt.key} className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <h3 className="text-white font-medium">{opt.label}</h3>
                  {counts[opt.key] !== undefined && <p className="text-xs text-green-400">{counts[opt.key]} records exported</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleExport(opt)} disabled={exporting === opt.key} className="bg-cyan-600 hover:bg-cyan-700 flex-1" size="sm">
                  {exporting === opt.key ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {exporting === opt.key ? 'Exporting…' : 'Export CSV'}
                </Button>
                <Button onClick={() => handlePreview(opt)} variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  <Database className="w-4 h-4 mr-1" /> Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Preview: {exportOptions.find(o => o.key === selected)?.label} (latest 5 records)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewLoading ? <p className="text-slate-400 py-4">Loading preview…</p> : previewData.length === 0 ? <p className="text-slate-500 py-4">No records found.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-left">
                      {Object.keys(previewData[0]).filter(k => !['id', 'created_date', 'updated_date', 'created_by_id'].includes(k)).slice(0, 6).map(k => <th key={k} className="pb-2 pr-4">{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={row.id || i} className="border-b border-slate-800">
                        {Object.keys(previewData[0]).filter(k => !['id', 'created_date', 'updated_date', 'created_by_id'].includes(k)).slice(0, 6).map(k => (
                          <td key={k} className="py-2 pr-4 text-slate-300 max-w-[150px] truncate">
                            {typeof row[k] === 'object' ? JSON.stringify(row[k]).slice(0, 30) : String(row[k] ?? '').slice(0, 50)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
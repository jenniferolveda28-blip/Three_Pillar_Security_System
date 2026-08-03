import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Radar, Activity, Bell } from 'lucide-react';

export default function AlertFeed() {
  const alerts = useQuery({ queryKey: ['alertFeed', 'alerts'], queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 50) });
  const exposures = useQuery({ queryKey: ['alertFeed', 'exposures'], queryFn: () => base44.entities.ExposureRecord.list('-created_date', 50) });
  const logs = useQuery({ queryKey: ['alertFeed', 'logs'], queryFn: () => base44.entities.SecurityLog.list('-created_date', 50) });
  const metrics = useQuery({ queryKey: ['alertFeed', 'metrics'], queryFn: () => base44.entities.AnalyticsMetric.list('-created_date', 30) });

  const feed = useMemo(() => {
    const items = [];
    (alerts.data || []).forEach(a => items.push({ id: a.id, type: 'incident', time: a.created_date, color: 'text-red-400', icon: AlertTriangle, title: `${a.alert_type.replace(/_/g, ' ')} · ${a.severity}`, detail: a.user_identifier }));
    (exposures.data || []).forEach(e => items.push({ id: e.id, type: 'discovery', time: e.discovery_date || e.created_date, color: 'text-amber-400', icon: Radar, title: `Exposure found: ${e.broker_name}`, detail: (e.exposure_type || '').replace(/_/g, ' ') }));
    (logs.data || []).forEach(l => items.push({ id: l.id, type: 'system', time: l.created_date, color: 'text-cyan-400', icon: Activity, title: l.event_type, detail: l.details }));
    (metrics.data || []).forEach(m => items.push({ id: m.id, type: 'metric', time: m.created_date, color: m.success ? 'text-emerald-400' : 'text-red-400', icon: Activity, title: `${m.metric_type} ${m.method || ''}`, detail: m.success ? 'success' : 'failed' }));
    return items.filter(i => i.time).sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [alerts.data, exposures.data, logs.data, metrics.data]);

  const loading = alerts.isLoading || exposures.isLoading || logs.isLoading || metrics.isLoading;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Bell className="w-7 h-7 text-cyan-400" /> Alert Feed</h1>
        <p className="text-slate-400 mt-1">Recent security incidents, data discoveries, and system status changes — chronological.</p>
      </div>
      <Card className="bg-slate-900/60 border-slate-700">
        <CardContent className="pt-5">
          {loading && <p className="text-slate-500">Loading feed…</p>}
          {!loading && feed.length === 0 && <p className="text-slate-500">No recent activity.</p>}
          <div className="space-y-3 max-h-[640px] overflow-y-auto">
            {feed.map(i => {
              const Icon = i.icon;
              return (
                <div key={i.type + i.id} className="flex gap-3 border-b border-slate-800 pb-3">
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${i.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-white text-sm font-medium truncate">{i.title}</div>
                      <div className="text-xs text-slate-500 shrink-0">{new Date(i.time).toLocaleString()}</div>
                    </div>
                    {i.detail && <div className="text-xs text-slate-500 truncate">{i.detail}</div>}
                  </div>
                  <Badge variant="outline" className="border-slate-700 text-slate-400 shrink-0">{i.type}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Watch, Battery, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

const syncStyle = {
  synced: 'border-emerald-600/50 text-emerald-300',
  syncing: 'border-blue-600/50 text-blue-300',
  offline: 'border-amber-600/50 text-amber-300',
  error: 'border-red-600/50 text-red-300'
};
const batteryColor = (lvl) => lvl > 60 ? 'text-emerald-400' : lvl > 20 ? 'text-amber-400' : 'text-red-400';
const batteryBar = (lvl) => lvl > 60 ? 'bg-emerald-500' : lvl > 20 ? 'bg-amber-500' : 'bg-red-500';

export default function BioVerifyHardwareStatus() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['bioverifyHardware'],
    queryFn: () => base44.entities.BioVerifyToken.list('-created_date', 50)
  });
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Watch className="w-7 h-7 text-cyan-400" /> BioVerify Hardware Status</h1>
        <p className="text-slate-400 mt-1">Operational status of physical BioVerify tokens — battery levels and last sync timestamps.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && <p className="text-slate-500">Loading devices…</p>}
        {!isLoading && data.length === 0 && <p className="text-slate-500">No BioVerify devices registered.</p>}
        {data.map(d => {
          const battery = d.battery_level ?? 100;
          return (
            <Card key={d.id} className="bg-slate-900/60 border-slate-700">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-semibold">{d.device_name}</div>
                    <div className="text-xs text-slate-500 font-mono">{d.device_id}</div>
                  </div>
                  <Badge variant="outline" className={d.is_active ? 'border-emerald-600/50 text-emerald-300' : 'border-slate-600 text-slate-500'}>
                    {d.is_active ? 'active' : 'inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Battery className={`w-5 h-5 ${batteryColor(battery)}`} />
                    <span className={batteryColor(battery)}>{battery}%</span>
                  </div>
                  <Badge variant="outline" className={syncStyle[d.sync_status] || 'border-slate-600 text-slate-300'}>
                    {d.sync_status === 'offline' || d.sync_status === 'error' ? <WifiOff className="w-3 h-3 mr-1 inline" /> : <Wifi className="w-3 h-3 mr-1 inline" />}
                    {d.sync_status || 'synced'}
                  </Badge>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${batteryBar(battery)}`} style={{ width: `${battery}%` }} />
                </div>
                <div className="text-xs text-slate-500 space-y-1 border-t border-slate-800 pt-2">
                  <div className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Last sync: {d.last_sync_date ? new Date(d.last_sync_date).toLocaleString() : 'never'}</div>
                  {d.firmware_version && <div>Firmware: {d.firmware_version}</div>}
                  {d.failed_attempts > 0 && <div className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-3 h-3" /> {d.failed_attempts} failed attempts</div>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Cpu, Activity, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function HardwareDiagnostics() {
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['hardwareTokensDiag'],
    queryFn: () => base44.entities.HardwareToken.list('-created_date', 100),
  });

  const computeCalibration = (token) => {
    const failed = token.failed_attempts || 0;
    return Math.max(0, 100 - failed * 15);
  };

  const computeStability = (token) => {
    if (!token.last_code_generated) return 50;
    const elapsed = (Date.now() - new Date(token.last_code_generated).getTime()) / 1000;
    if (elapsed < 10) return 100;
    if (elapsed < 60) return 85;
    if (elapsed < 300) return 60;
    return 30;
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading hardware diagnostics…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Cpu className="w-8 h-8 text-cyan-400" /> Hardware Diagnostics
        </h1>
        <p className="text-slate-400 mt-1">Deep-dive health metrics for all registered hardware tokens</p>
      </div>

      {tokens.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="py-12 text-center text-slate-500">No hardware tokens registered.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map(t => {
            const calibration = computeCalibration(t);
            const stability = computeStability(t);
            const healthScore = Math.round((calibration + stability) / 2);
            const HealthIcon = healthScore >= 80 ? CheckCircle : healthScore >= 50 ? AlertTriangle : XCircle;
            const healthColor = healthScore >= 80 ? 'text-green-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400';

            return (
              <Card key={t.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-cyan-400" /> {t.device_name || 'Unnamed Token'}
                    </CardTitle>
                    <HealthIcon className={`w-6 h-6 ${healthColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-slate-500 font-mono break-all">{t.device_id || 'No ID'}</div>

                  <div className="flex items-center gap-2">
                    <Badge className={t.is_active ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}>
                      {t.is_active ? 'Active' : 'Locked'}
                    </Badge>
                    {t.failed_attempts > 0 && <Badge variant="destructive">{t.failed_attempts} failed</Badge>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Sensor Calibration</span>
                      <span className={healthColor}>{calibration}%</span>
                    </div>
                    <Progress value={calibration} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400 flex items-center gap-1"><Wifi className="w-3 h-3" /> Connection Stability</span>
                      <span className={stability >= 80 ? 'text-green-400' : stability >= 50 ? 'text-amber-400' : 'text-red-400'}>{stability}%</span>
                    </div>
                    <Progress value={stability} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400">Overall Health</span>
                      <span className={healthColor}>{healthScore}%</span>
                    </div>
                    <Progress value={healthScore} className="h-2" />
                  </div>

                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                    <p>Last code: {t.last_code_generated ? new Date(t.last_code_generated).toLocaleString() : 'Never'}</p>
                    <p>Last used: {t.last_used ? new Date(t.last_used).toLocaleString() : 'Never'}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
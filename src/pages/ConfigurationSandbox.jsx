import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { FlaskConical, Save, RotateCcw, Gauge, Clock } from 'lucide-react';

export default function ConfigurationSandbox() {
  const qc = useQueryClient();
  const { data: configs = [], isLoading } = useQuery({ queryKey: ['secConfigSandbox'], queryFn: () => base44.entities.SecurityConfig.list('-created_date', 10) });
  const { data: sessions = [] } = useQuery({ queryKey: ['scrambleSandbox'], queryFn: () => base44.entities.ScramblingSession.list('-created_date', 10) });

  const config = configs[0] || {};
  const session = sessions.find(s => s.status === 'active') || sessions[0] || {};

  const [darkScan, setDarkScan] = useState(24);
  const [exposureScan, setExposureScan] = useState(168);
  const [rotation, setRotation] = useState(5);
  const [sensitivity, setSensitivity] = useState('medium');
  const [autoRemoval, setAutoRemoval] = useState(true);
  const [scrambleInterval, setScrambleInterval] = useState(5);

  useEffect(() => {
    if (config.dark_web_scan_frequency_hours) setDarkScan(config.dark_web_scan_frequency_hours);
    if (config.exposure_scan_frequency_hours) setExposureScan(config.exposure_scan_frequency_hours);
    if (config.rotation_interval_seconds) setRotation(config.rotation_interval_seconds);
    if (config.alert_sensitivity_threshold) setSensitivity(config.alert_sensitivity_threshold);
    if (config.auto_removal_enabled !== undefined) setAutoRemoval(config.auto_removal_enabled);
  }, [config]);

  useEffect(() => {
    if (session.scramble_interval_seconds) setScrambleInterval(session.scramble_interval_seconds);
  }, [session]);

  const updateConfig = useMutation({
    mutationFn: (data) => config.id ? base44.entities.SecurityConfig.update(config.id, data) : base44.entities.SecurityConfig.create({ config_name: 'sandbox', ...data }),
    onSuccess: () => qc.invalidateQueries(['secConfigSandbox'])
  });
  const updateSession = useMutation({
    mutationFn: (data) => session.id ? base44.entities.ScramblingSession.update(session.id, data) : Promise.resolve(),
    onSuccess: () => qc.invalidateQueries(['scrambleSandbox'])
  });

  const reset = () => {
    setDarkScan(config.dark_web_scan_frequency_hours || 24);
    setExposureScan(config.exposure_scan_frequency_hours || 168);
    setRotation(config.rotation_interval_seconds || 5);
    setSensitivity(config.alert_sensitivity_threshold || 'medium');
    setAutoRemoval(config.auto_removal_enabled !== undefined ? config.auto_removal_enabled : true);
    setScrambleInterval(session.scramble_interval_seconds || 5);
  };

  const apply = () => {
    updateConfig.mutate({ dark_web_scan_frequency_hours: darkScan, exposure_scan_frequency_hours: exposureScan, rotation_interval_seconds: rotation, alert_sensitivity_threshold: sensitivity, auto_removal_enabled: autoRemoval });
    updateSession.mutate({ scramble_interval_seconds: scrambleInterval });
  };

  const liveDark = config.dark_web_scan_frequency_hours || 24;
  const liveExposure = config.exposure_scan_frequency_hours || 168;
  const liveRotation = config.rotation_interval_seconds || 5;
  const liveSensitivity = config.alert_sensitivity_threshold || 'medium';
  const liveAutoRemoval = config.auto_removal_enabled !== undefined ? config.auto_removal_enabled : true;
  const liveScramble = session.scramble_interval_seconds || 5;
  const configChanged = darkScan !== liveDark || exposureScan !== liveExposure || rotation !== liveRotation || sensitivity !== liveSensitivity || autoRemoval !== liveAutoRemoval || scrambleInterval !== liveScramble;

  const protectionImpact = Math.min(100, Math.round((100 / (rotation + 1)) * 0.5 + (100 / (scrambleInterval + 1)) * 0.5 + (sensitivity === 'critical' ? 25 : sensitivity === 'high' ? 18 : sensitivity === 'medium' ? 10 : 5)));
  const loadImpact = Math.round((100 / Math.max(rotation, 1)) + (100 / Math.max(scrambleInterval, 1)) + (darkScan < 12 ? 15 : 0) + (exposureScan < 24 ? 15 : 0));

  if (isLoading) return <div className="p-8 text-slate-400">Loading configuration sandbox…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><FlaskConical className="w-8 h-8 text-cyan-400" /> Configuration Sandbox</h1>
        <p className="text-slate-400 mt-1">Adjust security thresholds and scrambling intervals, preview impact, then apply globally</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-400" /> Scan & Rotation Thresholds</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Dark Web Scan Frequency</span><span className="text-cyan-400">{darkScan}h</span></div>
                <Slider value={[darkScan]} min={1} max={168} step={1} onValueChange={v => setDarkScan(v[0])} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Exposure Scan Frequency</span><span className="text-cyan-400">{exposureScan}h</span></div>
                <Slider value={[exposureScan]} min={1} max={720} step={1} onValueChange={v => setExposureScan(v[0])} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">CipherPass Rotation Interval</span><span className="text-cyan-400">{rotation}s</span></div>
                <Slider value={[rotation]} min={1} max={3600} step={1} onValueChange={v => setRotation(v[0])} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Scrambling Interval</span><span className="text-cyan-400">{scrambleInterval}s</span></div>
                <Slider value={[scrambleInterval]} min={1} max={300} step={1} onValueChange={v => setScrambleInterval(v[0])} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Gauge className="w-5 h-5 text-violet-400" /> Alert Sensitivity & Auto-Removal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Alert Sensitivity Threshold</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['low', 'medium', 'high', 'critical'].map(s => (
                    <button key={s} onClick={() => setSensitivity(s)} className={`px-3 py-1.5 rounded-md text-sm capitalize border ${sensitivity === s ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Auto-removal for critical findings</span>
                <button onClick={() => setAutoRemoval(!autoRemoval)} className={`relative w-12 h-6 rounded-full transition-colors ${autoRemoval ? 'bg-cyan-600' : 'bg-slate-700'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoRemoval ? 'translate-x-6' : 'translate-x-0.5'}`} /></button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white">Impact Preview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Projected Protection</span><span className="text-green-400">{protectionImpact}/100</span></div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${protectionImpact}%` }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-400">Projected System Load</span><span className={loadImpact > 80 ? 'text-red-400' : loadImpact > 50 ? 'text-amber-400' : 'text-green-400'}>{Math.min(loadImpact, 100)}/100</span></div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className={`h-full ${loadImpact > 80 ? 'bg-red-500' : loadImpact > 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(loadImpact, 100)}%` }} /></div>
              </div>
              <div className="pt-2 text-xs text-slate-500 space-y-1">
                <p>Faster rotation and scrambling raise protection but increase load.</p>
                <p>Higher sensitivity surfaces more alerts.</p>
              </div>
              {configChanged && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Unsaved changes</Badge>}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-5 space-y-3">
              <Button onClick={apply} disabled={!configChanged || updateConfig.isPending || updateSession.isPending} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
                <Save className="w-4 h-4 mr-2" />{updateConfig.isPending || updateSession.isPending ? 'Applying…' : 'Apply Globally'}
              </Button>
              <Button onClick={reset} variant="outline" className="w-full bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800">
                <RotateCcw className="w-4 h-4 mr-2" />Reset to Live
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Save } from 'lucide-react';

export default function SecurityConfiguration() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ['securityConfig'],
    queryFn: () => base44.entities.SecurityConfig.list('-created_date', 10)
  });
  const config = data[0];
  const [form, setForm] = useState(null);

  useEffect(() => { if (config) setForm({ ...config }); }, [config?.id]);

  const save = useMutation({
    mutationFn: () => base44.entities.SecurityConfig.update(config.id, {
      dark_web_scan_frequency_hours: Number(form.dark_web_scan_frequency_hours),
      exposure_scan_frequency_hours: Number(form.exposure_scan_frequency_hours),
      alert_sensitivity_threshold: form.alert_sensitivity_threshold,
      auto_removal_enabled: form.auto_removal_enabled,
      rotation_interval_seconds: Number(form.rotation_interval_seconds),
      notify_email: form.notify_email,
      is_active: form.is_active
    }),
    onSuccess: () => { toast({ title: 'Configuration saved' }); qc.invalidateQueries({ queryKey: ['securityConfig'] }); },
    onError: (e) => toast({ variant: 'destructive', title: 'Save failed', description: e.message })
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Settings className="w-7 h-7 text-cyan-400" /> Security Configuration</h1>
        <p className="text-slate-400 mt-1">Define automated security policies: scan frequencies, alert thresholds, and rotation intervals.</p>
      </div>
      {isLoading && <p className="text-slate-500">Loading configuration…</p>}
      {!isLoading && !config && <p className="text-slate-500">No configuration record found. Create one via the admin console.</p>}
      {form && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader><CardTitle className="text-white">Active Policy: {config.config_name}</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Dark Web Scan Frequency (hours)</Label>
                <Input type="number" value={form.dark_web_scan_frequency_hours ?? ''} onChange={e => setForm({ ...form, dark_web_scan_frequency_hours: e.target.value })} className="bg-slate-950 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">Exposure Scan Frequency (hours)</Label>
                <Input type="number" value={form.exposure_scan_frequency_hours ?? ''} onChange={e => setForm({ ...form, exposure_scan_frequency_hours: e.target.value })} className="bg-slate-950 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">Alert Sensitivity Threshold</Label>
                <select value={form.alert_sensitivity_threshold} onChange={e => setForm({ ...form, alert_sensitivity_threshold: e.target.value })} className="w-full bg-slate-950 border border-slate-700 text-white rounded-md h-9 px-3">
                  <option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">CipherPass Rotation Interval (seconds)</Label>
                <Input type="number" value={form.rotation_interval_seconds ?? ''} onChange={e => setForm({ ...form, rotation_interval_seconds: e.target.value })} className="bg-slate-950 border-slate-700 text-white" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-slate-300">Notify Email</Label>
                <Input value={form.notify_email ?? ''} onChange={e => setForm({ ...form, notify_email: e.target.value })} className="bg-slate-950 border-slate-700 text-white" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-slate-300 text-sm">
              <input type="checkbox" checked={form.auto_removal_enabled} onChange={e => setForm({ ...form, auto_removal_enabled: e.target.checked })} className="rounded" />
              Auto-removal enabled (open removal requests automatically)
            </label>
            <Button className="bg-cyan-600 hover:bg-cyan-500" disabled={save.isPending} onClick={() => save.mutate()}>
              <Save className="w-4 h-4 mr-2" /> {save.isPending ? 'Saving…' : 'Save Configuration'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
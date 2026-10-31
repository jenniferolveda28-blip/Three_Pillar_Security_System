import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Save, Smartphone, Tablet, Watch, Cpu, Monitor, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEVICE_TYPE_OPTIONS } from '@/components/shared_DeviceTypeBar';

export default function SecurityConfiguration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['securityConfig'],
    queryFn: async () => {
      const res = await base44.entities.SecurityConfig.list('-created_date', 10);
      return Array.isArray(res) ? res : res?.items || [];
    },
  });

  const config = data[0];
  const [form, setForm] = useState({
    config_name: 'default',
    device_type: user?.preferred_device_type || 'tablet',
    dark_web_scan_frequency_hours: 24,
    exposure_scan_frequency_hours: 168,
    alert_sensitivity_threshold: 'medium',
    auto_removal_enabled: true,
    rotation_interval_seconds: 5,
    notify_email: user?.email || '',
    is_active: true,
  });

  useEffect(() => {
    if (config) {
      setForm({
        ...config,
        device_type: user?.preferred_device_type || config.device_type || 'tablet',
      });
    } else if (user?.preferred_device_type) {
      setForm((prev) => ({ ...prev, device_type: user.preferred_device_type }));
    }
  }, [config?.id, user?.preferred_device_type]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.deviceType) {
        setForm((prev) => ({ ...prev, device_type: e.detail.deviceType }));
      }
    };
    window.addEventListener('reclaimme:device-type-changed', handler);
    return () => window.removeEventListener('reclaimme:device-type-changed', handler);
  }, []);

  const handleDeviceDropdownChange = async (newDeviceType) => {
    setForm((prev) => ({ ...prev, device_type: newDeviceType }));
    window.dispatchEvent(
      new CustomEvent('reclaimme:device-type-changed', { detail: { deviceType: newDeviceType } })
    );
    if (user) {
      await base44.auth.updateMe({ preferred_device_type: newDeviceType });
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      if (user) {
        await base44.auth.updateMe({ preferred_device_type: form.device_type });
      }
      window.dispatchEvent(
        new CustomEvent('reclaimme:device-type-changed', {
          detail: { deviceType: form.device_type },
        })
      );

      const payload = {
        config_name: form.config_name || 'default',
        device_type: form.device_type || 'tablet',
        dark_web_scan_frequency_hours: Number(form.dark_web_scan_frequency_hours),
        exposure_scan_frequency_hours: Number(form.exposure_scan_frequency_hours),
        alert_sensitivity_threshold: form.alert_sensitivity_threshold,
        auto_removal_enabled: Boolean(form.auto_removal_enabled),
        rotation_interval_seconds: Number(form.rotation_interval_seconds),
        notify_email: form.notify_email,
        is_active: form.is_active ?? true,
      };

      if (config?.id) {
        return base44.entities.SecurityConfig.update(config.id, payload);
      }
      return base44.entities.SecurityConfig.create(payload);
    },
    onSuccess: () => {
      toast({
        title: 'Settings & Device Type saved',
        description: `Active device profile set to ${
          DEVICE_TYPE_OPTIONS.find((d) => d.value === form.device_type)?.label || form.device_type
        }.`,
      });
      qc.invalidateQueries({ queryKey: ['securityConfig'] });
    },
    onError: (e) =>
      toast({ variant: 'destructive', title: 'Save failed', description: e.message }),
  });

  const selectedMeta =
    DEVICE_TYPE_OPTIONS.find((d) => d.value === form.device_type) || DEVICE_TYPE_OPTIONS[1];
  const SelectedIcon = selectedMeta.icon;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-cyan-400" /> Security Settings & Device Configuration
          </h1>
          <p className="text-slate-400 mt-1">
            Configure your current Device Type, scan frequencies, alert thresholds, and CipherPass rotation intervals.
          </p>
        </div>
        <Link to="/Dashboard">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Loading settings…</p>
      ) : (
        <>
          {/* Dedicated Device Type Settings Card */}
          <Card className="bg-slate-900/70 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <SelectedIcon className="w-5 h-5 text-cyan-400" />
                Device Type & Interface Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-device-type" className="text-slate-200">
                    Device Type
                  </Label>
                  <select
                    id="settings-device-type"
                    value={form.device_type || 'tablet'}
                    onChange={(e) => handleDeviceDropdownChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  >
                    {DEVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400">
                    Select the device you are currently using (Smartphone, Tablet, Wearable, Subdermal Reader, or Desktop) so Reclaim Me tailors security telemetry and verification prompts.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <SelectedIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-white">
                      Active Profile: {selectedMeta.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedMeta.contextSummary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Policy Settings Card */}
          <Card className="bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Active Security Policy: {form.config_name || 'default'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Dark Web Scan Frequency (hours)</Label>
                  <Input
                    type="number"
                    value={form.dark_web_scan_frequency_hours ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, dark_web_scan_frequency_hours: e.target.value })
                    }
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Exposure Scan Frequency (hours)</Label>
                  <Input
                    type="number"
                    value={form.exposure_scan_frequency_hours ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, exposure_scan_frequency_hours: e.target.value })
                    }
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">Alert Sensitivity Threshold</Label>
                  <select
                    value={form.alert_sensitivity_threshold}
                    onChange={(e) =>
                      setForm({ ...form, alert_sensitivity_threshold: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-md h-9 px-3"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="critical">critical</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300">CipherPass Rotation Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={form.rotation_interval_seconds ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, rotation_interval_seconds: e.target.value })
                    }
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-slate-300">Notify Email</Label>
                  <Input
                    value={form.notify_email ?? ''}
                    onChange={(e) => setForm({ ...form, notify_email: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-slate-300 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(form.auto_removal_enabled)}
                  onChange={(e) =>
                    setForm({ ...form, auto_removal_enabled: e.target.checked })
                  }
                  className="rounded"
                />
                Auto-removal enabled (open removal requests automatically)
              </label>
              <Button
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
                disabled={save.isPending}
                onClick={() => save.mutate()}
              >
                <Save className="w-4 h-4 mr-2" />{' '}
                {save.isPending ? 'Saving…' : 'Save Settings & Device Type'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
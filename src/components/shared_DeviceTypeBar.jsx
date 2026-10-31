import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  Smartphone,
  Tablet,
  Watch,
  Cpu,
  Monitor,
  Settings,
  CheckCircle2,
} from 'lucide-react';

export const DEVICE_TYPE_OPTIONS = [
  {
    value: 'smartphone',
    label: 'Smartphone',
    icon: Smartphone,
    contextSummary:
      'Mobile biometric handoff enabled • NFC tap-to-verify & compact threat alerts active',
    badgeClass: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
  },
  {
    value: 'tablet',
    label: 'Tablet',
    icon: Tablet,
    contextSummary:
      'Split-zone tablet command layout active • Real-time scrambler & token telemetry optimized',
    badgeClass: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  },
  {
    value: 'wearable',
    label: 'Wearable (HelixVerify Band / Patch)',
    icon: Watch,
    contextSummary:
      'Continuous 2-second TOTP pulse & proximity liveness binding active for HelixVerify wearable',
    badgeClass: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
  },
  {
    value: 'subdermal_reader',
    label: 'Subdermal NFC Reader',
    icon: Cpu,
    contextSummary:
      'RF read-lock guard & manual identity verification gate enforced before token reads',
    badgeClass: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  },
  {
    value: 'desktop',
    label: 'Desktop Workstation',
    icon: Monitor,
    contextSummary:
      'Full multi-universe SOC telemetry, PDF audit generation, and deep correlation views active',
    badgeClass: 'border-blue-500/40 text-blue-300 bg-blue-500/10',
  },
];

export default function SharedDeviceTypeBar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: configs = [] } = useQuery({
    queryKey: ['securityConfig'],
    queryFn: async () => {
      const res = await base44.entities.SecurityConfig.list('-created_date', 5);
      return Array.isArray(res) ? res : res?.items || [];
    },
    enabled: !!user,
  });

  const activeConfig = configs[0];
  const [selectedDevice, setSelectedDevice] = useState(
    () => user?.preferred_device_type || activeConfig?.device_type || 'tablet'
  );

  useEffect(() => {
    const resolved = user?.preferred_device_type || activeConfig?.device_type;
    if (resolved && DEVICE_TYPE_OPTIONS.some((d) => d.value === resolved)) {
      setSelectedDevice(resolved);
    }
  }, [user?.preferred_device_type, activeConfig?.device_type]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.deviceType) {
        setSelectedDevice(e.detail.deviceType);
      }
    };
    window.addEventListener('reclaimme:device-type-changed', handler);
    return () => window.removeEventListener('reclaimme:device-type-changed', handler);
  }, []);

  const handleDeviceChange = async (newType) => {
    setSelectedDevice(newType);
    window.dispatchEvent(
      new CustomEvent('reclaimme:device-type-changed', { detail: { deviceType: newType } })
    );
    if (!user) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({ preferred_device_type: newType });
      if (user.role === 'admin' && activeConfig?.id) {
        await base44.entities.SecurityConfig.update(activeConfig.id, {
          device_type: newType,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['securityConfig'] });
    } finally {
      setSaving(false);
    }
  };

  const currentMeta =
    DEVICE_TYPE_OPTIONS.find((d) => d.value === selectedDevice) || DEVICE_TYPE_OPTIONS[1];
  const DeviceIcon = currentMeta.icon;

  return (
    <div className="no-print border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Active Device Context Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg border shrink-0 ${currentMeta.badgeClass}`}>
            <DeviceIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                Current Device Context: {currentMeta.label}
              </span>
              {saving && (
                <span className="text-[11px] text-cyan-400 animate-pulse">Syncing…</span>
              )}
              {!saving && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Adapted
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">{currentMeta.contextSummary}</p>
          </div>
        </div>

        {/* Right: Device Type Dropdown & Settings Link */}
        <div className="flex items-center gap-2.5 shrink-0">
          <label
            htmlFor="top-device-type-select"
            className="text-xs font-medium text-slate-300 whitespace-nowrap"
          >
            Device Type:
          </label>
          <select
            id="top-device-type-select"
            value={selectedDevice}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-white text-xs rounded-lg h-8 px-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            {DEVICE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <Link
            to="/security-configuration"
            className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
            title="Configure Device Type & Security Settings"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const NOTIFIED_KEY = 'anomaly_notified_ids';
const HIGH_SEVERITIES = new Set(['high', 'critical', 'emergency']);

function getNotifiedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]')); }
  catch { return new Set(); }
}

function saveNotifiedId(id) {
  const ids = getNotifiedIds();
  ids.add(id);
  // Keep only last 500 to avoid localStorage bloat
  const arr = [...ids].slice(-500);
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr));
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendDesktopNotification(title, body, severity) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const icon = severity === 'emergency' ? '🚨' : severity === 'critical' ? '🔴' : '🟠';
    try {
      new Notification(`${icon} ${title}`, { body, silent: false });
    } catch (e) {
      // Notification API unavailable in some contexts — fallback to toast only
    }
  }
}

export default function AnomalyNotificationMonitor() {
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (!permissionRequested.current) {
      permissionRequested.current = true;
      requestNotificationPermission();
    }
  }, []);

  const { data: anomalies = [] } = useQuery({
    queryKey: ['notif-anomalies'],
    queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 50),
    refetchInterval: 15000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['notif-alerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 50),
    refetchInterval: 15000,
  });

  // Process anomalies
  useEffect(() => {
    if (!anomalies.length) return;
    const notified = getNotifiedIds();

    anomalies.forEach(item => {
      const d = item.data ?? item;
      const severity = d.severity;
      const status = d.status;
      if (!HIGH_SEVERITIES.has(severity)) return;
      if (['resolved', 'false_positive'].includes(status)) return;
      if (notified.has(item.id)) return;

      const type = (d.anomaly_type || 'anomaly').replace(/_/g, ' ');
      const user = d.user_identifier || 'Unknown user';
      const title = `HIGH ANOMALY DETECTED`;
      const body = `${type} — ${user} | Severity: ${severity?.toUpperCase()} | Deviation: ${d.deviation_score ?? 0}/100`;

      sendDesktopNotification(title, body, severity);
      toast.error(body, {
        duration: 8000,
        description: title,
      });
      saveNotifiedId(item.id);
    });
  }, [anomalies]);

  // Process criminal alerts
  useEffect(() => {
    if (!alerts.length) return;
    const notified = getNotifiedIds();

    alerts.forEach(item => {
      const d = item.data ?? item;
      const severity = d.severity;
      const status = d.status;
      if (!HIGH_SEVERITIES.has(severity)) return;
      if (['resolved', 'false_positive'].includes(status)) return;
      if (notified.has(item.id)) return;

      const type = (d.alert_type || 'alert').replace(/_/g, ' ');
      const user = d.user_identifier || 'Unknown';
      const title = `CRIMINAL ALERT — ${severity?.toUpperCase()}`;
      const body = `${type} — ${user}${d.ip_address ? ` from ${d.ip_address}` : ''} | Confidence: ${d.confidence_score ?? 0}%`;

      sendDesktopNotification(title, body, severity);
      toast.error(body, {
        duration: 8000,
        description: title,
      });
      saveNotifiedId(item.id);
    });
  }, [alerts]);

  return null; // background monitor — no UI
}
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CriticalThreatMonitor() {
  const seenIds = useRef(new Set());
  const isInitialized = useRef(false);

  const { data: alerts = [] } = useQuery({
    queryKey: ['criticalThreatMonitor'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 50),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const critical = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency');

    if (!isInitialized.current) {
      critical.forEach(a => seenIds.current.add(a.id));
      isInitialized.current = true;
      return;
    }

    critical.forEach(alert => {
      if (!seenIds.current.has(alert.id)) {
        seenIds.current.add(alert.id);
        const label = alert.alert_type.replace(/_/g, ' ').toUpperCase();
        toast.error(`🚨 ${alert.severity.toUpperCase()} THREAT DETECTED`, {
          description: `${label} — Immediate action required`,
          duration: 10000,
        });
      }
    });
  }, [alerts]);

  return null;
}
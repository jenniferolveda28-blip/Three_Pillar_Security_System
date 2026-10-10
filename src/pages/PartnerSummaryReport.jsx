import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldAlert, Eraser, Activity, Users, Building2, TrendingDown, Loader2, RefreshCw, Share2 } from 'lucide-react';
import PartnerStatCard from '@/components/reports/PartnerStatCard';

const THREAT_TYPES = ['fraud', 'identity_theft', 'unauthorized_access', 'data_breach', 'malicious_intent', 'pattern_anomaly', 'credential_abuse'];
const PII_TYPES = ['pii_name', 'pii_address', 'pii_phone', 'pii_email', 'pii_relatives', 'pii_criminal_record', 'pii_financial', 'pii_court_records'];
const PII_LABELS = {
  pii_name: 'Names', pii_address: 'Addresses', pii_phone: 'Phone numbers', pii_email: 'Emails',
  pii_relatives: 'Relatives', pii_criminal_record: 'Criminal records', pii_financial: 'Financial records', pii_court_records: 'Court records',
};

export default function PartnerSummaryReport() {
  // Threat counts (server-side)
  const threatsAgg = useQuery({
    queryKey: ['partner', 'threats-agg'],
    queryFn: () => base44.entities.CriminalActivityAlert.aggregate({ groupBy: 'alert_type', count: true }),
  });
  const anomaliesCount = useQuery({
    queryKey: ['partner', 'anomalies'],
    queryFn: () => base44.entities.BehaviorAnomaly.count({}),
  });
  const threatsTotal = useQuery({
    queryKey: ['partner', 'threats-total'],
    queryFn: () => base44.entities.CriminalActivityAlert.count({}),
  });

  // PII scrubbed (server-side)
  const scrubbedTotal = useQuery({
    queryKey: ['partner', 'scrubbed-total'],
    queryFn: () => base44.entities.ExposureRecord.count({ status: 'scrubbed' }),
  });
  const discoveredTotal = useQuery({
    queryKey: ['partner', 'discovered-total'],
    queryFn: () => base44.entities.ExposureRecord.count({}),
  });
  const scrubbedByType = useQuery({
    queryKey: ['partner', 'scrubbed-by-type'],
    queryFn: () => base44.entities.ExposureRecord.aggregate({ query: { status: 'scrubbed' }, groupBy: 'exposure_type', count: true }),
  });
  const brokersCovered = useQuery({
    queryKey: ['partner', 'brokers'],
    queryFn: () => base44.entities.DataBroker.count({}),
  });
  const usersProtected = useQuery({
    queryKey: ['partner', 'users-protected'],
    queryFn: () => base44.entities.ExposureRecord.aggregate({ query: { status: 'scrubbed' }, countDistinct: 'user_email' }),
  });

  const loading = [threatsAgg, anomaliesCount, threatsTotal, scrubbedTotal, discoveredTotal, scrubbedByType, brokersCovered, usersProtected]
    .some(q => q.isLoading);

  const refetchAll = () => [threatsAgg, anomaliesCount, threatsTotal, scrubbedTotal, discoveredTotal, scrubbedByType, brokersCovered, usersProtected]
    .forEach(q => q.refetch());

  // Build threat-type map
  const threatRows = (threatsAgg.data?.rows || []).filter(r => r.alert_type);
  const threatMap = Object.fromEntries(threatRows.map(r => [r.alert_type, r.count || 0]));
  const threatsDetectedTotal = threatsTotal.data ?? 0;
  const anomaliesDetectedTotal = anomaliesCount.data ?? 0;
  const combinedThreats = threatsDetectedTotal + anomaliesDetectedTotal;

  // Build PII map
  const piiRows = (scrubbedByType.data?.rows || []).filter(r => r.exposure_type);
  const piiMap = Object.fromEntries(piiRows.map(r => [r.exposure_type, r.count || 0]));
  const scrubbedCount = scrubbedTotal.data ?? 0;
  const discoveredCount = discoveredTotal.data ?? 0;
  const scrubRate = discoveredCount > 0 ? Math.round((scrubbedCount / discoveredCount) * 100) : 0;
  const usersCount = usersProtected.data?.rows?.[0]?.countDistinct_user_email ?? 0;
  const brokersCount = brokersCovered.data ?? 0;

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-cyan-400 shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2"><Share2 className="w-5 h-5 text-cyan-400" /> Partner Summary Report</h1>
            <p className="text-xs text-slate-500">Threats detected & PII scrubbed — shareable overview for partners</p>
          </div>
          <Button onClick={refetchAll} variant="outline" size="sm" className="border-slate-700 text-slate-300" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
            Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Intro band */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-slate-200">Three Pillar Plus Security Solution</span> — platform impact summary as of <span className="text-slate-300">{today}</span>. This report aggregates the number of threats detected by the BioVerify and Forged API threat engines, and the volume of personal information removed from data brokers by Exposure Shield.
            </p>
          </CardContent>
        </Card>

        {/* Headline stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PartnerStatCard
            label="Threats Detected"
            value={combinedThreats.toLocaleString()}
            sublabel={`${threatsDetectedTotal.toLocaleString()} criminal alerts + ${anomaliesDetectedTotal.toLocaleString()} behavior anomalies`}
            icon={ShieldAlert}
            tone="rose"
          />
          <PartnerStatCard
            label="PII Records Scrubbed"
            value={scrubbedCount.toLocaleString()}
            sublabel={`${scrubRate}% of ${discoveredCount.toLocaleString()} discovered exposures removed`}
            icon={Eraser}
            tone="emerald"
          />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PartnerStatCard label="Users Protected" value={usersCount.toLocaleString()} sublabel="with verified removals" icon={Users} tone="cyan" />
          <PartnerStatCard label="Brokers Covered" value={brokersCount.toLocaleString()} sublabel="in active registry" icon={Building2} tone="violet" />
          <PartnerStatCard label="Criminal Alerts" value={threatsDetectedTotal.toLocaleString()} sublabel="across all threat types" icon={Activity} tone="amber" />
          <PartnerStatCard label="Scrub Rate" value={`${scrubRate}%`} sublabel="removals vs discoveries" icon={TrendingDown} tone="emerald" />
        </div>

        {/* Threats by type */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-400" /> Threats Detected by Type</CardTitle>
            <CardDescription>Breakdown of criminal activity alerts detected by the threat engine.</CardDescription>
          </CardHeader>
          <CardContent>
            {threatsAgg.isLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
            ) : threatRows.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No threat data yet.</p>
            ) : (
              <div className="space-y-3">
                {THREAT_TYPES.map((t) => {
                  const count = threatMap[t] || 0;
                  const pct = threatsDetectedTotal > 0 ? (count / threatsDetectedTotal) * 100 : 0;
                  return (
                    <div key={t}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-300 capitalize">{t.replace(/_/g, ' ')}</span>
                        <span className="text-slate-400 font-mono">{count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PII scrubbed by type */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Eraser className="w-4 h-4 text-emerald-400" /> PII Scrubbed by Type</CardTitle>
            <CardDescription>Personal information removed from data brokers, by category.</CardDescription>
          </CardHeader>
          <CardContent>
            {scrubbedByType.isLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-6"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
            ) : piiRows.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No scrubbed records yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PII_TYPES.map((t) => {
                  const count = piiMap[t] || 0;
                  const pct = scrubbedCount > 0 ? (count / scrubbedCount) * 100 : 0;
                  return (
                    <div key={t}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-300">{PII_LABELS[t]}</span>
                        <span className="text-slate-400 font-mono">{count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-xs text-slate-600 text-center pt-2">
          Figures are aggregated from live platform records. Share this page with partners, or use Print / PDF to export a copy.
        </p>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2, FileText, Search, CheckCircle2, AlertTriangle,
  TrendingDown, Globe, Activity, RefreshCw, Calendar, BarChart3
} from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

export default function WeeklyExposureSummary() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generateWeeklyExposureSummary', {});
      setReport(res.data);
      toast({ title: 'Weekly summary generated', description: 'Report ready for stakeholders.' });
    } catch (err) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const summary = report?.summary_data;
  const narrative = report?.narrative;

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Weekly Exposure Summary</h1>
            <p className="text-slate-400 text-sm">Deep web scan progress, profile discoveries, and removal status for stakeholders.</p>
          </div>
        </div>
        <Button onClick={generateReport} disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
          {loading ? 'Generating...' : 'Generate This Week\'s Report'}
        </Button>
      </div>

      {loading && !report && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Scanning exposure records and compiling report...</p>
        </div>
      )}

      {!loading && !report && (
        <Card className="bg-slate-900/40 border-slate-700">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No report generated yet</h3>
            <p className="text-slate-500 text-sm">Click "Generate This Week's Report" to compile your weekly exposure summary.</p>
          </CardContent>
        </Card>
      )}

      {report && summary && (
        <>
          {/* Week Range */}
          <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Reporting period: {summary.weekRange}</span>
            <span className="text-slate-600">·</span>
            <span>Generated {new Date(report.generated_at).toLocaleString()}</span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-900/40 border-slate-700">
              <CardContent className="pt-5 text-center">
                <Search className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-100">{summary.newDiscoveries}</p>
                <p className="text-xs text-slate-500">New Discoveries</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 border-slate-700">
              <CardContent className="pt-5 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-100">{summary.newlyScrubbed}</p>
                <p className="text-xs text-slate-500">Newly Scrubbed</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 border-slate-700">
              <CardContent className="pt-5 text-center">
                <AlertTriangle className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-100">{summary.reListed}</p>
                <p className="text-xs text-slate-500">Re-Listed</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 border-slate-700">
              <CardContent className="pt-5 text-center">
                <TrendingDown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-100">{summary.scrubRate}%</p>
                <p className="text-xs text-slate-500">Overall Scrub Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Narrative */}
          {narrative && (
            <Card className="bg-slate-900/60 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Stakeholder Summary
                </CardTitle>
                <CardDescription>AI-generated executive overview of this week's exposure activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {narrative.headline && (
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
                    <p className="text-sm font-semibold text-slate-200">{narrative.headline}</p>
                  </div>
                )}
                {narrative.key_findings && narrative.key_findings.length > 0 && (
                  <div>
                    <p className="text-xs font-mono text-slate-500 uppercase mb-2">Key Findings</p>
                    <ul className="space-y-2">
                      {narrative.key_findings.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400 text-sm mt-0.5">•</span>
                          <span className="text-sm text-slate-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {narrative.progress_summary && (
                  <div>
                    <p className="text-xs font-mono text-slate-500 uppercase mb-2">Progress Summary</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{narrative.progress_summary}</p>
                  </div>
                )}
                {narrative.action_items && narrative.action_items.length > 0 && (
                  <div>
                    <p className="text-xs font-mono text-slate-500 uppercase mb-2">Action Items</p>
                    <ul className="space-y-2">
                      {narrative.action_items.map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Breakdown */}
          <Card className="bg-slate-900/40 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-slate-100">Status Breakdown (All Tracked Listings)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(summary.statusBreakdown || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-slate-400 capitalize">{status.replace(/_/g, ' ')}</span>
                    <Badge variant="outline" className="bg-slate-800 text-slate-200 border-slate-600">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Brokers with Active Exposures */}
          {summary.topBrokers && summary.topBrokers.length > 0 && (
            <Card className="bg-slate-900/40 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Top Data Brokers with Active Exposures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.topBrokers.map(([broker, count]) => (
                    <div key={broker} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                      <span className="text-sm text-slate-300">{broker}</span>
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">{count} listing(s)</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Discoveries */}
          {report.recent_discoveries && report.recent_discoveries.length > 0 && (
            <>
              <Separator className="my-6 bg-slate-800" />
              <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-red-400" /> New Profiles Discovered This Week
              </h3>
              <div className="space-y-2 mb-6">
                {report.recent_discoveries.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                    <div>
                      <p className="text-sm text-slate-200 font-medium">{d.broker_name}</p>
                      <p className="text-xs text-slate-500">{d.exposure_type.replace(/_/g, ' ')} · Risk {d.risk_score}/100</p>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(d.discovery_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Recent Scrubs */}
          {report.recent_scrubbed && report.recent_scrubbed.length > 0 && (
            <>
              <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Successfully Scrubbed This Week
              </h3>
              <div className="space-y-2">
                {report.recent_scrubbed.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-emerald-800/30">
                    <div>
                      <p className="text-sm text-slate-200 font-medium">{s.broker_name}</p>
                      <p className="text-xs text-slate-500">{s.exposure_type.replace(/_/g, ' ')}</p>
                    </div>
                    <span className="text-xs text-emerald-400">{new Date(s.scrubbed_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
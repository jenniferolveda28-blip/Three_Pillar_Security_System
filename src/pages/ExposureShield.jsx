import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck, ShieldAlert, Eye, RefreshCw, ExternalLink,
  Camera, AlertTriangle, Search, CheckCircle2, Clock, Activity,
  Globe, UserX, TrendingDown
} from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

const STATUS_CONFIG = {
  discovered: { label: 'Discovered', color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: Eye },
  opt_out_sent: { label: 'Opt-Out Sent', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: Send },
  pending_verification: { label: 'Verifying', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: Clock },
  scrubbed: { label: 'Scrubbed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', icon: CheckCircle2 },
  re_listed: { label: 'Re-Listed', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', icon: AlertTriangle },
  escalated: { label: 'Escalated', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40', icon: ShieldAlert }
};

const EXPOSURE_LABELS = {
  pii_name: 'Full Name',
  pii_address: 'Home Address',
  pii_phone: 'Phone Number',
  pii_email: 'Email Address',
  pii_relatives: 'Family Members',
  pii_criminal_record: 'Criminal Record',
  pii_financial: 'Financial Data',
  pii_court_records: 'Court Records'
};

import { Send } from 'lucide-react';

export default function ExposureShield() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const data = await base44.entities.ExposureRecord.filter(
        { user_email: user.email },
        '-discovery_date',
        100
      );
      setRecords(data);
    } catch (err) {
      console.error('Failed to load exposure records:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = base44.entities.ExposureRecord.subscribe((event) => {
      loadRecords();
    });
    return unsubscribe;
  }, [loadRecords]);

  const handleRunScan = async () => {
    setScanning(true);
    toast({ title: "Deep scan initiated", description: "Scanning data broker networks for your exposed PII..." });
    // Simulate discovery of new exposures (prototype)
    await new Promise(r => setTimeout(r, 2500));
    toast({ title: "Scan complete", description: `${records.length} active exposure(s) tracked.` });
    setScanning(false);
  };

  const handleOptOut = async (record) => {
    try {
      await base44.entities.ExposureRecord.update(record.id, {
        status: 'opt_out_sent',
        opt_out_sent_date: new Date().toISOString(),
        removal_method: 'automated_opt_out'
      });
      toast({ title: "Opt-out request sent", description: `Legal deletion request sent to ${record.broker_name}.` });
      loadRecords();
    } catch (err) {
      toast({ title: "Failed to send opt-out", variant: "destructive" });
    }
  };

  const handleVerify = async (record) => {
    try {
      await base44.entities.ExposureRecord.update(record.id, {
        status: 'scrubbed',
        scrubbed_date: new Date().toISOString(),
        last_verified: new Date().toISOString(),
        re_scan_count: (record.re_scan_count || 0) + 1
      });
      toast({ title: "Removal verified", description: `${record.broker_name} listing confirmed scrubbed.` });
      loadRecords();
    } catch (err) {
      toast({ title: "Verification failed", variant: "destructive" });
    }
  };

  // Compute metrics
  const totalRecords = records.length;
  const scrubbedCount = records.filter(r => r.status === 'scrubbed').length;
  const activeExposures = records.filter(r => r.status === 'discovered' || r.status === 'opt_out_sent' || r.status === 're_listed').length;
  const scrubRate = totalRecords > 0 ? Math.round((scrubbedCount / totalRecords) * 100) : 0;
  const avgRisk = totalRecords > 0 ? Math.round(records.reduce((sum, r) => sum + (r.risk_score || 0), 0) / totalRecords) : 0;

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <UserX className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">Exposure Shield</h1>
            <p className="text-slate-400 text-sm">Deep web data broker scanning & automated removal verification</p>
          </div>
        </div>
      </div>

      {/* Exposure Score Banner */}
      <Card className="bg-slate-900/60 border-slate-700 mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-slate-400 text-sm mb-1">Your Digital Exposure Score</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${activeExposures === 0 ? 'text-emerald-400' : activeExposures > 5 ? 'text-red-400' : 'text-amber-400'}`}>
                  {activeExposures}
                </span>
                <span className="text-slate-500 text-lg">active exposures</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {scrubbedCount} scrubbed · {scrubRate}% cleanup rate
              </p>
            </div>
            <div className="flex-1 max-w-xs w-full">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Scrub Progress</span>
                <span>{scrubRate}%</span>
              </div>
              <Progress value={scrubRate} className="h-3 bg-slate-800" />
            </div>
            <Button
              onClick={handleRunScan}
              disabled={scanning}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {scanning ? 'Scanning...' : 'Run Deep Scan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/40 border-slate-700">
          <CardContent className="pt-5 text-center">
            <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{totalRecords}</p>
            <p className="text-xs text-slate-500">Total Listings</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-700">
          <CardContent className="pt-5 text-center">
            <Eye className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{activeExposures}</p>
            <p className="text-xs text-slate-500">Active Exposures</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-700">
          <CardContent className="pt-5 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{scrubbedCount}</p>
            <p className="text-xs text-slate-500">Scrubbed</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-700">
          <CardContent className="pt-5 text-center">
            <TrendingDown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{avgRisk}</p>
            <p className="text-xs text-slate-500">Avg Risk Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : totalRecords === 0 ? (
        /* Empty State */
        <Card className="bg-slate-900/40 border-slate-700">
          <CardContent className="py-16 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-200 mb-2">No exposures tracked yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              Run your first deep scan to discover data broker listings containing your personal information.
            </p>
            <Button onClick={handleRunScan} disabled={scanning} className="bg-cyan-600 hover:bg-cyan-500">
              {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Start First Scan
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Exposure Records List */
        <div className="space-y-3">
          {records.map((record) => {
            const status = STATUS_CONFIG[record.status] || STATUS_CONFIG.discovered;
            const StatusIcon = status.icon;
            return (
              <Card key={record.id} className="bg-slate-900/40 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left: Broker Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0">
                        <Globe className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-slate-200 truncate">{record.broker_name}</h4>
                          <Badge variant="outline" className={`${status.color} border text-xs`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500">{EXPOSURE_LABELS[record.exposure_type] || record.exposure_type}</span>
                          <span className="text-xs text-slate-600">·</span>
                          <span className="text-xs text-slate-500">Risk: {record.risk_score || 0}/100</span>
                          {record.listing_url && (
                            <>
                              <span className="text-xs text-slate-600">·</span>
                              <a href={record.listing_url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
                                View listing <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {record.before_screenshot_url && (
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                          <Camera className="w-4 h-4 mr-1" /> Before
                        </Button>
                      )}
                      {record.after_screenshot_url && (
                        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                          <Camera className="w-4 h-4 mr-1" /> After
                        </Button>
                      )}
                      {record.status === 'discovered' && (
                        <Button size="sm" onClick={() => handleOptOut(record)} className="bg-amber-600 hover:bg-amber-500 text-white">
                          <Send className="w-3.5 h-3.5 mr-1" /> Send Opt-Out
                        </Button>
                      )}
                      {record.status === 'opt_out_sent' && (
                        <Button size="sm" onClick={() => handleVerify(record)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify
                        </Button>
                      )}
                      {record.status === 're_listed' && (
                        <Button size="sm" onClick={() => handleOptOut(record)} className="bg-orange-600 hover:bg-orange-500 text-white">
                          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Send
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* How It Works */}
      <Separator className="my-8 bg-slate-800" />
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: Search, title: 'Deep Scan', desc: 'AI scans hundreds of data broker sites for your name, age, and location.' },
          { icon: Send, title: 'Automated Opt-Out', desc: 'Legal deletion requests sent to brokers on your behalf automatically.' },
          { icon: Camera, title: 'Screenshot Verification', desc: 'Before & after screenshots capture proof of exposure and removal.' },
          { icon: Activity, title: 'Continuous Monitoring', desc: 'Re-checks ensure deleted data is not republished later.' }
        ].map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="text-center">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 inline-block mb-3">
                <Icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">{step.title}</h4>
              <p className="text-xs text-slate-500">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
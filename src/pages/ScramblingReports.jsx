import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useGuestAuditor } from '@/lib/useGuestAuditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Download, RefreshCw, CheckCircle2, AlertTriangle, Gauge, Clock, Activity } from 'lucide-react';

export default function ScramblingReports() {
    const { isGuestAuditor } = useGuestAuditor();
    const qc = useQueryClient();
    const [generating, setGenerating] = useState(false);

    const { data: reports = [], isLoading } = useQuery({
        queryKey: ['scramblingReports'],
        queryFn: () => base44.entities.SecurityReport.filter(
            { description: { $regex: 'scrambling interval' } },
            '-created_date',
            50
        ),
    });

    const { data: sessions = [] } = useQuery({
        queryKey: ['scramblingSessions-report'],
        queryFn: () => base44.entities.ScramblingSession.filter({ status: 'active' }),
    });

    const allCompliant = sessions.length > 0 && sessions.every(s => s.scramble_interval_seconds === 0.01);
    const totalIterations = sessions.reduce((sum, s) => sum + (s.iterations || 0), 0);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await base44.functions.invoke('generateScramblingReport', {});
            if (res.data?.success) {
                qc.invalidateQueries({ queryKey: ['scramblingReports'] });
            }
        } catch (err) {
            console.error('Report generation failed:', err);
        } finally {
            setGenerating(false);
        }
    };

    if (isGuestAuditor) return null;

    return (
        <div className="min-h-screen p-6 text-white">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
                                <Gauge className="w-6 h-6" />
                                Scrambling Interval Reports
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Weekly verification that the 0.01s (10ms) scrambling threshold was maintained.
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleGenerate} disabled={generating}>
                        <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                        {generating ? 'Generating…' : 'Generate Now'}
                    </Button>
                </div>

                {/* Live status */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/60 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs text-slate-400">Active Layers</span>
                            </div>
                            <div className="text-3xl font-bold text-cyan-400">{sessions.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/60 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs text-slate-400">Threshold Status</span>
                            </div>
                            <div className="text-xl font-bold text-emerald-400">
                                {allCompliant ? 'MAINTAINED' : 'VIOLATION'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/60 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Gauge className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-slate-400">Total Iterations</span>
                            </div>
                            <div className="text-3xl font-bold text-amber-400">{Math.round(totalIterations).toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/60 border-slate-700">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-violet-400" />
                                <span className="text-xs text-slate-400">Schedule</span>
                            </div>
                            <div className="text-xl font-bold text-violet-400">Weekly</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports list */}
                <Card className="bg-slate-900/60 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Generated Reports
                        </CardTitle>
                        <CardDescription>Weekly PDF reports confirming 0.01s threshold compliance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                <p>No reports generated yet. Click "Generate Now" to create the first one.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reports.map(report => {
                                    const isPass = report.description?.includes('PASS');
                                    const isFail = report.description?.includes('FAIL');
                                    return (
                                        <div key={report.id} className="flex items-center justify-between bg-slate-800/40 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {isPass ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                                ) : isFail ? (
                                                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-200 truncate">{report.report_name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {report.last_run ? new Date(report.last_run).toLocaleString('en-US', { timeZone: 'America/Chicago' }) : '—'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={isPass ? 'default' : 'destructive'} className={isPass ? 'bg-emerald-600' : ''}>
                                                    {isPass ? 'PASS' : isFail ? 'FAIL' : '—'}
                                                </Badge>
                                                {report.file_url && (
                                                    <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" variant="outline">
                                                            <Download className="w-3 h-3" />
                                                            PDF
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
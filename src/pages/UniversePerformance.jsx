import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Activity, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import UniverseHealthMonitor from '../components/dashboard/UniverseHealthMonitor';
import RateLimitMonitor from '../components/dashboard/RateLimitMonitor';
import ApiPerformanceMetrics from '../components/dashboard/ApiPerformanceMetrics';
import ResourceUtilizationChart from '../components/dashboard/ResourceUtilizationChart';
import ApiRoutingRules from '../components/dashboard/ApiRoutingRules';

export default function UniversePerformance() {
    const [activeTab, setActiveTab] = useState('overview');

    const { data: universes = [], refetch: refetchUniverses } = useQuery({
        queryKey: ['universes'],
        queryFn: () => base44.entities.Universe.list('-created_date'),
    });

    const { data: requests = [] } = useQuery({
        queryKey: ['requests'],
        queryFn: () => base44.entities.UniversalRequest.list('-created_date', 100),
    });

    const { data: metrics = [] } = useQuery({
        queryKey: ['analyticsMetrics'],
        queryFn: () => base44.entities.AnalyticsMetric.list('-created_date', 200),
        refetchInterval: 5000
    });

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="outline" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/50">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold gradient-text">Universe Performance</h1>
                                <p className="text-slate-400">Real-time monitoring and health metrics for all API universes</p>
                            </div>
                        </div>
                        <PrintReportButton
                            reportTitle="Universe Performance Report"
                            subtitle="Real-time API universe health, metrics, and routing analysis"
                            filename="universe-performance-{date}.pdf"
                            sections={[
                                { heading: 'UNIVERSE HEALTH OVERVIEW', rows: [['Total Universes', universes.length], ['Active', universes.filter(u => (u.data?.status || u.status) === 'active').length], ['Degraded', universes.filter(u => (u.data?.status || u.status) === 'degraded').length], ['Offline', universes.filter(u => (u.data?.status || u.status) === 'offline').length], ['Total Requests Tracked', requests.length], ['Analytics Metrics', metrics.length]] },
                                { heading: 'UNIVERSE LIST', body: universes.length > 0 ? universes.map(u => `• ${u.data?.name || u.name} — Status: ${u.data?.status || u.status} — Success Rate: ${u.data?.success_rate || u.success_rate || 100}% — Errors: ${u.data?.error_count || u.error_count || 0}`).join('\n') : 'No universes configured.' },
                                { heading: 'REQUEST SUMMARY', body: `Total Requests: ${requests.length}\nSuccessful: ${requests.filter(r => (r.data?.status || r.status) === 'success').length}\nFailed: ${requests.filter(r => (r.data?.status || r.status) === 'failed').length}\nAvg Latency: ${requests.length > 0 ? Math.round(requests.reduce((s, r) => s + (r.data?.latency_ms || r.latency_ms || 0), 0) / requests.length) : 0}ms\nFallback Used: ${requests.filter(r => r.data?.fallback_used || r.fallback_used).length} requests` },
                                { heading: 'PERFORMANCE BENCHMARKS', body: 'Latency Targets:\n• < 200ms — Excellent\n• 200–500ms — Good\n• 500–1000ms — Warning\n• > 1000ms — Critical\n\nAvailability Targets:\n• > 99.9% — Excellent\n• 99–99.9% — Good\n• < 99% — Action Required\n\nCircuit Breaker Policy: Opens after 5 consecutive failures. Recovery test every 30 seconds.' },
                            ]}
                        />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Performance
                        </TabsTrigger>
                        <TabsTrigger value="health" className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Health & Limits
                        </TabsTrigger>
                        <TabsTrigger value="routing" className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Routing Rules
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <ApiPerformanceMetrics universes={universes} metrics={metrics} />
                        <ResourceUtilizationChart universes={universes} metrics={metrics} />
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                        <ApiPerformanceMetrics universes={universes} metrics={metrics} detailed={true} />
                    </TabsContent>

                    <TabsContent value="health" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <UniverseHealthMonitor universes={universes} onUpdate={refetchUniverses} />
                            <RateLimitMonitor universes={universes} requests={requests} />
                        </div>
                    </TabsContent>

                    <TabsContent value="routing" className="space-y-6">
                        <ApiRoutingRules universes={universes} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
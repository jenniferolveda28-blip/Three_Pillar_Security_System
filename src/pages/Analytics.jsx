import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Shield, UserCheck, Activity, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import ApiUsageChart from '../components/analytics/ApiUsageChart';
import SecurityEventsChart from '../components/analytics/SecurityEventsChart';
import AuthMetricsChart from '../components/analytics/AuthMetricsChart';
import PerformanceMonitor from '../components/analytics/PerformanceMonitor';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('api');
  const [timeRange, setTimeRange] = useState('24h');

  const { data: metrics = [], refetch } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => base44.entities.AnalyticsMetric.list('-created_date', 1000),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: universes = [] } = useQuery({
    queryKey: ['universes'],
    queryFn: () => base44.entities.Universe.list('-created_date'),
  });

  const apiMetrics = metrics.filter(m => m.metric_type === 'api_call');
  const securityMetrics = metrics.filter(m => m.metric_type === 'security_event');
  const authMetrics = metrics.filter(m => m.metric_type === 'auth_attempt');
  const performanceMetrics = metrics.filter(m => m.metric_type === 'performance' || m.metric_type === 'api_call');

  const totalCalls = apiMetrics.length;
  const successRate = apiMetrics.length > 0 
    ? ((apiMetrics.filter(m => m.success).length / apiMetrics.length) * 100).toFixed(1)
    : 100;
  const avgLatency = apiMetrics.length > 0
    ? (apiMetrics.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / apiMetrics.length).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive insights and metrics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === '1h' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('1h')}
              >
                1H
              </Button>
              <Button
                variant={timeRange === '24h' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('24h')}
              >
                24H
              </Button>
              <Button
                variant={timeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('7d')}
              >
                7D
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total API Calls</p>
                <p className="text-3xl font-bold text-blue-600">{totalCalls}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-blue-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">{successRate}%</p>
              </div>
              <Activity className="w-10 h-10 text-green-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Latency</p>
                <p className="text-3xl font-bold text-purple-600">{avgLatency}ms</p>
              </div>
              <Activity className="w-10 h-10 text-purple-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Auth Attempts</p>
                <p className="text-3xl font-bold text-orange-600">{authMetrics.length}</p>
              </div>
              <UserCheck className="w-10 h-10 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              API Usage
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Events
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api">
            <ApiUsageChart metrics={apiMetrics} universes={universes} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityEventsChart metrics={securityMetrics} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="auth">
            <AuthMetricsChart metrics={authMetrics} timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor metrics={performanceMetrics} universes={universes} timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
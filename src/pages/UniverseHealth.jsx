import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Activity, AlertTriangle, CheckCircle, XCircle, Search, ArrowUpDown } from "lucide-react";

export default function UniverseHealth() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data: universes = [], isLoading } = useQuery({
    queryKey: ['universes'],
    queryFn: () => base44.entities.Universe.list('-created_date'),
    refetchInterval: 10000,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['requests'],
    queryFn: () => base44.entities.UniversalRequest.list('-created_date', 500),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => base44.entities.AnalyticsMetric.filter({ metric_type: 'api_call' }, '-created_date', 1000),
  });

  const getUniverseMetrics = (universeId) => {
    const universeRequests = requests.filter(r => r.routed_to === universeId);
    const universeMetrics = metrics.filter(m => m.universe_id === universeId);
    
    const successCount = universeRequests.filter(r => r.status === 'success').length;
    const totalCount = universeRequests.length;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 100;
    
    const latencies = universeMetrics.map(m => m.latency_ms).filter(Boolean);
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    
    const recentRequests = universeRequests.filter(r => {
      const created = new Date(r.created_date);
      return new Date() - created < 3600000; // Last hour
    }).length;
    
    const errorRate = totalCount > 0 ? ((totalCount - successCount) / totalCount) * 100 : 0;
    
    return {
      successRate: successRate.toFixed(1),
      avgLatency: Math.round(avgLatency),
      recentActivity: recentRequests,
      errorRate: errorRate.toFixed(1),
      totalRequests: totalCount
    };
  };

  const getHealthStatus = (universe) => {
    const m = getUniverseMetrics(universe.id);
    const successRate = parseFloat(m.successRate);
    const errorRate = parseFloat(m.errorRate);
    
    if (universe.status === 'offline' || successRate < 50) {
      return { status: 'Down', color: 'text-red-400', bg: 'bg-red-900/30', icon: XCircle };
    } else if (universe.status === 'degraded' || successRate < 90 || errorRate > 10) {
      return { status: 'Degraded', color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: AlertTriangle };
    } else {
      return { status: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-900/30', icon: CheckCircle };
    }
  };

  const filteredUniverses = universes
    .filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
      const health = getHealthStatus(u);
      const matchesStatus = statusFilter === 'all' || health.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortBy === 'status') {
        aVal = getHealthStatus(a).status;
        bVal = getHealthStatus(b).status;
      } else if (sortBy === 'success_rate') {
        aVal = parseFloat(getUniverseMetrics(a.id).successRate);
        bVal = parseFloat(getUniverseMetrics(b.id).successRate);
      } else if (sortBy === 'latency') {
        aVal = getUniverseMetrics(a.id).avgLatency;
        bVal = getUniverseMetrics(b.id).avgLatency;
      } else if (sortBy === 'activity') {
        aVal = getUniverseMetrics(a.id).recentActivity;
        bVal = getUniverseMetrics(b.id).recentActivity;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

  const totalUniverses = universes.length;
  const healthyCount = universes.filter(u => getHealthStatus(u).status === 'Healthy').length;
  const degradedCount = universes.filter(u => getHealthStatus(u).status === 'Degraded').length;
  const downCount = universes.filter(u => getHealthStatus(u).status === 'Down').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Universe Health Dashboard</h1>
            <p className="text-slate-400">Monitor API health, performance, and activity</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="multi-layer-card card-layer-auth border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Universes</p>
                  <p className="text-3xl font-bold text-cyan-400">{totalUniverses}</p>
                </div>
                <Activity className="w-10 h-10 text-cyan-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="multi-layer-card card-layer-data border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Healthy</p>
                  <p className="text-3xl font-bold text-emerald-400">{healthyCount}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="multi-layer-card card-layer-scramble border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Degraded</p>
                  <p className="text-3xl font-bold text-yellow-400">{degradedCount}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="multi-layer-card card-layer-threat border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Down</p>
                  <p className="text-3xl font-bold text-red-400">{downCount}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="multi-layer-card border bg-slate-800/50 mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search universes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="degraded">Degraded</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="success_rate">Success Rate</SelectItem>
                    <SelectItem value="latency">Latency</SelectItem>
                    <SelectItem value="activity">Recent Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Universe List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="multi-layer-card border bg-slate-800/50">
              <CardContent className="p-8 text-center text-slate-400">Loading...</CardContent>
            </Card>
          ) : filteredUniverses.length === 0 ? (
            <Card className="multi-layer-card border bg-slate-800/50">
              <CardContent className="p-8 text-center text-slate-400">No universes found</CardContent>
            </Card>
          ) : (
            filteredUniverses.map((universe) => {
              const health = getHealthStatus(universe);
              const metrics = getUniverseMetrics(universe.id);
              const Icon = health.icon;

              return (
                <Card key={universe.id} className="multi-layer-card border bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${health.bg}`}>
                          <Icon className={`w-6 h-6 ${health.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-100 mb-1">{universe.name}</h3>
                          <p className="text-sm text-slate-400 mb-2">{universe.description}</p>
                          <div className="flex gap-2 flex-wrap">
                            {universe.capabilities?.map((cap, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${health.bg} ${health.color} border-0`}>
                        {health.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-slate-700">
                      <div className="bg-slate-900/50 rounded p-3">
                        <p className="text-xs text-slate-400 mb-1">Success Rate</p>
                        <p className="text-lg font-bold text-emerald-400">{metrics.successRate}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3">
                        <p className="text-xs text-slate-400 mb-1">Avg Latency</p>
                        <p className="text-lg font-bold text-cyan-400">{metrics.avgLatency}ms</p>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3">
                        <p className="text-xs text-slate-400 mb-1">Error Rate</p>
                        <p className="text-lg font-bold text-red-400">{metrics.errorRate}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3">
                        <p className="text-xs text-slate-400 mb-1">Recent Activity</p>
                        <p className="text-lg font-bold text-violet-400">{metrics.recentActivity}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded p-3">
                        <p className="text-xs text-slate-400 mb-1">Total Requests</p>
                        <p className="text-lg font-bold text-slate-300">{metrics.totalRequests}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                      <span>Base URL: {universe.base_url}</span>
                      <span>Last checked: {universe.last_check ? new Date(universe.last_check).toLocaleString() : 'Never'}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
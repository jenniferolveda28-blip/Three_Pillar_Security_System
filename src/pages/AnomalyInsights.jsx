import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };

const severityColors = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
};

const statusColors = {
  detected: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  investigating: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
  confirmed_threat: 'bg-red-500/20 text-red-400 border-red-500/50',
  false_positive: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/50',
};

export default function AnomalyInsights() {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const { data: anomalies = [], isLoading } = useQuery({
    queryKey: ['behaviorAnomaliesInsights'],
    queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 200),
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading anomaly insights…</div>;

  const filtered = severityFilter === 'all' ? anomalies : anomalies.filter(a => a.severity === severityFilter);

  // Build severity trend by day (last 7 days)
  const now = new Date();
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStr = day.toDateString();
    const dayAnomalies = anomalies.filter(a => a.detection_timestamp && new Date(a.detection_timestamp).toDateString() === dayStr);
    trendData.push({
      date: day.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      critical: dayAnomalies.filter(a => a.severity === 'critical').length,
      high: dayAnomalies.filter(a => a.severity === 'high').length,
      medium: dayAnomalies.filter(a => a.severity === 'medium').length,
      low: dayAnomalies.filter(a => a.severity === 'low').length,
    });
  }

  // Anomaly type distribution
  const typeData = Object.entries(
    anomalies.reduce((acc, a) => { acc[a.anomaly_type] = (acc[a.anomaly_type] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Status distribution
  const statusData = Object.entries(
    anomalies.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Brain className="w-8 h-8 text-cyan-400" /> Anomaly Insights
        </h1>
        <p className="text-slate-400 mt-1">Behavioral anomaly patterns, severity trends, and AI-driven reasoning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-400" /> Severity Trends (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Anomaly Type Distribution</CardTitle></CardHeader>
          <CardContent>
            {typeData.length === 0 ? <p className="text-slate-500 text-center py-8">No data</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {typeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Status Distribution</CardTitle></CardHeader>
        <CardContent>
          {statusData.length === 0 ? <p className="text-slate-500 text-center py-4">No data</p> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Flagged Anomalies ({filtered.length})</CardTitle>
            <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? <p className="text-slate-500 text-center py-8">No anomalies found.</p> : (
            <div className="space-y-3">
              {filtered.slice(0, 30).map(a => (
                <div key={a.id} className="rounded-lg bg-slate-900/50 border border-slate-800 overflow-hidden">
                  <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors text-left">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${a.severity === 'critical' ? 'text-red-400' : a.severity === 'high' ? 'text-orange-400' : 'text-amber-400'}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 truncate">{a.anomaly_type?.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-500">{a.user_identifier}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={severityColors[a.severity] || severityColors.medium}>{a.severity}</Badge>
                      <Badge className={statusColors[a.status] || statusColors.detected}>{a.status?.replace(/_/g, ' ')}</Badge>
                      {a.deviation_score != null && <span className="text-xs text-slate-400">Score: {a.deviation_score}</span>}
                      {expandedId === a.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </button>
                  {expandedId === a.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-800">
                      {a.ai_reasoning && (
                        <div className="mt-3 p-3 rounded-lg bg-violet-500/10 border-l-2 border-violet-500">
                          <p className="text-xs text-violet-400 font-medium mb-1 flex items-center gap-1"><Brain className="w-3 h-3" /> AI Reasoning</p>
                          <p className="text-sm text-slate-300">{a.ai_reasoning}</p>
                        </div>
                      )}
                      {a.baseline_behavior && (
                        <div><p className="text-xs text-slate-400 mb-1">Baseline Behavior</p><pre className="text-xs text-slate-500 bg-slate-900 p-2 rounded overflow-x-auto">{JSON.stringify(a.baseline_behavior, null, 2)}</pre></div>
                      )}
                      {a.anomalous_behavior && (
                        <div><p className="text-xs text-slate-400 mb-1">Anomalous Behavior</p><pre className="text-xs text-slate-500 bg-slate-900 p-2 rounded overflow-x-auto">{JSON.stringify(a.anomalous_behavior, null, 2)}</pre></div>
                      )}
                      <p className="text-xs text-slate-500">Detected: {a.detection_timestamp ? new Date(a.detection_timestamp).toLocaleString() : 'Unknown'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
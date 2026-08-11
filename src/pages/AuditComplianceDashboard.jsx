import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ClipboardCheck, ShieldCheck, AlertTriangle, FileText, Clock } from 'lucide-react';

export default function AuditComplianceDashboard() {
  const { data: passes = [], isLoading: passesLoading } = useQuery({ queryKey: ['auditPassesComp'], queryFn: () => base44.entities.AuditorAccessPass.list('-created_date', 200) });
  const { data: feedback = [], isLoading: feedbackLoading } = useQuery({ queryKey: ['auditFeedbackComp'], queryFn: () => base44.entities.AuditFeedback.list('-created_date', 200) });
  const { data: logs = [], isLoading: logsLoading } = useQuery({ queryKey: ['compLogsDash'], queryFn: () => base44.entities.SecurityLog.list('-created_date', 200) });
  const { data: anomalies = [], isLoading: anomaliesLoading } = useQuery({ queryKey: ['compAnomDash'], queryFn: () => base44.entities.BehaviorAnomaly.list('-created_date', 200) });

  const isLoading = passesLoading || feedbackLoading || logsLoading || anomaliesLoading;
  if (isLoading) return <div className="p-8 text-slate-400">Loading audit compliance dashboard…</div>;

  const totalPasses = passes.length;
  const completed = passes.filter(p => p.questionnaire_completed).length;
  const pending = totalPasses - completed;
  const completionRate = totalPasses > 0 ? Math.round((completed / totalPasses) * 100) : 0;

  const openFeedback = feedback.filter(f => f.status === 'submitted').length;
  const resolvedFeedback = feedback.filter(f => f.status === 'resolved').length;

  const suspicious = logs.filter(l => l.event_type === 'suspicious_activity').length;
  const denied = logs.filter(l => l.event_type === 'access_denied').length;
  const activeAnomalies = anomalies.filter(a => a.status === 'detected' || a.status === 'investigating').length;

  const complianceScore = Math.max(0, Math.min(100, completionRate - suspicious * 2 - activeAnomalies * 3 - denied));
  const scoreColor = complianceScore >= 80 ? 'text-green-400' : complianceScore >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><ClipboardCheck className="w-8 h-8 text-cyan-400" /> Audit Compliance Dashboard</h1>
        <p className="text-slate-400 mt-1">Auditor progress, pending questionnaire responses, and platform-wide compliance scoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Compliance Score</p><p className={`text-3xl font-bold ${scoreColor}`}>{complianceScore}</p></div>
            <ShieldCheck className="w-10 h-10 text-cyan-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Questionnaire Completion</p><p className="text-3xl font-bold text-white">{completionRate}%</p></div>
            <FileText className="w-10 h-10 text-violet-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Pending Responses</p><p className="text-3xl font-bold text-amber-400">{pending}</p></div>
            <Clock className="w-10 h-10 text-amber-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Open Audit Feedback</p><p className="text-3xl font-bold text-red-400">{openFeedback}</p></div>
            <AlertTriangle className="w-10 h-10 text-red-500/50" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Questionnaire Completion Progress</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-slate-400">Completed</span><span className="text-white">{completed} / {totalPasses}</span></div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Pending Questionnaire Responses</CardTitle></CardHeader>
          <CardContent>
            {pending === 0 ? <p className="text-slate-500 text-center py-4">All questionnaires completed.</p> : (
              <div className="space-y-2">
                {passes.filter(p => !p.questionnaire_completed).slice(0, 10).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div>
                      <p className="text-sm text-white">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-slate-500">{p.auditor_email || '—'}</p>
                    </div>
                    <Badge variant="outline" className="border-amber-600/50 text-amber-300">{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Recent Audit Feedback</CardTitle></CardHeader>
          <CardContent>
            {feedback.length === 0 ? <p className="text-slate-500 text-center py-4">No feedback recorded.</p> : (
              <div className="space-y-2">
                {feedback.slice(0, 10).map(f => (
                  <div key={f.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{f.auditor_email || 'Auditor'}</span>
                      <Badge variant="outline" className={f.status === 'resolved' ? 'border-emerald-600/50 text-emerald-300' : f.status === 'reviewed' ? 'border-blue-600/50 text-blue-300' : 'border-amber-600/50 text-amber-300'}>{f.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{f.observation || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
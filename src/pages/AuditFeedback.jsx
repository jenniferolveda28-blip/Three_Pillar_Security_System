import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const categoryColors = {
  security: 'bg-red-500/20 text-red-400 border-red-500/50',
  performance: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  usability: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  compliance: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  general: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
};

const severityColors = {
  info: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  high: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export default function AuditFeedback() {
  const queryClient = useQueryClient();
  const [observation, setObservation] = useState('');
  const [category, setCategory] = useState('general');
  const [severity, setSeverity] = useState('info');

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['auditFeedback'],
    queryFn: () => base44.entities.AuditFeedback.list('-created_date', 100),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.AuditFeedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['auditFeedback']);
      setObservation('');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!observation.trim()) return;
    const user = await base44.auth.me();
    submitMutation.mutate({
      auditor_email: user?.email || 'unknown',
      observation: observation.trim(),
      category,
      severity,
      session_date: new Date().toISOString(),
    });
  };

  if (isLoading) return <div className="p-8 text-slate-400">Loading feedback…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-cyan-400" /> Audit Feedback
        </h1>
        <p className="text-slate-400 mt-1">Submit observations and notes during test sessions for admin review</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Submit New Observation</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
                  <option value="general">General</option>
                  <option value="security">Security</option>
                  <option value="performance">Performance</option>
                  <option value="usability">Usability</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Severity</label>
                <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
                  <option value="info">Info</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Observation / Notes</label>
              <Textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Describe your observation during the test session…" className="bg-slate-900 border-slate-700 text-white min-h-[120px]" />
            </div>
            <Button type="submit" disabled={!observation.trim() || submitMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
              <Send className="w-4 h-4 mr-2" /> {submitMutation.isPending ? 'Submitting…' : 'Submit Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Submitted Feedback ({feedback.length})</CardTitle></CardHeader>
        <CardContent>
          {feedback.length === 0 ? <p className="text-slate-500 py-4">No feedback submitted yet.</p> : (
            <div className="space-y-3">
              {feedback.map(f => (
                <div key={f.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[f.category] || categoryColors.general}>{f.category}</Badge>
                      <Badge className={severityColors[f.severity] || severityColors.info}>{f.severity}</Badge>
                      {f.status === 'reviewed' && <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" /> Reviewed</Badge>}
                      {f.status === 'resolved' && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>}
                    </div>
                    <span className="text-xs text-slate-500">{f.session_date ? new Date(f.session_date).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-sm text-slate-200">{f.observation}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">By {f.auditor_email}</p>
                  </div>
                  {f.admin_response && (
                    <div className="mt-2 p-2 rounded bg-slate-800/50 border-l-2 border-cyan-500">
                      <p className="text-xs text-cyan-400 font-medium mb-1">Admin Response:</p>
                      <p className="text-xs text-slate-300">{f.admin_response}</p>
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
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Save, X, CheckCircle, Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const statusColors = {
  submitted: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  reviewed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/50',
};

export default function AuditFeedbackTracker() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', admin_response: '' });
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['auditFeedbackAdmin'],
    queryFn: () => base44.entities.AuditFeedback.list('-created_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AuditFeedback.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['auditFeedbackAdmin']); setEditingId(null); },
  });

  const startEdit = (f) => {
    setEditingId(f.id);
    setEditForm({ status: f.status || 'submitted', admin_response: f.admin_response || '' });
  };

  const filtered = statusFilter === 'all' ? feedback : feedback.filter(f => f.status === statusFilter);

  if (isLoading) return <div className="p-8 text-slate-400">Loading audit feedback…</div>;

  const submittedCount = feedback.filter(f => f.status === 'submitted').length;
  const reviewedCount = feedback.filter(f => f.status === 'reviewed').length;
  const resolvedCount = feedback.filter(f => f.status === 'resolved').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-cyan-400" /> Audit Feedback Tracker
        </h1>
        <p className="text-slate-400 mt-1">Review and resolve observations submitted by auditors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Awaiting Review</p><p className="text-2xl font-bold text-amber-400">{submittedCount}</p></div>
            <FileText className="w-8 h-8 text-amber-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Under Review</p><p className="text-2xl font-bold text-cyan-400">{reviewedCount}</p></div>
            <Eye className="w-8 h-8 text-cyan-500/50" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 flex items-center justify-between">
            <div><p className="text-sm text-slate-400">Resolved</p><p className="text-2xl font-bold text-green-400">{resolvedCount}</p></div>
            <CheckCircle className="w-8 h-8 text-green-500/50" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Feedback Items ({filtered.length})</CardTitle>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm">
              <option value="all">All Statuses</option>
              <option value="submitted">Awaiting Review</option>
              <option value="reviewed">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? <p className="text-slate-500 text-center py-8">No feedback found.</p> : (
            <div className="space-y-3">
              {filtered.map(f => (
                <div key={f.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[f.category] || categoryColors.general}>{f.category}</Badge>
                      <Badge className={severityColors[f.severity] || severityColors.info}>{f.severity}</Badge>
                      <Badge className={statusColors[f.status] || statusColors.submitted}>{f.status}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">{f.session_date ? new Date(f.session_date).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-sm text-slate-200 mb-2">{f.observation}</p>
                  <p className="text-xs text-slate-500 mb-3">By {f.auditor_email}</p>

                  {f.admin_response && editingId !== f.id && (
                    <div className="p-2 rounded bg-slate-800/50 border-l-2 border-cyan-500">
                      <p className="text-xs text-cyan-400 font-medium mb-1">Admin Response:</p>
                      <p className="text-xs text-slate-300">{f.admin_response}</p>
                    </div>
                  )}

                  {editingId === f.id ? (
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">Status</label>
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm w-full">
                          <option value="submitted">Awaiting Review</option>
                          <option value="reviewed">Under Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">Admin Response</label>
                        <Textarea value={editForm.admin_response} onChange={e => setEditForm({ ...editForm, admin_response: e.target.value })} placeholder="Enter your response…" className="bg-slate-900 border-slate-700 text-white min-h-[80px]" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => updateMutation.mutate({ id: f.id, data: editForm })} disabled={updateMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
                          <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? 'Saving…' : 'Save'}
                        </Button>
                        <Button onClick={() => setEditingId(null)} variant="outline" className="border-slate-700 text-slate-300"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => startEdit(f)} variant="outline" size="sm" className="border-slate-700 text-slate-300">
                      {f.status === 'submitted' ? <><Eye className="w-3 h-3 mr-1" /> Review</> : <><CheckCircle className="w-3 h-3 mr-1" /> Update</>}
                    </Button>
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
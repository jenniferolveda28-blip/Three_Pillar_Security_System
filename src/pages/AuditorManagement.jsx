import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Copy, Check, Loader2, Users, KeyRound, FileCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const STATUS_COLORS = {
  pending: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  used: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
  expired: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  revoked: 'bg-red-500/20 text-red-400 border-red-500/50'
};

function generatePasscode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `BVFY-${segment(4)}-${segment(4)}`;
}

export default function AuditorManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { data: passes = [], isLoading } = useQuery({
    queryKey: ['auditorPasses'],
    queryFn: () => base44.entities.AuditorAccessPass.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AuditorAccessPass.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditorPasses'] });
    }
  });

  const emailMutation = useMutation({
    mutationFn: ({ to, subject, body }) =>
      base44.integrations.Core.SendEmail({ to, subject, body }),
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    const code = generatePasscode();
    setGeneratedCode(code);

    try {
      await createMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        auditor_email: email,
        passcode: code,
        status: 'active',
        assigned_date: new Date().toISOString()
      });

      if (email) {
        const appUrl = window.location.origin + '/auditor-access';
        const body = `Hello ${firstName},\n\nYou have been granted auditor access to the Three-Pillar Security System.\n\nYour unique access passcode: ${code}\n\nAccess portal: ${appUrl}\n\nInstructions:\n1. Visit the access portal link above\n2. Enter your first name, last name, and the passcode\n3. Complete the security audit questionnaire\n\nThis passcode is unique to you. Do not share it with others.\n\nThank you,\nThree-Pillar Security Team`;
        await emailMutation.mutateAsync({ to: email, subject: 'Your Auditor Access Passcode — Three-Pillar Security', body });
        toast({ title: 'Passcode generated & emailed', description: `${firstName} ${lastName} received their passcode.` });
      } else {
        toast({ title: 'Passcode generated', description: 'Copy the passcode to share with the auditor manually.' });
      }

      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (err) {
      toast({ title: 'Error', description: err.message || 'Failed to create passcode.', variant: 'destructive' });
    }
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResendEmail = async (pass) => {
    if (!pass.auditor_email) {
      toast({ title: 'No email', description: 'This auditor has no email on file.', variant: 'destructive' });
      return;
    }
    const appUrl = window.location.origin + '/auditor-access';
    const body = `Hello ${pass.first_name},\n\nYour auditor access passcode: ${pass.passcode}\n\nAccess portal: ${appUrl}\n\nInstructions:\n1. Visit the access portal link above\n2. Enter your first name, last name, and the passcode\n3. Complete the security audit questionnaire\n\nThank you,\nThree-Pillar Security Team`;
    try {
      await emailMutation.mutateAsync({ to: pass.auditor_email, subject: 'Your Auditor Access Passcode — Three-Pillar Security', body });
      toast({ title: 'Email sent', description: `Passcode re-sent to ${pass.auditor_email}.` });
    } catch (err) {
      toast({ title: 'Email failed', description: err.message, variant: 'destructive' });
    }
  };

  const stats = {
    total: passes.length,
    active: passes.filter((p) => p.status === 'active').length,
    used: passes.filter((p) => p.status === 'used').length,
    completed: passes.filter((p) => p.questionnaire_completed).length
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-400" /> Auditor Management
        </h1>
        <p className="text-slate-400 mt-1">Generate unique passcodes, invite auditors, and review questionnaire responses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6"><p className="text-sm text-slate-400">Total Auditors</p><p className="text-2xl font-bold text-white">{stats.total}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-emerald-500/30"><CardContent className="pt-6"><p className="text-sm text-emerald-400">Active Passes</p><p className="text-2xl font-bold text-emerald-400">{stats.active}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-cyan-500/30"><CardContent className="pt-6"><p className="text-sm text-cyan-400">Accessed</p><p className="text-2xl font-bold text-cyan-400">{stats.used}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-violet-500/30"><CardContent className="pt-6"><p className="text-sm text-violet-400">Questionnaires Done</p><p className="text-2xl font-bold text-violet-400">{stats.completed}</p></CardContent></Card>
      </div>

      {/* Generate new pass */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-cyan-400" /> Generate New Auditor Passcode</CardTitle>
          <CardDescription>Each auditor gets a unique passcode tied to their name. Optionally email it directly.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="bg-slate-900/50 border-slate-700 text-white" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="bg-slate-900/50 border-slate-700 text-white" placeholder="Smith" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email (optional)</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="bg-slate-900/50 border-slate-700 text-white" placeholder="auditor@firm.com" />
              </div>
            </div>
            {generatedCode && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-cyan-500/30">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <code className="text-cyan-400 font-mono font-bold tracking-wider flex-1">{generatedCode}</code>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleCopy(generatedCode, 'new')}>
                  {copiedId === 'new' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
            <Button type="submit" disabled={createMutation.isPending} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Generate Passcode {email && '& Send Email'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Auditor list */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Auditor Passes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : passes.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No auditor passes generated yet.</p>
          ) : (
            <div className="space-y-2">
              {passes.map((p) => (
                <div key={p.id} className="rounded-lg bg-slate-900/50 border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                        {p.first_name?.[0]}{p.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-slate-500">{p.auditor_email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLORS[p.status] || STATUS_COLORS.pending}>{p.status}</Badge>
                      {p.questionnaire_completed && (
                        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/50">
                          <FileCheck className="w-3 h-3 mr-1" /> Done
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(p.passcode, p.id)}>
                        {copiedId === p.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      {p.auditor_email && (
                        <Button variant="ghost" size="sm" onClick={() => handleResendEmail(p)} disabled={emailMutation.isPending}>
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      {p.questionnaire_completed && (
                        <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                          {expandedId === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Passcode display */}
                  <div className="px-3 pb-2">
                    <code className="text-xs text-cyan-400 font-mono">{p.passcode}</code>
                    <span className="text-xs text-slate-600 ml-2">
                      · Accessed {p.access_count || 0}×
                      {p.accessed_date && ` · ${new Date(p.accessed_date).toLocaleString()}`}
                    </span>
                  </div>
                  {/* Expanded questionnaire answers */}
                  {expandedId === p.id && p.questionnaire_answers && (
                    <div className="border-t border-slate-800 p-3 space-y-3 bg-slate-950/30">
                      <p className="text-xs text-slate-500">
                        Submitted: {p.questionnaire_completed_date ? new Date(p.questionnaire_completed_date).toLocaleString() : 'N/A'}
                      </p>
                      {Object.entries(p.questionnaire_answers).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs font-medium text-slate-400 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-slate-200 mt-1">{String(value)}</p>
                        </div>
                      ))}
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
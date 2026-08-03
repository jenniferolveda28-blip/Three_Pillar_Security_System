import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ClipboardCheck, KeyRound, FileText, ArrowRight, Gavel } from 'lucide-react';

const links = [
  { to: '/bioverify-handbook', icon: BookOpen, title: 'BioVerify Handbook', desc: 'Architecture & verification documentation' },
  { to: '/self-certification', icon: ClipboardCheck, title: 'Self-Certification Form', desc: 'Enroll a token & test identity verification' },
  { to: '/auditor-access', icon: KeyRound, title: 'Auditor Access Portal', desc: 'Verify passcode & complete questionnaire' },
  { to: '/bioverify-blueprint', icon: FileText, title: 'BioVerify Blueprint', desc: 'Token architecture paperwork prototype' }
];

export default function AuditorPortal() {
  const { user } = useAuth();
  const { data = [] } = useQuery({
    queryKey: ['auditorPortal', 'warrants', user?.email],
    queryFn: () => base44.entities.AuditorAccessPass.list('-assigned_date', 20),
    enabled: !!user?.email
  });
  const myWarrant = (data || []).find(w => w.auditor_email === user?.email);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Gavel className="w-7 h-7 text-cyan-400" /> Auditor Portal</h1>
        <p className="text-slate-400 mt-1">Your assigned tasks, BioVerify documentation, and self-certification — in one place.</p>
      </div>
      {myWarrant && (
        <Card className="bg-slate-900/60 border-cyan-700/40">
          <CardContent className="pt-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-white font-medium">Your Auditor Warrant</div>
              <div className="text-xs text-slate-500">{myWarrant.first_name} {myWarrant.last_name} · {myWarrant.auditor_email}</div>
            </div>
            <Badge variant="outline" className={myWarrant.status === 'active' ? 'border-emerald-600/50 text-emerald-300' : 'border-slate-600 text-slate-400'}>{myWarrant.status}</Badge>
          </CardContent>
        </Card>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {links.map(l => {
          const Icon = l.icon;
          return (
            <Link key={l.to} to={l.to}>
              <Card className="bg-slate-900/60 border-slate-700 hover:border-cyan-600/50 transition-colors h-full">
                <CardContent className="pt-5 flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-600/20"><Icon className="w-5 h-5 text-cyan-300" /></div>
                  <div className="flex-1">
                    <div className="text-white font-medium flex items-center justify-between">{l.title}<ArrowRight className="w-4 h-4 text-slate-500" /></div>
                    <div className="text-sm text-slate-400 mt-1">{l.desc}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Star, Calendar, Activity, ArrowRight, Mail, Phone, FileText } from 'lucide-react';
import { format } from 'date-fns';
import ExportAllPagesButton from '@/components/reports/ExportAllPagesButton';

const STATUS_COLORS = {
  'Contacted': 'bg-blue-600',
  'NDA Sent': 'bg-yellow-600',
  'Meeting Scheduled': 'bg-cyan-600',
  'Follow-up Needed': 'bg-orange-600',
  'Negotiating': 'bg-purple-600',
  'Interested': 'bg-green-600',
  'Passed': 'bg-slate-600',
};

export default function LeadActivitySummary() {
  const { data: meetings = [] } = useQuery({
    queryKey: ['investor_meetings_summary'],
    queryFn: () => base44.entities.InvestorMeeting.list('-created_date', 200),
  });

  // Compute activity score per lead
  const leadsWithScores = meetings.map(m => {
    let score = 0;
    if (m.feedback) score += 3;
    if (m.next_steps) score += 2;
    if (m.pillars_discussed?.length) score += m.pillars_discussed.length;
    if (m.documents_reviewed) score += 2;
    if (m.follow_up_date) score += 2;
    if (m.email) score += 1;
    if (m.phone) score += 1;
    score += parseInt(m.interest_level || 3);
    return { ...m, activity_score: score };
  }).sort((a, b) => b.activity_score - a.activity_score);

  const newLeads = meetings.filter(m =>
    m.documents_reviewed === 'SeekingPartners page contact form' ||
    m.status === 'Contacted'
  );
  const upcomingFollowUps = meetings.filter(m => m.follow_up_date && new Date(m.follow_up_date) >= new Date())
    .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));

  const statusCounts = {};
  meetings.forEach(m => { statusCounts[m.status] = (statusCounts[m.status] || 0) + 1; });

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black gradient-text">Lead Activity Summary</h1>
            <p className="text-slate-400 mt-1">One clear view of all prospect activity — ranked by engagement</p>
          </div>
          <div className="flex gap-2">
            <ExportAllPagesButton />
            <Link to="/InvestorCRM"><Button variant="outline" className="border-slate-600 text-slate-300"><Users className="w-4 h-4 mr-2" />Open CRM</Button></Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: meetings.length, icon: Users, color: 'text-cyan-400' },
            { label: 'New Contact Form Entries', value: newLeads.length, icon: Mail, color: 'text-green-400' },
            { label: 'Upcoming Follow-Ups', value: upcomingFollowUps.length, icon: Calendar, color: 'text-purple-400' },
            { label: 'Pipeline Stages Active', value: Object.keys(statusCounts).length, icon: Activity, color: 'text-orange-400' },
          ].map((s, i) => (
            <Card key={i} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-5 flex items-center gap-4">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-slate-400 text-xs">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline Stage Distribution */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base">Pipeline Stage Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
                  <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[status] || 'bg-slate-600'}`} />
                  <span className="text-sm font-medium text-white">{status}</span>
                  <Badge className="bg-slate-700 text-white">{count}</Badge>
                </div>
              ))}
              {Object.keys(statusCounts).length === 0 && <p className="text-slate-500 text-sm">No leads yet.</p>}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Active Prospects */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-400" />Most Active Prospects</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {leadsWithScores.slice(0, 10).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg border border-slate-700/50">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{m.investor_name}</p>
                    <p className="text-xs text-slate-500 truncate">{m.company || 'No company'} • {m.meeting_date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-xs">{'⭐'.repeat(parseInt(m.interest_level || 3))}</span>
                    <Badge className={`${STATUS_COLORS[m.status] || 'bg-slate-600'} text-white text-xs`}>{m.status}</Badge>
                    <span className="text-cyan-400 font-bold text-sm">{m.activity_score}</span>
                  </div>
                </div>
              ))}
              {leadsWithScores.length === 0 && <p className="text-slate-500 text-center py-8">No leads recorded yet.</p>}
            </CardContent>
          </Card>

          {/* Upcoming Follow-Ups */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-400" />Upcoming Follow-Ups</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {upcomingFollowUps.slice(0, 10).map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg border border-purple-500/20">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{m.investor_name}</p>
                    <p className="text-xs text-slate-500">Follow-up: {m.follow_up_date}</p>
                  </div>
                  <Badge className={`${STATUS_COLORS[m.status] || 'bg-slate-600'} text-white text-xs`}>{m.status}</Badge>
                </div>
              ))}
              {upcomingFollowUps.length === 0 && <p className="text-slate-500 text-center py-8">No upcoming follow-ups.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Recent Contact Form Entries */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Mail className="w-5 h-5 text-green-400" />Recent Contact Form Entries</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newLeads.slice(0, 8).map(m => (
                <div key={m.id} className="flex items-center gap-4 p-3 bg-slate-900/40 rounded-lg border border-slate-700/50">
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{m.investor_name} {m.company && <span className="text-slate-500 font-normal">— {m.company}</span>}</p>
                    <p className="text-xs text-slate-500">{m.email} {m.phone && `• ${m.phone}`}</p>
                    {m.feedback && <p className="text-xs text-slate-400 mt-1 truncate">"{m.feedback}"</p>}
                  </div>
                  <span className="text-xs text-slate-500">{format(new Date(m.created_date), 'MMM d, yyyy')}</span>
                  <Badge className={`${STATUS_COLORS[m.status] || 'bg-slate-600'} text-white text-xs`}>{m.status}</Badge>
                </div>
              ))}
              {newLeads.length === 0 && <p className="text-slate-500 text-center py-8">No contact form entries yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
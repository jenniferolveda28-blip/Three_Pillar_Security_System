import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Download, Star, Calendar, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import BulkActionBar, { exportSelectedLeadsPDF } from '@/components/investor/BulkActionBar';
import PriorityBadge, { calculatePriorityScore, getPriorityTier } from '@/components/investor/PriorityBadge';
import { format } from 'date-fns';

const STATUS_COLORS = {
  'Contacted': 'bg-blue-600',
  'NDA Sent': 'bg-yellow-600',
  'Meeting Scheduled': 'bg-cyan-600',
  'Follow-up Needed': 'bg-orange-600',
  'Negotiating': 'bg-purple-600',
  'Interested': 'bg-green-600',
  'Passed': 'bg-slate-600',
};

const STATUS_OPTIONS = ['Contacted', 'NDA Sent', 'Meeting Scheduled', 'Follow-up Needed', 'Negotiating', 'Interested', 'Passed'];

export default function LeadBulkActions() {
  const qc = useQueryClient();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [interestFilter, setInterestFilter] = useState('all');

  const { data: meetings = [] } = useQuery({
    queryKey: ['investor_meetings_bulk'],
    queryFn: () => base44.entities.InvestorMeeting.list('-meeting_date', 200),
  });

  const filtered = useMemo(() => {
    return meetings.filter(m => {
      const matchesSearch = !search ||
        m.investor_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.company?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesInterest = interestFilter === 'all' ||
        (interestFilter === 'high' && parseInt(m.interest_level) >= 4) ||
        (interestFilter === 'medium' && parseInt(m.interest_level) === 3) ||
        (interestFilter === 'low' && parseInt(m.interest_level) <= 2);
      return matchesSearch && matchesStatus && matchesInterest;
    });
  }, [meetings, search, statusFilter, interestFilter]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(m => m.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }) => base44.entities.InvestorMeeting.bulkUpdate(ids.map(id => ({ id, status }))),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries(['investor_meetings_bulk']);
      qc.invalidateQueries(['investor_meetings']);
      toast.success(`Updated ${vars.ids.length} leads to "${vars.status}"`);
      clearSelection();
    },
  });

  const bulkInterestMutation = useMutation({
    mutationFn: ({ ids, level }) => base44.entities.InvestorMeeting.bulkUpdate(ids.map(id => ({ id, interest_level: level }))),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries(['investor_meetings_bulk']);
      qc.invalidateQueries(['investor_meetings']);
      toast.success(`Updated interest level for ${vars.ids.length} leads`);
      clearSelection();
    },
  });

  const handleBulkStatusUpdate = (newStatus) => {
    bulkStatusMutation.mutate({ ids: [...selectedIds], status: newStatus });
  };

  const handleBulkInterestUpdate = (level) => {
    bulkInterestMutation.mutate({ ids: [...selectedIds], level });
  };

  const handleExportSelected = () => {
    const selectedMeetings = meetings.filter(m => selectedIds.has(m.id));
    exportSelectedLeadsPDF(selectedMeetings);
  };

  const handleExportAll = () => {
    exportSelectedLeadsPDF(filtered);
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black gradient-text">Lead Bulk Actions</h1>
            <p className="text-slate-400 mt-1">Select multiple leads and perform bulk updates or exports</p>
          </div>
          <Button onClick={handleExportAll} className="bg-purple-600 hover:bg-purple-500">
            <Download className="w-4 h-4 mr-2" /> Export All Filtered
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: meetings.length, icon: Users, color: 'text-cyan-400' },
            { label: 'Filtered Results', value: filtered.length, icon: Filter, color: 'text-blue-400' },
            { label: 'Selected', value: selectedIds.size, icon: Star, color: 'text-yellow-400' },
            { label: 'High Priority', value: filtered.filter(m => getPriorityTier(calculatePriorityScore(m)) === 'high').length, icon: Calendar, color: 'text-red-400' },
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

        {selectedIds.size > 0 && (
          <BulkActionBar
            selectedCount={selectedIds.size}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onExportSelected={handleExportSelected}
            onClearSelection={clearSelection}
          />
        )}

        {selectedIds.size > 0 && (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-300 font-semibold">Bulk Interest Update:</span>
              <Select onValueChange={handleBulkInterestUpdate}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Set interest..." /></SelectTrigger>
                <SelectContent>
                  {['1','2','3','4','5'].map(n => <SelectItem key={n} value={n}>{'⭐'.repeat(parseInt(n))} ({n}/5)</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input className="bg-slate-800 border-slate-700 text-white pl-10" placeholder="Search by name, company, email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={interestFilter} onValueChange={setInterestFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interest</SelectItem>
              <SelectItem value="high">High (4-5)</SelectItem>
              <SelectItem value="medium">Medium (3)</SelectItem>
              <SelectItem value="low">Low (1-2)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-cyan-400">Leads ({filtered.length})</CardTitle>
              <div className="flex items-center gap-3">
                <Checkbox checked={filtered.length > 0 && selectedIds.size === filtered.length} onCheckedChange={toggleSelectAll} />
                <span className="text-xs text-slate-400">Select all</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filtered.length === 0 && <p className="text-slate-500 text-center py-8">No leads match your filters.</p>}
              {filtered.map(m => (
                <div key={m.id} className={`flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border transition-all cursor-pointer ${selectedIds.has(m.id) ? 'border-cyan-500/50 ring-1 ring-cyan-500/30' : 'border-slate-700/50 hover:border-slate-600'}`}
                  onClick={() => toggleSelect(m.id)}>
                  <Checkbox checked={selectedIds.has(m.id)} onCheckedChange={() => toggleSelect(m.id)} onClick={e => e.stopPropagation()} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{m.investor_name}</span>
                      {m.company && <span className="text-sm text-slate-400">— {m.company}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{m.email || 'No email'}</span>
                      <span>•</span>
                      <span>{m.meeting_date ? format(new Date(m.meeting_date), 'MMM d, yyyy') : 'No date'}</span>
                      <span>•</span>
                      <span className="text-yellow-400">{'⭐'.repeat(parseInt(m.interest_level || 3))}</span>
                    </div>
                  </div>
                  <Badge className={`${STATUS_COLORS[m.status] || 'bg-slate-600'} text-white text-xs`}>{m.status}</Badge>
                  <PriorityBadge meeting={m} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
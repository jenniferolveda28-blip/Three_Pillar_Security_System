import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dna, Droplet, Syringe, Scissors, Plus, ArrowLeft, Search,
  CheckCircle2, FlaskConical, XCircle, PackageCheck, Clock, Trash2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

const STATUS_META = {
  received:        { label: 'Received',        icon: PackageCheck,  color: 'cyan',    cls: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
  in_transit:      { label: 'In Transit',      icon: Clock,         color: 'slate',   cls: 'border-slate-500/40 bg-slate-500/10 text-slate-300' },
  lab_processing:  { label: 'Lab Processing',  icon: FlaskConical,  color: 'amber',   cls: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  hash_generated:  { label: 'Hash Generated',  icon: Dna,           color: 'violet',  cls: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
  activated:       { label: 'Activated',       icon: CheckCircle2,  color: 'emerald', cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  rejected:        { label: 'Rejected',         icon: XCircle,       color: 'rose',    cls: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
  destroyed:       { label: 'Destroyed',        icon: Trash2,       color: 'slate',    cls: 'border-slate-600/40 bg-slate-700/10 text-slate-400' },
};

const TYPE_META = {
  saliva: { label: 'Saliva', icon: Droplet,   cls: 'text-cyan-400' },
  blood:  { label: 'Blood',  icon: Syringe,   cls: 'text-rose-400' },
  hair:   { label: 'Hair',   icon: Scissors,  cls: 'text-amber-400' },
};

export default function SystemDnaSampleTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);

  // New sample form state
  const [form, setForm] = useState({
    sample_id: '',
    sample_type: 'saliva',
    submitter_name: '',
    submitter_email: '',
    lab_name: '',
    tracking_number: '',
    kit_serial: '',
    notes: '',
  });

  const { data: samples = [], isLoading } = useQuery({
    queryKey: ['system_DnaSample'],
    queryFn: () => base44.entities.system_DnaSample.list('-received_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.system_DnaSample.create({
      ...data,
      received_date: new Date().toISOString(),
      status: 'received',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_DnaSample'] });
      toast({ title: 'Sample logged', description: `${form.sample_id} recorded as received.` });
      setForm({
        sample_id: '', sample_type: 'saliva', submitter_name: '', submitter_email: '',
        lab_name: '', tracking_number: '', kit_serial: '', notes: '',
      });
      setShowForm(false);
    },
    onError: (e) => toast({
      variant: 'destructive',
      title: 'Failed to log sample',
      description: e?.message || 'Unknown error',
    }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, extra }) =>
      base44.entities.system_DnaSample.update(id, {
        status,
        ...(status === 'hash_generated' || status === 'activated'
          ? { processed_date: new Date().toISOString(), ...(extra || {}) }
          : extra || {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_DnaSample'] });
      toast({ title: 'Status updated' });
    },
    onError: (e) => toast({
      variant: 'destructive',
      title: 'Update failed',
      description: e?.message || 'Unknown error',
    }),
  });

  const filtered = useMemo(() => {
    return samples.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        s.sample_id?.toLowerCase().includes(q) ||
        s.submitter_name?.toLowerCase().includes(q) ||
        s.submitter_email?.toLowerCase().includes(q) ||
        s.tracking_number?.toLowerCase().includes(q);
      const matchesType = filterType === 'all' || s.sample_type === filterType;
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [samples, search, filterType, filterStatus]);

  const stats = useMemo(() => {
    const by = (st) => samples.filter((s) => s.status === st).length;
    return {
      total: samples.length,
      received: by('received'),
      processing: by('lab_processing') + by('in_transit'),
      hash_generated: by('hash_generated'),
      activated: by('activated'),
      rejected: by('rejected'),
      destroyed: by('destroyed'),
    };
  }, [samples]);

  const STAT_CARDS = [
    { label: 'Total Samples', value: stats.total, icon: Dna, cls: 'text-cyan-400 border-cyan-500/30' },
    { label: 'Received', value: stats.received, icon: PackageCheck, cls: 'text-slate-300 border-slate-500/30' },
    { label: 'Processing', value: stats.processing, icon: FlaskConical, cls: 'text-amber-400 border-amber-500/30' },
    { label: 'Hash Generated', value: stats.hash_generated, icon: Dna, cls: 'text-violet-400 border-violet-500/30' },
    { label: 'Activated', value: stats.activated, icon: CheckCircle2, cls: 'text-emerald-400 border-emerald-500/30' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, cls: 'text-rose-400 border-rose-500/30' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.sample_id || !form.submitter_name) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Sample ID and submitter name are required.' });
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-slate-400 hover:text-cyan-400 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate flex items-center gap-2">
                <Dna className="w-5 h-5 text-cyan-400 shrink-0" />
                DNA Sample Intake Tracker
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Internal staff dashboard for biological sample processing</p>
            </div>
          </div>
          <Button onClick={() => setShowForm((v) => !v)} className="shrink-0 bg-cyan-600 hover:bg-cyan-500">
            <Plus className="w-4 h-4 mr-1" /> Log Sample
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_CARDS.map((s) => (
            <Card key={s.label} className={`bg-slate-900/50 border ${s.cls}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide">{s.label}</p>
                  </div>
                  <s.icon className={`w-6 h-6 ${s.cls.split(' ')[0]}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add form */}
        {showForm && (
          <Card className="bg-slate-900/50 border-cyan-900/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4 text-cyan-400" /> Log New Sample Arrival</CardTitle>
              <CardDescription>Record a biological sample received at intake.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Sample ID / Barcode *</Label>
                  <Input value={form.sample_id} onChange={(e) => setForm({ ...form, sample_id: e.target.value })} placeholder="DNA-2026-0001" className="bg-slate-950 border-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sample Type</Label>
                  <Select value={form.sample_type} onValueChange={(v) => setForm({ ...form, sample_type: v })}>
                    <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saliva">Saliva</SelectItem>
                      <SelectItem value="blood">Blood</SelectItem>
                      <SelectItem value="hair">Hair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Submitter Name *</Label>
                  <Input value={form.submitter_name} onChange={(e) => setForm({ ...form, submitter_name: e.target.value })} className="bg-slate-950 border-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <Label>Submitter Email</Label>
                  <Input type="email" value={form.submitter_email} onChange={(e) => setForm({ ...form, submitter_email: e.target.value })} className="bg-slate-950 border-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <Label>CLIA Lab Partner</Label>
                  <Input value={form.lab_name} onChange={(e) => setForm({ ...form, lab_name: e.target.value })} placeholder="LabCorp / Quest / ..." className="bg-slate-950 border-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tracking Number</Label>
                  <Input value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} className="bg-slate-950 border-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <Label>Kit Serial</Label>
                  <Input value={form.kit_serial} onChange={(e) => setForm({ ...form, kit_serial: e.target.value })} className="bg-slate-950 border-slate-700" />
                </div>
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={1} className="bg-slate-950 border-slate-700 resize-none" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-cyan-600 hover:bg-cyan-500">
                    {createMutation.isPending ? 'Saving…' : 'Log Sample'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by sample ID, name, email, or tracking #"
              className="pl-9 bg-slate-900/50 border-slate-700"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40 bg-slate-900/50 border-slate-700"><SelectValue placeholder="Sample type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="saliva">Saliva</SelectItem>
              <SelectItem value="blood">Blood</SelectItem>
              <SelectItem value="hair">Hair</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-44 bg-slate-900/50 border-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sample list */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-500">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
            Loading samples…
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-slate-900/40 border-slate-800">
            <CardContent className="py-16 text-center">
              <Dna className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">No samples match the current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => {
              const sm = STATUS_META[s.status] || STATUS_META.received;
              const tm = TYPE_META[s.sample_type] || TYPE_META.saliva;
              const StatusIcon = sm.icon;
              const TypeIcon = tm.icon;
              return (
                <Card key={s.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardContent className="pt-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Identity */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 ${tm.cls}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-semibold text-sm text-slate-100">{s.sample_id}</span>
                            <Badge variant="outline" className={`h-5 text-[10px] py-0 ${sm.cls}`}>
                              <StatusIcon className="w-3 h-3 mr-1" /> {sm.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 mt-0.5 truncate">{s.submitter_name}</p>
                          {s.submitter_email && <p className="text-xs text-slate-500 truncate">{s.submitter_email}</p>}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 lg:justify-center">
                        <div>
                          <span className="text-slate-600">Received</span>
                          <p className="text-slate-300">{s.received_date ? moment(s.received_date).format('MMM D, YYYY · h:mm A') : '—'}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Processed</span>
                          <p className="text-slate-300">{s.processed_date ? moment(s.processed_date).format('MMM D, YYYY · h:mm A') : '—'}</p>
                        </div>
                        {s.dna_hash && (
                          <div className="max-w-[160px]">
                            <span className="text-slate-600">DNA Hash</span>
                            <p className="text-violet-300 font-mono truncate" title={s.dna_hash}>{s.dna_hash.slice(0, 16)}…</p>
                          </div>
                        )}
                      </div>

                      {/* Meta + actions */}
                      <div className="flex flex-col items-start lg:items-end gap-2">
                        {s.lab_name && <span className="text-xs text-slate-500">Lab: {s.lab_name}</span>}
                        {s.tracking_number && <span className="text-xs text-slate-500 font-mono">Track: {s.tracking_number}</span>}
                        <Select
                          value={s.status}
                          onValueChange={(v) => statusMutation.mutate({ id: s.id, status: v })}
                        >
                          <SelectTrigger className="h-8 w-44 text-xs bg-slate-950 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_META).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {s.notes && (
                      <p className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500 italic">"{s.notes}"</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
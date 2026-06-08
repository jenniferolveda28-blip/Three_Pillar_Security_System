import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { addDays, addHours, format } from 'date-fns';

const PRESETS = [
  { label: 'Daily', schedule_type: 'daily', time_range_days: 1, description: 'Every 24 hours' },
  { label: 'Weekly', schedule_type: 'weekly', time_range_days: 7, description: 'Every 7 days' },
  { label: 'Monthly', schedule_type: 'monthly', time_range_days: 30, description: 'Every 30 days' },
];

export default function AutoReportScheduler() {
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SecurityReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityReports'] });
      toast.success('Automated report schedule created!');
      setSelected(null);
      setEmail('');
    },
    onError: (err) => toast.error('Failed: ' + err.message),
  });

  const handleCreate = () => {
    if (!selected) { toast.error('Select a schedule frequency.'); return; }
    if (!email.includes('@')) { toast.error('Enter a valid recipient email.'); return; }

    const preset = PRESETS.find(p => p.label === selected);
    const next_run = format(
      preset.label === 'Daily' ? addHours(new Date(), 24)
      : preset.label === 'Weekly' ? addDays(new Date(), 7)
      : addDays(new Date(), 30),
      "yyyy-MM-dd'T'HH:mm:ss"
    );

    createMutation.mutate({
      report_name: `Auto ${preset.label} Security Report`,
      schedule_type: preset.schedule_type,
      is_active: true,
      delivery_method: 'email',
      recipients: [email],
      include_threat_summary: true,
      include_incident_details: true,
      include_key_metrics: true,
      include_recommendations: true,
      time_range_days: preset.time_range_days,
      next_run,
    });
  };

  return (
    <Card className="bg-slate-800/60 border-cyan-500/30 border mt-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-cyan-400" />
          Quick Auto-Schedule Setup
          <Badge className="bg-cyan-500/20 text-cyan-300 text-xs ml-2">For Testing</Badge>
        </CardTitle>
        <p className="text-slate-400 text-sm">Set up automated recurring reports delivered to your email — perfect for ongoing testing and monitoring.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setSelected(p.label)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selected === p.label
                  ? 'bg-cyan-600 border-cyan-500 text-white'
                  : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-cyan-500/50'
              }`}
            >
              {p.label}
              <span className="block text-xs opacity-70">{p.description}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-slate-400 text-xs mb-1 block">Recipient Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending || !selected || !email}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {createMutation.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
              : <><Zap className="w-4 h-4 mr-2" />Create Schedule</>
            }
          </Button>
        </div>

        {createMutation.isSuccess && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Schedule created! It will appear in the report list above.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
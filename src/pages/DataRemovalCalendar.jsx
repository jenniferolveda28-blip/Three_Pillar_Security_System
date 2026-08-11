import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function DataRemovalCalendar() {
  const [cursor, setCursor] = useState(new Date());
  const { data: records = [], isLoading } = useQuery({ queryKey: ['removalCalendar'], queryFn: () => base44.entities.ExposureRecord.list('-discovery_date', 500) });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = {};
  records.forEach(r => {
    const entries = [];
    if (r.scrubbed_date) entries.push({ date: new Date(r.scrubbed_date), type: 'completed', r });
    if (r.opt_out_sent_date) entries.push({ date: new Date(r.opt_out_sent_date), type: 'scheduled', r });
    entries.forEach(({ date, type, r: rec }) => {
      if (date.getFullYear() === year && date.getMonth() === month) {
        const key = date.getDate();
        if (!eventsByDate[key]) eventsByDate[key] = [];
        eventsByDate[key].push({ type, r: rec });
      }
    });
  });

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const completedCount = records.filter(r => r.scrubbed_date).length;
  const scheduledCount = records.filter(r => r.status === 'opt_out_sent' || r.status === 'pending_verification').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Calendar className="w-8 h-8 text-cyan-400" /> Data Removal Calendar</h1>
        <p className="text-slate-400 mt-1">Scheduled PII removal tasks and a timeline of past successful data purges</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Completed Purges</p><p className="text-2xl font-bold text-green-400">{completedCount}</p></div><CheckCircle2 className="w-8 h-8 text-green-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">In-Progress / Scheduled</p><p className="text-2xl font-bold text-amber-400">{scheduledCount}</p></div><Clock className="w-8 h-8 text-amber-500/50" /></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardContent className="pt-6 flex items-center justify-between"><div><p className="text-sm text-slate-400">Total Tracked</p><p className="text-2xl font-bold text-white">{records.length}</p></div><Calendar className="w-8 h-8 text-cyan-500/50" /></CardContent></Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">{monthNames[month]} {year}</CardTitle>
            <div className="flex items-center gap-2">
              <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCursor(new Date())} className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm">Today</button>
              <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-slate-500 text-center py-8">Loading calendar…</p> : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-xs text-slate-500 py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                  if (d === null) return <div key={i} />;
                  const evs = eventsByDate[d] || [];
                  const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  return (
                    <div key={i} className={`min-h-[5rem] p-1.5 rounded-lg border ${isToday ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/40'}`}>
                      <div className={`text-xs ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>{d}</div>
                      <div className="space-y-0.5 mt-1">
                        {evs.slice(0, 3).map((e, j) => (
                          <div key={j} className={`text-[10px] px-1 py-0.5 rounded truncate ${e.type === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`} title={`${e.r.broker_name} — ${e.type}`}>
                            {e.r.broker_name}
                          </div>
                        ))}
                        {evs.length > 3 && <div className="text-[10px] text-slate-500">+{evs.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40" /> Completed purge</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/40" /> Scheduled / in-progress</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
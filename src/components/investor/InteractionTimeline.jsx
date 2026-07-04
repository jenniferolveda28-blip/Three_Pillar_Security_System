import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, FileText, ArrowRight, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const ICONS = {
  meeting_logged: FileText,
  status_change: ArrowRight,
  follow_up_scheduled: Calendar,
  checklist_created: CheckSquare,
  feedback_updated: MessageSquare,
  notes_added: MessageSquare,
};

const COLORS = {
  meeting_logged: 'bg-blue-500',
  status_change: 'bg-cyan-500',
  follow_up_scheduled: 'bg-purple-500',
  checklist_created: 'bg-green-500',
  feedback_updated: 'bg-orange-500',
  notes_added: 'bg-slate-500',
};

export default function InteractionTimeline({ meeting }) {
  const { data: interactions = [] } = useQuery({
    queryKey: ['investor_interactions', meeting?.id],
    queryFn: () => base44.entities.InvestorInteraction.filter({ investor_meeting_id: meeting.id }, '-timestamp', 50),
    enabled: !!meeting?.id,
  });

  // Build events from logged interactions; fall back to meeting record fields if none exist yet
  const events = interactions.map(i => ({
    type: i.interaction_type,
    description: i.description,
    timestamp: i.timestamp,
  }));

  if (events.length === 0 && meeting) {
    if (meeting.created_date) events.push({ type: 'meeting_logged', description: `Meeting logged — Status: ${meeting.status}`, timestamp: meeting.created_date });
    if (meeting.meeting_date) events.push({ type: 'meeting_logged', description: `Meeting date scheduled: ${meeting.meeting_date}`, timestamp: new Date(meeting.meeting_date).toISOString() });
    if (meeting.follow_up_date) events.push({ type: 'follow_up_scheduled', description: `Follow-up scheduled: ${meeting.follow_up_date}`, timestamp: new Date(meeting.follow_up_date).toISOString() });
    if (meeting.updated_date && meeting.updated_date !== meeting.created_date) events.push({ type: 'notes_added', description: 'Record updated with new details', timestamp: meeting.updated_date });
  }

  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (events.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700">
      <p className="text-xs text-slate-400 font-semibold mb-3 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Interaction Timeline
      </p>
      <div className="space-y-0">
        {events.map((e, i) => {
          const Icon = ICONS[e.type] || FileText;
          const color = COLORS[e.type] || 'bg-slate-500';
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                {i < events.length - 1 && <div className="w-0.5 flex-1 bg-slate-700 mt-1" style={{ minHeight: '20px' }} />}
              </div>
              <div className="pb-3">
                <p className="text-sm text-slate-200 leading-tight">{e.description}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {e.timestamp ? format(new Date(e.timestamp), 'MMM d, yyyy h:mm a') : '—'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
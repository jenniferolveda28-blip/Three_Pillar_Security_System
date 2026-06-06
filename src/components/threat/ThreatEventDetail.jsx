import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Clock, MapPin, User, Shield, Lock, Activity } from 'lucide-react';
import moment from 'moment';

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/50',
  emergency: 'bg-red-600/20 text-red-500 border-red-600/50',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
};

export default function ThreatEventDetail({ event, onClose, alerts, logs }) {
  // Normalize: support both flat and nested (.data) structures
  const e = event?.data ?? event ?? {};

  const isAlert = e.alert_type !== undefined;
  const severity = isAlert ? e.severity : e.threat_level;
  const title = isAlert
    ? (e.alert_type || '').replace(/_/g, ' ').toUpperCase()
    : (e.event_type || '').replace(/_/g, ' ').toUpperCase();

  // Find related events (normalize nested data too)
  const relatedEvents = isAlert
    ? alerts.filter(a => a.id !== event.id && (
        (a.data?.ip_address || a.ip_address) === e.ip_address ||
        (a.data?.user_identifier || a.user_identifier) === e.user_identifier
      )).slice(0, 5)
    : logs.filter(l => l.id !== event.id && (
        (l.data?.ip_address || l.ip_address) === e.ip_address ||
        (l.data?.universe_id || l.universe_id) === e.universe_id
      )).slice(0, 5);

  return (
    <Card className="multi-layer-card card-layer-threat border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <CardTitle className="text-2xl text-slate-100">{title}</CardTitle>
            </div>
            <Badge className={severityColors[severity] || severityColors.low}>
              {severity?.toUpperCase() || 'UNKNOWN'} SEVERITY
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">Timestamp</span>
            </div>
            <p className="text-slate-200">{moment(event.created_date || e.created_date).format('MMMM Do YYYY, h:mm:ss a')}</p>
            <p className="text-xs text-slate-500">{moment(event.created_date || e.created_date).fromNow()}</p>
          </div>

          {e.ip_address && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-semibold">IP Address</span>
              </div>
              <p className="text-slate-200 font-mono">{e.ip_address}</p>
            </div>
          )}

          {e.user_identifier && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-semibold">User</span>
              </div>
              <p className="text-slate-200">{e.user_identifier}</p>
            </div>
          )}

          {e.universe_id && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-semibold">Universe</span>
              </div>
              <p className="text-slate-200">{e.universe_id}</p>
            </div>
          )}

          {e.confidence_score && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-semibold">Confidence Score</span>
              </div>
              <p className="text-slate-200">{e.confidence_score}%</p>
            </div>
          )}

          {e.status && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-semibold">Status</span>
              </div>
              <Badge variant="outline">{e.status.toUpperCase()}</Badge>
            </div>
          )}
        </div>

        {/* Details */}
        {(e.details || e.activity_details) && (
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">Event Details</p>
            <div className="text-slate-300 text-sm whitespace-pre-wrap">
              {typeof (e.details || e.activity_details) === 'string'
                ? (e.details || e.activity_details)
                : JSON.stringify(e.details || e.activity_details, null, 2)
              }
            </div>
          </div>
        )}

        {/* Indicators */}
        {e.indicators && e.indicators.length > 0 && (
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">Threat Indicators</p>
            <div className="flex flex-wrap gap-2">
              {e.indicators.map((indicator, idx) => (
                <Badge key={idx} variant="outline" className="border-red-500/50 text-red-400">
                  {indicator}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-3">Related Events</p>
            <div className="space-y-2">
              {relatedEvents.map((related) => (
                <div key={related.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">
                      {(related.alert_type || related.event_type)?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {moment(related.created_date).fromNow()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Block Source
          </Button>
          <Button variant="outline" className="flex-1">
            Mark as False Positive
          </Button>
          <Button className="flex-1 bg-red-600 hover:bg-red-700">
            Escalate to Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
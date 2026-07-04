import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckSquare, Mail, RefreshCw, Plug, Zap, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const INTEGRATIONS = [
  {
    id: 'googlecalendar',
    name: 'Google Calendar',
    description: 'Create and manage calendar events for investor meetings and follow-ups',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-600',
    scopes: ['calendar.events', 'email'],
    features: ['Auto-create meeting events', 'Webhook for event changes', 'Pre-meeting reminders'],
    connected: true,
  },
  {
    id: 'googletasks',
    name: 'Google Tasks',
    description: 'Generate pre-meeting checklists and follow-up tasks automatically',
    icon: CheckSquare,
    color: 'from-green-500 to-emerald-600',
    scopes: ['tasks', 'email'],
    features: ['Pre-meeting checklist (7 items)', 'Follow-up task creation', 'Auto-reminders'],
    connected: true,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send investor intro emails, daily threat summaries, and follow-up sequences',
    icon: Mail,
    color: 'from-red-500 to-orange-600',
    scopes: ['gmail.send', 'email'],
    features: ['Investor intro emails', 'Daily threat digest', 'Webhook for mailbox events'],
    connected: true,
  },
];

export default function IntegrationHub() {
  const [toggles, setToggles] = useState({
    googlecalendar: true,
    googletasks: true,
    gmail: true,
  });

  const toggleIntegration = (id) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(`${INTEGRATIONS.find(i => i.id === id).name} ${toggles[id] ? 'disabled' : 'enabled'}`);
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black gradient-text">Integration Hub</h1>
          <p className="text-slate-400 mt-1">Manage and toggle connections for external services</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Connected Services', value: INTEGRATIONS.filter(i => i.connected).length, icon: Plug, color: 'text-cyan-400' },
            { label: 'Active Integrations', value: Object.values(toggles).filter(Boolean).length, icon: Zap, color: 'text-green-400' },
            { label: 'Webhooks Enabled', value: 2, icon: RefreshCw, color: 'text-purple-400' },
            { label: 'Total Scopes', value: INTEGRATIONS.reduce((s, i) => s + i.scopes.length, 0), icon: AlertCircle, color: 'text-yellow-400' },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {INTEGRATIONS.map(integ => {
            const Icon = integ.icon;
            const isEnabled = toggles[integ.id];
            const isOAuthConnected = integ.connected;
            return (
              <Card key={integ.id} className={`bg-slate-800/60 border-slate-700 transition-all ${isEnabled && isOAuthConnected ? 'ring-1 ring-cyan-500/30' : 'opacity-60'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-gradient-to-br ${integ.color} rounded-xl`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{integ.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {isOAuthConnected ? (
                            <Badge className="bg-green-600 text-white text-xs">Connected</Badge>
                          ) : (
                            <Badge className="bg-slate-600 text-white text-xs">Not Connected</Badge>
                          )}
                          {isEnabled && isOAuthConnected && (
                            <Badge className="bg-cyan-600 text-white text-xs">Active</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleIntegration(integ.id)}
                      disabled={!isOAuthConnected}
                      className={`relative w-12 h-6 rounded-full transition-colors ${isEnabled && isOAuthConnected ? 'bg-cyan-500' : 'bg-slate-600'} disabled:cursor-not-allowed`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isEnabled && isOAuthConnected ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-3">{integ.description}</p>
                  <div className="space-y-1.5">
                    {integ.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckSquare className="w-3 h-3 text-cyan-400" />{f}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700">
                    <span className="text-xs text-slate-500">Scopes:</span>
                    {integ.scopes.map(s => (
                      <Badge key={s} variant="outline" className="text-xs text-slate-400 border-slate-600">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="bg-slate-800/40 border-slate-700 border-dashed">
            <CardHeader>
              <CardTitle className="text-slate-400 flex items-center gap-2">
                <Plug className="w-5 h-5" /> Additional Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Connect additional services like Slack, Notion, HubSpot, Salesforce, and more through the platform's OAuth connector system.
              </p>
              <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10" asChild>
                <a href="/Dashboard">
                  <ExternalLink className="w-4 h-4 mr-2" /> Browse All Connectors
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
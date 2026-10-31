import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Link2,
  Watch,
  FileSearch,
  Database,
  Bell,
  Activity,
  RefreshCw,
  Lock,
  Brain,
  Zap,
  Mail,
  CalendarClock,
  Star,
  BarChart3,
  Users,
  FileText,
  Gauge,
  UserCheck,
  ListChecks,
  Settings,
  Gavel,
  KeyRound,
  ScrollText,
  ShieldCheck,
  Share2,
  Sparkles,
  Crown,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const USER_EXPERIENCE_LINKS = [
  { label: 'HelixVerify Auth', to: createPageUrl('Authenticator'), icon: Link2, accent: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10' },
  { label: 'Exposure Shield', to: '/exposure-shield', icon: Shield, accent: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' },
  { label: 'Identity Dashboard', to: '/identity-dashboard', icon: Activity, accent: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10' },
  { label: 'Token Enrollment', to: '/token-enrollment', icon: Watch, accent: 'text-amber-300 border-amber-500/30 hover:bg-amber-500/10' },
  { label: 'Hardware Status', to: '/bioverify-hardware-status', icon: Watch, accent: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10' },
  { label: 'My Security Report', to: '/user-security-report', icon: FileSearch, accent: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' },
  { label: 'Data Brokers', to: '/data-broker-directory', icon: Database, accent: 'text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10' },
  { label: 'Dynamic Scrambler', to: createPageUrl('DynamicScrambler'), icon: RefreshCw, accent: 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10' },
  { label: 'Alert Feed', to: '/alert-feed', icon: Bell, accent: 'text-red-400 border-red-500/30 hover:bg-red-500/10' },
  { label: 'Connect AI', to: '/connect', icon: Sparkles, accent: 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10' },
];

const OWNER_CATEGORIES = {
  operations: {
    label: 'Security & Ops',
    items: [
      { label: 'Unified Security', to: createPageUrl('UnifiedSecurityDashboard'), icon: Shield },
      { label: 'AI Threat Detection', to: createPageUrl('AIThreatDetection'), icon: Brain },
      { label: 'Auto-Neutralize', to: createPageUrl('AnomalyOrchestration'), icon: Zap },
      { label: 'Three-Pillar Arch', to: createPageUrl('ThreePillarView'), icon: Lock },
      { label: 'System Diagnostics', to: createPageUrl('SystemDiagnostics'), icon: Activity },
      { label: 'Security Config', to: '/security-configuration', icon: Settings },
      { label: 'Key Rotation', to: '/token-key-rotation', icon: KeyRound },
      { label: 'Remediation Queue', to: '/remediation-queue', icon: ListChecks },
      { label: 'Broker Requests', to: '/broker-request-manager', icon: Mail },
      { label: 'System Logs', to: '/SystemLogs', icon: Activity },
    ],
  },
  governance: {
    label: 'Audit & Reports',
    items: [
      { label: 'Owner Report', to: '/owners-security-report', icon: ShieldCheck },
      { label: 'Partner Report', to: '/partner-summary-report', icon: Share2 },
      { label: 'Auditor Passcodes', to: '/auditor-management', icon: UserCheck },
      { label: 'Auditor Portal', to: '/auditor-portal', icon: Gavel },
      { label: 'Compliance Log', to: '/auditor-compliance-log', icon: ScrollText },
      { label: 'Certificates', to: '/certificate-registry', icon: FileText },
      { label: 'Scrambling Reports', to: '/ScramblingReports', icon: Gauge },
      { label: 'Exposure Trends', to: '/exposure-trends', icon: BarChart3 },
      { label: 'Hourly Email Setup', to: createPageUrl('HourlySecurityEmailSetup'), icon: Mail },
      { label: 'Daily Threat Digest', to: '/DailyThreatEmail', icon: CalendarClock },
    ],
  },
  investor: {
    label: 'Investor & CRM',
    items: [
      { label: 'Seeking Partners', to: '/SeekingPartners', icon: Star },
      { label: 'Investor Overview', to: '/InvestorOverview', icon: BarChart3 },
      { label: 'Investor CRM', to: '/InvestorCRM', icon: Users },
      { label: 'Prototype Schematics', to: '/helix-prototype-schematics', icon: Watch },
      { label: 'Texas NDA', to: '/TexasNDA', icon: FileText },
      { label: 'Lead Activity', to: '/LeadActivitySummary', icon: Users },
      { label: 'Bulk Leads', to: '/LeadBulkActions', icon: Users },
      { label: 'Email Templates', to: '/EmailTemplates', icon: Mail },
      { label: 'Integrations Hub', to: '/IntegrationHub', icon: Link2 },
      { label: 'Analytics & Perf', to: createPageUrl('Analytics'), icon: BarChart3 },
    ],
  },
};

export default function SharedZonedDashboardNavigation({ onOpenUserManagement }) {
  const [ownerGroup, setOwnerGroup] = useState('operations');
  const [ownerExpanded, setOwnerExpanded] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
      {/* Zone 1: Everyday User Experience */}
      <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-5 shadow-lg shadow-cyan-950/20 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  Everyday User Experience
                </h2>
                <p className="text-xs text-slate-400">
                  Personal identity recovery, HelixVerify tokens & PII protection
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10 text-xs">
              User Zone
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {USER_EXPERIENCE_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-950/70 border text-xs font-medium transition-colors ${item.accent}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zone 2: High-Level Owner Management Tools */}
      <div className="rounded-2xl bg-slate-900/80 border border-violet-500/30 p-5 shadow-lg shadow-violet-950/20">
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/30">
              <Crown className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Owner Management Command
              </h2>
              <p className="text-xs text-slate-400">
                High-level administration, user accounts, audits & investor ops
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenUserManagement && (
              <button
                type="button"
                onClick={onOpenUserManagement}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                Manage Users
              </button>
            )}
            <button
              type="button"
              onClick={() => setOwnerExpanded((v) => !v)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={ownerExpanded ? 'Collapse tools' : 'Expand tools'}
            >
              {ownerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Category Switcher */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {Object.entries(OWNER_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setOwnerGroup(key);
                setOwnerExpanded(true);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                ownerGroup === key
                  ? 'bg-violet-500/20 text-violet-200 border border-violet-500/50'
                  : 'bg-slate-950/50 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {ownerExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OWNER_CATEGORIES[ownerGroup].items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950/70 border border-violet-500/20 text-slate-200 hover:text-violet-300 hover:border-violet-500/50 hover:bg-violet-500/10 text-xs font-medium transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
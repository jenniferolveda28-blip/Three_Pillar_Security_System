import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Globe, History, Key, Link2, BarChart3, RefreshCw, Activity, Lock, Brain, Shield, Zap, Mail, CalendarClock, Star, TrendingUp, Gauge } from "lucide-react";
import PrintReportButton from '../components/PrintReportButton';
import BatchDownloadButton from '../components/reports/BatchDownloadButton';
import ExportAllPagesButton from '../components/reports/ExportAllPagesButton';
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import UniverseCard from '../components/dashboard/UniverseCard';
import UniversalQueryBox from '../components/router/UniversalQueryBox';
import RequestHistory from '../components/router/RequestHistory';
import KeyRotationDisplay from '../components/security/KeyRotationDisplay';
import SecurityMonitor from '../components/security/SecurityMonitor';
import HardwareTokenDisplay from '../components/security/HardwareTokenDisplay';
import FluctuatingKeyVisualizer from '../components/security/FluctuatingKeyVisualizer';
import AddUniverseForm from '../components/dashboard/AddUniverseForm';
import RateLimitMonitor from '../components/dashboard/RateLimitMonitor';
import UniverseHealthMonitor from '../components/dashboard/UniverseHealthMonitor';
import UniverseStatusWidget from '../components/dashboard/UniverseStatusWidget';
import QuantumEncryptionVisualizer from '../components/security/QuantumEncryptionVisualizer';
import ThreatMapGlobe from '../components/security/ThreatMapGlobe';
import BiometricLayerVisualizer from '../components/security/BiometricLayerVisualizer';
import ApiPlayground from '../components/api/ApiPlayground';
import CircuitBreakerMonitor from '../components/api/CircuitBreakerMonitor';
import EmergencyProtocol from '../components/security/EmergencyProtocol';
import CriminalActivityMonitor from '../components/security/CriminalActivityMonitor';
import AlertNotificationCenter from '../components/security/AlertNotificationCenter';
import ScramblerMonitor from '../components/security/ScramblerMonitor';
import AuditModeToggle from '../components/security/AuditModeToggle';
import ThreatNeutralizationChart from '../components/investor/ThreatNeutralizationChart';
import { FileText, Users } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('router');
  const [showAddUniverse, setShowAddUniverse] = useState(false);

  const { data: universes = [], refetch: refetchUniverses } = useQuery({
    queryKey: ['universes'],
    queryFn: () => base44.entities.Universe.list('-created_date'),
  });

  const { data: requests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['requests'],
    queryFn: () => base44.entities.UniversalRequest.list('-created_date', 20),
  });

  const { data: keys = [] } = useQuery({
    queryKey: ['keys'],
    queryFn: () => base44.entities.UniversalKey.list('-created_date'),
  });

  const { data: securityLogs = [] } = useQuery({
    queryKey: ['securityLogs'],
    queryFn: () => base44.entities.SecurityLog.list('-created_date', 50),
  });

  const { data: hardwareTokens = [] } = useQuery({
    queryKey: ['hardwareTokens'],
    queryFn: () => base44.entities.HardwareToken.filter({ is_active: true }),
  });

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/50">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Forged API</h1>
              <p className="text-slate-400">DNA Authentication • Unique to You • Constantly Verified</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <ExportAllPagesButton />
            <BatchDownloadButton
              universes={universes}
              requests={requests}
              keys={keys}
              securityLogs={securityLogs}
              hardwareTokens={hardwareTokens}
            />
            <PrintReportButton
              reportTitle="Forged API — API Key & Universe Management Report"
              subtitle="What Forged API does for your API keys — and why no other system comes close."
              filename="forged-api-report-{date}.pdf"
              sections={[
                {
                  heading: 'WHAT FORGED API DOES FOR YOUR API KEYS',
                  body: 'Forged API is an intelligent multi-universe API gateway that eliminates every weakness of traditional API key management.\n\nTraditional API management: One static key. One endpoint. One point of failure.\nForged API: Rotating keys across multiple universes with AI-powered routing, auto-failover, and real-time threat detection — all happening invisibly behind every request.'
                },
                {
                  heading: 'LIVE SYSTEM STATUS',
                  rows: [
                    ['Connected API Universes', universes.length],
                    ['Total Requests Processed', requests.length],
                    ['Active API Keys', keys.length],
                    ['Active Hardware Tokens', hardwareTokens.length],
                    ['Security Logs', securityLogs.length],
                    ['Key Rotation', 'Continuous — every 0.1 to 5 seconds'],
                    ['Routing Algorithm', 'AI-powered latency + health scoring'],
                    ['Failover Time', '< 50ms automatic rerouting'],
                  ]
                },
                {
                  heading: 'THE API KEY PROBLEM — AND OUR SOLUTION',
                  body: 'TRADITIONAL APPROACH (broken):\n• One API key, valid for months or years\n• Stored in environment variables or config files\n• Leaked via git commits, logs, or insider access\n• Single point of failure — one breach = full access\n• No visibility into who used the key, when, or why\n\nFORGED API APPROACH (architected for resilience):\n• Keys rotate every 0.1–5 seconds via IP Shield\n• Keys are bound to DNA-verified hardware tokens\n• Every request is logged with user, timestamp, and IP\n• Compromised keys expire before they can be replayed\n• Multiple universes provide instant failover if one is compromised'
                },
                {
                  heading: 'INTELLIGENT ROUTING ACROSS UNIVERSES',
                  body: 'Forged API routes every request across multiple API universes using an AI scoring algorithm that weighs:\n\n• Real-time latency (40% weight)\n• Success rate history (30% weight)\n• Current health status (20% weight)\n• Geographic proximity (10% weight)\n\nIf a universe degrades or goes offline, the system automatically reroutes to the next best option in < 50ms — completely transparently to the application.\n\nThis means your APIs have 99.9%+ availability even when individual providers fail.'
                },
                {
                  heading: 'SECURITY LAYERS ON EVERY API CALL',
                  body: 'Every request through Forged API passes through 5 security layers:\n\nLayer 1: DNA Authentication — Verify caller identity via BioVerify token\nLayer 2: Key Validation — Confirm current rotating key matches expected TOTP\nLayer 3: Rate Limiting — Enforce per-user and per-universe call limits\nLayer 4: Threat Analysis — AI checks request pattern against behavioral baseline\nLayer 5: Audit Logging — Full immutable record of every call with metadata\n\nAny layer can independently block a request. All five must pass for a call to succeed.'
                },
                {
                  heading: 'CIRCUIT BREAKER & FAILOVER',
                  body: 'The circuit breaker pattern protects against cascading failures:\n\n• CLOSED state: Normal operation, all requests pass through\n• OPEN state: Universe is failing, requests immediately reroute\n• HALF-OPEN state: Testing recovery before restoring full traffic\n\nThreshold: 5 consecutive failures triggers circuit open. Recovery test: Every 30 seconds.\n\nThis ensures a failing third-party API never brings down your application.'
                },
              ]}
            />
              <Link to={createPageUrl('ThreePillarView')}>
                <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                  <Lock className="w-4 h-4 mr-2" />
                  Architecture
                </Button>
              </Link>
              <Link to={createPageUrl('SystemDiagnostics')}>
                <Button variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Diagnostics
                </Button>
              </Link>
              <Link to={createPageUrl('DynamicScrambler')}>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  IP Shield
                </Button>
              </Link>
              <Link to={createPageUrl('Authenticator')}>
                <Button variant="outline">
                  <Link2 className="w-4 h-4 mr-2" />
                  BioVerify
                </Button>
              </Link>
              <Link to={createPageUrl('Analytics')}>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link to={createPageUrl('UniversePerformance')}>
                <Button variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Performance
                </Button>
              </Link>
              <Link to={createPageUrl('AIThreatDetection')}>
                <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Threats
                </Button>
              </Link>
              <Link to={createPageUrl('UnifiedSecurityDashboard')}>
                <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                  <Shield className="w-4 h-4 mr-2" />
                  Unified Dashboard
                </Button>
              </Link>
              <Link to={createPageUrl('AnomalyOrchestration')}>
                <Button variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Neutralize
                </Button>
              </Link>
              <Link to={createPageUrl('HourlySecurityEmailSetup')}>
                <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Reports
                </Button>
              </Link>
              <Link to="/DailyThreatEmail">
                <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                  <CalendarClock className="w-4 h-4 mr-2" />
                  Daily Digest
                </Button>
              </Link>
              <Link to="/SeekingPartners">
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold border-0">
                  <Star className="w-4 h-4 mr-2" />
                  Seeking Partners
                </Button>
              </Link>
              <Link to="/InvestorOverview">
                <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Investor Overview
                </Button>
              </Link>
              <Link to="/InvestorCRM">
                <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                  <Users className="w-4 h-4 mr-2" />
                  Investor CRM
                </Button>
              </Link>
              <Link to="/TexasNDA">
                <Button variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                  <FileText className="w-4 h-4 mr-2" />
                  Texas NDA
                </Button>
              </Link>
              <Link to="/LeadActivitySummary">
                <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                  <Users className="w-4 h-4 mr-2" />
                  Lead Activity
                </Button>
              </Link>
              <Link to="/SystemLogs">
                <Button variant="outline" className="border-slate-500/50 text-slate-300 hover:bg-slate-500/10">
                  <Activity className="w-4 h-4 mr-2" />
                  System Logs
                </Button>
              </Link>
              <Link to="/IntegrationHub">
                <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                  <Link2 className="w-4 h-4 mr-2" />
                  Integrations
                </Button>
              </Link>
              <Link to="/LeadBulkActions">
                <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                  <Users className="w-4 h-4 mr-2" />
                  Bulk Leads
                </Button>
              </Link>
              <Link to="/EmailTemplates">
                <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Templates
                </Button>
              </Link>
              <Link to="/ScramblingReports">
                <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                  <Gauge className="w-4 h-4 mr-2" />
                  Scrambling Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Audit Mode Toggle (Auditor role only) */}
        <div className="mb-8">
          <AuditModeToggle />
        </div>

        {/* Universe Status Widget + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-1">
            <UniverseStatusWidget />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="multi-layer-card card-layer-auth rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Connected Universes</p>
                <p className="text-3xl font-bold text-cyan-400">{universes.length}</p>
              </div>
              <Globe className="w-10 h-10 text-cyan-500/50 glow-pulse" />
            </div>
          </div>
          <div className="multi-layer-card card-layer-data rounded-xl p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Requests</p>
                <p className="text-3xl font-bold text-emerald-400">{requests.length}</p>
              </div>
              <History className="w-10 h-10 text-emerald-500/50 glow-pulse" />
            </div>
          </div>
            <div className="multi-layer-card card-layer-monitoring rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Keys</p>
                  <p className="text-3xl font-bold text-violet-400">{keys.length}</p>
                </div>
                <Key className="w-10 h-10 text-violet-500/50 glow-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="router" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Smart Router
            </TabsTrigger>
            <TabsTrigger value="universes" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Universes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="investor" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Investor View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="router" className="space-y-6">
            <UniversalQueryBox onRequestCreated={() => refetchRequests()} />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
              <RequestHistory requests={requests.slice(0, 5)} />
            </div>

            <ThreatNeutralizationChart />
          </TabsContent>

          <TabsContent value="universes">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Connected API Universes</h3>
              <Button 
                onClick={() => setShowAddUniverse(!showAddUniverse)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Universe
              </Button>
            </div>

            {showAddUniverse && (
              <div className="mb-6">
                <AddUniverseForm 
                  onUniverseAdded={() => {
                    refetchUniverses();
                    setShowAddUniverse(false);
                  }}
                  onCancel={() => setShowAddUniverse(false)}
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {universes.map((universe) => (
                <UniverseCard key={universe.id} universe={universe} />
              ))}
              {universes.length === 0 && (
                <div className="col-span-full bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                  <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No universes connected yet</p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Your First Universe
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <RequestHistory requests={requests} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hardwareTokens[0] && <HardwareTokenDisplay token={hardwareTokens[0]} />}
              <FluctuatingKeyVisualizer />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuantumEncryptionVisualizer />
              <BiometricLayerVisualizer />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ThreatMapGlobe logs={securityLogs} />
              <EmergencyProtocol />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RateLimitMonitor universes={universes} requests={requests} />
              <UniverseHealthMonitor universes={universes} onUpdate={() => refetchUniverses()} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CircuitBreakerMonitor universes={universes} />
              <ApiPlayground universes={universes} />
            </div>
            <CriminalActivityMonitor />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <KeyRotationDisplay keys={keys} />
              <AlertNotificationCenter />
            </div>
            <ScramblerMonitor />
            <SecurityMonitor logs={securityLogs} />
          </TabsContent>

          <TabsContent value="investor" className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-black text-white">Investor Performance Overview</h2>
                <p className="text-slate-400 text-sm">30-day threat neutralization trends and scrambler performance — ready to show investors</p>
              </div>
              <div className="flex gap-2">
                <Link to="/InvestorCRM">
                  <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                    <Users className="w-4 h-4 mr-2" /> Investor CRM
                  </Button>
                </Link>
                <Link to="/TexasNDA">
                  <Button variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                    <FileText className="w-4 h-4 mr-2" /> Generate NDA
                  </Button>
                </Link>
              </div>
            </div>
            <ThreatNeutralizationChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
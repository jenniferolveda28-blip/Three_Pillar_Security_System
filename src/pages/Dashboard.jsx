import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Globe, History, Key, Link2, BarChart3 } from "lucide-react";
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
import QuantumEncryptionVisualizer from '../components/security/QuantumEncryptionVisualizer';
import ThreatMapGlobe from '../components/security/ThreatMapGlobe';
import BiometricLayerVisualizer from '../components/security/BiometricLayerVisualizer';
import ApiPlayground from '../components/api/ApiPlayground';
import CircuitBreakerMonitor from '../components/api/CircuitBreakerMonitor';
import EmergencyProtocol from '../components/security/EmergencyProtocol';
import CriminalActivityMonitor from '../components/security/CriminalActivityMonitor';
import AlertNotificationCenter from '../components/security/AlertNotificationCenter';
import ScramblerMonitor from '../components/security/ScramblerMonitor';

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
                <p className="text-slate-400">Your DNA-secured gateway to any API</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={createPageUrl('Analytics')}>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link to={createPageUrl('Authenticator')}>
                <Button variant="outline">
                  <Link2 className="w-4 h-4 mr-2" />
                  BioVerify
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          </TabsList>

          <TabsContent value="router" className="space-y-6">
            <UniversalQueryBox onRequestCreated={() => refetchRequests()} />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
              <RequestHistory requests={requests.slice(0, 5)} />
            </div>
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
        </Tabs>
      </div>
    </div>
  );
}
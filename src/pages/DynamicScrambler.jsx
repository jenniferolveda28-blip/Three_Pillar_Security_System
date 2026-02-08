import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { RefreshCw, ArrowLeft, Shield, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import ScramblerMonitor from '../components/security/ScramblerMonitor';
import KeyRotationDisplay from '../components/security/KeyRotationDisplay';
import FluctuatingKeyVisualizer from '../components/security/FluctuatingKeyVisualizer';
import QuantumEncryptionVisualizer from '../components/security/QuantumEncryptionVisualizer';

export default function DynamicScrambler() {
  const { data: sessions = [] } = useQuery({
    queryKey: ['scramblingSessions'],
    queryFn: () => base44.entities.ScramblingSession.filter({ status: 'active' }),
    refetchInterval: 2000
  });

  const { data: keys = [] } = useQuery({
    queryKey: ['keys'],
    queryFn: () => base44.entities.UniversalKey.list('-created_date'),
  });

  const totalIterations = sessions.reduce((sum, s) => sum + s.iterations, 0);
  const avgComplexity = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + s.complexity_level, 0) / sessions.length 
    : 0;

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/50">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Dynamic Scrambling System</h1>
                  <p className="text-slate-400">IP Shield - Continuous code & data obfuscation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="multi-layer-card card-layer-scramble rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Scrambles</p>
                  <p className="text-3xl font-bold text-amber-400">{totalIterations}</p>
                </div>
                <RefreshCw className="w-10 h-10 text-amber-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-monitoring rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Layers</p>
                  <p className="text-3xl font-bold text-violet-400">{sessions.length}</p>
                </div>
                <Activity className="w-10 h-10 text-violet-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-auth rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Complexity Level</p>
                  <p className="text-3xl font-bold text-cyan-400">{Math.round(avgComplexity)}%</p>
                </div>
                <Shield className="w-10 h-10 text-cyan-500/50 glow-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <ScramblerMonitor />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FluctuatingKeyVisualizer />
            <QuantumEncryptionVisualizer />
          </div>

          <KeyRotationDisplay keys={keys} />
        </div>
      </div>
    </div>
  );
}
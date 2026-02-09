import React from 'react';
import IllegalActivityDetectionDemo from '@/components/investor/IllegalActivityDetectionDemo';
import DNABreathalyzerDemo from '@/components/investor/DNABreathalyzerDemo';
import ThreePillarIntegratedDemo from '@/components/investor/ThreePillarIntegratedDemo';
import TokenReplacementDemo from '@/components/investor/TokenReplacementDemo';

export default function InvestorPresentation() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold gradient-text text-center">Live Security Demonstrations</h1>
          <p className="text-xl text-slate-400">Interactive demonstrations showing our three-pillar security technology in action</p>
        </div>

        <div className="space-y-8">
          {/* Demo 1: API Illegal Activity Detection */}
          <IllegalActivityDetectionDemo />

          {/* Demo 2: DNA Breathalyzer Registration */}
          <DNABreathalyzerDemo />

          {/* Demo 3: Three Pillars Working Together */}
          <ThreePillarIntegratedDemo />

          {/* Demo 4: Token Replacement */}
          <TokenReplacementDemo />
        </div>
      </div>
    </div>
  );
}
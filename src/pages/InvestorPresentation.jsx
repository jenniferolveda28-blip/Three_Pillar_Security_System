import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Dna, Layers, RefreshCw, BookOpen } from 'lucide-react';
import IllegalActivityDetectionDemo from '@/components/investor/IllegalActivityDetectionDemo';
import DNABreathalyzerDemo from '@/components/investor/DNABreathalyzerDemo';
import ThreePillarIntegratedDemo from '@/components/investor/ThreePillarIntegratedDemo';
import TokenReplacementDemo from '@/components/investor/TokenReplacementDemo';
import DemoExplanation from '@/components/investor/DemoExplanation';

export default function InvestorPresentation() {
  const [activeDemo, setActiveDemo] = useState('detection');

  const demos = [
    {
      id: 'detection',
      title: 'Illegal Activity Detection',
      icon: Shield,
      description: 'Real-time threat detection and response',
      component: IllegalActivityDetectionDemo,
      color: 'red'
    },
    {
      id: 'dna',
      title: 'DNA Breathalyzer',
      icon: Dna,
      description: 'Secure biometric registration process',
      component: DNABreathalyzerDemo,
      color: 'blue'
    },
    {
      id: 'integrated',
      title: 'Three Pillars Integration',
      icon: Layers,
      description: 'Complete security ecosystem in action',
      component: ThreePillarIntegratedDemo,
      color: 'purple'
    },
    {
      id: 'replacement',
      title: 'Token Replacement',
      icon: RefreshCw,
      description: 'Fast and secure device replacement',
      component: TokenReplacementDemo,
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold gradient-text text-center mb-3">
            Live Security Demonstrations
          </h1>
          <p className="text-xl text-slate-400 text-center">
            Interactive demonstrations showcasing our three-pillar security technology
          </p>
        </div>

        {/* Navigation & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <Card className="bg-slate-900/50 border-slate-700 sticky top-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Demo Navigation
                </h3>
                <div className="space-y-2">
                  {demos.map((demo) => {
                    const Icon = demo.icon;
                    const isActive = activeDemo === demo.id;
                    return (
                      <Button
                        key={demo.id}
                        onClick={() => setActiveDemo(demo.id)}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          isActive 
                            ? `bg-${demo.color}-600 hover:bg-${demo.color}-700` 
                            : 'hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <div className="text-left flex-1">
                          <div className="font-semibold">{demo.title}</div>
                          <div className="text-xs opacity-70">{demo.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
              {demos.map((demo) => {
                const DemoComponent = demo.component;
                return (
                  <TabsContent key={demo.id} value={demo.id} className="space-y-6">
                    {/* AI-Generated Explanation Section */}
                    <DemoExplanation demoId={demo.id} demoTitle={demo.title} />

                    {/* Interactive Demo */}
                    <DemoComponent />
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
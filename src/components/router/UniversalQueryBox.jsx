import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function UniversalQueryBox({ onRequestCreated }) {
  const [intent, setIntent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [threatLevel, setThreatLevel] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Security thresholds
  const THREAT_THRESHOLD = 85;

  const calculateThreatLevel = async () => {
    // Simulate threat calculation based on request patterns
    const requests = await base44.entities.UniversalRequest.list('-created_date', 20);
    const lastMinute = requests.filter(r => {
      const created = new Date(r.created_date);
      return new Date() - created < 60000;
    }).length;

    const failedRequests = requests.filter(r => r.status === 'failed').length;
    const errorRate = (failedRequests / requests.length) * 100;

    let threat = 0;
    threat += (lastMinute / 100) * 40;
    threat += (errorRate / 15) * 40;
    threat += Math.random() * 20;

    return Math.min(threat, 100);
  };

  const handleSubmit = async () => {
    if (!intent.trim()) {
      toast.error('Please describe what you want to do');
      return;
    }

    // Check threat level before proceeding
    const currentThreat = await calculateThreatLevel();
    setThreatLevel(currentThreat);

    if (currentThreat >= THREAT_THRESHOLD) {
      setIsBlocked(true);
      toast.error('🚨 API BLOCKED: Critical threat level detected. Auto-generating security report...');
      
      // Generate security report
      await base44.functions.invoke('generateSecurityReport', {
        threatLevel: currentThreat,
        metrics: {
          recentRequests: Math.floor(currentThreat),
          avgLatency: Math.floor(currentThreat * 20),
          errorRate: Math.floor(currentThreat / 2)
        },
        triggeredAt: new Date().toISOString()
      });
      return;
    }

    if (currentThreat >= 60) {
      toast.warning(`⚠️ Warning: Threat level at ${currentThreat.toFixed(0)}%. Approaching security limit.`);
    }

    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke('intelligentRouter', { intent });
      
      const request = await base44.entities.UniversalRequest.create({
        intent,
        routed_to: response.data.universe,
        status: 'success',
        response_data: response.data.result,
        latency_ms: response.data.latency,
        ai_reasoning: response.data.reasoning,
        fallback_used: response.data.fallback_used || false
      });

      toast.success(`✓ Routed to ${response.data.universe}! Check History tab for results.`);
      setIntent('');
      if (onRequestCreated) onRequestCreated(request);
    } catch (error) {
      toast.error(error.message || 'Failed to process request');
      
      await base44.entities.UniversalRequest.create({
        intent,
        status: 'failed',
        error_message: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-900">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Universal Request</h3>
        </div>
        
        <Textarea
          placeholder="Just tell me what you want... 
          
Examples:
• Get weather for San Francisco
• Find latest AI news
• Generate a random quote
• Get Bitcoin price"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          className="min-h-32 bg-white"
          disabled={isProcessing}
        />

        <Button 
          onClick={handleSubmit}
          disabled={isProcessing || !intent.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Routing...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Let AI Figure It Out
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
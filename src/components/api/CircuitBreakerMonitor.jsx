import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CircuitBreakerMonitor({ universes = [] }) {
  const [circuitStates, setCircuitStates] = useState({});

  useEffect(() => {
    // Initialize circuit states
    const states = {};
    universes.forEach(u => {
      states[u.id] = {
        state: u.status === 'active' ? 'closed' : u.status === 'degraded' ? 'half-open' : 'open',
        failures: u.error_count || 0,
        successRate: u.success_rate || 100
      };
    });
    setCircuitStates(states);
  }, [universes]);

  const getStateConfig = (state) => {
    switch (state) {
      case 'closed':
        return { icon: CheckCircle2, color: 'green', bg: 'bg-green-100', text: 'Healthy' };
      case 'half-open':
        return { icon: AlertCircle, color: 'yellow', bg: 'bg-yellow-100', text: 'Testing' };
      case 'open':
        return { icon: XCircle, color: 'red', bg: 'bg-red-100', text: 'Circuit Open' };
      default:
        return { icon: Zap, color: 'gray', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  return (
    <Card className="border-2 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Circuit Breaker Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {universes.slice(0, 5).map((universe) => {
          const circuitState = circuitStates[universe.id] || { state: 'closed', failures: 0, successRate: 100 };
          const config = getStateConfig(circuitState.state);
          const Icon = config.icon;

          return (
            <div key={universe.id} className="bg-white border-2 border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 ${config.bg} rounded`}>
                    <Icon className={`w-4 h-4 text-${config.color}-600`} />
                  </div>
                  <span className="font-semibold text-sm">{universe.name}</span>
                </div>
                <Badge className={`bg-${config.color}-600`}>
                  {config.text}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Failures</p>
                  <p className="font-bold">{circuitState.failures}</p>
                </div>
                <div>
                  <p className="text-gray-500">Success Rate</p>
                  <p className="font-bold">{circuitState.successRate}%</p>
                </div>
              </div>

              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-${config.color}-500`}
                  initial={{ width: 0 }}
                  animate={{ width: `${circuitState.successRate}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}

        {universes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No universes to monitor</p>
          </div>
        )}

        <div className="bg-yellow-50 rounded-lg p-3 text-xs text-gray-700 mt-4">
          <p className="font-semibold mb-1">Circuit Breaker Pattern</p>
          <p>Automatically prevents cascading failures by opening circuits when error thresholds are exceeded</p>
        </div>
      </CardContent>
    </Card>
  );
}
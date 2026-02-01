import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Shield, AlertCircle, CheckCircle, Timer } from "lucide-react";

export default function ContinuousAuthentication({ session }) {
  const [trustScore, setTrustScore] = useState(100);
  const [behaviorMetrics, setBehaviorMetrics] = useState({
    typing_pattern: 95,
    mouse_movement: 92,
    session_duration: 88,
    location_match: 100,
    device_match: 100
  });
  const [nextVerification, setNextVerification] = useState(300);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate trust score fluctuation
      setTrustScore(prev => {
        const change = (Math.random() - 0.5) * 5;
        return Math.max(70, Math.min(100, prev + change));
      });

      // Simulate behavior metrics
      setBehaviorMetrics(prev => ({
        typing_pattern: Math.max(70, Math.min(100, prev.typing_pattern + (Math.random() - 0.5) * 8)),
        mouse_movement: Math.max(70, Math.min(100, prev.mouse_movement + (Math.random() - 0.5) * 8)),
        session_duration: Math.max(80, Math.min(100, prev.session_duration - 0.5)),
        location_match: prev.location_match,
        device_match: prev.device_match
      }));

      // Countdown to next verification
      setNextVerification(prev => (prev > 0 ? prev - 1 : 300));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTrustLevel = (score) => {
    if (score >= 90) return { label: 'TRUSTED', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 75) return { label: 'MONITOR', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { label: 'SUSPICIOUS', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const trustLevel = getTrustLevel(trustScore);

  return (
    <Card className={`border-2 ${trustLevel.border} ${trustLevel.bg}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className={`w-5 h-5 ${trustLevel.color}`} />
            Continuous Authentication
          </CardTitle>
          <Badge className={`${trustLevel.bg} ${trustLevel.color}`}>
            {trustLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trust Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Trust Score</span>
              <span className={`text-2xl font-bold ${trustLevel.color}`}>
                {trustScore.toFixed(0)}%
              </span>
            </div>
            <Progress value={trustScore} className="h-3" />
          </div>

          {/* Behavioral Metrics */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold text-gray-700">Behavioral Analysis</p>
            
            {Object.entries(behaviorMetrics).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-medium">
                    {value.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={value} 
                  className={`h-1.5 ${
                    value >= 90 ? '' : 
                    value >= 75 ? '[&>div]:bg-yellow-500' : 
                    '[&>div]:bg-red-500'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Next Verification */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Timer className="w-4 h-4" />
              Next verification in
            </div>
            <Badge variant="outline">
              {Math.floor(nextVerification / 60)}:{String(nextVerification % 60).padStart(2, '0')}
            </Badge>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-2">
            {trustScore >= 90 ? (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 rounded p-2">
                <CheckCircle className="w-4 h-4" />
                Verified User
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
                <AlertCircle className="w-4 h-4" />
                Monitoring
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 rounded p-2">
              <Shield className="w-4 h-4" />
              Auto-Protected
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
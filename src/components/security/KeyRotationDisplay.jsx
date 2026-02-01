import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, RefreshCw, Lock, Fingerprint, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function KeyRotationDisplay({ keys }) {
  const [timeUntilRotation, setTimeUntilRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (keys.length > 0) {
        const nextExpiry = keys.reduce((earliest, key) => {
          const expiry = new Date(key.expires_at).getTime();
          return expiry < earliest ? expiry : earliest;
        }, Infinity);
        
        const now = Date.now();
        setTimeUntilRotation(Math.max(0, Math.floor((nextExpiry - now) / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [keys]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const activeKeys = keys.filter(k => k.status === 'active').length;
  const expiringKeys = keys.filter(k => k.status === 'expiring_soon').length;

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <Shield className="w-5 h-5" />
          Fluctuating Security Layer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-emerald-100">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
            <div>
              <p className="text-sm font-medium text-gray-700">Next Key Rotation</p>
              <p className="text-2xl font-bold text-emerald-600">{formatTime(timeUntilRotation)}</p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white">ACTIVE</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600">Active Keys</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{activeKeys}</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600">Rotating Soon</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{expiringKeys}</p>
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">Your Digital Fingerprint</p>
              <p className="text-xs text-purple-600">Unique to you • Constantly verified</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="text-xs text-center text-gray-500 pt-2 border-t">
          🔐 Keys rotate automatically • No one else can access your universes
        </div>
      </CardContent>
    </Card>
  );
}
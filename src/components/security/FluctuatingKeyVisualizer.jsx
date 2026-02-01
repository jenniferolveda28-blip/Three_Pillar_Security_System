import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FluctuatingKeyVisualizer() {
  const [keys, setKeys] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Generate new fluctuating key every 2 seconds
    const interval = setInterval(() => {
      const newKey = {
        id: Date.now(),
        value: Array.from({ length: 32 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        timestamp: new Date().toLocaleTimeString()
      };

      setKeys(prev => [newKey, ...prev].slice(0, 10));
      setActiveIndex(0);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white border-2 border-emerald-400">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
          Fluctuating API Keys (2-Second Rotation)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {keys.length === 0 ? (
          <div className="text-center py-4 text-emerald-300">
            <Shield className="w-8 h-8 mx-auto mb-2 animate-spin" />
            Initializing secure key rotation...
          </div>
        ) : (
          keys.map((key, idx) => (
            <div
              key={key.id}
              className={cn(
                "p-3 rounded-lg border transition-all duration-300",
                idx === 0
                  ? "bg-emerald-500 border-yellow-400 border-2 scale-105"
                  : "bg-black/30 border-emerald-700/50 opacity-50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {idx === 0 && <Lock className="w-4 h-4 text-yellow-300 animate-pulse" />}
                  <span className="text-xs font-medium">
                    {idx === 0 ? "ACTIVE KEY" : `Previous #${idx}`}
                  </span>
                </div>
                <span className="text-xs">{key.timestamp}</span>
              </div>
              <code className="text-xs font-mono break-all block">
                {key.value}
              </code>
            </div>
          ))
        )}
        
        <div className="pt-3 border-t border-emerald-500/30 text-xs text-center text-emerald-300">
          🔄 New key generated every 2 seconds • Old keys instantly invalid
        </div>
      </CardContent>
    </Card>
  );
}
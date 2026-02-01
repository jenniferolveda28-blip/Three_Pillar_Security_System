import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, AlertTriangle, Shield, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function ThreatMapGlobe({ logs = [] }) {
  const [threats, setThreats] = useState([]);
  const [blockedCount, setBlockedCount] = useState(0);

  useEffect(() => {
    // Simulate real-time threat detection
    const interval = setInterval(() => {
      const newThreat = {
        id: Date.now(),
        location: ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin'][Math.floor(Math.random() * 5)],
        type: ['Brute Force', 'SQL Injection', 'DDoS', 'Unauthorized Access'][Math.floor(Math.random() * 4)],
        blocked: true
      };
      
      setThreats(prev => [newThreat, ...prev.slice(0, 4)]);
      setBlockedCount(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-red-600" />
            Global Threat Map
          </div>
          <Badge className="bg-red-600">
            {blockedCount} Blocked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-48 bg-gradient-to-b from-blue-900 to-indigo-900 rounded-lg overflow-hidden">
          {/* Globe visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full border-4 border-blue-400 opacity-30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-24 h-24 rounded-full border-4 border-purple-400 opacity-20"
            />
          </div>

          {/* Threat pulses */}
          {threats.slice(0, 3).map((threat, idx) => (
            <motion.div
              key={threat.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute"
              style={{
                left: `${20 + idx * 25}%`,
                top: `${30 + idx * 15}%`
              }}
            >
              <div className="w-4 h-4 bg-red-500 rounded-full" />
            </motion.div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Recent Threats Detected</p>
          {threats.slice(0, 3).map((threat) => (
            <div key={threat.id} className="flex items-center justify-between bg-white rounded-lg p-2 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-medium">{threat.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">{threat.location}</span>
                <Shield className="w-4 h-4 text-green-500" />
              </div>
            </div>
          ))}
        </div>

        {threats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No active threats detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
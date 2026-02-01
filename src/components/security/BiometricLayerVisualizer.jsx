import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Eye, Droplets, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BiometricLayerVisualizer() {
  const layers = [
    { name: 'DNA Verification', icon: Droplets, color: 'purple', status: 'active', strength: 99.9 },
    { name: 'Fingerprint Scan', icon: Fingerprint, color: 'blue', status: 'active', strength: 98.5 },
    { name: 'Facial Recognition', icon: Eye, color: 'green', status: 'active', strength: 97.2 },
    { name: 'Behavioral Pattern', icon: Shield, color: 'indigo', status: 'active', strength: 95.8 }
  ];

  const colorMap = {
    purple: 'bg-purple-500 text-purple-600 border-purple-200',
    blue: 'bg-blue-500 text-blue-600 border-blue-200',
    green: 'bg-green-500 text-green-600 border-green-200',
    indigo: 'bg-indigo-500 text-indigo-600 border-indigo-200'
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Multi-Layer Biometric Security
          </div>
          <Badge className="bg-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            All Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;
          return (
            <motion.div
              key={layer.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`border-2 ${colorMap[layer.color].split(' ')[2]} bg-white rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${colorMap[layer.color].split(' ')[0]} bg-opacity-20 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${colorMap[layer.color].split(' ')[1]}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{layer.name}</p>
                    <p className="text-xs text-gray-500">Layer {idx + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${colorMap[layer.color].split(' ')[1]}`}>
                    {layer.strength}%
                  </p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
              </div>
              
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${colorMap[layer.color].split(' ')[0]}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${layer.strength}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mt-4">
          <p className="text-xs text-gray-700 font-semibold mb-1">Zero-Trust Architecture</p>
          <p className="text-xs text-gray-600">
            Multiple independent verification layers ensure maximum security even if one layer is compromised
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
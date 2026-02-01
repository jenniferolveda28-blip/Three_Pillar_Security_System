import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function QuantumEncryptionVisualizer() {
  const [quantumState, setQuantumState] = useState('entangled');
  const [encryptionStrength, setEncryptionStrength] = useState(256);
  const [quantumBits, setQuantumBits] = useState([]);

  useEffect(() => {
    // Generate quantum bits visualization
    const interval = setInterval(() => {
      const newBits = Array.from({ length: 8 }, () => 
        Math.random() > 0.5 ? '1' : '0'
      );
      setQuantumBits(newBits);
      setQuantumState(['entangled', 'superposition', 'collapsed'][Math.floor(Math.random() * 3)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const stateColors = {
    entangled: 'text-purple-600',
    superposition: 'text-blue-600',
    collapsed: 'text-indigo-600'
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Quantum Encryption Layer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Quantum State</p>
            <p className={`text-lg font-bold ${stateColors[quantumState]}`}>
              {quantumState.toUpperCase()}
            </p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="w-8 h-8 text-purple-500" />
          </motion.div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Quantum Bits Stream</p>
          <div className="flex gap-1 font-mono text-sm">
            {quantumBits.map((bit, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={bit === '1' ? 'text-purple-600 font-bold' : 'text-gray-400'}
              >
                {bit}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold">Encryption Strength</span>
            </div>
            <Badge className="bg-purple-600">{encryptionStrength}-bit</Badge>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">Post-Quantum Security</p>
          <p>Resistant to quantum computing attacks using lattice-based cryptography</p>
        </div>
      </CardContent>
    </Card>
  );
}
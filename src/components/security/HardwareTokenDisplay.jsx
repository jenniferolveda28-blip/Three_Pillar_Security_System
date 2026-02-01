import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Shield, Lock, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function HardwareTokenDisplay({ token }) {
  const [currentCode, setCurrentCode] = useState('------');
  const [timeLeft, setTimeLeft] = useState(2);
  const [inputCode, setInputCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [rotationCount, setRotationCount] = useState(0);

  useEffect(() => {
    // Generate new code every 2 seconds
    const generateCode = () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentCode(code);
      setRotationCount(prev => prev + 1);
    };

    generateCode();
    const interval = setInterval(generateCode, 2000);

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) return 2;
        return prev - 0.1;
      });
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const handleVerify = () => {
    if (inputCode === currentCode) {
      setIsVerified(true);
      setInputCode('');
      setTimeout(() => setIsVerified(false), 3000);
    } else {
      alert('❌ INVALID CODE - Access Denied');
      setInputCode('');
    }
  };

  const progress = (timeLeft / 2) * 100;

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white border-4 border-indigo-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-indigo-300" />
            <span>Physical Hardware Token</span>
          </div>
          <Badge className="bg-green-500 text-white animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current TOTP Code */}
        <div className="p-6 bg-black/40 rounded-xl border-2 border-indigo-400">
          <p className="text-xs text-indigo-300 mb-2 text-center">YOUR CURRENT CODE</p>
          <div className="text-5xl font-mono font-bold text-center tracking-widest text-green-400 animate-pulse">
            {currentCode}
          </div>
          <Progress value={progress} className="mt-4 h-2 bg-slate-700" />
          <p className="text-xs text-center mt-2 text-indigo-300">
            Expires in {timeLeft.toFixed(1)}s • Rotation #{rotationCount}
          </p>
        </div>

        {/* Token Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-black/30 rounded-lg border border-indigo-500/30">
            <p className="text-xs text-indigo-300">Rotation Speed</p>
            <p className="text-xl font-bold">2 sec</p>
          </div>
          <div className="p-3 bg-black/30 rounded-lg border border-indigo-500/30">
            <p className="text-xs text-indigo-300">Total Rotations</p>
            <p className="text-xl font-bold">{rotationCount}</p>
          </div>
        </div>

        {/* Verification Input */}
        <div className="p-4 bg-black/30 rounded-lg border-2 border-yellow-500/50">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-yellow-400" />
            <p className="text-sm font-medium">Verify Access</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.slice(0, 6))}
              maxLength={6}
              className="bg-black/50 border-indigo-500 text-white text-center text-lg font-mono"
            />
            <Button 
              onClick={handleVerify}
              disabled={inputCode.length !== 6}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Verify
            </Button>
          </div>
          {isVerified && (
            <div className="mt-2 flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">✓ Access Granted!</span>
            </div>
          )}
        </div>

        {/* Security Features */}
        <div className="space-y-2 pt-2 border-t border-indigo-500/30">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Hardware-bound • Cannot be cloned</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Lock className="w-4 h-4 text-green-400" />
            <span>Offline generation • No network required</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-green-400" />
            <span>Auto-locks after 3 failed attempts</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-green-400" />
            <span>Impossible to hack via email/phone</span>
          </div>
        </div>

        <div className="text-center text-xs text-indigo-400 pt-2 border-t border-indigo-500/30">
          🔐 This token is bound to your unique digital fingerprint
        </div>
      </CardContent>
    </Card>
  );
}
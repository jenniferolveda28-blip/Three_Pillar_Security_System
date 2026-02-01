import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Shield, Loader2, Lock, Unlock, RefreshCw, AlertTriangle } from "lucide-react";

export default function HardwareTokenManager({ tokens, onUpdate }) {
  const [activeToken, setActiveToken] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      setActiveToken(tokens[0]);
    }
  }, [tokens]);

  const generateNewCode = async (token) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    
    await base44.entities.HardwareToken.update(token.id, {
      current_code: code,
      last_code_generated: new Date().toISOString()
    });
    
    onUpdate();
  };

  useEffect(() => {
    if (!activeToken) return;
    
    const interval = setInterval(() => {
      generateNewCode(activeToken);
    }, 3000); // Rotate every 3 seconds for demo
    
    return () => clearInterval(interval);
  }, [activeToken]);

  const handleVerify = async () => {
    if (!activeToken || !verificationCode.trim()) return;
    
    setVerifying(true);
    try {
      if (verificationCode.toUpperCase() === activeToken.current_code) {
        await base44.entities.HardwareToken.update(activeToken.id, {
          last_used: new Date().toISOString(),
          failed_attempts: 0
        });
        
        await base44.entities.SecurityLog.create({
          event_type: 'access_granted',
          details: `Token ${activeToken.device_name} verified successfully`,
          success: true,
          threat_level: 'none'
        });
        
        toast.success('✓ Verification successful! Access granted.');
        setVerificationCode('');
      } else {
        const newAttempts = (activeToken.failed_attempts || 0) + 1;
        await base44.entities.HardwareToken.update(activeToken.id, {
          failed_attempts: newAttempts,
          is_active: newAttempts < 3
        });
        
        await base44.entities.SecurityLog.create({
          event_type: 'access_denied',
          details: `Failed verification attempt for ${activeToken.device_name}`,
          success: false,
          threat_level: newAttempts >= 2 ? 'high' : 'medium'
        });
        
        if (newAttempts >= 3) {
          toast.error('Token locked after 3 failed attempts!');
        } else {
          toast.error(`Invalid code. ${3 - newAttempts} attempts remaining.`);
        }
      }
      onUpdate();
    } finally {
      setVerifying(false);
    }
  };

  const handleUnlock = async (token) => {
    await base44.entities.HardwareToken.update(token.id, {
      failed_attempts: 0,
      is_active: true
    });
    toast.success('Token unlocked');
    onUpdate();
  };

  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!activeToken) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No active BioVerify tokens</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              {activeToken.device_name}
            </span>
            <Badge variant={activeToken.is_active ? "default" : "destructive"}>
              {activeToken.is_active ? 'Active' : 'Locked'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-2">Current Verification Code</div>
            <div className="text-5xl font-mono font-bold tracking-wider text-purple-900 bg-white rounded-lg py-6 border-2 border-purple-200">
              {activeToken.current_code || 'XXXX'}
            </div>
            <div className="mt-4">
              <Progress value={(timeLeft / 3) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">Refreshes in {timeLeft}s</p>
            </div>
          </div>

          {activeToken.is_active ? (
            <div className="space-y-3">
              <Label htmlFor="verify">Enter Code to Verify</Label>
              <div className="flex gap-2">
                <Input
                  id="verify"
                  placeholder="XXXXXX"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  maxLength={6}
                  className="font-mono text-lg text-center tracking-wider"
                />
                <Button 
                  onClick={handleVerify} 
                  disabled={verifying || !verificationCode.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                </Button>
              </div>
              {activeToken.failed_attempts > 0 && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  {activeToken.failed_attempts} failed attempt(s)
                </div>
              )}
            </div>
          ) : (
            <Button 
              onClick={() => handleUnlock(activeToken)}
              variant="outline"
              className="w-full"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Unlock Token
            </Button>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Device ID</p>
              <p className="font-mono text-xs">{activeToken.device_id}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Used</p>
              <p className="text-xs">{activeToken.last_used ? new Date(activeToken.last_used).toLocaleString() : 'Never'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {tokens.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">All Devices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tokens.map(token => (
              <div 
                key={token.id}
                onClick={() => setActiveToken(token)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeToken?.id === token.id 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{token.device_name}</span>
                  <Badge variant={token.is_active ? "default" : "destructive"}>
                    {token.is_active ? 'Active' : 'Locked'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
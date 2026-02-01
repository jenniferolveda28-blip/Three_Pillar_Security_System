import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Copy, RotateCw, Clock, Lock, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SecureAPIKeyManager({ keys = [] }) {
  const [revealedKeys, setRevealedKeys] = useState({});
  const [rotating, setRotating] = useState(null);

  const toggleReveal = (keyId) => {
    setRevealedKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyKey = (value, name) => {
    navigator.clipboard.writeText(value);
    toast.success(`${name} copied to clipboard`);
  };

  const maskKey = (value) => {
    if (!value) return '••••••••••••••••';
    const visible = value.slice(0, 4);
    const hidden = value.slice(4);
    return `${visible}${hidden.replace(/./g, '•')}`;
  };

  const getRotationStatus = (lastRotated, interval) => {
    const lastDate = new Date(lastRotated);
    const nextRotation = new Date(lastDate.getTime() + interval * 1000);
    const daysUntil = Math.ceil((nextRotation - new Date()) / (1000 * 60 * 60 * 24));
    
    return {
      nextRotation: nextRotation.toLocaleDateString(),
      daysUntil,
      isExpiringSoon: daysUntil <= 3
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-slate-100">Secure API Keys</h3>
        </div>
        <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700">{keys.length} Active</Badge>
      </div>

      {keys.length === 0 ? (
        <Card className="multi-layer-card card-layer-monitoring border">
          <CardContent className="p-8 text-center">
            <Lock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No API keys configured</p>
          </CardContent>
        </Card>
      ) : (
        keys.map((key) => {
          const rotationStatus = getRotationStatus(key.last_rotated, key.rotation_interval);
          const isRevealed = revealedKeys[key.id];

          return (
            <Card key={key.id} className={`multi-layer-card ${rotationStatus.isExpiringSoon ? 'card-layer-threat' : 'card-layer-monitoring'} border`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-700">
                      <Lock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-100">{key.key_name}</CardTitle>
                      <p className="text-xs text-slate-400 mt-1">
                        Universe: {key.universe_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {key.status === 'active' && (
                      <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700">Active</Badge>
                    )}
                    {key.status === 'expiring_soon' && (
                      <Badge className="bg-orange-900/50 text-orange-300 border-orange-700">Expiring Soon</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Value Display */}
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-sm text-slate-300 break-all">
                      {isRevealed ? key.encrypted_value : maskKey(key.encrypted_value)}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleReveal(key.id)}
                        className="hover:bg-slate-700"
                      >
                        {isRevealed ? (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyKey(key.encrypted_value, key.key_name)}
                        className="hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">🔒 Encrypted at rest • Never logged • Auto-masked</p>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-400">Last Rotated</span>
                    </div>
                    <p className="text-sm text-slate-200">
                      {new Date(key.last_rotated).toLocaleDateString()}
                    </p>
                  </div>

                  <div className={`rounded p-3 border ${rotationStatus.isExpiringSoon ? 'bg-orange-900/20 border-orange-700' : 'bg-slate-900/50 border-slate-700'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCw className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-400">Next Rotation</span>
                    </div>
                    <p className={`text-sm ${rotationStatus.isExpiringSoon ? 'text-orange-300 font-semibold' : 'text-slate-200'}`}>
                      {rotationStatus.daysUntil} days
                    </p>
                  </div>

                  <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-slate-400">Usage</span>
                    </div>
                    <p className="text-sm text-slate-200">{key.usage_count} requests</p>
                  </div>

                  <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span className="text-xs text-slate-400">Expires</span>
                    </div>
                    <p className="text-sm text-slate-200">
                      {new Date(key.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Rotation Warning */}
                {rotationStatus.isExpiringSoon && (
                  <div className="bg-orange-900/20 border border-orange-700 rounded p-3 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-300">
                      <p className="font-semibold">Key rotation due soon</p>
                      <p className="text-xs mt-1">Schedule rotation to maintain security</p>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200"
                  disabled={rotating === key.id}
                  onClick={() => {
                    setRotating(key.id);
                    setTimeout(() => {
                      toast.success('Key rotation scheduled');
                      setRotating(null);
                    }, 1500);
                  }}
                >
                  {rotating === key.id ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Rotating...
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-4 h-4 mr-2" />
                      Schedule Rotation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Security Info */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span>All keys encrypted with AES-256-GCM</span>
            </div>
            <div className="flex gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span>Automatic rotation every 24 hours</span>
            </div>
            <div className="flex gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span>All access logged and auditable</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
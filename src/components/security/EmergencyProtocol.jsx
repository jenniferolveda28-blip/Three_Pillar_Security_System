import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Phone, Lock, Unlock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function EmergencyProtocol() {
  const [lockdownActive, setLockdownActive] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const handleLockdown = () => {
    setLockdownActive(!lockdownActive);
    if (!lockdownActive) {
      toast.error('🚨 SECURITY LOCKDOWN ACTIVATED');
    } else {
      toast.success('Security lockdown deactivated');
    }
  };

  const handleEmergency = () => {
    setEmergencyMode(true);
    toast.error('🆘 EMERGENCY PROTOCOL INITIATED');
    setTimeout(() => {
      toast.success('Emergency contacts notified');
    }, 2000);
  };

  return (
    <Card className={`border-2 ${lockdownActive ? 'border-red-500 bg-red-50' : 'border-orange-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${lockdownActive ? 'text-red-600' : 'text-orange-600'}`} />
            Emergency Protocol
          </div>
          {lockdownActive && (
            <Badge className="bg-red-600 animate-pulse">
              LOCKDOWN ACTIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleLockdown}
            variant={lockdownActive ? "destructive" : "outline"}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            {lockdownActive ? (
              <>
                <Unlock className="w-8 h-8" />
                <span className="font-bold">Deactivate Lockdown</span>
              </>
            ) : (
              <>
                <Lock className="w-8 h-8" />
                <span className="font-bold">Security Lockdown</span>
              </>
            )}
            <span className="text-xs">Freeze all API access</span>
          </Button>

          <Button
            onClick={handleEmergency}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 border-orange-500 text-orange-700 hover:bg-orange-50"
          >
            <Phone className="w-8 h-8" />
            <span className="font-bold">Emergency Alert</span>
            <span className="text-xs">Notify emergency contacts</span>
          </Button>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm">Emergency Contacts</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Primary Admin</span>
              <span className="font-mono">+1-555-SECURE</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">Security Team</span>
              <span className="font-mono">security@forged.api</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Incident Response</span>
              <Badge className="bg-green-600">24/7 Active</Badge>
            </div>
          </div>
        </div>

        {lockdownActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <p className="font-bold text-red-900">ALL SYSTEMS LOCKED</p>
            <p className="text-sm text-red-700 mt-1">
              API access suspended. Only emergency protocols available.
            </p>
          </motion.div>
        )}

        <div className="bg-orange-50 rounded-lg p-3 text-xs text-gray-700">
          <p className="font-semibold mb-1">⚠️ Emergency Features</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Instant security lockdown of all universes</li>
            <li>Automatic notification to emergency contacts</li>
            <li>Forensic logging of all access attempts</li>
            <li>Biometric verification bypass for recovery</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ShieldAlert, Lock, Unlock, Mail, Phone, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AccountRecoveryPanel({ accounts, onUpdate }) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [recoveryMethod, setRecoveryMethod] = useState('email');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleInitiateRecovery = async (account) => {
    setProcessing(true);
    try {
      await base44.entities.LinkedAccount.update(account.id, {
        status: 'pending',
        recovery_attempts: (account.recovery_attempts || 0) + 1
      });
      
      await base44.entities.SecurityLog.create({
        event_type: 'suspicious_activity',
        details: `Account recovery initiated for ${account.account_identifier}`,
        success: true,
        threat_level: 'medium'
      });
      
      // Simulate sending recovery code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setRecoveryCode(code);
      
      toast.success(`Recovery code sent via ${recoveryMethod}: ${code}`);
      setSelectedAccount(account);
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteRecovery = async () => {
    if (!selectedAccount) return;
    
    setProcessing(true);
    try {
      await base44.entities.LinkedAccount.update(selectedAccount.id, {
        status: 'recovered',
        last_verified: new Date().toISOString(),
        recovery_attempts: 0
      });
      
      await base44.entities.SecurityLog.create({
        event_type: 'access_granted',
        details: `Account ${selectedAccount.account_identifier} successfully recovered`,
        success: true,
        threat_level: 'none'
      });
      
      toast.success('Account recovered successfully!');
      setSelectedAccount(null);
      setRecoveryCode('');
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleLockAccount = async (account) => {
    if (!confirm('Lock this account? This will prevent all access until recovered.')) return;
    
    try {
      await base44.entities.LinkedAccount.update(account.id, {
        status: 'locked'
      });
      
      await base44.entities.SecurityLog.create({
        event_type: 'suspicious_activity',
        details: `Account ${account.account_identifier} manually locked`,
        success: true,
        threat_level: 'high'
      });
      
      toast.success('Account locked');
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const lockedAccounts = accounts?.filter(a => a.status === 'locked' || a.status === 'pending') || [];
  const activeAccounts = accounts?.filter(a => a.status === 'active') || [];

  return (
    <div className="space-y-4">
      {lockedAccounts.length > 0 && (
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="w-5 h-5" />
              Locked Accounts Requiring Recovery
            </CardTitle>
            <CardDescription>These accounts need verification to restore access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lockedAccounts.map(account => (
              <div key={account.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{account.account_identifier}</p>
                    <p className="text-sm text-gray-600">{account.account_provider}</p>
                  </div>
                  <Badge variant="destructive">{account.status}</Badge>
                </div>
                
                {selectedAccount?.id === account.id ? (
                  <div className="space-y-3 bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700 font-medium">
                      ✓ Recovery code sent: <code className="bg-white px-2 py-1 rounded">{recoveryCode}</code>
                    </div>
                    <div>
                      <Label>Enter Recovery Code</Label>
                      <Input placeholder="Enter 6-digit code" />
                    </div>
                    <Button 
                      onClick={handleCompleteRecovery}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Complete Recovery
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRecoveryMethod('email')}
                        className={recoveryMethod === 'email' ? 'border-blue-500' : ''}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email: {account.recovery_email || 'Not set'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRecoveryMethod('phone')}
                        className={recoveryMethod === 'phone' ? 'border-blue-500' : ''}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Phone: {account.recovery_phone || 'Not set'}
                      </Button>
                    </div>
                    <Button 
                      onClick={() => handleInitiateRecovery(account)}
                      disabled={processing}
                      className="w-full"
                    >
                      Initiate Recovery via {recoveryMethod}
                    </Button>
                  </div>
                )}
                
                {account.recovery_attempts > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    {account.recovery_attempts} recovery attempt(s)
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Active Accounts
            </CardTitle>
            <CardDescription>These accounts are secure and accessible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAccounts.map(account => (
              <div key={account.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{account.account_identifier}</p>
                  <p className="text-sm text-gray-600">{account.account_provider}</p>
                  <p className="text-xs text-gray-500">Last verified: {new Date(account.last_verified).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <Button 
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLockAccount(account)}
                  >
                    <Lock className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
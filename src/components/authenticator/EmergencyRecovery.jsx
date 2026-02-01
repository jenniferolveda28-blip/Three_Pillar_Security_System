import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Key, Mail, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function EmergencyRecovery({ tokenSerial }) {
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateRecoveryCode = () => {
    setGenerating(true);
    setTimeout(() => {
      const code = Array.from({ length: 6 }, () => 
        Math.floor(Math.random() * 10)
      ).join('');
      setRecoveryCode(code);
      toast.success('Emergency recovery code generated');
      setGenerating(false);
    }, 1000);
  };

  const handleSetupRecovery = async () => {
    if (!recoveryEmail && !recoveryPhone) {
      toast.error('Please provide at least one recovery method');
      return;
    }

    try {
      await base44.entities.LinkedAccount.create({
        token_serial: tokenSerial,
        account_provider: 'Recovery Contact',
        account_identifier: recoveryEmail || recoveryPhone,
        account_type: 'other',
        recovery_email: recoveryEmail,
        recovery_phone: recoveryPhone,
        status: 'active'
      });
      toast.success('Recovery methods configured!');
      setRecoveryEmail('');
      setRecoveryPhone('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-5 h-5" />
            Emergency Recovery
          </CardTitle>
          <CardDescription className="text-orange-700">
            Set up backup methods in case your BioVerify device is lost or damaged
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recovery-email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Recovery Email
            </Label>
            <Input
              id="recovery-email"
              type="email"
              placeholder="backup@example.com"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recovery-phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Recovery Phone
            </Label>
            <Input
              id="recovery-phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={recoveryPhone}
              onChange={(e) => setRecoveryPhone(e.target.value)}
              className="bg-white"
            />
          </div>

          <Button 
            onClick={handleSetupRecovery}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Shield className="w-4 h-4 mr-2" />
            Save Recovery Methods
          </Button>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Key className="w-5 h-5" />
            One-Time Recovery Code
          </CardTitle>
          <CardDescription className="text-blue-700">
            Generate a single-use code for emergency access (write this down!)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recoveryCode ? (
            <div className="bg-white p-6 rounded-lg border-2 border-blue-300 text-center">
              <p className="text-sm text-gray-600 mb-2">Your Recovery Code</p>
              <p className="text-3xl font-mono font-bold text-blue-900 tracking-wider mb-2">
                {recoveryCode}
              </p>
              <Badge className="bg-red-100 text-red-800">
                Write this down - it will only be shown once
              </Badge>
            </div>
          ) : (
            <Button 
              onClick={generateRecoveryCode}
              disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {generating ? 'Generating...' : 'Generate Emergency Code'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
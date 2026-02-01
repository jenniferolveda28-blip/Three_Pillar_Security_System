import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dna, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function TokenRegistrationForm({ onRegistered, tokens }) {
  const [formData, setFormData] = useState({
    token_serial: '',
    registered_by_email: '',
  });
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await base44.auth.me();
      
      // Simulate DNA verification
      setSimulating(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const dnaHash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      await base44.entities.TokenRegistration.create({
        token_serial: formData.token_serial,
        registered_by_email: formData.registered_by_email || user.email,
        registration_status: 'dna_verified',
        dna_hash: dnaHash,
        biometric_confidence: Math.floor(Math.random() * 5) + 95,
        registration_date: new Date().toISOString(),
        verification_method: 'dna_saliva'
      });

      toast.success('BioVerify device registered successfully!');
      setFormData({ token_serial: '', registered_by_email: '' });
      onRegistered();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setSimulating(false);
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "Pending" },
    dna_verified: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Verified" },
    activated: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50", label: "Activated" },
    rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Rejected" }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Register BioVerify Device</CardTitle>
          <CardDescription>
            Register your physical BioVerify token for unhackable biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serial">BioVerify Serial Number</Label>
              <Input
                id="serial"
                placeholder="BVFY-XXXX-XXXX-XXXX"
                value={formData.token_serial}
                onChange={(e) => setFormData({...formData, token_serial: e.target.value})}
                required
              />
              <p className="text-xs text-gray-500">Found on the back of your physical device</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.registered_by_email}
                onChange={(e) => setFormData({...formData, registered_by_email: e.target.value})}
              />
              <p className="text-xs text-gray-500">Leave blank to use your account email</p>
            </div>

            {simulating && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Dna className="w-6 h-6 text-purple-600 animate-pulse" />
                  <div>
                    <p className="font-medium text-purple-900">Analyzing DNA Sample...</p>
                    <p className="text-sm text-purple-600">Processing biometric data</p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
              {loading ? 'Processing...' : 'Register Token'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Registered Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Your Registered BioVerify Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No devices registered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => {
                const config = statusConfig[token.registration_status];
                const StatusIcon = config.icon;
                
                return (
                  <div key={token.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{token.token_serial}</p>
                        <p className="text-sm text-gray-500">{token.registered_by_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={config.bg + ' ' + config.color}>
                        {config.label}
                      </Badge>
                      {token.biometric_confidence && (
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {token.biometric_confidence}%
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
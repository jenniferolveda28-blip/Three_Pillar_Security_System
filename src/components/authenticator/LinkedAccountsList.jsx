import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link2, Mail, Facebook, Cloud, Building, Plus, Shield, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function LinkedAccountsList({ accounts, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    token_serial: '',
    account_provider: '',
    account_identifier: '',
    account_type: 'email',
    recovery_email: '',
    recovery_phone: ''
  });
  const [loading, setLoading] = useState(false);

  const accountTypeIcons = {
    email: Mail,
    social: Facebook,
    cloud_storage: Cloud,
    banking: Building,
    other: Link2
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.LinkedAccount.create({
        ...formData,
        link_date: new Date().toISOString(),
        status: 'active'
      });

      toast.success('Account linked successfully!');
      setFormData({
        token_serial: '',
        account_provider: '',
        account_identifier: '',
        account_type: 'email',
        recovery_email: '',
        recovery_phone: ''
      });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Linked Accounts</CardTitle>
              <CardDescription>
                Protect all your accounts with BioVerify authentication
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Link Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>BioVerify Serial</Label>
                  <Input
                    placeholder="BVFY-XXXX-XXXX"
                    value={formData.token_serial}
                    onChange={(e) => setFormData({...formData, token_serial: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select value={formData.account_type} onValueChange={(value) => setFormData({...formData, account_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="banking">Banking</SelectItem>
                      <SelectItem value="cloud_storage">Cloud Storage</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Input
                    placeholder="Google, Microsoft, etc."
                    value={formData.account_provider}
                    onChange={(e) => setFormData({...formData, account_provider: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Email/Username</Label>
                  <Input
                    placeholder="account@example.com"
                    value={formData.account_identifier}
                    onChange={(e) => setFormData({...formData, account_identifier: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recovery Email</Label>
                  <Input
                    type="email"
                    placeholder="backup@example.com"
                    value={formData.recovery_email}
                    onChange={(e) => setFormData({...formData, recovery_email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recovery Phone</Label>
                  <Input
                    placeholder="+1234567890"
                    value={formData.recovery_phone}
                    onChange={(e) => setFormData({...formData, recovery_phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  Link Account
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Link2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No accounts linked yet</p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Link Your First Account
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account) => {
                const Icon = accountTypeIcons[account.account_type] || Link2;
                
                return (
                  <div key={account.id} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{account.account_provider}</p>
                          <p className="text-sm text-gray-600">{account.account_identifier}</p>
                        </div>
                      </div>
                      {account.status === 'active' && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="w-3 h-3" />
                      <span>Protected by BVFY: {account.token_serial}</span>
                    </div>
                    
                    {account.recovery_email && (
                      <div className="mt-2 text-xs text-gray-500">
                        Recovery: {account.recovery_email}
                      </div>
                    )}
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
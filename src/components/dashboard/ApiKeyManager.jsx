import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Key, Plus, Eye, EyeOff, Trash2, RefreshCw, Copy, Clock } from "lucide-react";

export default function ApiKeyManager({ universe, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [keyData, setKeyData] = useState({
    key_name: '',
    encrypted_value: '',
    rotation_interval: 86400
  });

  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.UniversalKey.create({
        universe_id: universe.id,
        ...keyData,
        last_rotated: new Date().toISOString(),
        expires_at: new Date(Date.now() + keyData.rotation_interval * 1000).toISOString(),
        status: 'active',
        usage_count: 0
      });
      
      toast.success('API key added successfully');
      setShowForm(false);
      setKeyData({ key_name: '', encrypted_value: '', rotation_interval: 86400 });
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRotateKey = async (key) => {
    try {
      await base44.entities.UniversalKey.update(key.id, {
        last_rotated: new Date().toISOString(),
        expires_at: new Date(Date.now() + key.rotation_interval * 1000).toISOString(),
        usage_count: 0
      });
      
      await base44.entities.SecurityLog.create({
        event_type: 'key_rotation',
        universe_id: universe.id,
        success: true,
        details: `Rotated key: ${key.key_name}`,
        threat_level: 'none'
      });
      
      toast.success('Key rotated successfully');
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteKey = async (key) => {
    if (!confirm('Delete this API key?')) return;
    
    try {
      await base44.entities.UniversalKey.delete(key.id);
      toast.success('Key deleted');
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys for {universe.name}
          </span>
          <Button 
            size="sm"
            onClick={() => setShowForm(!showForm)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Key
          </Button>
        </CardTitle>
        <CardDescription>Manage authentication credentials for this universe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleCreateKey} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Key Name</Label>
              <Input
                placeholder="Production API Key"
                value={keyData.key_name}
                onChange={(e) => setKeyData({...keyData, key_name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>API Key Value</Label>
              <Input
                type="password"
                placeholder="sk_live_..."
                value={keyData.encrypted_value}
                onChange={(e) => setKeyData({...keyData, encrypted_value: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Rotation Interval (seconds)</Label>
              <Input
                type="number"
                value={keyData.rotation_interval}
                onChange={(e) => setKeyData({...keyData, rotation_interval: parseInt(e.target.value)})}
              />
              <p className="text-xs text-gray-500 mt-1">86400 = 24 hours</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Create Key</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {universe.keys?.map(key => (
            <KeyItem 
              key={key.id} 
              keyData={key} 
              onRotate={() => handleRotateKey(key)}
              onDelete={() => handleDeleteKey(key)}
              onCopy={copyToClipboard}
            />
          )) || <p className="text-sm text-gray-500">No API keys configured</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function KeyItem({ keyData, onRotate, onDelete, onCopy }) {
  const [revealed, setRevealed] = useState(false);
  
  const timeUntilExpiry = keyData.expires_at 
    ? Math.max(0, new Date(keyData.expires_at) - new Date()) / 1000 / 60 / 60
    : 0;
  
  const statusColor = {
    active: 'bg-green-100 text-green-800',
    expiring_soon: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
    revoked: 'bg-gray-100 text-gray-800'
  }[keyData.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">{keyData.key_name}</h4>
            <Badge className={statusColor}>{keyData.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
              {revealed ? keyData.encrypted_value : '••••••••••••••••'}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setRevealed(!revealed)}
            >
              {revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => onCopy(keyData.encrypted_value)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={onRotate} className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8 text-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
        <div>
          <Clock className="w-3 h-3 inline mr-1" />
          Expires in {Math.round(timeUntilExpiry)}h
        </div>
        <div>Used: {keyData.usage_count || 0}x</div>
        <div>Last rotated: {keyData.last_rotated ? new Date(keyData.last_rotated).toLocaleDateString() : 'Never'}</div>
      </div>
    </div>
  );
}
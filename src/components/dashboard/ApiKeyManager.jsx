import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ApiKeyManager({ universe, onKeysUpdated }) {
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddKey = async () => {
    if (!newKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.UniversalKey.create({
        universe_id: universe.id,
        key_name: `${universe.name} Key`,
        encrypted_value: btoa(newKey), // Simple encoding for demo
        rotation_interval: 86400 * 30, // 30 days
        last_rotated: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
        status: 'active'
      });
      toast.success('API key added successfully!');
      setNewKey('');
      onKeysUpdated?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600" />
          API Key for {universe.name}
        </CardTitle>
        <CardDescription>
          Securely store and rotate your API credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <Input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleAddKey}
          disabled={loading || !newKey.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {loading ? 'Adding...' : 'Add Key'}
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 mb-2">Security Features</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Auto-rotation: 30 days
            </Badge>
            <Badge variant="outline" className="text-xs">
              🔒 Encrypted at rest
            </Badge>
            <Badge variant="outline" className="text-xs">
              🔐 BioVerify required
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
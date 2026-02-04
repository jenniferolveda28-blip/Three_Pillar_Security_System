import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key, Copy, Trash2, Eye, EyeOff, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from '../utils/activityLogger';

export default function ApiKeyManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState('api_read,api_write');
  const [revealedKeys, setRevealedKeys] = useState({});
  const [generatedKey, setGeneratedKey] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['apiKeys', user?.email],
    queryFn: () => base44.entities.UserApiKey.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const rawKey = `fa_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const keyPrefix = `${rawKey.substring(0, 8)}...${rawKey.substring(rawKey.length - 4)}`;
      
      const rateLimit = user?.role === 'admin' ? 1000 : 100;
      
      const key = await base44.entities.UserApiKey.create({
        key_name: newKeyName,
        api_key: rawKey,
        key_prefix: keyPrefix,
        is_active: true,
        rate_limit: rateLimit,
        scopes: newKeyScopes.split(',').map(s => s.trim()),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await logActivity({
        action_type: 'create',
        entity_type: 'UserApiKey',
        entity_id: key.id,
        description: `Created API key: ${newKeyName}`,
        details: { scopes: newKeyScopes.split(',').map(s => s.trim()) },
      });

      return rawKey;
    },
    onSuccess: (rawKey) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setGeneratedKey(rawKey);
      setNewKeyName('');
      toast.success('API key created successfully');
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (keyId) => base44.entities.UserApiKey.update(keyId, { is_active: false }),
    onSuccess: async (_, keyId) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      const key = apiKeys.find(k => k.id === keyId);
      await logActivity({
        action_type: 'update',
        entity_type: 'UserApiKey',
        entity_id: keyId,
        description: `Revoked API key: ${key?.key_name}`,
      });
      toast.success('API key revoked');
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (keyId) => base44.entities.UserApiKey.delete(keyId),
    onSuccess: async (_, keyId) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      const key = apiKeys.find(k => k.id === keyId);
      await logActivity({
        action_type: 'delete',
        entity_type: 'UserApiKey',
        entity_id: keyId,
        description: `Deleted API key: ${key?.key_name}`,
      });
      toast.success('API key deleted');
    },
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    createKeyMutation.mutate();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleReveal = (keyId) => {
    setRevealedKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Key className="w-5 h-5 text-cyan-400" />
              API Key Management
            </CardTitle>
            <CardDescription className="text-slate-400">
              Generate and manage API keys for external integrations
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-slate-100">Create New API Key</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Generate a new API key for your applications
                </DialogDescription>
              </DialogHeader>
              
              {generatedKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-500">Save this key now!</p>
                        <p className="text-xs text-slate-400 mt-1">
                          This is the only time you'll see the full key. Copy it to a safe place.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Your API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        value={generatedKey}
                        readOnly
                        className="bg-slate-900 border-slate-700 text-slate-100 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(generatedKey)}
                        className="border-slate-700"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Key Name</Label>
                    <Input
                      placeholder="My Production Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-100"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Scopes (comma-separated)</Label>
                    <Input
                      placeholder="api_read, api_write"
                      value={newKeyScopes}
                      onChange={(e) => setNewKeyScopes(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-100"
                    />
                  </div>
                  
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-400">
                      Rate Limit: <span className="text-cyan-400 font-semibold">
                        {user?.role === 'admin' ? '1000' : '100'} requests/hour
                      </span>
                    </p>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                {generatedKey ? (
                  <Button onClick={() => {
                    setGeneratedKey(null);
                    setShowCreateDialog(false);
                  }} className="bg-cyan-600 hover:bg-cyan-700">
                    Done
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-700">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKey} disabled={createKeyMutation.isPending} className="bg-cyan-600 hover:bg-cyan-700">
                      {createKeyMutation.isPending ? 'Creating...' : 'Create Key'}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No API keys yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first key to get started</p>
          </div>
        ) : (
          apiKeys.map((key) => (
            <div key={key.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-100">{key.key_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-slate-400 font-mono">{key.key_prefix}</code>
                    {key.is_active ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Active</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Revoked</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(key.key_prefix)}
                    className="text-slate-400 hover:text-slate-100"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {key.is_active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revokeKeyMutation.mutate(key.id)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <EyeOff className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteKeyMutation.mutate(key.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Rate Limit</p>
                  <p className="text-slate-300 font-semibold">{key.rate_limit}/hour</p>
                </div>
                <div>
                  <p className="text-slate-500">Usage Count</p>
                  <p className="text-slate-300 font-semibold">{key.usage_count || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Used</p>
                  <p className="text-slate-300">{key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Expires</p>
                  <p className="text-slate-300">{new Date(key.expires_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              {key.scopes && key.scopes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {key.scopes.map((scope, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-400">
                      {scope}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
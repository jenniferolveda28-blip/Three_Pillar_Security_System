import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KeyRound, Loader2, RefreshCw, Fingerprint, Ban, RotateCw, MoreVertical, ShieldOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function TokenManagement() {
  const [tokens, setTokens] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [t, r] = await Promise.all([
        base44.entities.HardwareToken.list('-created_date', 50),
        base44.entities.TokenRegistration.list('-created_date', 50),
      ]);
      setTokens(t);
      setRegistrations(r);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const regBySerial = {};
  registrations.forEach(r => { regBySerial[r.token_serial] = r; });

  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const revokeToken = async (token) => {
    setActionLoading(token.id);
    try {
      await base44.entities.HardwareToken.update(token.id, { is_active: false, failed_attempts: 3 });
      setToast({ type: 'success', msg: `${token.device_name} access revoked` });
      await load();
    } catch (e) { setToast({ type: 'error', msg: e.message }); } finally { setActionLoading(null); }
    setTimeout(() => setToast(null), 3000);
  };

  const reactivateToken = async (token) => {
    setActionLoading(token.id);
    try {
      await base44.entities.HardwareToken.update(token.id, { is_active: true, failed_attempts: 0 });
      setToast({ type: 'success', msg: `${token.device_name} reactivated` });
      await load();
    } catch (e) { setToast({ type: 'error', msg: e.message }); } finally { setActionLoading(null); }
    setTimeout(() => setToast(null), 3000);
  };

  const refreshStatus = async (token) => {
    setActionLoading(token.id);
    try {
      await base44.entities.HardwareToken.update(token.id, { last_code_generated: new Date().toISOString() });
      setToast({ type: 'success', msg: `${token.device_name} status refreshed` });
      await load();
    } catch (e) { setToast({ type: 'error', msg: e.message }); } finally { setActionLoading(null); }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Token Management</h1>
              <p className="text-slate-400 text-sm">Hardware tokens, activation dates, and biometric confidence</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Total Tokens</p><p className="text-3xl font-bold text-cyan-400 mt-1">{tokens.length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Active</p><p className="text-3xl font-bold text-green-400 mt-1">{tokens.filter(t => t.is_active).length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">Locked</p><p className="text-3xl font-bold text-red-400 mt-1">{tokens.filter(t => !t.is_active).length}</p></CardContent></Card>
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="pt-6"><p className="text-slate-400 text-xs uppercase">DNA Verified</p><p className="text-3xl font-bold text-purple-400 mt-1">{registrations.filter(r => r.registration_status === 'dna_verified' || r.registration_status === 'activated').length}</p></CardContent></Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan-400 animate-spin" /></div>
        ) : tokens.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-700"><CardContent className="py-16 text-center text-slate-500">No hardware tokens registered.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tokens.map(t => {
              const reg = regBySerial[t.device_id] || regBySerial[t.device_name];
              const confidence = reg?.biometric_confidence || 0;
              return (
                <Card key={t.id} className="bg-slate-900/60 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{t.device_name}</CardTitle>
                        <p className="text-slate-400 text-xs mt-1 font-mono">{t.device_id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={t.is_active ? 'default' : 'destructive'}>{t.is_active ? 'Active' : 'Locked'}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === t.id}>
                              {actionLoading === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                            {t.is_active ? (
                              <DropdownMenuItem onClick={() => revokeToken(t)} className="text-red-400 hover:text-red-300 cursor-pointer">
                                <Ban className="w-4 h-4 mr-2" /> Revoke Access
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => reactivateToken(t)} className="text-green-400 hover:text-green-300 cursor-pointer">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => refreshStatus(t)} className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
                              <RotateCw className="w-4 h-4 mr-2" /> Refresh Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {reg && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Biometric Confidence</span>
                          <span>{confidence}%</span>
                        </div>
                        <Progress value={confidence} className="h-2" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-500">Last Used:</span> <span className="text-slate-300">{t.last_used ? new Date(t.last_used).toLocaleString() : 'Never'}</span></div>
                      <div><span className="text-slate-500">Failed Attempts:</span> <span className={t.failed_attempts >= 3 ? 'text-red-400' : 'text-slate-300'}>{t.failed_attempts || 0}/3</span></div>
                      {reg && <div><span className="text-slate-500">Activated:</span> <span className="text-slate-300">{reg.activation_date ? new Date(reg.activation_date).toLocaleDateString() : 'Pending'}</span></div>}
                      {reg && <div><span className="text-slate-500">Verification:</span> <span className="text-slate-300 capitalize">{reg.verification_method?.replace('_', ' ')}</span></div>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {toast && (
          <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white text-sm font-medium`}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}
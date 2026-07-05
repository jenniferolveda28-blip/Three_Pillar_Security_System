import React from 'react';
import { useAuditMode } from '@/lib/AuditModeContext';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, UserCheck } from 'lucide-react';

export default function AuditModeToggle() {
  const { user } = useAuth();
  const { bypassActive, toggleBypass, isAuditor } = useAuditMode();

  // Only visible to users with the Auditor role
  if (!isAuditor) return null;

  return (
    <Card className={`border-2 ${bypassActive ? 'border-red-500 bg-red-950/40' : 'border-slate-700 bg-slate-900/60'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bypassActive
              ? <ShieldAlert className="h-5 w-5 text-red-400" />
              : <ShieldCheck className="h-5 w-5 text-slate-400" />
            }
            <CardTitle className="text-lg">Bypass Authentication (Audit Mode)</CardTitle>
          </div>
          <Badge variant={bypassActive ? 'destructive' : 'outline'}>
            {bypassActive ? 'BYPASS ACTIVE' : 'SECURE'}
          </Badge>
        </div>
        <CardDescription>
          Skip the BioVerify login requirement for demonstration purposes. All bypass events are logged with timestamp and auditor email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-200">Enable Authentication Bypass</p>
              <p className="text-xs text-slate-500">Logged as: {user?.email}</p>
            </div>
          </div>
          <Switch
            checked={bypassActive}
            onCheckedChange={toggleBypass}
          />
        </div>
      </CardContent>
    </Card>
  );
}
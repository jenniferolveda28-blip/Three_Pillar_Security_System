import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Shield, KeyRound, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const permLabels = {
  view_dashboard: 'Dashboard', view_analytics: 'Analytics', view_threats: 'Threats',
  manage_universes: 'Universes', manage_keys: 'Keys', manage_users: 'Users',
  manage_roles: 'Roles', view_security_logs: 'Logs', manage_reports: 'Reports',
  emergency_protocols: 'Emergency',
};

export default function UserPermissions() {
  const { data: assignments = [], isLoading: loadingA } = useQuery({
    queryKey: ['roleAssignments'],
    queryFn: () => base44.entities.UserRoleAssignment.list('-created_date', 100),
  });
  const { data: roles = [], isLoading: loadingR } = useQuery({
    queryKey: ['rolesList'],
    queryFn: () => base44.entities.Role.list('-created_date', 50),
  });
  const { data: users = [], isLoading: loadingU } = useQuery({
    queryKey: ['usersList'],
    queryFn: () => base44.entities.User.list(),
  });

  const isLoading = loadingA || loadingR || loadingU;
  if (isLoading) return <div className="p-8 text-slate-400">Loading permissions…</div>;

  const roleMap = {};
  roles.forEach(r => { roleMap[r.id] = r; });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-400" /> User Permissions
        </h1>
        <p className="text-slate-400 mt-1">Manage user roles and verify access levels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white">{users.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Role Assignments</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white">{assignments.length}</p></CardContent></Card>
        <Card className="bg-slate-800/50 border-slate-700"><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Defined Roles</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-white">{roles.length}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><KeyRound className="w-5 h-5 text-cyan-400" /> User Assignments</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {assignments.length === 0 && <p className="text-slate-500">No role assignments.</p>}
            {assignments.map(a => {
              const role = roleMap[a.role_id];
              return (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <div>
                    <p className="text-white font-medium">{a.user_email}</p>
                    <p className="text-xs text-slate-500">Assigned by {a.assigned_by || 'system'}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">{role?.role_name || 'Unknown Role'}</Badge>
                    <p className="text-xs text-slate-500 mt-1">{a.assigned_date ? new Date(a.assigned_date).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" /> Role Permission Matrix</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {roles.length === 0 && <p className="text-slate-500">No roles defined.</p>}
            {roles.map(role => (
              <div key={role.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{role.role_name}</span>
                  {role.is_system_role && <Badge variant="secondary">System</Badge>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(permLabels).map(([key, label]) => {
                    const has = role.permissions?.[key];
                    return (
                      <span key={key} className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${has ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/50 text-slate-500'}`}>
                        {has ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  KeyRound,
  Mail,
  RefreshCw,
  Lock,
} from 'lucide-react';

const ROLE_STYLES = {
  admin: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
  auditor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  user: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
};

export default function OwnersUserManagementSection() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [statusMessage, setStatusMessage] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['dashboardUsersList'],
    queryFn: () => base44.entities.User.list(),
    enabled: isAdmin,
  });

  const { data: linkedAccounts = [] } = useQuery({
    queryKey: ['dashboardLinkedAccounts'],
    queryFn: () => base44.entities.HelixVerifyLinkedAccount.list('-created_date', 100),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboardUsersList'] });
      qc.invalidateQueries({ queryKey: ['usersList'] });
      setStatusMessage({ type: 'success', text: 'User role updated.' });
    },
    onError: (err) => {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update role.' });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: ({ email, role }) => base44.users.inviteUser(email, role),
    onSuccess: () => {
      setInviteEmail('');
      qc.invalidateQueries({ queryKey: ['dashboardUsersList'] });
      setStatusMessage({
        type: 'success',
        text: 'Invitation sent. The user will appear once they accept their invite.',
      });
    },
    onError: (err) => {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to send invitation.' });
    },
  });

  if (!isAdmin) {
    return (
      <Card className="bg-slate-900/70 border-slate-800">
        <CardContent className="py-10 text-center space-y-2">
          <Lock className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Admin Access Required</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            User Management is restricted to platform administrators. Signed in as{' '}
            <span className="text-slate-200 font-medium">{currentUser?.email || 'Standard User'}</span>.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || (u.role || 'user') === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const standardCount = users.filter((u) => !u.role || u.role === 'user').length;
  const auditorCount = users.filter((u) => u.role === 'auditor').length;

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setStatusMessage(null);
    inviteUserMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            User Account Management
          </h2>
          <p className="text-xs text-slate-400">
            View registered users, invite team members, and manage role permissions across Reclaim Me.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/UserPermissions">
            <Button variant="outline" size="sm" className="border-violet-500/40 text-violet-300 hover:bg-violet-500/10">
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />
              Role Matrix
            </Button>
          </Link>
          <Link to="/AccountManagement">
            <Button variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Linked Accounts ({linkedAccounts.length})
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
          <p className="text-xs text-slate-400">Total Users</p>
          <p className="text-2xl font-bold text-white mt-0.5">{users.length}</p>
        </div>
        <div className="rounded-xl bg-slate-900/80 border border-violet-500/30 p-4">
          <p className="text-xs text-violet-300">Administrators</p>
          <p className="text-2xl font-bold text-violet-400 mt-0.5">{adminCount}</p>
        </div>
        <div className="rounded-xl bg-slate-900/80 border border-cyan-500/30 p-4">
          <p className="text-xs text-cyan-300">Standard Users</p>
          <p className="text-2xl font-bold text-cyan-400 mt-0.5">{standardCount}</p>
        </div>
        <div className="rounded-xl bg-slate-900/80 border border-amber-500/30 p-4">
          <p className="text-xs text-amber-300">Auditors</p>
          <p className="text-2xl font-bold text-amber-400 mt-0.5">{auditorCount}</p>
        </div>
      </div>

      {/* Invite User Bar */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyan-400" />
            Invite New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@organization.com"
                className="pl-9 bg-slate-950 border-slate-700 text-white"
                required
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-md bg-slate-950 border border-slate-700 text-white text-sm px-3 py-2"
            >
              <option value="user">Role: Standard User</option>
              <option value="admin">Role: Administrator</option>
            </select>
            <Button
              type="submit"
              disabled={inviteUserMutation.isPending || !inviteEmail.trim()}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              {inviteUserMutation.isPending ? 'Sending Invite…' : 'Send Invite'}
            </Button>
          </form>

          {statusMessage && (
            <p
              className={`text-xs mt-2.5 ${
                statusMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {statusMessage.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* User Directory Table */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base text-white">
              Registered User Accounts ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or email…"
                  className="pl-8 h-8 text-xs bg-slate-950 border-slate-700 text-white w-48"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 rounded-md bg-slate-950 border border-slate-700 text-white text-xs px-2.5"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
                <option value="auditor">Auditors</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400 text-sm py-6 text-center">Loading user accounts…</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-slate-500 text-sm py-6 text-center">No matching user accounts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-800">
                    <th className="text-left py-2.5 px-2">User</th>
                    <th className="text-left py-2.5 px-2">Email</th>
                    <th className="text-left py-2.5 px-2">Current Role</th>
                    <th className="text-left py-2.5 px-2">Protected Accounts</th>
                    <th className="text-left py-2.5 px-2">Joined</th>
                    <th className="text-right py-2.5 px-2">Assign Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const userLinkedCount = linkedAccounts.filter(
                      (a) => a.account_identifier === u.email || a.recovery_email === u.email
                    ).length;
                    const roleKey = u.role || 'user';
                    return (
                      <tr key={u.id} className="border-b border-slate-800/70 hover:bg-slate-800/30">
                        <td className="py-3 px-2 font-medium text-white">
                          {u.full_name || 'Unnamed User'}
                        </td>
                        <td className="py-3 px-2 text-slate-300 text-xs font-mono">{u.email}</td>
                        <td className="py-3 px-2">
                          <Badge
                            variant="outline"
                            className={ROLE_STYLES[roleKey] || ROLE_STYLES.user}
                          >
                            {roleKey}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-300">
                          {userLinkedCount} linked
                        </td>
                        <td className="py-3 px-2 text-xs text-slate-400">
                          {u.created_date ? new Date(u.created_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <select
                            value={roleKey}
                            disabled={updateRoleMutation.isPending}
                            onChange={(e) =>
                              updateRoleMutation.mutate({ userId: u.id, role: e.target.value })
                            }
                            className="rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 px-2 py-1"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="auditor">auditor</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
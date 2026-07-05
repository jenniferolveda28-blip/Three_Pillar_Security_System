import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Plus, ArrowLeft, Users } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import RoleEditor from '../components/roles/RoleEditor';
import RoleList from '../components/roles/RoleList';
import UserRoleAssignment from '../components/roles/UserRoleAssignment';
import { useGuestAuditor } from '@/lib/useGuestAuditor';
import AccessRestricted from '@/components/security/AccessRestricted';

export default function RoleManagement() {
  const { isGuestAuditor } = useGuestAuditor();
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showUserAssignment, setShowUserAssignment] = useState(false);
  const queryClient = useQueryClient();

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list('-created_date'),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['roleAssignments'],
    queryFn: () => base44.entities.UserRoleAssignment.list('-created_date'),
  });

  if (isGuestAuditor) return <AccessRestricted feature="Settings & Role Management" />;

  return (
    <div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/50">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Role & Permission Management</h1>
                  <p className="text-slate-400">Granular access control and user permissions</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <PrintReportButton
                reportTitle="Role & Permission Management Report"
                subtitle="Granular access control and user permission assignments"
                filename="role-management-{date}.pdf"
                sections={[
                  { heading: 'RBAC OVERVIEW', rows: [['Total Roles', roles.length], ['User Assignments', assignments.length], ['System Roles', roles.filter(r => r.data?.is_system_role || r.is_system_role).length], ['Custom Roles', roles.filter(r => !(r.data?.is_system_role || r.is_system_role)).length]] },
                  { heading: 'ROLES LIST', body: roles.length > 0 ? roles.map(r => `• ${r.data?.role_name || r.role_name} — ${r.data?.description || r.description || 'No description'} — System Role: ${(r.data?.is_system_role || r.is_system_role) ? 'YES' : 'NO'}`).join('\n') : 'No roles configured.' },
                  { heading: 'USER ASSIGNMENTS', body: assignments.length > 0 ? assignments.slice(0, 20).map(a => `• User: ${a.data?.user_email || a.user_email} — Role ID: ${a.data?.role_id || a.role_id} — Assigned by: ${a.data?.assigned_by || a.assigned_by || 'System'}`).join('\n') : 'No assignments configured.' },
                  { heading: 'WHY RBAC MATTERS', body: 'Role-Based Access Control (RBAC) ensures the principle of least privilege — every user can only access exactly what they need to do their job, nothing more.\n\nIn a zero-trust security model, RBAC prevents:\n• Insider threats — employees cannot access data beyond their role\n• Lateral movement — a compromised account cannot escalate privileges\n• Accidental data exposure — no user can stumble into sensitive areas\n\nAll RBAC changes are logged in the audit trail for compliance purposes.' },
                ]}
              />
              <Button onClick={() => setShowUserAssignment(true)} variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Assign Users
              </Button>
              <Button onClick={() => setShowRoleForm(true)} className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-2" />
                New Role
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="multi-layer-card card-layer-monitoring rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Roles</p>
                  <p className="text-3xl font-bold text-violet-400">{roles.length}</p>
                </div>
                <Shield className="w-10 h-10 text-violet-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-auth rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Users Assigned</p>
                  <p className="text-3xl font-bold text-cyan-400">{assignments.length}</p>
                </div>
                <Users className="w-10 h-10 text-cyan-500/50 glow-pulse" />
              </div>
            </div>
          </div>
        </div>

        {showRoleForm && (
          <div className="mb-6">
            <RoleEditor
              role={editingRole}
              onSave={() => {
                setShowRoleForm(false);
                setEditingRole(null);
                queryClient.invalidateQueries({ queryKey: ['roles'] });
              }}
              onCancel={() => {
                setShowRoleForm(false);
                setEditingRole(null);
              }}
            />
          </div>
        )}

        {showUserAssignment && (
          <div className="mb-6">
            <UserRoleAssignment
              roles={roles}
              onClose={() => setShowUserAssignment(false)}
            />
          </div>
        )}

        <RoleList
          roles={roles}
          assignments={assignments}
          onEdit={(role) => {
            setEditingRole(role);
            setShowRoleForm(true);
          }}
        />
      </div>
    </div>
  );
}
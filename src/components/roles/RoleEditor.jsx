import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const permissionGroups = {
  'Dashboards & Views': ['view_dashboard', 'view_analytics', 'view_threats'],
  'Data Management': ['manage_universes', 'manage_keys', 'view_security_logs'],
  'User & System Admin': ['manage_users', 'manage_roles', 'emergency_protocols'],
  'Reporting': ['manage_reports']
};

const permissionLabels = {
  view_dashboard: 'View Dashboard',
  view_analytics: 'View Analytics',
  view_threats: 'View Threat Analysis',
  manage_universes: 'Manage API Universes',
  manage_keys: 'Manage API Keys',
  manage_users: 'Manage Users',
  manage_roles: 'Manage Roles & Permissions',
  view_security_logs: 'View Security Logs',
  manage_reports: 'Manage Security Reports',
  emergency_protocols: 'Access Emergency Protocols'
};

export default function RoleEditor({ role, onSave, onCancel }) {
  const [formData, setFormData] = useState(role || {
    role_name: '',
    description: '',
    permissions: {},
    is_system_role: false
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (role) {
        return base44.entities.Role.update(role.id, data);
      }
      return base44.entities.Role.create(data);
    },
    onSuccess: () => {
      toast.success(role ? 'Role updated' : 'Role created');
      onSave();
    }
  });

  const togglePermission = (key) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions?.[key]
      }
    }));
  };

  return (
    <Card className="multi-layer-card card-layer-monitoring border">
      <CardHeader>
        <CardTitle className="text-slate-100">{role ? 'Edit' : 'Create'} Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-slate-300">Role Name</Label>
          <Input
            value={formData.role_name}
            onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
            placeholder="Security Analyst"
            className="bg-slate-800 border-slate-700 text-slate-200"
          />
        </div>

        <div>
          <Label className="text-slate-300">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Can view threats and analyze security events..."
            className="bg-slate-800 border-slate-700 text-slate-200"
          />
        </div>

        <div>
          <Label className="text-slate-300 mb-3 block">Permissions</Label>
          <div className="space-y-4">
            {Object.entries(permissionGroups).map(([group, perms]) => (
              <div key={group} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm font-semibold text-slate-400 mb-3">{group}</p>
                <div className="space-y-2">
                  {perms.map(perm => (
                    <div key={perm} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.permissions?.[perm] || false}
                        onCheckedChange={() => togglePermission(perm)}
                      />
                      <span className="text-slate-300 text-sm">{permissionLabels[perm]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onCancel} variant="outline" className="flex-1">Cancel</Button>
          <Button
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending || !formData.role_name}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Role'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Edit, Trash2, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RoleList({ roles, assignments, onEdit }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => {
      toast.success('Role deleted');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const getUserCount = (roleId) => {
    return assignments.filter(a => a.role_id === roleId).length;
  };

  const getActivePermissions = (permissions) => {
    return Object.entries(permissions || {}).filter(([, v]) => v).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map(role => (
        <Card key={role.id} className="multi-layer-card card-layer-monitoring border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-violet-400" />
                  <CardTitle className="text-slate-100">{role.role_name}</CardTitle>
                </div>
                {role.is_system_role && (
                  <Badge variant="outline" className="text-xs">SYSTEM ROLE</Badge>
                )}
              </div>
              {!role.is_system_role && (
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(role)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(role.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {role.description && (
              <p className="text-sm text-slate-400">{role.description}</p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users className="w-4 h-4" />
                <span>{getUserCount(role.id)} users</span>
              </div>
              <div className="text-sm text-slate-400">
                {getActivePermissions(role.permissions)} permissions
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {roles.length === 0 && (
        <Card className="multi-layer-card border col-span-full">
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No roles configured yet</p>
            <p className="text-slate-500 text-sm">Create your first role to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
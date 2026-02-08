import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function UserRoleAssignment({ roles, onClose }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: assignments = [] } = useQuery({
    queryKey: ['roleAssignments'],
    queryFn: () => base44.entities.UserRoleAssignment.list('-created_date'),
  });

  const assignMutation = useMutation({
    mutationFn: (data) => base44.entities.UserRoleAssignment.create(data),
    onSuccess: () => {
      toast.success('User assigned to role');
      queryClient.invalidateQueries({ queryKey: ['roleAssignments'] });
      setUserEmail('');
      setSelectedRole('');
    }
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.UserRoleAssignment.delete(id),
    onSuccess: () => {
      toast.success('Assignment removed');
      queryClient.invalidateQueries({ queryKey: ['roleAssignments'] });
    }
  });

  const getRoleName = (roleId) => {
    return roles.find(r => r.id === roleId)?.role_name || 'Unknown Role';
  };

  return (
    <Card className="multi-layer-card card-layer-auth border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100">User Role Assignment</CardTitle>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="user@example.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-slate-200"
          />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  {role.role_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => assignMutation.mutate({
              user_email: userEmail,
              role_id: selectedRole,
              assigned_date: new Date().toISOString()
            })}
            disabled={!userEmail || !selectedRole || assignMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Assign
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <p className="text-sm text-slate-400 mb-2">Current Assignments</p>
          {assignments.map(assignment => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
            >
              <div className="flex-1">
                <p className="text-slate-300 text-sm">{assignment.user_email}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {getRoleName(assignment.role_id)}
                </Badge>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeMutation.mutate(assignment.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {assignments.length === 0 && (
            <p className="text-center text-slate-500 py-8">No user assignments yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
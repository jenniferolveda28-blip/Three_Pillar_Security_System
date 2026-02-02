import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Shield, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "../components/permissions/PermissionGuard";

export default function UserManagement() {
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});
  const queryClient = useQueryClient();
  const { currentUser, isAdmin } = usePermissions();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await base44.entities.User.list('-created_date', 100);
      return result;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      return await base44.auth.updateMe({ custom_role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
      setEditingUserId(null);
    },
    onError: (error) => {
      toast.error('Failed to update user role');
    },
  });

  const roleColors = {
    admin: 'bg-red-900/30 text-red-400',
    editor: 'bg-blue-900/30 text-blue-400',
    viewer: 'bg-slate-700/30 text-slate-400',
  };

  if (!isAdmin || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Card className="multi-layer-card card-layer-threat border bg-red-900/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
              <p className="text-slate-300">Only administrators can access user management.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold gradient-text">User Management</h1>
            <p className="text-slate-400">Manage user roles and permissions</p>
          </div>
        </div>

        {/* Users List */}
        <Card className="multi-layer-card card-layer-data border bg-slate-800/50">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-slate-100">Registered Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-700">
                    <tr className="bg-slate-900/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Full Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Platform Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Custom Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-3 text-sm text-slate-300">{user.email}</td>
                        <td className="px-6 py-3 text-sm text-slate-300">{user.full_name || '-'}</td>
                        <td className="px-6 py-3 text-sm">
                          <Badge className={user.role === 'admin' ? 'bg-red-900/30 text-red-400' : 'bg-slate-700/30 text-slate-400'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <Badge className={roleColors[user.custom_role || 'viewer']}>
                            {user.custom_role || 'viewer'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <Badge className={user.is_active !== false ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}>
                            {user.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-cyan-400 hover:bg-cyan-900/20"
                                onClick={() => setSelectedRole({ [user.id]: user.custom_role || 'viewer' })}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700">
                              <DialogHeader>
                                <DialogTitle className="text-slate-100">Update Role for {user.email}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label className="text-sm text-slate-400">Select Role</label>
                                  <Select
                                    value={selectedRole[user.id] || user.custom_role || 'viewer'}
                                    onValueChange={(value) => setSelectedRole({ ...selectedRole, [user.id]: value })}
                                  >
                                    <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-slate-100">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600">
                                      <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                                      <SelectItem value="editor">Editor - Create and edit data</SelectItem>
                                      <SelectItem value="admin">Admin - Full access</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                                  <p className="text-xs text-slate-400">
                                    <strong>Viewer:</strong> Can only view data<br />
                                    <strong>Editor:</strong> Can create, update, and delete data<br />
                                    <strong>Admin:</strong> Full system access and user management
                                  </p>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <DialogTrigger asChild>
                                    <Button variant="outline" className="border-slate-600 text-slate-300">Cancel</Button>
                                  </DialogTrigger>
                                  <Button
                                    onClick={() => updateRoleMutation.mutate({ userId: user.id, newRole: selectedRole[user.id] })}
                                    className="bg-cyan-600 hover:bg-cyan-700"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Update Role
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
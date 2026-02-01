import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { ArrowLeft, Filter, Download } from "lucide-react";
import { format } from 'date-fns';

export default function ActivityLogs() {
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100),
  });

  const actionColors = {
    create: 'bg-green-900/30 text-green-400',
    update: 'bg-blue-900/30 text-blue-400',
    delete: 'bg-red-900/30 text-red-400',
    api_call: 'bg-cyan-900/30 text-cyan-400',
    settings_change: 'bg-orange-900/30 text-orange-400',
    role_assignment: 'bg-purple-900/30 text-purple-400',
    login: 'bg-emerald-900/30 text-emerald-400',
    logout: 'bg-slate-700/30 text-slate-400',
  };

  const statusColors = {
    success: 'bg-green-900/30 text-green-400',
    failed: 'bg-red-900/30 text-red-400',
  };

  const filteredLogs = logs.filter(log => {
    const actionMatch = filterAction === 'all' || log.action_type === filterAction;
    const userMatch = !filterUser || log.user_email.toLowerCase().includes(filterUser.toLowerCase());
    const statusMatch = filterStatus === 'all' || log.status === filterStatus;
    return actionMatch && userMatch && statusMatch;
  });

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
            <h1 className="text-3xl font-bold gradient-text">Activity Logs</h1>
            <p className="text-slate-400">Monitor all user actions and system events</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="multi-layer-card card-layer-auth rounded-xl p-4 border">
            <p className="text-sm text-slate-400">Total Events</p>
            <p className="text-2xl font-bold text-cyan-400">{logs.length}</p>
          </div>
          <div className="multi-layer-card card-layer-data rounded-xl p-4 border">
            <p className="text-sm text-slate-400">Success Rate</p>
            <p className="text-2xl font-bold text-emerald-400">
              {logs.length > 0 ? ((logs.filter(l => l.status === 'success').length / logs.length) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div className="multi-layer-card card-layer-monitoring rounded-xl p-4 border">
            <p className="text-sm text-slate-400">Unique Users</p>
            <p className="text-2xl font-bold text-violet-400">
              {new Set(logs.map(l => l.user_email)).size}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="multi-layer-card card-layer-auth border mb-6 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-slate-400">Filter by User Email</label>
                <Input
                  placeholder="Search email..."
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="mt-2 bg-slate-700 border-slate-600 text-slate-100"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-slate-400">Action Type</label>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="api_call">API Call</SelectItem>
                    <SelectItem value="settings_change">Settings Change</SelectItem>
                    <SelectItem value="role_assignment">Role Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-slate-400">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="multi-layer-card card-layer-data border bg-slate-800/50">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-slate-100 flex items-center justify-between">
              Event History
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No logs found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-700">
                    <tr className="bg-slate-900/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Entity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-700 hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-3 text-sm text-slate-300">
                          {format(new Date(log.created_date), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-300">{log.user_email}</td>
                        <td className="px-6 py-3 text-sm">
                          <Badge className={actionColors[log.action_type]}>
                            {log.action_type}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-400">{log.entity_type || '-'}</td>
                        <td className="px-6 py-3 text-sm text-slate-300">{log.description}</td>
                        <td className="px-6 py-3 text-sm">
                          <Badge className={statusColors[log.status]}>
                            {log.status}
                          </Badge>
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
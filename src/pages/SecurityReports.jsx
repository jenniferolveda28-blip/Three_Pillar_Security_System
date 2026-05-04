import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Plus, ArrowLeft, Calendar, Download, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ReportConfigForm from '../components/reports/ReportConfigForm';
import ReportList from '../components/reports/ReportList';
import ExecutiveReportGenerator from '../components/reports/ExecutiveReportGenerator';

export default function SecurityReports() {
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
    queryKey: ['securityReports'],
    queryFn: () => base44.entities.SecurityReport.list('-created_date'),
  });

  const generateReportMutation = useMutation({
    mutationFn: (reportId) => base44.functions.invoke('generateSecurityReport', { report_id: reportId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityReports'] });
    }
  });

  const activeReports = reports.filter(r => r.is_active).length;
  const totalGenerated = reports.filter(r => r.last_run).length;

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
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/50">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Security Reports</h1>
                  <p className="text-slate-400">Automated threat intelligence and compliance reporting</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="multi-layer-card card-layer-auth rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Reports</p>
                  <p className="text-3xl font-bold text-cyan-400">{reports.length}</p>
                </div>
                <FileText className="w-10 h-10 text-cyan-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-data rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Schedules</p>
                  <p className="text-3xl font-bold text-emerald-400">{activeReports}</p>
                </div>
                <Calendar className="w-10 h-10 text-emerald-500/50 glow-pulse" />
              </div>
            </div>
            <div className="multi-layer-card card-layer-monitoring rounded-xl p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Generated</p>
                  <p className="text-3xl font-bold text-violet-400">{totalGenerated}</p>
                </div>
                <Download className="w-10 h-10 text-violet-500/50 glow-pulse" />
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="mb-6">
            <ReportConfigForm
              report={editingReport}
              onSave={() => {
                setShowForm(false);
                setEditingReport(null);
                queryClient.invalidateQueries({ queryKey: ['securityReports'] });
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingReport(null);
              }}
            />
          </div>
        )}

        <ReportList 
          reports={reports}
          onEdit={(report) => {
            setEditingReport(report);
            setShowForm(true);
          }}
          onGenerate={(reportId) => generateReportMutation.mutate(reportId)}
        />

        <ExecutiveReportGeneratorWrapper />
      </div>
    </div>
  );
}

function ExecutiveReportGeneratorWrapper() {
  const { data: alerts = [] } = useQuery({ queryKey: ['execAlerts'], queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 500) });
  const { data: logs = [] } = useQuery({ queryKey: ['execLogs'], queryFn: () => base44.entities.SecurityLog.list('-created_date', 500) });
  const { data: sessions = [] } = useQuery({ queryKey: ['execSessions'], queryFn: () => base44.entities.ScramblingSession.list('-created_date', 100) });
  return <ExecutiveReportGenerator alerts={alerts} logs={logs} sessions={sessions} />;
}
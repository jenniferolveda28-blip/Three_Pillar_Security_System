import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Mail, Download, Play, Edit, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import moment from 'moment';

export default function ReportList({ reports, onEdit, onGenerate }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SecurityReport.delete(id),
    onSuccess: () => {
      toast.success('Report deleted');
      queryClient.invalidateQueries({ queryKey: ['securityReports'] });
    }
  });

  const scheduleColors = {
    daily: 'bg-green-500/20 text-green-400 border-green-500/50',
    weekly: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    monthly: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    'on-demand': 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  };

  return (
    <div className="space-y-4">
      {reports.map(report => (
        <Card key={report.id} className="multi-layer-card card-layer-data border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-slate-100 mb-2">{report.report_name}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={scheduleColors[report.schedule_type]}>
                    {report.schedule_type.toUpperCase()}
                  </Badge>
                  <Badge variant={report.is_active ? 'default' : 'outline'}>
                    {report.is_active ? 'ACTIVE' : 'PAUSED'}
                  </Badge>
                  {report.delivery_method === 'email' || report.delivery_method === 'both' ? (
                    <Badge variant="outline" className="text-slate-400">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Badge>
                  ) : null}
                  {report.delivery_method === 'download' || report.delivery_method === 'both' ? (
                    <Badge variant="outline" className="text-slate-400">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => onEdit(report)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(report.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Time Range</p>
                <p className="text-slate-300">{report.time_range_days} days</p>
              </div>
              {report.last_run && (
                <div>
                  <p className="text-slate-500 text-xs">Last Generated</p>
                  <p className="text-slate-300">{moment(report.last_run).fromNow()}</p>
                </div>
              )}
              {report.recipients?.length > 0 && (
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs mb-1">Recipients</p>
                  <p className="text-slate-300 text-xs">{report.recipients.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onGenerate(report.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Generate Now
              </Button>
              {report.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(report.file_url, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Last
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {reports.length === 0 && (
        <Card className="multi-layer-card border">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No security reports configured yet</p>
            <p className="text-slate-500 text-sm">Create your first automated report to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
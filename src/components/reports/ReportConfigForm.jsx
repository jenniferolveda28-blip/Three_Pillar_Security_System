import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ReportConfigForm({ report, onSave, onCancel }) {
  const [formData, setFormData] = useState(report || {
    report_name: '',
    schedule_type: 'weekly',
    delivery_method: 'email',
    recipients: [],
    include_threat_summary: true,
    include_incident_details: true,
    include_key_metrics: true,
    include_recommendations: true,
    time_range_days: 7,
    is_active: true
  });

  const [emailInput, setEmailInput] = useState('');

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (report) {
        return base44.entities.SecurityReport.update(report.id, data);
      }
      return base44.entities.SecurityReport.create(data);
    },
    onSuccess: () => {
      toast.success(report ? 'Report updated' : 'Report created');
      onSave();
    }
  });

  const addRecipient = () => {
    if (emailInput && emailInput.includes('@')) {
      setFormData(prev => ({
        ...prev,
        recipients: [...(prev.recipients || []), emailInput]
      }));
      setEmailInput('');
    }
  };

  return (
    <Card className="multi-layer-card card-layer-auth border">
      <CardHeader>
        <CardTitle className="text-slate-100">{report ? 'Edit' : 'Create'} Security Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300">Report Name</Label>
            <Input
              value={formData.report_name}
              onChange={(e) => setFormData({ ...formData, report_name: e.target.value })}
              placeholder="Weekly Security Summary"
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
          <div>
            <Label className="text-slate-300">Schedule</Label>
            <Select value={formData.schedule_type} onValueChange={(v) => setFormData({ ...formData, schedule_type: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="on-demand">On-Demand Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300">Delivery Method</Label>
            <Select value={formData.delivery_method} onValueChange={(v) => setFormData({ ...formData, delivery_method: v })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="download">Download Only</SelectItem>
                <SelectItem value="both">Email & Download</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Time Range (Days)</Label>
            <Input
              type="number"
              value={formData.time_range_days}
              onChange={(e) => setFormData({ ...formData, time_range_days: parseInt(e.target.value) })}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
        </div>

        {(formData.delivery_method === 'email' || formData.delivery_method === 'both') && (
          <div>
            <Label className="text-slate-300">Email Recipients</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@example.com"
                className="bg-slate-800 border-slate-700 text-slate-200"
                onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
              />
              <Button type="button" onClick={addRecipient} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.recipients?.map((email, idx) => (
                <div key={idx} className="bg-slate-800 px-3 py-1 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                  {email}
                  <button
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      recipients: prev.recipients.filter((_, i) => i !== idx)
                    }))}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label className="text-slate-300 mb-3 block">Report Content</Label>
          <div className="space-y-2">
            {[
              { key: 'include_threat_summary', label: 'Threat Summary' },
              { key: 'include_incident_details', label: 'Incident Details' },
              { key: 'include_key_metrics', label: 'Key Metrics & Statistics' },
              { key: 'include_recommendations', label: 'AI Recommendations' }
            ].map(item => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  checked={formData[item.key]}
                  onCheckedChange={(checked) => setFormData({ ...formData, [item.key]: checked })}
                />
                <span className="text-slate-300 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onCancel} variant="outline" className="flex-1">Cancel</Button>
          <Button
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending || !formData.report_name}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
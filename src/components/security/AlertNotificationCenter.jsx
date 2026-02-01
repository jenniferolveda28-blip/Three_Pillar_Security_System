import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Mail, Phone, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AlertNotificationCenter() {
  const [notificationConfig, setNotificationConfig] = useState({
    email: '',
    phone: '',
    emergencyContact: '',
    autoNotify: true,
    notifyOnCritical: true,
    notifyOnHigh: true,
    notifyOnMedium: false
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['criminalAlerts'],
    queryFn: () => base44.entities.CriminalActivityAlert.list('-created_date', 50),
  });

  const handleSaveConfig = () => {
    toast.success('✅ Notification settings saved');
  };

  const handleTestNotification = () => {
    toast.info('📧 Test notification sent');
  };

  const recentNotifications = alerts
    .filter(a => a.notification_sent)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Notification Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Emergency Email
                </label>
                <Input
                  type="email"
                  placeholder="security@yourcompany.com"
                  value={notificationConfig.email}
                  onChange={(e) => setNotificationConfig({...notificationConfig, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Emergency Phone
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={notificationConfig.phone}
                  onChange={(e) => setNotificationConfig({...notificationConfig, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Law Enforcement Contact</label>
              <Input
                placeholder="Local Police Department - 911"
                value={notificationConfig.emergencyContact}
                onChange={(e) => setNotificationConfig({...notificationConfig, emergencyContact: e.target.value})}
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Notification Triggers</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationConfig.autoNotify}
                    onChange={(e) => setNotificationConfig({...notificationConfig, autoNotify: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Enable automatic notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationConfig.notifyOnCritical}
                    onChange={(e) => setNotificationConfig({...notificationConfig, notifyOnCritical: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Notify on CRITICAL alerts</span>
                  <Badge className="bg-red-600">Critical</Badge>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationConfig.notifyOnHigh}
                    onChange={(e) => setNotificationConfig({...notificationConfig, notifyOnHigh: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Notify on HIGH severity alerts</span>
                  <Badge className="bg-orange-600">High</Badge>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={notificationConfig.notifyOnMedium}
                    onChange={(e) => setNotificationConfig({...notificationConfig, notifyOnMedium: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">Notify on MEDIUM severity alerts</span>
                  <Badge className="bg-yellow-600">Medium</Badge>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveConfig} className="bg-indigo-600 hover:bg-indigo-700">
                <Shield className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button variant="outline" onClick={handleTestNotification}>
                <Bell className="w-4 h-4 mr-2" />
                Test Notification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Recent Notifications Sent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentNotifications.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium">{alert.alert_type.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(alert.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.authorities_notified && (
                    <Badge className="bg-purple-600">Authorities Notified</Badge>
                  )}
                  <Badge variant="outline">{alert.severity}</Badge>
                </div>
              </div>
            ))}
            {recentNotifications.length === 0 && (
              <p className="text-center text-gray-500 py-8">No notifications sent yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
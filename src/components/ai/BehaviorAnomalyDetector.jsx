import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

const anomalyIcons = {
  unusual_access_time: Clock,
  unusual_location: MapPin,
  excessive_requests: Activity,
  privilege_escalation_attempt: User,
  data_exfiltration_pattern: Activity,
  unusual_endpoint_access: Activity
};

const severityColors = {
  critical: 'border-red-500 bg-red-500/10 text-red-400',
  high: 'border-orange-500 bg-orange-500/10 text-orange-400',
  medium: 'border-amber-500 bg-amber-500/10 text-amber-400',
  low: 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
};

export default function BehaviorAnomalyDetector({ anomalies }) {
  return (
    <Card className="multi-layer-card card-layer-scramble border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Activity className="w-5 h-5 text-amber-400" />
          Behavioral Anomaly Detection
        </CardTitle>
        <CardDescription className="text-slate-400">
          AI-powered insider threat detection and user behavior analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No behavioral anomalies detected</p>
            <p className="text-xs">All user behavior within normal parameters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.slice(0, 6).map((anomaly, idx) => {
              const Icon = anomalyIcons[anomaly.anomaly_type] || Activity;
              
              return (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border ${severityColors[anomaly.severity]}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-100 mb-1">
                        {anomaly.anomaly_type.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs" variant="outline">
                          {anomaly.user_identifier}
                        </Badge>
                        <Badge className={`text-xs ${severityColors[anomaly.severity]}`}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {anomaly.ai_reasoning && (
                    <div className="bg-slate-800/50 rounded p-2 mb-2">
                      <p className="text-xs text-slate-300">{anomaly.ai_reasoning}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Deviation: {anomaly.deviation_score}%</span>
                    <span>{moment(anomaly.detection_timestamp || anomaly.created_date).fromNow()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
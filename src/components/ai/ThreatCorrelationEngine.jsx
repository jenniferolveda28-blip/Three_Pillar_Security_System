import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

const severityColors = {
  critical: 'border-red-500 bg-red-500/10',
  high: 'border-orange-500 bg-orange-500/10',
  medium: 'border-amber-500 bg-amber-500/10',
  low: 'border-yellow-500 bg-yellow-500/10'
};

export default function ThreatCorrelationEngine({ correlations }) {
  return (
    <Card className="multi-layer-card card-layer-threat border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Sparkles className="w-5 h-5 text-pink-400" />
              Attack Chain Correlation
            </CardTitle>
            <CardDescription className="text-slate-400">
              AI-detected complex attack patterns across security modules
            </CardDescription>
          </div>
          <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">AI POWERED</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {correlations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No attack chains detected</p>
            <p className="text-xs">AI monitoring active</p>
          </div>
        ) : (
          correlations.slice(0, 5).map((corr, idx) => (
            <motion.div
              key={corr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg border ${severityColors[corr.severity]}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h4 className="font-semibold text-slate-100">{corr.attack_chain_name}</h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${severityColors[corr.severity]}`}>
                      {corr.severity?.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {corr.confidence_score}% confidence
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {corr.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {corr.ai_analysis && (
                <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-slate-400 mb-1">AI Analysis:</p>
                  <p className="text-sm text-slate-300">{corr.ai_analysis}</p>
                </div>
              )}

              {corr.attack_stages && corr.attack_stages.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-2">Attack Stages:</p>
                  <div className="flex items-center gap-2">
                    {corr.attack_stages.map((stage, i) => (
                      <React.Fragment key={i}>
                        <div className="bg-slate-800/50 px-2 py-1 rounded text-xs text-slate-300">
                          Stage {i + 1}
                        </div>
                        {i < corr.attack_stages.length - 1 && (
                          <div className="text-slate-600">→</div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {corr.recommended_actions && corr.recommended_actions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-2">Recommended Actions:</p>
                  <ul className="space-y-1">
                    {corr.recommended_actions.map((action, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700">
                <span>{moment(corr.created_date).fromNow()}</span>
                <span>{corr.related_events?.length || 0} related events</span>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
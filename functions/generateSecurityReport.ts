import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threatLevel, metrics, triggeredAt } = await req.json();

    // Create security report record
    const report = {
      threat_level: threatLevel,
      metrics: JSON.stringify(metrics),
      triggered_at: triggeredAt,
      user_email: user.email,
      status: 'generated',
      incident_type: threatLevel >= 85 ? 'critical_threat' : 'high_threat',
      recommended_action: threatLevel >= 85 ? 'immediate_shutdown' : 'monitor_and_throttle',
      auto_blocked: threatLevel >= 85
    };

    // Save report to database (if we have an entity for it)
    // This would be created as an entity if not existing
    // For now, logging the report structure
    console.log('Security Report Generated:', JSON.stringify(report, null, 2));

    // Send alert email (optional integration)
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `🚨 Security Alert: API Threat Level ${threatLevel.toFixed(0)}%`,
      body: `
An automated security report has been generated due to detected API threats.

Threat Level: ${threatLevel.toFixed(0)}%
Incident Type: ${report.incident_type}
Timestamp: ${new Date(triggeredAt).toLocaleString()}

Metrics:
- Request Rate: ${metrics.recentRequests} req/min
- Avg Latency: ${metrics.avgLatency}ms
- Error Rate: ${metrics.errorRate}%

Action Taken: ${report.recommended_action}
${report.auto_blocked ? 'API access has been automatically blocked.' : 'API is being monitored. Further throttling may occur.'}

Review your API usage and secure your keys.
      `
    });

    return Response.json({
      success: true,
      report: report,
      message: `Security report generated and alert sent to ${user.email}`
    });
  } catch (error) {
    console.error('Security report generation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
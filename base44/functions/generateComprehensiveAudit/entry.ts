import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const daysBack = body.days_back || 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // ── Fetch all security audit and system health data ──
    const [
      securityLogs,
      criminalAlerts,
      behaviorAnomalies,
      threatCorrelations,
      analyticsMetrics,
      incidentRules,
      scramblingSessions,
      hardwareTokens,
      universes,
      auditFeedback,
      securityReports,
      webhooks,
      subscriptions,
      tokenRegistrations,
    ] = await Promise.all([
      base44.asServiceRole.entities.SecurityLog.filter({}),
      base44.asServiceRole.entities.CriminalActivityAlert.filter({}),
      base44.asServiceRole.entities.BehaviorAnomaly.filter({}),
      base44.asServiceRole.entities.ThreatCorrelation.filter({}),
      base44.asServiceRole.entities.AnalyticsMetric.filter({}),
      base44.asServiceRole.entities.IncidentRule.filter({}),
      base44.asServiceRole.entities.ScramblingSession.filter({}),
      base44.asServiceRole.entities.HardwareToken.filter({}),
      base44.asServiceRole.entities.Universe.filter({}),
      base44.asServiceRole.entities.AuditFeedback.filter({}),
      base44.asServiceRole.entities.SecurityReport.filter({}),
      base44.asServiceRole.entities.WebhookEndpoint.filter({}),
      base44.asServiceRole.entities.Subscription.filter({}),
      base44.asServiceRole.entities.TokenRegistration.filter({}),
    ]);

    // Filter to recent
    const recentLogs = securityLogs.filter(l => new Date(l.created_date) > cutoffDate);
    const recentAlerts = criminalAlerts.filter(a => new Date(a.created_date) > cutoffDate);
    const recentAnomalies = behaviorAnomalies.filter(a => new Date(a.created_date) > cutoffDate);
    const recentMetrics = analyticsMetrics.filter(m => new Date(m.created_date) > cutoffDate);

    // ── Compute summary metrics ──
    const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length;
    const highAlerts = recentAlerts.filter(a => a.severity === 'high').length;
    const openAlerts = recentAlerts.filter(a => a.status === 'open' || a.status === 'investigating').length;
    const confirmedAlerts = recentAlerts.filter(a => a.status === 'confirmed').length;
    const resolvedAlerts = recentAlerts.filter(a => a.status === 'resolved').length;
    const falsePositives = recentAlerts.filter(a => a.status === 'false_positive').length;

    const criticalAnomalies = recentAnomalies.filter(a => a.severity === 'critical').length;
    const highAnomalies = recentAnomalies.filter(a => a.severity === 'high').length;
    const confirmedThreats = recentAnomalies.filter(a => a.status === 'confirmed_threat').length;

    const activeThreatCorrelations = threatCorrelations.filter(t => t.status === 'active').length;

    const failedAuths = recentLogs.filter(l => l.event_type === 'access_denied').length;
    const suspiciousEvents = recentLogs.filter(l => l.event_type === 'suspicious_activity').length;
    const dnaVerified = recentLogs.filter(l => l.event_type === 'dna_verified').length;
    const highThreatLogs = recentLogs.filter(l => l.threat_level === 'high' || l.threat_level === 'critical').length;

    const apiCalls = recentMetrics.filter(m => m.metric_type === 'api_call');
    const failedApiCalls = apiCalls.filter(m => !m.success);
    const apiSuccessRate = apiCalls.length > 0
      ? ((apiCalls.length - failedApiCalls.length) / apiCalls.length * 100).toFixed(1)
      : '100.0';
    const avgLatency = apiCalls.length > 0
      ? Math.round(apiCalls.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / apiCalls.length)
      : 0;

    const activeSessions = scramblingSessions.filter(s => s.status === 'active');
    const avgProtection = activeSessions.length > 0
      ? Math.round(activeSessions.reduce((sum, s) => sum + (s.protection_score || 0), 0) / activeSessions.length)
      : 0;
    const totalIterations = activeSessions.reduce((sum, s) => sum + (s.iterations || 0), 0);
    const compliantLayers = activeSessions.filter(s => (s.scramble_interval_seconds || 0) <= 0.01).length;

    const activeTokens = hardwareTokens.filter(t => t.is_active).length;
    const lockedTokens = hardwareTokens.filter(t => t.failed_attempts >= 3).length;

    const activeUniverses = universes.filter(u => u.status === 'active').length;
    const degradedUniverses = universes.filter(u => u.status === 'degraded').length;
    const offlineUniverses = universes.filter(u => u.status === 'offline').length;
    const avgSuccessRate = universes.length > 0
      ? Math.round(universes.reduce((sum, u) => sum + (u.success_rate || 0), 0) / universes.length)
      : 0;

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const expiredSubscriptions = subscriptions.filter(s => s.status === 'expired').length;

    const pendingTokenRegs = tokenRegistrations.filter(t => t.registration_status === 'pending').length;
    const activatedTokenRegs = tokenRegistrations.filter(t => t.registration_status === 'activated').length;

    const activeIncidentRules = incidentRules.filter(r => r.is_active).length;
    const activeWebhooks = webhooks.filter(w => w.is_active).length;

    const unresolvedFeedback = auditFeedback.filter(f => f.status !== 'resolved').length;

    // ── Build PDF ──
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 0;

    const addHeader = () => {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(34, 211, 238);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('THREE-PILLAR SECURITY SYSTEM', margin, 13);
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text('Comprehensive Security Audit & System Health Report', margin, 21);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 13);
      doc.text(`Period: Last ${daysBack} days`, pageWidth - margin - 60, 19);
      doc.text('DEMO — Internal Testing', pageWidth - margin - 60, 25);
      y = 42;
      doc.setTextColor(0, 0, 0);
    };

    const addFooter = (pageNum) => {
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('Three-Pillar Security System · Comprehensive Audit Report · DEMO ENVIRONMENT (INTERNAL TESTING ONLY)', margin, pageHeight - 8);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 15, pageHeight - 8);
      doc.setTextColor(0, 0, 0);
    };

    const ensureSpace = (needed) => {
      if (y + needed > pageHeight - 15) {
        doc.addPage();
        addHeader();
      }
    };

    const sectionTitle = (title) => {
      ensureSpace(20);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(title, margin, y);
      doc.setDrawColor(34, 211, 238);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    };

    const metricLine = (label, value, indent = 0) => {
      ensureSpace(8);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(label, margin + indent, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), pageWidth - margin - 5, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      y += 7;
    };

    const tableHeader = (headers, colWidths) => {
      ensureSpace(10);
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      let x = margin + 2;
      headers.forEach((h, i) => {
        doc.text(h, x, y);
        x += colWidths[i];
      });
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    };

    const tableRow = (cells, colWidths) => {
      ensureSpace(7);
      doc.setFontSize(8);
      let x = margin + 2;
      cells.forEach((c, i) => {
        const val = typeof c === 'string' ? c.substring(0, Math.floor(colWidths[i] / 1.8)) : String(c);
        doc.text(val, x, y);
        x += colWidths[i];
      });
      y += 6;
    };

    // ═══════════════════════════════════════════
    // PAGE 1: COVER + EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════
    addHeader();

    sectionTitle('Executive Summary');
    metricLine('Report Period', `Last ${daysBack} days`);
    metricLine('Generated By', user?.email || 'System');
    metricLine('Environment', 'DEMO — Internal Testing');
    y += 5;

    sectionTitle('Security Posture Overview');
    metricLine('Total Security Events', recentLogs.length);
    metricLine('Critical/Emergency Alerts', criticalAlerts);
    metricLine('High Severity Alerts', highAlerts);
    metricLine('Open/Investigating Alerts', openAlerts);
    metricLine('Confirmed Threats', confirmedAlerts);
    metricLine('Resolved Alerts', resolvedAlerts);
    metricLine('False Positives', falsePositives);
    metricLine('Behavioral Anomalies Detected', recentAnomalies.length);
    metricLine('Active Threat Correlations', activeThreatCorrelations);
    y += 5;

    sectionTitle('System Health Overview');
    metricLine('API Success Rate', `${apiSuccessRate}%`);
    metricLine('Average API Latency', `${avgLatency}ms`);
    metricLine('Failed API Calls', failedApiCalls.length);
    metricLine('Active API Universes', `${activeUniverses} / ${universes.length}`);
    metricLine('Degraded Universes', degradedUniverses);
    metricLine('Offline Universes', offlineUniverses);
    metricLine('Avg Universe Success Rate', `${avgSuccessRate}%`);
    y += 5;

    sectionTitle('Scrambling System Health');
    metricLine('Active Scrambling Sessions', activeSessions.length);
    metricLine('Compliant Layers (≤10ms)', `${compliantLayers} / ${activeSessions.length}`);
    metricLine('Average Protection Score', avgProtection);
    metricLine('Total Iterations (7d)', totalIterations);
    y += 5;

    sectionTitle('Authentication & Token Health');
    metricLine('Active Hardware Tokens', activeTokens);
    metricLine('Locked Tokens (3+ failures)', lockedTokens);
    metricLine('DNA Verifications', dnaVerified);
    metricLine('Failed Auth Attempts', failedAuths);
    metricLine('Suspicious Activity Events', suspiciousEvents);
    metricLine('Pending Token Registrations', pendingTokenRegs);
    metricLine('Activated Token Registrations', activatedTokenRegs);

    // ═══════════════════════════════════════════
    // PAGE 2: DETAILED ALERTS
    // ═══════════════════════════════════════════
    doc.addPage();
    addHeader();

    sectionTitle('Recent Criminal Activity Alerts');
    if (recentAlerts.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No alerts in the selected period.', margin, y);
      y += 10;
    } else {
      const colW = [25, 20, 25, 25, 35, 40];
      tableHeader(['Type', 'Severity', 'Status', 'IP Address', 'Indicators', 'Date'], colW);
      recentAlerts.slice(0, 25).forEach(alert => {
        tableRow([
          alert.alert_type || '—',
          (alert.severity || '—').toUpperCase(),
          alert.status || '—',
          alert.ip_address || '—',
          (alert.indicators || []).join(', ').substring(0, 30) || '—',
          alert.created_date ? new Date(alert.created_date).toLocaleDateString() : '—',
        ], colW);
      });
    }
    y += 8;

    sectionTitle('Recent Behavioral Anomalies');
    if (recentAnomalies.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No anomalies detected in the selected period.', margin, y);
      y += 10;
    } else {
      const colW = [40, 25, 20, 25, 40];
      tableHeader(['User', 'Anomaly Type', 'Severity', 'Status', 'AI Reasoning'], colW);
      recentAnomalies.slice(0, 20).forEach(anom => {
        tableRow([
          (anom.user_identifier || '—').substring(0, 25),
          (anom.anomaly_type || '—').replace(/_/g, ' '),
          (anom.severity || '—'),
          anom.status || '—',
          (anom.ai_reasoning || '—').substring(0, 35),
        ], colW);
      });
    }

    // ═══════════════════════════════════════════
    // PAGE 3: SECURITY LOGS
    // ═══════════════════════════════════════════
    doc.addPage();
    addHeader();

    sectionTitle('Security Event Log');
    if (recentLogs.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No security events in the selected period.', margin, y);
      y += 10;
    } else {
      const colW = [35, 25, 20, 25, 45];
      tableHeader(['Event Type', 'Threat Level', 'Success', 'IP Address', 'Details'], colW);
      recentLogs.slice(0, 30).forEach(log => {
        tableRow([
          (log.event_type || '—').replace(/_/g, ' '),
          log.threat_level || 'none',
          log.success ? 'Yes' : 'No',
          log.ip_address || '—',
          (log.details || '—').substring(0, 40),
        ], colW);
      });
    }
    y += 8;

    sectionTitle('Active Threat Correlations');
    if (threatCorrelations.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No threat correlations detected.', margin, y);
      y += 10;
    } else {
      const colW = [50, 20, 20, 25, 35];
      tableHeader(['Attack Chain', 'Severity', 'Status', 'Confidence', 'Affected Systems'], colW);
      threatCorrelations.slice(0, 15).forEach(tc => {
        tableRow([
          (tc.attack_chain_name || '—').substring(0, 30),
          tc.severity || '—',
          tc.status || '—',
          `${tc.confidence_score || 0}%`,
          (tc.affected_systems || []).join(', ').substring(0, 30) || '—',
        ], colW);
      });
    }

    // ═══════════════════════════════════════════
    // PAGE 4: SYSTEM HEALTH DETAILS
    // ═══════════════════════════════════════════
    doc.addPage();
    addHeader();

    sectionTitle('API Universe Health');
    if (universes.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No universes registered.', margin, y);
      y += 10;
    } else {
      const colW = [40, 20, 20, 20, 25];
      tableHeader(['Universe', 'Status', 'Success %', 'Errors', 'Last Check'], colW);
      universes.slice(0, 25).forEach(u => {
        tableRow([
          (u.name || '—').substring(0, 25),
          u.status || '—',
          `${u.success_rate || 0}%`,
          String(u.error_count || 0),
          u.last_check ? new Date(u.last_check).toLocaleDateString() : '—',
        ], colW);
      });
    }
    y += 8;

    sectionTitle('Scrambling Session Details');
    if (activeSessions.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No active scrambling sessions.', margin, y);
      y += 10;
    } else {
      const colW = [35, 20, 20, 20, 25];
      tableHeader(['Scramble Type', 'Status', 'Protection', 'Iterations', 'Interval (s)'], colW);
      activeSessions.slice(0, 15).forEach(s => {
        tableRow([
          (s.scramble_type || '—').replace(/_/g, ' '),
          s.status || '—',
          `${s.protection_score || 0}`,
          String(s.iterations || 0),
          String(s.scramble_interval_seconds || 0),
        ], colW);
      });
    }
    y += 8;

    sectionTitle('Hardware Token Status');
    if (hardwareTokens.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No hardware tokens registered.', margin, y);
      y += 10;
    } else {
      const colW = [35, 20, 20, 25, 25];
      tableHeader(['Device Name', 'Active', 'Failed Attempts', 'Last Used', 'Device ID'], colW);
      hardwareTokens.slice(0, 15).forEach(t => {
        tableRow([
          (t.device_name || '—').substring(0, 22),
          t.is_active ? 'Yes' : 'No',
          String(t.failed_attempts || 0),
          t.last_used ? new Date(t.last_used).toLocaleDateString() : '—',
          (t.device_id || '—').substring(0, 20),
        ], colW);
      });
    }

    // ═══════════════════════════════════════════
    // PAGE 5: INCIDENT RULES, WEBHOOKS, SUBSCRIPTIONS, AUDIT FEEDBACK
    // ═══════════════════════════════════════════
    doc.addPage();
    addHeader();

    sectionTitle('Incident Response Rules');
    metricLine('Total Rules', incidentRules.length);
    metricLine('Active Rules', activeIncidentRules);
    if (incidentRules.length > 0) {
      const colW = [35, 25, 20, 20, 25];
      tableHeader(['Rule Name', 'Trigger Type', 'Min Severity', 'Active', 'Executions'], colW);
      incidentRules.slice(0, 15).forEach(r => {
        tableRow([
          (r.rule_name || '—').substring(0, 22),
          r.trigger_type || '—',
          r.min_severity || '—',
          r.is_active ? 'Yes' : 'No',
          String(r.execution_count || 0),
        ], colW);
      });
    }
    y += 8;

    sectionTitle('Webhook Integrations');
    metricLine('Total Webhooks', webhooks.length);
    metricLine('Active Webhooks', activeWebhooks);
    if (webhooks.length > 0) {
      const colW = [35, 25, 20, 25, 25];
      tableHeader(['Webhook Name', 'Target URL', 'Active', 'Trigger Count', 'Last Status'], colW);
      webhooks.slice(0, 10).forEach(w => {
        tableRow([
          (w.webhook_name || '—').substring(0, 22),
          (w.target_url || '—').substring(0, 20),
          w.is_active ? 'Yes' : 'No',
          String(w.trigger_count || 0),
          w.last_response_status ? String(w.last_response_status) : '—',
        ], colW);
      });
    }
    y += 8;

    sectionTitle('Subscription Status');
    metricLine('Active Subscriptions', activeSubscriptions);
    metricLine('Expired Subscriptions', expiredSubscriptions);
    y += 8;

    sectionTitle('Audit Feedback Summary');
    metricLine('Total Feedback Entries', auditFeedback.length);
    metricLine('Unresolved Feedback', unresolvedFeedback);
    if (auditFeedback.length > 0) {
      const colW = [30, 20, 20, 20, 40];
      tableHeader(['Auditor', 'Category', 'Severity', 'Status', 'Observation'], colW);
      auditFeedback.slice(0, 10).forEach(f => {
        tableRow([
          (f.auditor_email || '—').substring(0, 18),
          f.category || '—',
          f.severity || '—',
          f.status || '—',
          (f.observation || '—').substring(0, 35),
        ], colW);
      });
    }

    // ═══════════════════════════════════════════
    // PAGE 6: RECOMMENDATIONS
    // ═══════════════════════════════════════════
    doc.addPage();
    addHeader();

    sectionTitle('Automated Recommendations');

    const recommendations = [];
    if (criticalAlerts > 0) recommendations.push(`URGENT: ${criticalAlerts} critical/emergency alert(s) require immediate investigation.`);
    if (openAlerts > 0) recommendations.push(`${openAlerts} alert(s) remain open or under investigation — prioritize resolution.`);
    if (confirmedAlerts > 0) recommendations.push(`${confirmedAlerts} confirmed threat(s) — review and apply mitigation steps.`);
    if (highThreatLogs > 0) recommendations.push(`${highThreatLogs} high-threat security event(s) logged — review access patterns.`);
    if (failedAuths > 10) recommendations.push(`${failedAuths} failed authentication attempts — consider IP blocking or rate limiting.`);
    if (suspiciousEvents > 0) recommendations.push(`${suspiciousEvents} suspicious activity event(s) — investigate source IPs and user accounts.`);
    if (degradedUniverses > 0) recommendations.push(`${degradedUniverses} API universe(s) in degraded state — check endpoint health.`);
    if (offlineUniverses > 0) recommendations.push(`${offlineUniverses} API universe(s) offline — restore or remove from routing.`);
    if (parseFloat(apiSuccessRate) < 95) recommendations.push(`API success rate at ${apiSuccessRate}% — below 95% threshold, investigate failures.`);
    if (lockedTokens > 0) recommendations.push(`${lockedTokens} hardware token(s) locked due to failed attempts — review and reset if legitimate.`);
    if (compliantLayers < activeSessions.length) recommendations.push(`${activeSessions.length - compliantLayers} scrambling layer(s) exceeding 10ms threshold — tune intervals.`);
    if (unresolvedFeedback > 0) recommendations.push(`${unresolvedFeedback} audit feedback item(s) unresolved — review and address.`);
    if (expiredSubscriptions > 0) recommendations.push(`${expiredSubscriptions} expired subscription(s) — contact users for renewal.`);

    if (recommendations.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(22, 163, 74);
      doc.text('✓ All systems operating within normal parameters. No action required.', margin, y);
    } else {
      doc.setFontSize(10);
      recommendations.forEach((rec, idx) => {
        ensureSpace(12);
        doc.setTextColor(15, 23, 42);
        doc.text(`${idx + 1}.`, margin, y);
        const lines = doc.splitTextToSize(rec, pageWidth - margin * 2 - 10);
        doc.text(lines, margin + 8, y);
        y += lines.length * 6 + 3;
      });
    }

    y += 10;
    sectionTitle('Report Metadata');
    metricLine('Data Sources Queried', '14 entities');
    metricLine('Total Security Logs (period)', recentLogs.length);
    metricLine('Total Criminal Alerts (period)', recentAlerts.length);
    metricLine('Total Anomalies (period)', recentAnomalies.length);
    metricLine('Total API Metrics (period)', recentMetrics.length);
    metricLine('Report Generated', new Date().toLocaleString());

    // ── Footers on all pages ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addFooter(p);
    }

    // ── Upload to storage ──
    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const fileName = `comprehensive-audit-${new Date().toISOString().split('T')[0]}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({
      success: true,
      file_url,
      file_name: fileName,
      pages: totalPages,
      summary: {
        days_back: daysBack,
        security_events: recentLogs.length,
        criminal_alerts: recentAlerts.length,
        behavior_anomalies: recentAnomalies.length,
        critical_alerts: criticalAlerts,
        open_alerts: openAlerts,
        api_success_rate: `${apiSuccessRate}%`,
        avg_latency_ms: avgLatency,
        active_scrambling_sessions: activeSessions.length,
        avg_protection_score: avgProtection,
        active_tokens: activeTokens,
        active_universes: activeUniverses,
        active_subscriptions: activeSubscriptions,
        recommendations_count: recommendations.length,
      },
      message: 'Comprehensive audit PDF generated successfully',
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      success: false,
    }, { status: 500 });
  }
});
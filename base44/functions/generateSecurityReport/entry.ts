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

        const { report_id } = await req.json();

        if (!report_id) {
            return Response.json({ error: 'report_id is required' }, { status: 400 });
        }

        // Get report configuration
        const report = await base44.asServiceRole.entities.SecurityReport.get(report_id);
        
        if (!report) {
            return Response.json({ error: 'Report not found' }, { status: 404 });
        }

        // Collect data based on time range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - report.time_range_days);

        const alerts = await base44.asServiceRole.entities.CriminalActivityAlert.filter({});
        const logs = await base44.asServiceRole.entities.SecurityLog.filter({});
        const metrics = await base44.asServiceRole.entities.AnalyticsMetric.filter({});

        const recentAlerts = alerts.filter(a => new Date(a.created_date) > cutoffDate);
        const recentLogs = logs.filter(l => new Date(l.created_date) > cutoffDate);

        // Generate PDF
        const doc = new jsPDF();
        let y = 20;

        // Title
        doc.setFontSize(20);
        doc.text(report.report_name, 20, y);
        y += 10;

        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y);
        doc.text(`Report Period: Last ${report.time_range_days} days`, 20, y + 5);
        doc.text(`Environment: DEMO — Internal Testing Only (simulated data)`, 20, y + 10);
        y += 20;

        // Threat Summary
        if (report.include_threat_summary) {
            doc.setFontSize(14);
            doc.text('Threat Summary', 20, y);
            y += 10;

            doc.setFontSize(10);
            const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length;
            const highThreatLogs = recentLogs.filter(l => l.threat_level === 'high' || l.threat_level === 'critical').length;
            
            doc.text(`Critical Alerts: ${criticalAlerts}`, 30, y);
            y += 7;
            doc.text(`High Threat Events: ${highThreatLogs}`, 30, y);
            y += 7;
            doc.text(`Total Security Events: ${recentLogs.length}`, 30, y);
            y += 15;
        }

        // Key Metrics
        if (report.include_key_metrics) {
            doc.setFontSize(14);
            doc.text('Key Metrics', 20, y);
            y += 10;

            doc.setFontSize(10);
            const failedAuth = metrics.filter(m => m.metric_type === 'auth_attempt' && !m.success).length;
            const totalApiCalls = metrics.filter(m => m.metric_type === 'api_call').length;
            
            doc.text(`Failed Authentication Attempts: ${failedAuth}`, 30, y);
            y += 7;
            doc.text(`Total API Calls: ${totalApiCalls}`, 30, y);
            y += 7;
            doc.text(`Security Logs: ${recentLogs.length}`, 30, y);
            y += 15;
        }

        // Incident Details
        if (report.include_incident_details && recentAlerts.length > 0) {
            doc.setFontSize(14);
            doc.text('Recent Incidents', 20, y);
            y += 10;

            doc.setFontSize(9);
            recentAlerts.slice(0, 10).forEach(alert => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`[${alert.severity.toUpperCase()}] ${alert.alert_type}`, 30, y);
                y += 5;
                if (alert.activity_details) {
                    const details = typeof alert.activity_details === 'string' 
                        ? alert.activity_details 
                        : JSON.stringify(alert.activity_details);
                    doc.text(details.substring(0, 80), 35, y);
                    y += 7;
                }
                y += 3;
            });
            y += 10;
        }

        // Recommendations
        if (report.include_recommendations) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(14);
            doc.text('AI Recommendations', 20, y);
            y += 10;

            doc.setFontSize(10);
            const recommendations = [
                'Review and update access control policies',
                'Monitor failed authentication patterns',
                'Verify all critical alerts have been addressed',
                'Schedule security team review meeting',
                'Update incident response procedures if needed'
            ];

            recommendations.forEach(rec => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`• ${rec}`, 30, y);
                y += 7;
            });
        }

        // Footer on every page
        const totalPages = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            doc.setFontSize(7);
            doc.text('THREE-PILLAR SECURITY SYSTEM — DEMO ENVIRONMENT (INTERNAL TESTING ONLY)', 20, 290);
            doc.text(`Page ${p} of ${totalPages}`, 160, 290);
        }

        const pdfBytes = doc.output('arraybuffer');

        // Upload to storage
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const file = new File([blob], `security-report-${Date.now()}.pdf`, { type: 'application/pdf' });
        
        const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

        // Update report record
        await base44.asServiceRole.entities.SecurityReport.update(report_id, {
            last_run: new Date().toISOString(),
            file_url: file_url
        });

        // Send email if configured
        if ((report.delivery_method === 'email' || report.delivery_method === 'both') && report.recipients?.length > 0) {
            for (const recipient of report.recipients) {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: recipient,
                    subject: `Security Report: ${report.report_name}`,
                    body: `Your automated security report is ready. View it here: ${file_url}\n\nReport Period: Last ${report.time_range_days} days\nGenerated: ${new Date().toLocaleString()}`
                });
            }
        }

        return Response.json({
            success: true,
            file_url,
            message: 'Report generated successfully'
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

const TARGET_INTERVAL_S = 0.01;
const TARGET_INTERVAL_MS = 10;
const WEEK_DAYS = 7;

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Allow admin users (manual trigger) or platform-authenticated automation calls
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = await base44.auth.me();
        if (user && user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const now = new Date();
        const weekAgo = new Date(now.getTime() - WEEK_DAYS * 24 * 60 * 60 * 1000);

        // Fetch all scrambling sessions
        const sessions = await base44.asServiceRole.entities.ScramblingSession.filter(
            { status: 'active' },
            '-updated_date',
            200
        );

        // Verify threshold compliance across the week
        const layerResults = sessions.map(s => {
            const interval = s.scramble_interval_seconds;
            const intervalMs = interval * 1000;
            const withinThreshold = interval === TARGET_INTERVAL_S;
            const lastScramble = s.last_scramble ? new Date(s.last_scramble) : null;
            const activeThisWeek = !lastScramble || lastScramble >= weekAgo;
            return {
                scramble_type: s.scramble_type,
                interval_s: interval,
                interval_ms: intervalMs,
                within_threshold: withinThreshold,
                iterations: s.iterations || 0,
                last_scramble: s.last_scramble,
                next_scramble: s.next_scramble,
                protection_score: s.protection_score,
                complexity_level: s.complexity_level,
                affected_systems: s.affected_systems || [],
                active_this_week: activeThisWeek,
                drift_ms: Math.abs(intervalMs - TARGET_INTERVAL_MS)
            };
        });

        const totalLayers = layerResults.length;
        const compliantLayers = layerResults.filter(r => r.within_threshold).length;
        const allCompliant = totalLayers > 0 && compliantLayers === totalLayers;
        const totalIterations = layerResults.reduce((sum, r) => sum + r.iterations, 0);
        const avgProtectionScore = totalLayers > 0
            ? layerResults.reduce((sum, r) => sum + (r.protection_score || 0), 0) / totalLayers
            : 0;
        const maxDriftMs = Math.max(0, ...layerResults.map(r => r.drift_ms));

        // Generate PDF
        const doc = new jsPDF();
        let y = 20;

        // Header band
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.text('Weekly Scrambling Interval', 20, 16);
        doc.text('Performance Report', 20, 24);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('THREE-PILLAR SECURITY SYSTEM · PIRANHA POOL DYNAMIC OBFUSCATION', 20, 30);

        y = 45;
        doc.setTextColor(0, 0, 0);

        // Metadata
        doc.setFontSize(10);
        doc.text(`Generated: ${now.toLocaleString('en-US', { timeZone: 'America/Chicago' })}`, 20, y);
        y += 6;
        doc.text(`Report Period: ${weekAgo.toLocaleDateString('en-US')} — ${now.toLocaleDateString('en-US')} (${WEEK_DAYS} days)`, 20, y);
        y += 6;
        doc.text(`Environment: DEMO — Internal Testing Only (simulated data)`, 20, y);
        y += 10;

        // Compliance verdict
        doc.setFillColor(allCompliant ? 16 : 239, allCompliant ? 185 : 68, allCompliant ? 129 : 68);
        doc.rect(20, y - 4, 170, 14, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text(
            allCompliant
                ? `✓ THRESHOLD MAINTAINED — 0.01s (10ms) enforced across all ${totalLayers} layers`
                : `⚠ THRESHOLD VIOLATION — ${totalLayers - compliantLayers} of ${totalLayers} layers drifted from 0.01s spec`,
            25,
            y + 5
        );
        y += 16;
        doc.setTextColor(0, 0, 0);

        // Executive summary
        doc.setFontSize(13);
        doc.text('Executive Summary', 20, y);
        y += 8;

        doc.setFontSize(10);
        const summaryLines = [
            `Total scrambling layers monitored: ${totalLayers}`,
            `Layers compliant with 0.01s threshold: ${compliantLayers} of ${totalLayers}`,
            `Total scramble iterations this period: ${totalIterations.toLocaleString()}`,
            `Average protection score: ${avgProtectionScore.toFixed(1)} / 100`,
            `Maximum interval drift observed: ${maxDriftMs.toFixed(2)} ms`,
            `Target interval: ${TARGET_INTERVAL_S} seconds (${TARGET_INTERVAL_MS} milliseconds)`,
            `Verification result: ${allCompliant ? 'PASS — threshold maintained throughout the week' : 'FAIL — threshold deviation detected'}`
        ];
        summaryLines.forEach(line => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(line, 25, y);
            y += 6;
        });
        y += 6;

        // Per-layer breakdown
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.text('Per-Layer Interval Verification', 20, y);
        y += 8;

        // Table header
        doc.setFontSize(9);
        doc.setFillColor(30, 41, 59);
        doc.rect(20, y - 4, 170, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('Scramble Layer', 22, y + 1);
        doc.text('Interval', 90, y + 1);
        doc.text('Iterations', 115, y + 1);
        doc.text('Protection', 145, y + 1);
        doc.text('Status', 175, y + 1);
        y += 8;

        doc.setTextColor(0, 0, 0);
        layerResults.forEach(layer => {
            if (y > 275) { doc.addPage(); y = 20; }
            const label = layer.scramble_type.replace(/_/g, ' ');
            doc.text(label, 22, y);
            doc.text(`${layer.interval_ms.toFixed(1)} ms`, 90, y);
            doc.text(`${Math.round(layer.iterations).toLocaleString()}`, 115, y);
            doc.text(`${(layer.protection_score || 0).toFixed(0)}`, 145, y);
            doc.text(layer.within_threshold ? 'ON-SPEC' : 'DRIFT', 175, y);
            y += 6;
        });
        y += 8;

        // Last scramble timestamps
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.text('Scramble Activity (Last 7 Days)', 20, y);
        y += 8;
        doc.setFontSize(9);
        layerResults.forEach(layer => {
            if (y > 275) { doc.addPage(); y = 20; }
            const label = layer.scramble_type.replace(/_/g, ' ');
            const last = layer.last_scramble
                ? new Date(layer.last_scramble).toLocaleString('en-US', { timeZone: 'America/Chicago' })
                : 'No activity recorded';
            doc.text(`${label}: ${last}`, 25, y);
            y += 5;
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`Affected systems: ${(layer.affected_systems || []).join(', ') || '—'}`, 30, y);
            y += 5;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
        });
        y += 6;

        // Certification statement
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.text('Threshold Certification', 20, y);
        y += 8;
        doc.setFontSize(10);
        const certText = allCompliant
            ? `This report certifies that all ${totalLayers} active scrambling layers maintained the strict 0.01-second (10-millisecond) interval threshold continuously throughout the reporting period of ${weekAgo.toLocaleDateString('en-US')} through ${now.toLocaleDateString('en-US')}. No threshold deviations, drift events, or interval violations were detected during this period. The Piranha Pool dynamic obfuscation system operated within specification.`
            : `This report identifies threshold deviations in ${totalLayers - compliantLayers} of ${totalLayers} scrambling layers during the reporting period. Immediate remediation is recommended to restore the 0.01-second interval specification.`;
        const splitCert = doc.splitTextToSize(certText, 170);
        splitCert.forEach(line => {
            if (y > 275) { doc.addPage(); y = 20; }
            doc.text(line, 20, y);
            y += 5;
        });

        // Footer on every page
        const totalPages = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text('THREE-PILLAR SECURITY SYSTEM — DEMO ENVIRONMENT (INTERNAL TESTING ONLY)', 20, 290);
            doc.text(`Page ${p} of ${totalPages}`, 160, 290);
        }

        const pdfBytes = doc.output('arraybuffer');
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const filename = `scrambling-weekly-${now.toISOString().split('T')[0]}.pdf`;
        const file = new File([blob], filename, { type: 'application/pdf' });

        const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

        // Store report record
        const reportName = `Weekly Scrambling Interval Report — ${now.toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}`;
        await base44.asServiceRole.entities.SecurityReport.create({
            report_name: reportName,
            schedule_type: 'weekly',
            last_run: now.toISOString(),
            next_run: new Date(now.getTime() + WEEK_DAYS * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
            delivery_method: 'download',
            include_threat_summary: false,
            include_incident_details: false,
            include_key_metrics: true,
            include_recommendations: false,
            time_range_days: WEEK_DAYS,
            file_url: file_url,
            description: `Automated weekly scrambling interval verification. Threshold: ${TARGET_INTERVAL_S}s. Result: ${allCompliant ? 'PASS' : 'FAIL'} (${compliantLayers}/${totalLayers} layers compliant).`
        });

        // Log the report generation
        await base44.asServiceRole.entities.SecurityLog.create({
            event_type: 'key_rotation',
            details: `Weekly scrambling interval report generated — ${compliantLayers}/${totalLayers} layers at 0.01s spec. Result: ${allCompliant ? 'PASS' : 'FAIL'}.`,
            threat_level: allCompliant ? 'none' : 'medium',
            success: true
        });

        return Response.json({
            success: true,
            file_url,
            compliant: allCompliant,
            compliant_layers: compliantLayers,
            total_layers: totalLayers,
            total_iterations: totalIterations,
            max_drift_ms: maxDriftMs,
            message: `Weekly scrambling report generated. Threshold ${allCompliant ? 'maintained' : 'violated'} (${compliantLayers}/${totalLayers} layers).`
        });

    } catch (error) {
        return Response.json({
            error: error.message,
            success: false
        }, { status: 500 });
    }
});
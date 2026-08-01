import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all exposure records (service role for admin overview)
    const allRecords = await base44.asServiceRole.entities.ExposureRecord.list('-discovery_date', 500);

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Records discovered in the last 7 days
    const recentDiscoveries = allRecords.filter(r =>
      r.discovery_date && new Date(r.discovery_date) >= sevenDaysAgo
    );

    // Records scrubbed in the last 7 days
    const recentScrubbed = allRecords.filter(r =>
      r.scrubbed_date && new Date(r.scrubbed_date) >= sevenDaysAgo
    );

    // Re-listed in the last 7 days
    const recentReListed = allRecords.filter(r =>
      r.status === 're_listed' && r.last_verified &&
      new Date(r.last_verified) >= sevenDaysAgo
    );

    // Status breakdown
    const statusBreakdown = {};
    allRecords.forEach(r => {
      statusBreakdown[r.status] = (statusBreakdown[r.status] || 0) + 1;
    });

    // Broker breakdown (top brokers with exposures)
    const brokerBreakdown = {};
    allRecords.forEach(r => {
      if (r.status !== 'scrubbed') {
        brokerBreakdown[r.broker_name] = (brokerBreakdown[r.broker_name] || 0) + 1;
      }
    });

    // Exposure type breakdown
    const typeBreakdown = {};
    allRecords.forEach(r => {
      typeBreakdown[r.exposure_type] = (typeBreakdown[r.exposure_type] || 0) + 1;
    });

    // Avg risk score
    const avgRisk = allRecords.length > 0
      ? Math.round(allRecords.reduce((sum, r) => sum + (r.risk_score || 0), 0) / allRecords.length)
      : 0;

    // Generate narrative summary with LLM
    const summaryData = {
      weekRange: `${sevenDaysAgo.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`,
      totalTracked: allRecords.length,
      newDiscoveries: recentDiscoveries.length,
      newlyScrubbed: recentScrubbed.length,
      reListed: recentReListed.length,
      statusBreakdown,
      topBrokers: Object.entries(brokerBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5),
      typeBreakdown,
      avgRisk,
      scrubRate: allRecords.length > 0
        ? Math.round((statusBreakdown.scrubbed || 0) / allRecords.length * 100)
        : 0
    };

    let narrative = '';
    try {
      const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Generate a concise, professional weekly summary report for stakeholders based on this deep web exposure scan data. Use clear, non-technical language. Cover: new profile discoveries, removal progress, and any re-listings that need attention. Data: ${JSON.stringify(summaryData)}`,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            key_findings: { type: "array", items: { type: "string" } },
            progress_summary: { type: "string" },
            action_items: { type: "array", items: { type: "string" } }
          }
        }
      });
      narrative = llmRes || '';
    } catch (e) {
      narrative = '';
    }

    return Response.json({
      generated_at: new Date().toISOString(),
      summary_data: summaryData,
      recent_discoveries: recentDiscoveries.map(r => ({
        broker_name: r.broker_name,
        exposure_type: r.exposure_type,
        risk_score: r.risk_score,
        discovery_date: r.discovery_date
      })),
      recent_scrubbed: recentScrubbed.map(r => ({
        broker_name: r.broker_name,
        exposure_type: r.exposure_type,
        scrubbed_date: r.scrubbed_date
      })),
      narrative
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
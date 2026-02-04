import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, api_key } = await req.json();

    // Determine rate limit based on user role
    const rateLimit = user.role === 'admin' ? 1000 : 100;

    // Check logs from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const recentLogs = await base44.asServiceRole.entities.RateLimitLog.filter({
      user_email: user.email,
    });

    // Filter to last hour
    const logsInWindow = recentLogs.filter(log => 
      new Date(log.created_date).getTime() > Date.now() - 60 * 60 * 1000
    );

    const totalRequests = logsInWindow.reduce((sum, log) => sum + (log.requests_count || 1), 0);
    const limitExceeded = totalRequests >= rateLimit;

    // Log this request
    if (!limitExceeded) {
      await base44.asServiceRole.entities.RateLimitLog.create({
        user_email: user.email,
        api_key_id: api_key || null,
        endpoint: endpoint || 'unknown',
        requests_count: 1,
        window_start: new Date(Date.now() - (Date.now() % (60 * 60 * 1000))).toISOString(),
        limit_exceeded: false,
        user_role: user.role,
      });
    } else {
      // Log exceeded attempt
      await base44.asServiceRole.entities.RateLimitLog.create({
        user_email: user.email,
        api_key_id: api_key || null,
        endpoint: endpoint || 'unknown',
        requests_count: 1,
        window_start: new Date(Date.now() - (Date.now() % (60 * 60 * 1000))).toISOString(),
        limit_exceeded: true,
        user_role: user.role,
      });
    }

    return Response.json({
      allowed: !limitExceeded,
      limit: rateLimit,
      remaining: Math.max(0, rateLimit - totalRequests),
      reset_in_seconds: 3600 - Math.floor((Date.now() / 1000) % 3600),
      current_usage: totalRequests,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
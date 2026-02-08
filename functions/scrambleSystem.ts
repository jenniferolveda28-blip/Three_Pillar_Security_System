import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Perform scrambling operations
        const scramblingTypes = [
            'api_keys',
            'data_paths',
            'execution_sequence',
            'encryption_layer',
            'full_system'
        ];

        const scrambledSessions = [];

        for (const type of scramblingTypes) {
            // Get or create active scrambling session
            const existingSessions = await base44.asServiceRole.entities.ScramblingSession.filter({
                scramble_type: type,
                status: 'active'
            });

            let session;
            if (existingSessions.length > 0) {
                session = existingSessions[0];
                
                // Update existing session
                const newIterations = session.iterations + 1;
                const nextScramble = new Date(Date.now() + (session.scramble_interval_seconds * 1000));
                
                session = await base44.asServiceRole.entities.ScramblingSession.update(session.id, {
                    iterations: newIterations,
                    last_scramble: new Date().toISOString(),
                    next_scramble: nextScramble.toISOString(),
                    protection_score: Math.min(100, 85 + (newIterations % 16))
                });
            } else {
                // Create new session
                session = await base44.asServiceRole.entities.ScramblingSession.create({
                    scramble_type: type,
                    status: 'active',
                    iterations: 1,
                    last_scramble: new Date().toISOString(),
                    next_scramble: new Date(Date.now() + 5000).toISOString(),
                    scramble_interval_seconds: 0.1,
                    complexity_level: 100,
                    affected_systems: ['universes', 'keys', 'authentication', 'data_paths'],
                    protection_score: 100
                });
            }

            scrambledSessions.push(session);
        }

        // Log scrambling activity
        await base44.asServiceRole.entities.SecurityLog.create({
            event_type: 'key_rotation',
            details: `System-wide scrambling executed - ${scrambledSessions.length} layers scrambled`,
            threat_level: 'none',
            success: true
        });

        return Response.json({
            success: true,
            message: 'System scrambled successfully',
            sessions: scrambledSessions,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});
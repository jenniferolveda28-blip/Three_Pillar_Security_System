import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { intent } = await req.json();
        const startTime = Date.now();

        // Get all available universes
        const universes = await base44.entities.Universe.filter({ status: 'active' });

        if (universes.length === 0) {
            return Response.json({ 
                error: 'No active universes available',
                suggestion: 'Add some API connections first'
            }, { status: 400 });
        }

        // Use AI to route the request
        const routingPrompt = `
You are an intelligent API router. Given a user's intent and available API services, decide which one to use.

User Intent: "${intent}"

Available Services:
${universes.map(u => `- ${u.name}: ${u.description} (capabilities: ${u.capabilities?.join(', ')})`).join('\n')}

Respond with JSON containing:
- "universe": the exact name of the service to use
- "reasoning": brief explanation of why you chose it
- "endpoint": suggested endpoint path or action
- "confidence": 0-100 score of how confident you are
`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: routingPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    universe: { type: "string" },
                    reasoning: { type: "string" },
                    endpoint: { type: "string" },
                    confidence: { type: "number" }
                }
            }
        });

        const selectedUniverse = universes.find(u => u.name === aiResponse.universe);
        
        if (!selectedUniverse) {
            return Response.json({
                error: 'Could not match intent to any universe',
                ai_suggestion: aiResponse
            }, { status: 404 });
        }

        // For demo: use AI to generate mock response based on the intent
        const mockPrompt = `Generate a realistic API response for this request: "${intent}". 
Keep it concise and realistic. Return only the data, no explanations.`;

        const mockResponse = await base44.integrations.Core.InvokeLLM({
            prompt: mockPrompt,
            add_context_from_internet: true
        });

        const latency = Date.now() - startTime;

        // Update universe success rate
        await base44.entities.Universe.update(selectedUniverse.id, {
            success_rate: Math.min(100, (selectedUniverse.success_rate || 100) + 1),
            last_check: new Date().toISOString()
        });

        return Response.json({
            universe: aiResponse.universe,
            reasoning: aiResponse.reasoning,
            confidence: aiResponse.confidence,
            result: mockResponse,
            latency,
            fallback_used: false
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});
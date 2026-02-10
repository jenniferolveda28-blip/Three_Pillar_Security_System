import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type } = await req.json();
        const runwayApiKey = Deno.env.get('RUNWAY_API_KEY');

        if (!runwayApiKey) {
            return Response.json({ 
                error: 'RUNWAY_API_KEY not configured. Please add your Runway API key in the dashboard settings.',
                success: false 
            }, { status: 500 });
        }

        let prompt = '';
        
        if (type === 'demo') {
            prompt = `Professional product demonstration video: Three-Pillar Security System with DNA authentication, futuristic UI showing real-time threat detection dashboard with blue and purple color scheme, modern tech aesthetic, smooth camera movements`;
        } else if (type === 'explainer') {
            prompt = `Educational explainer video: cybersecurity concepts illustrated with clean animations, showing three pillars (biometric DNA, universal API gateway, dynamic scrambling), infographic style with icons and diagrams, professional business presentation`;
        }

        // Generate video with Runway Gen-3 Alpha
        const runwayResponse = await fetch('https://api.runwayml.com/v1/image_to_video', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${runwayApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gen3a_turbo',
                prompt_text: prompt,
                duration: type === 'demo' ? 10 : 10,
                ratio: '16:9'
            })
        });

        if (!runwayResponse.ok) {
            const errorData = await runwayResponse.text();
            throw new Error(`Runway API error: ${errorData}`);
        }

        const runwayData = await runwayResponse.json();
        const taskId = runwayData.id;

        // Poll for completion
        let videoUrl = null;
        let attempts = 0;
        const maxAttempts = 60;

        while (attempts < maxAttempts && !videoUrl) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const statusResponse = await fetch(`https://api.runwayml.com/v1/tasks/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${runwayApiKey}`,
                }
            });

            const statusData = await statusResponse.json();
            
            if (statusData.status === 'SUCCEEDED') {
                videoUrl = statusData.output?.[0];
                break;
            } else if (statusData.status === 'FAILED') {
                throw new Error('Video generation failed');
            }
            
            attempts++;
        }

        if (!videoUrl) {
            throw new Error('Video generation timed out');
        }

        // Download and upload to our storage
        const videoResponse = await fetch(videoUrl);
        const videoBlob = await videoResponse.blob();
        const file = new File([videoBlob], `video-${type}-${Date.now()}.mp4`, { type: 'video/mp4' });
        const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

        return Response.json({
            success: true,
            file_url
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});
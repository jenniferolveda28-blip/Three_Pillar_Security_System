import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type } = await req.json();
        const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');

        if (!elevenlabsApiKey) {
            return Response.json({ 
                error: 'ELEVENLABS_API_KEY not configured. Please add your ElevenLabs API key in the dashboard settings.',
                success: false 
            }, { status: 500 });
        }

        let script = '';
        
        if (type === 'intro') {
            script = `Welcome to the future of cybersecurity. Today we're diving into a revolutionary system that makes hacking designed to be computationally infeasible.

Picture this: A security architecture so advanced, it uses your DNA for authentication. Not your fingerprint. Not your face. Your actual DNA. Combined with technology that scrambles API keys every 30 milliseconds, making stolen credentials worthless before hackers can use them.

This is the Three-Pillar Security System. And it's about to change everything about how we protect our digital lives.

Over the next few minutes, we'll explore how this breakthrough technology is protecting Fortune 500 companies, government agencies, and could soon protect you too.`;

        } else if (type === 'deepdive') {
            script = `Welcome to this deep dive on the Three-Pillar Security System. We're facing a cybersecurity crisis. Traditional passwords, even two-factor authentication, are being breached daily.

Our first pillar: DNA biometric authentication. Using a breathalyzer device, we capture your unique genetic signature. It's converted to an irreversible hash, making it impossible to steal or replicate.

Second pillar: The Universal API Gateway. One hardware token replaces hundreds of passwords. It connects to all your accounts through intelligent routing that adapts in real-time.

Third pillar: Dynamic Scrambling. Every 30 milliseconds, the system reorganizes its internal structure. API keys, data paths, execution sequences all shift continuously. It's like trying to break into a building that's constantly rearranging its rooms.

The AI threat detection layer monitors millions of data points, identifying attack patterns before they succeed. We've seen simulated attacks neutralized in under 50 milliseconds.

For businesses, adoption is seamless. The system integrates with existing infrastructure. For individuals, it's a single device that protects everything.

This isn't just better security. It's a fundamental shift in how we think about digital protection. The future is here.`;
        }

        // Generate audio with ElevenLabs
        const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Default voice (Rachel)
        
        const audioResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': elevenlabsApiKey
            },
            body: JSON.stringify({
                text: script,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!audioResponse.ok) {
            const errorData = await audioResponse.text();
            throw new Error(`ElevenLabs API error: ${errorData}`);
        }

        const audioBlob = await audioResponse.blob();
        const file = new File([audioBlob], `podcast-${type}-${Date.now()}.mp3`, { type: 'audio/mpeg' });
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
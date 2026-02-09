import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type } = await req.json();

        let script = '';
        
        if (type === 'intro') {
            script = `Write a compelling 2-minute podcast introduction script about:

"Welcome to the future of cybersecurity. Today we're diving into a revolutionary system that makes hacking mathematically impossible.

Picture this: A security architecture so advanced, it uses your DNA for authentication. Not your fingerprint. Not your face. Your actual DNA. Combined with technology that scrambles API keys every few seconds, making stolen credentials worthless before hackers can use them.

This is the Three-Pillar Security System. And it's about to change everything about how we protect our digital lives.

I'm your host, and over the next few minutes, we'll explore how this breakthrough technology is protecting Fortune 500 companies, government agencies, and could soon protect you too."

Style: Professional, engaging, conversational
Tone: Excited but authoritative`;

        } else if (type === 'deepdive') {
            script = `Write a 15-minute deep-dive podcast script covering:

1. Introduction to the cybersecurity crisis
2. Why traditional security fails
3. Pillar 1: DNA biometric authentication explained
4. Pillar 2: Universal API gateway technology
5. Pillar 3: Dynamic scrambling defense
6. Real-world attack scenarios and how system responds
7. AI threat detection capabilities
8. Market opportunity and future vision
9. How businesses can adopt this technology
10. Q&A addressing common concerns

Style: In-depth, educational, engaging
Include: Technical details explained simply, real examples, actionable insights`;
        }

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `${script}\n\nGenerate a complete podcast script with timestamps, speaking cues, and transition points.`,
            response_json_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    duration_minutes: { type: "number" },
                    segments: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                timestamp: { type: "string" },
                                content: { type: "string" },
                                speaking_notes: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        const audioScript = JSON.stringify(response, null, 2);
        const textBlob = new Blob([
            `PODCAST SCRIPT - ${type.toUpperCase()}\n\n` +
            `This is your podcast script.\n` +
            `Use this with text-to-speech tools or record it yourself.\n\n` +
            `Script:\n${audioScript}\n\n` +
            `To create the audio file:\n` +
            `1. Read this script and record yourself\n` +
            `2. Use text-to-speech tools like ElevenLabs, Play.ht, or Google TTS\n` +
            `3. Edit in Audacity or similar audio software\n` +
            `4. Export as MP3 for podcast platforms`
        ], { type: 'text/plain' });
        
        const file = new File([textBlob], `podcast-script-${type}-${Date.now()}.txt`, { type: 'text/plain' });
        const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

        return Response.json({
            success: true,
            file_url,
            note: 'Podcast script generated. Record this with text-to-speech tools or your own voice.'
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});
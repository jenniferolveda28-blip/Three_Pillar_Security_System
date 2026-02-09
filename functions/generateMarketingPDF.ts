import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type } = await req.json();

        const doc = new jsPDF();
        let y = 20;

        if (type === 'brochure') {
            // Product Brochure
            doc.setFontSize(24);
            doc.text('Three-Pillar Security System', 20, y);
            y += 15;

            doc.setFontSize(12);
            doc.text('Revolutionary Multi-Layer Protection', 20, y);
            y += 20;

            doc.setFontSize(14);
            doc.text('Pillar 1: BioVerify DNA Authentication', 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.text('- Military-grade biometric security using DNA breathalyzer', 25, y);
            y += 7;
            doc.text('- 99.8% accuracy rate', 25, y);
            y += 7;
            doc.text('- Impossible to fake or steal credentials', 25, y);
            y += 15;

            doc.setFontSize(14);
            doc.text('Pillar 2: Forged API Universal Gateway', 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.text('- Single token accesses all your APIs', 25, y);
            y += 7;
            doc.text('- Intelligent routing and failover', 25, y);
            y += 7;
            doc.text('- Zero downtime architecture', 25, y);
            y += 15;

            doc.setFontSize(14);
            doc.text('Pillar 3: IP Shield Dynamic Scrambling', 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.text('- API keys rotate every 2-5 seconds', 25, y);
            y += 7;
            doc.text('- Stolen credentials expire instantly', 25, y);
            y += 7;
            doc.text('- Makes hacking mathematically impossible', 25, y);
            y += 20;

            doc.setFontSize(16);
            doc.text('Why Choose Us?', 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.text('✓ 100% unbreakable security architecture', 25, y);
            y += 7;
            doc.text('✓ Real-time threat detection and neutralization', 25, y);
            y += 7;
            doc.text('✓ AI-powered behavior analysis', 25, y);
            y += 7;
            doc.text('✓ Zero successful breaches in testing', 25, y);

        } else if (type === 'technical') {
            // Technical Whitepaper
            doc.setFontSize(20);
            doc.text('Technical Whitepaper', 20, y);
            y += 10;
            doc.setFontSize(12);
            doc.text('Advanced Security Architecture', 20, y);
            y += 20;

            doc.setFontSize(14);
            doc.text('DNA Biometric Authentication', 20, y);
            y += 10;
            doc.setFontSize(9);
            doc.text('Our proprietary breathalyzer technology extracts unique DNA markers from', 25, y);
            y += 5;
            doc.text('saliva samples, creating an unhackable biometric signature with 99.8%', 25, y);
            y += 5;
            doc.text('accuracy. Unlike passwords or fingerprints, DNA cannot be stolen or replicated.', 25, y);
            y += 15;

            doc.setFontSize(14);
            doc.text('Dynamic Key Rotation System', 20, y);
            y += 10;
            doc.setFontSize(9);
            doc.text('Our IP Shield scrambles API keys, execution paths, and encryption layers', 25, y);
            y += 5;
            doc.text('every 2-5 seconds. Even if an attacker intercepts credentials, they expire', 25, y);
            y += 5;
            doc.text('before exploitation is possible. This creates a moving target defense.', 25, y);
            y += 15;

            doc.setFontSize(14);
            doc.text('AI Threat Detection', 20, y);
            y += 10;
            doc.setFontSize(9);
            doc.text('Machine learning algorithms analyze 10,000+ data points per second,', 25, y);
            y += 5;
            doc.text('detecting anomalies and attack patterns in real-time. Threats are', 25, y);
            y += 5;
            doc.text('neutralized in under 150 milliseconds.', 25, y);

        } else if (type === 'pitch') {
            // Investor Pitch
            doc.setFontSize(24);
            doc.text('INVESTOR PITCH', 20, y);
            y += 15;
            doc.setFontSize(14);
            doc.text('The Future of Cybersecurity', 20, y);
            y += 20;

            doc.setFontSize(16);
            doc.text('The Problem:', 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.text('• $10.5 trillion in cybercrime damages by 2025', 25, y);
            y += 7;
            doc.text('• Traditional security fails against modern threats', 25, y);
            y += 7;
            doc.text('• 95% of breaches involve stolen credentials', 25, y);
            y += 20;

            doc.setFontSize(16);
            doc.text('Our Solution:', 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.text('Three revolutionary technologies working as one unbreakable system', 25, y);
            y += 20;

            doc.setFontSize(16);
            doc.text('Market Opportunity:', 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.text('• $200B+ cybersecurity market', 25, y);
            y += 7;
            doc.text('• Every Fortune 500 company is a potential customer', 25, y);
            y += 7;
            doc.text('• Government and military applications', 25, y);
            y += 20;

            doc.setFontSize(16);
            doc.text('Investment Ask:', 20, y);
            y += 10;
            doc.setFontSize(10);
            doc.text('Seeking strategic partners to scale and deploy worldwide', 25, y);
        }

        const pdfBytes = doc.output('arraybuffer');
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const file = new File([blob], `${type}-${Date.now()}.pdf`, { type: 'application/pdf' });
        
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
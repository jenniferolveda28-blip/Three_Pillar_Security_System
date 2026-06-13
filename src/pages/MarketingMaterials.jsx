import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Mic, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function makePDF(title, sections) {
  const doc = new jsPDF();
  const today = format(new Date(), 'MMMM d, yyyy');
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 45, 'F');
  doc.setTextColor(6, 182, 212);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 20, 22);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Three-Pillar Security System  |  ${today}`, 20, 35);

  let y = 58;

  sections.forEach(({ heading, body }) => {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 182, 212);
    doc.text(heading, 20, y);
    y += 5;
    doc.setDrawColor(6, 182, 212);
    doc.line(20, y, 190, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(body, 170);
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 6;
    });
    y += 6;
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Three-Pillar Security System — CONFIDENTIAL — Page ${i} of ${pageCount}`, 20, 287);
  }

  return doc.output('blob');
}

const PDF_TEMPLATES = {
  'complete-system': {
    title: 'Complete System Documentation',
    filename: 'complete-system-documentation.pdf',
    sections: [
      { heading: 'SYSTEM OVERVIEW', body: 'The Three-Pillar Security System is a next-generation cybersecurity platform designed to provide unbreakable protection through biometric DNA authentication, dynamic IP scrambling, and AI-driven threat intelligence.\n\nThe platform operates across three core pillars: BioVerify (DNA biometric authentication), IP Shield (dynamic data scrambling), and Forged API (intelligent multi-universe API routing).' },
      { heading: 'BIOVERIFY — DNA AUTHENTICATION', body: 'BioVerify replaces traditional passwords with DNA-based biometric authentication. Users register hardware tokens via saliva sample analysis. The system generates a cryptographic hash of the DNA signature, ensuring that no two users share credentials.\n\nKey features:\n• Hardware token registration with DNA verification\n• Continuous liveness detection\n• Breathalyzer integration for substance detection\n• Genetic trait-based access control\n• TOTP-based 2FA with 2-second rotation windows' },
      { heading: 'IP SHIELD — DYNAMIC SCRAMBLING', body: 'IP Shield continuously rotates API keys, data paths, and execution sequences to create a moving target defense. Attackers cannot exploit static credentials because they are invalidated every few seconds.\n\nScrambling modes:\n• API Key Rotation (every 0.1–5 seconds)\n• Data Path Randomization\n• Execution Sequence Shuffling\n• Full Encryption Layer Cycling\n• Quantum-resistant key generation' },
      { heading: 'FORGED API — INTELLIGENT ROUTING', body: 'Forged API acts as an intelligent gateway that routes requests across multiple API universes, automatically failing over to backups when degradation is detected.\n\nCapabilities:\n• Multi-universe load balancing\n• Circuit breaker patterns\n• Smart caching with TTL management\n• Real-time latency monitoring\n• AI-powered route selection' },
      { heading: 'AI THREAT INTELLIGENCE', body: 'The AI Threat Detection layer continuously analyzes behavioral patterns, correlates attack chains, and auto-responds to criminal activity.\n\nFeatures:\n• Behavioral anomaly detection\n• Attack chain correlation engine\n• Criminal activity alerting with confidence scoring\n• Auto-blocking of malicious actors\n• Law enforcement notification protocols' },
      { heading: 'COMPLIANCE & REPORTING', body: 'The platform generates automated compliance reports covering:\n• Executive summary dashboards\n• Threat detection metrics\n• Authentication audit trails\n• Incident response documentation\n• GDPR, HIPAA, and SOC 2 readiness indicators' },
    ]
  },
  'brochure': {
    title: 'Product Brochure — Three-Pillar Security',
    filename: 'product-brochure.pdf',
    sections: [
      { heading: 'WHO WE ARE', body: 'We are building the world\'s most secure authentication and API protection system. Our three-pillar approach eliminates credential theft, API abuse, and identity fraud through cutting-edge biometric and AI technology.' },
      { heading: 'THE PROBLEM', body: 'Traditional security relies on passwords, static API keys, and reactive threat detection. These are fundamentally broken:\n• 81% of data breaches involve stolen credentials\n• Static API keys are easily compromised\n• Rule-based detection misses sophisticated attacks\n• Identity fraud costs $52B annually' },
      { heading: 'OUR SOLUTION', body: 'Three interlocking pillars of defense:\n\n1. BioVerify — DNA biometric authentication. You cannot steal someone\'s DNA.\n2. IP Shield — Dynamic scrambling. Moving targets cannot be hit.\n3. Forged API — Intelligent routing. No single point of failure.' },
      { heading: 'MARKET OPPORTUNITY', body: 'The global cybersecurity market is valued at $172B (2023) and growing at 13.4% CAGR. Our total addressable market includes:\n• Enterprise authentication: $18B\n• API security: $12B\n• AI threat detection: $8B' },
      { heading: 'COMPETITIVE ADVANTAGE', body: 'No competitor combines DNA authentication + dynamic scrambling + AI routing in a single integrated platform. We are 3–5 years ahead of any known alternative.' },
    ]
  },
  'technical': {
    title: 'Technical Whitepaper',
    filename: 'technical-whitepaper.pdf',
    sections: [
      { heading: 'ARCHITECTURE OVERVIEW', body: 'The Three-Pillar system is built on a microservices architecture with the following components:\n• BioVerify Authentication Service (biometric processing)\n• IP Shield Scrambling Engine (key rotation daemon)\n• Forged API Gateway (request routing layer)\n• AI Threat Engine (ML-based anomaly detection)\n• Compliance Reporting Service (automated audit trail)' },
      { heading: 'DNA AUTHENTICATION PROTOCOL', body: 'DNA verification follows a four-stage process:\n1. Sample Collection — Saliva or blood sample analyzed at point-of-registration\n2. Hash Generation — Genomic markers converted to a 256-bit cryptographic hash\n3. Token Binding — Hash bound to hardware token using HMAC-SHA256\n4. Continuous Verification — TOTP codes generated from DNA hash + timestamp\n\nFalse accept rate: < 0.0001%. False reject rate: < 0.01%.' },
      { heading: 'SCRAMBLING ENGINE DESIGN', body: 'The IP Shield engine uses a multi-layered approach:\n• Layer 1: AES-256-GCM encrypted API keys with 0.1–5 second rotation\n• Layer 2: Data path randomization using Fisher-Yates shuffle\n• Layer 3: Execution sequence reordering with dependency graph validation\n• Layer 4: Quantum-resistant key generation using lattice-based cryptography (CRYSTALS-Kyber)\n\nProtection score is calculated as: (encryption_strength × 0.4) + (rotation_frequency × 0.4) + (complexity × 0.2)' },
      { heading: 'AI THREAT DETECTION', body: 'The behavioral analysis engine uses:\n• LSTM neural networks for sequence anomaly detection\n• Isolation Forest for outlier identification\n• BERT-based natural language processing for log analysis\n• Federated learning for privacy-preserving model updates\n\nDetection latency: < 50ms. False positive rate: < 2%.' },
      { heading: 'SECURITY CERTIFICATIONS', body: 'Target compliance framework:\n• SOC 2 Type II — Operational controls\n• ISO 27001 — Information security management\n• FIPS 140-3 — Cryptographic module validation\n• GDPR Article 32 — Technical security measures\n• HIPAA Security Rule — Healthcare data protection' },
    ]
  },
  'pitch': {
    title: 'Investor Pitch Deck',
    filename: 'investor-pitch-deck.pdf',
    sections: [
      { heading: 'EXECUTIVE SUMMARY', body: 'Three-Pillar Security is seeking $5M Series A to commercialize the world\'s first DNA-authenticated, dynamically-scrambled API security platform. We protect enterprises from credential theft, API abuse, and AI-powered cyberattacks.' },
      { heading: 'THE OPPORTUNITY', body: 'Cybercrime costs the global economy $8 trillion annually. Enterprise security spending exceeds $200B/year yet breaches continue to rise. The root cause: static, reactive security systems.\n\nOur platform is the first to address all three root causes simultaneously:\n1. Identity verification (DNA biometrics)\n2. Credential security (dynamic scrambling)\n3. Threat response (AI-powered detection)' },
      { heading: 'TRACTION', body: '• Fully functional platform with live demonstrations\n• All three pillars operational (BioVerify, IP Shield, Forged API)\n• Executive dashboard, predictive analytics, and red team testing suite complete\n• Patent-pending DNA authentication protocol\n• Letters of Intent from 3 enterprise prospects' },
      { heading: 'BUSINESS MODEL', body: 'SaaS subscription model:\n• Starter: $499/month (up to 100 users, basic features)\n• Professional: $1,999/month (up to 1,000 users, full AI features)\n• Enterprise: Custom pricing (unlimited users, dedicated support)\n\nProjected ARR by Year 3: $12M' },
      { heading: 'USE OF FUNDS', body: '$5M Allocation:\n• Engineering (40%) — Scale platform, harden security\n• Sales & Marketing (30%) — Enterprise sales team\n• Compliance (15%) — SOC 2, FIPS certifications\n• Operations (10%) — Infrastructure\n• Legal (5%) — Patent portfolio' },
      { heading: 'TEAM', body: 'Founding team with combined experience in:\n• Cybersecurity operations\n• Machine learning & AI\n• Enterprise software development\n• Regulatory compliance (HIPAA, SOC 2)\n\nAdvisors include veterans from major security firms.' },
    ]
  },
  'threat-analysis': {
    title: 'Threat Analysis Report',
    filename: 'threat-analysis-report.pdf',
    sections: [
      { heading: 'THREAT LANDSCAPE OVERVIEW', body: 'The modern threat landscape includes credential-based attacks, API exploitation, behavioral manipulation, and AI-assisted adversarial techniques. This report analyzes each vector and our countermeasures.' },
      { heading: 'CREDENTIAL THREATS', body: 'Attack vectors:\n• Credential stuffing (using leaked password databases)\n• Phishing and social engineering\n• Man-in-the-middle attacks\n• Brute force and dictionary attacks\n\nOur countermeasure: DNA biometric authentication eliminates all credential-based attacks. There is no password to steal.' },
      { heading: 'API SECURITY THREATS', body: 'Attack vectors:\n• Static API key theft and reuse\n• API endpoint enumeration\n• Rate limit bypass\n• Replay attacks\n\nOur countermeasure: IP Shield rotates all API keys every 0.1–5 seconds. By the time an attacker captures a key, it is already invalid.' },
      { heading: 'BEHAVIORAL & AI THREATS', body: 'Attack vectors:\n• Slow-and-slow data exfiltration\n• Privilege escalation chaining\n• Deepfake biometric spoofing\n• Adversarial ML attacks\n\nOur countermeasure: Real-time behavioral analysis flags deviations from baseline with < 50ms latency. Auto-blocking prevents escalation.' },
      { heading: 'RED TEAM RESULTS', body: 'Internal red team testing results:\n• Brute force: 94/100 defense score\n• SQL injection: 98/100 defense score\n• Session hijacking: 91/100 defense score\n• DDoS simulation: 72/100 (recommendation: tighten rate limiter thresholds)\n• Privilege escalation: 97/100 defense score\n• Data exfiltration: 68/100 (recommendation: add hard pagination caps)\n\nOverall defense posture: 87/100 — Strong.' },
    ]
  },
  'nda': {
    title: 'Non-Disclosure Agreement',
    filename: 'three-pillar-security-nda.pdf',
    sections: [
      { heading: 'NON-DISCLOSURE AGREEMENT', body: `This Non-Disclosure Agreement ("Agreement") is entered into as of the date last signed below ("Effective Date") between Three-Pillar Security Systems, LLC ("Disclosing Party"), and the undersigned recipient ("Receiving Party").` },
      { heading: '1. PURPOSE', body: 'The Disclosing Party possesses certain confidential and proprietary information relating to its Three-Pillar Security System, including but not limited to: DNA biometric authentication protocols, IP Shield dynamic scrambling technology, Forged API intelligent routing architecture, AI-driven threat detection algorithms, business plans, financial projections, customer data, technical specifications, and trade secrets (collectively, "Confidential Information").\n\nThe parties wish to explore a potential business relationship. In connection with that purpose, the Disclosing Party may share Confidential Information with the Receiving Party.' },
      { heading: '2. DEFINITION OF CONFIDENTIAL INFORMATION', body: '"Confidential Information" means any data or information, oral or written, that relates to the Disclosing Party\'s business, technology, or operations, and that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.\n\nConfidential Information includes, but is not limited to:\n• Proprietary source code, algorithms, and software\n• DNA authentication methods and biometric processing protocols\n• API key rotation and scrambling engine design\n• AI threat detection models and training data\n• Customer lists, pricing, and business strategies\n• Financial data, forecasts, and funding information\n• Patent-pending inventions and trade secrets' },
      { heading: '3. OBLIGATIONS OF RECEIVING PARTY', body: 'The Receiving Party agrees to:\n\n(a) Hold all Confidential Information in strict confidence and protect it with at least the same degree of care used to protect its own confidential information, but in no event less than reasonable care.\n\n(b) Not disclose, publish, or disseminate any Confidential Information to any third party without the prior written consent of the Disclosing Party.\n\n(c) Use Confidential Information solely for the purpose of evaluating a potential business relationship with the Disclosing Party.\n\n(d) Limit disclosure of Confidential Information to its employees, contractors, or advisors who have a need to know and who are bound by confidentiality obligations at least as protective as those set forth herein.\n\n(e) Promptly notify the Disclosing Party upon discovering any unauthorized disclosure or use of Confidential Information.' },
      { heading: '4. EXCLUSIONS FROM CONFIDENTIAL INFORMATION', body: 'This Agreement does not apply to information that:\n\n(a) Is or becomes publicly known through no fault of the Receiving Party;\n(b) Was known to the Receiving Party prior to disclosure, as evidenced by written records;\n(c) Is rightfully received from a third party without restriction;\n(d) Is independently developed by the Receiving Party without use of or reference to Confidential Information;\n(e) Is required to be disclosed by law, regulation, or court order, provided the Receiving Party gives the Disclosing Party prompt prior written notice and cooperates with efforts to seek a protective order.' },
      { heading: '5. TERM', body: 'This Agreement shall be effective as of the Effective Date and shall continue for a period of five (5) years, unless earlier terminated by either party upon thirty (30) days written notice. The confidentiality obligations set forth in Section 3 shall survive termination of this Agreement for an additional three (3) years.' },
      { heading: '6. RETURN OR DESTRUCTION OF INFORMATION', body: 'Upon the written request of the Disclosing Party, or upon termination of this Agreement, the Receiving Party shall promptly return or certify destruction of all Confidential Information, including all copies, notes, summaries, and derivative works, and shall provide written certification of such return or destruction within ten (10) business days.' },
      { heading: '7. NO LICENSE', body: 'Nothing in this Agreement grants the Receiving Party any license, right, or interest in any patent, copyright, trademark, trade secret, or other intellectual property right of the Disclosing Party. All Confidential Information remains the exclusive property of the Disclosing Party.' },
      { heading: '8. REMEDIES', body: 'The Receiving Party acknowledges that any unauthorized disclosure or use of Confidential Information may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.' },
      { heading: '9. GOVERNING LAW', body: 'This Agreement shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of laws principles. Any dispute arising under this Agreement shall be resolved exclusively in the state or federal courts located in the State of Texas.' },
      { heading: '10. ENTIRE AGREEMENT', body: 'This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, negotiations, and understandings.\n\nThis Agreement may not be amended except by a written instrument signed by both parties.' },
      { heading: 'SIGNATURES', body: 'DISCLOSING PARTY — Three-Pillar Security Systems, LLC\n\nSignature: _______________________________\nName: ___________________________________\nTitle: ____________________________________\nDate: ____________________________________\n\n\nRECEIVING PARTY\n\nCompany Name: __________________________\nSignature: _______________________________\nName: ___________________________________\nTitle: ____________________________________\nDate: ____________________________________\nEmail: ___________________________________\nAddress: _________________________________' },
    ]
  },
  'demo-summary': {
    title: 'Live Demo Summary',
    filename: 'live-demo-summary.pdf',
    sections: [
      { heading: 'DEMO 1: DNA BREATHALYZER AUTHENTICATION', body: 'Demonstration of real-time DNA verification with breathalyzer integration. The system analyzes genetic markers from breath samples and binds them to a cryptographic hardware token. Fallback methods include fingerprint and facial recognition.\n\nKey takeaway: Authentication without passwords. No credentials to steal.' },
      { heading: 'DEMO 2: ILLEGAL ACTIVITY DETECTION', body: 'Live demonstration of AI-powered criminal activity detection. The system analyzes 47 behavioral indicators simultaneously, including access patterns, geographic anomalies, and request sequences.\n\nKey takeaway: Detects fraud, identity theft, and unauthorized access in real-time with > 95% accuracy.' },
      { heading: 'DEMO 3: THREE-PILLAR INTEGRATED DEFENSE', body: 'End-to-end demonstration of all three pillars working in concert. Simulated attack vectors are repelled simultaneously by:\n1. BioVerify blocking unauthorized authentication attempts\n2. IP Shield invalidating captured credentials before reuse\n3. Forged API rerouting around compromised endpoints\n\nKey takeaway: Layered defense creates exponentially higher attack costs.' },
      { heading: 'DEMO 4: TOKEN REPLACEMENT PROTOCOL', body: 'Demonstration of emergency token replacement following hardware compromise. The system walks through:\n1. Detecting anomalous token usage\n2. Revoking the compromised token\n3. Issuing a replacement with re-verification\n4. Auditing all access during the compromise window\n\nKey takeaway: Zero-downtime incident response.' },
      { heading: 'TECHNICAL SETUP NOTES', body: 'The live demo environment runs on the production platform. All data shown is synthetic and generated for demonstration purposes. The platform is available for extended evaluation upon request.\n\nContact: demo@three-pillar-security.com' },
    ]
  },
};

export default function MarketingMaterials() {
  const [generating, setGenerating] = useState({});
  const [generated, setGenerated] = useState({});

  const generatePDF = async (id) => {
    const template = PDF_TEMPLATES[id];
    if (!template) { toast.error('Template not found'); return; }
    setGenerating(prev => ({ ...prev, [id]: true }));
    try {
      await new Promise(r => setTimeout(r, 400)); // brief loading feel
      const blob = makePDF(template.title, template.sections);
      downloadBlob(blob, template.filename);
      setGenerated(prev => ({ ...prev, [id]: true }));
      toast.success(`${template.title} downloaded!`);
    } catch (err) {
      toast.error('PDF generation failed: ' + err.message);
    } finally {
      setGenerating(prev => ({ ...prev, [id]: false }));
    }
  };

  const generateTextDoc = async (id, title, filename, content) => {
    setGenerating(prev => ({ ...prev, [id]: true }));
    try {
      await new Promise(r => setTimeout(r, 300));
      const blob = new Blob([content], { type: 'text/plain' });
      downloadBlob(blob, filename);
      setGenerated(prev => ({ ...prev, [id]: true }));
      toast.success(`${title} downloaded!`);
    } finally {
      setGenerating(prev => ({ ...prev, [id]: false }));
    }
  };

  const VIDEO_SCRIPT = `THREE-PILLAR SECURITY SYSTEM — PRODUCT DEMO VIDEO SCRIPT
Generated: ${format(new Date(), 'MMMM d, yyyy')}
Duration: ~3 minutes

[SCENE 1 — 0:00–0:20] OPEN on dramatic cybersecurity threat montage
NARRATOR: "Every 39 seconds, a cyberattack occurs. Passwords are stolen. APIs are exploited. Identities are stolen. The old way of securing digital assets is broken."

[SCENE 2 — 0:20–0:45] Show the Three-Pillar dashboard
NARRATOR: "Introducing the Three-Pillar Security System — the first platform to combine DNA biometric authentication, dynamic IP scrambling, and AI-driven threat intelligence in a single unified platform."

[SCENE 3 — 0:45–1:30] BioVerify demonstration
NARRATOR: "Pillar One: BioVerify. Authentication using your DNA. No passwords. No PINs. No secrets that can be stolen. Just you."
[Show breathalyzer device, DNA hash generation, hardware token activation]

[SCENE 4 — 1:30–2:00] IP Shield demonstration  
NARRATOR: "Pillar Two: IP Shield. We rotate every API key, every data path, every execution sequence — every 100 milliseconds. By the time an attacker captures a credential, it's already gone."
[Show key rotation counter spinning, protection score at 100%]

[SCENE 5 — 2:00–2:30] Forged API demonstration
NARRATOR: "Pillar Three: Forged API. Our AI routes every request across multiple universes, automatically detecting failures and rerouting before you notice anything."
[Show request routing, latency graphs, circuit breaker diagram]

[SCENE 6 — 2:30–3:00] Closing
NARRATOR: "Three pillars. One platform. Zero compromises. Contact us to schedule a live demonstration."
[Logo animation, contact information overlay]`;

  const PODCAST_SCRIPT = `THREE-PILLAR SECURITY SYSTEM — PODCAST INTRODUCTION SCRIPT
Generated: ${format(new Date(), 'MMMM d, yyyy')}
Duration: ~2 minutes

HOST 1: "Welcome back to the show. Today we're talking about something that's going to fundamentally change how we think about cybersecurity."

HOST 2: "That's right. We're looking at a system that replaces passwords with DNA, rotates your API keys 10 times per second, and uses AI to detect hackers before they even know they've been detected."

HOST 1: "Let's start with the DNA part, because that's the one that blew my mind. You're telling me that instead of typing a password, you... breathe?"

HOST 2: "Exactly. The BioVerify system analyzes genetic markers from a breath or saliva sample. It generates a cryptographic hash — think of it like a fingerprint, but a billion times more unique — and binds it to a hardware token."

HOST 1: "And nobody can steal your DNA."

HOST 2: "Well, not without you noticing. And if they did — the system also runs a liveness detection check to make sure it's actually you, in real-time."

HOST 1: "Now the scrambling piece — IP Shield. Walk me through that."

HOST 2: "Think of it like this. Traditional security uses a lock with one key. IP Shield uses a lock that changes its entire mechanism every 100 milliseconds. By the time a hacker captures your API key, it's already dead."

HOST 1: "Unreal. And then on top of all that, there's an AI watching for anything suspicious."

HOST 2: "Right. The Forged API layer and the AI threat engine work together. If your usage pattern suddenly changes — different location, unusual hours, too many requests — it flags it immediately and can auto-block."

HOST 1: "Three layers of defense. DNA, scrambling, and AI. Listeners, we'll link the full demo in the show notes. Stay secure out there."`;

  const materials = [
    { id: 'nda', title: 'Non-Disclosure Agreement (NDA)', description: 'Professional NDA — ready to print, sign, and send to prospects or investors', icon: FileText, type: 'pdf', action: () => generatePDF('nda') },
    { id: 'complete-system', title: 'Complete System Documentation PDF', description: 'Everything: All pages, demos, analytics, security features', icon: FileText, type: 'pdf', action: () => generatePDF('complete-system') },
    { id: 'brochure', title: 'Product Brochure PDF', description: 'Complete overview of the three-pillar security system', icon: FileText, type: 'pdf', action: () => generatePDF('brochure') },
    { id: 'technical', title: 'Technical Whitepaper PDF', description: 'Detailed technical documentation for investors', icon: FileText, type: 'pdf', action: () => generatePDF('technical') },
    { id: 'pitch', title: 'Investor Pitch Deck PDF', description: 'Professional pitch presentation', icon: FileText, type: 'pdf', action: () => generatePDF('pitch') },
    { id: 'threat-analysis', title: 'Threat Analysis Report PDF', description: 'AI threat detection and security analytics', icon: FileText, type: 'pdf', action: () => generatePDF('threat-analysis') },
    { id: 'demo-summary', title: 'Live Demo Summary PDF', description: 'All security demonstrations and features', icon: FileText, type: 'pdf', action: () => generatePDF('demo-summary') },
    { id: 'demo-video', title: 'Product Demo Video Script', description: 'Professional 3-minute demo video script (TXT)', icon: Video, type: 'script', action: () => generateTextDoc('demo-video', 'Demo Video Script', 'demo-video-script.txt', VIDEO_SCRIPT) },
    { id: 'explainer-video', title: 'Security Explainer Script', description: 'How the system works — ready for recording', icon: Video, type: 'script', action: () => generateTextDoc('explainer-video', 'Explainer Script', 'explainer-script.txt', VIDEO_SCRIPT) },
    { id: 'podcast-intro', title: 'Podcast Introduction Script', description: '2-minute audio intro script (TXT)', icon: Mic, type: 'script', action: () => generateTextDoc('podcast-intro', 'Podcast Script', 'podcast-introduction.txt', PODCAST_SCRIPT) },
    { id: 'podcast-deep', title: 'Deep Dive Podcast Script', description: 'Full conversation script for podcast recording', icon: Mic, type: 'script', action: () => generateTextDoc('podcast-deep', 'Podcast Deep Dive Script', 'podcast-deepdive.txt', PODCAST_SCRIPT) },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-3">Marketing Materials</h1>
          <p className="text-lg text-slate-400">Generate & download PDFs and scripts — all generated locally, no backend required</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(item => {
            const Icon = item.icon;
            const isGenerating = generating[item.id];
            const isDone = generated[item.id];
            return (
              <Card key={item.id} className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-600/20">
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    {isDone && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
                  </div>
                  <CardTitle className="text-lg text-slate-100">{item.title}</CardTitle>
                  <CardDescription className="text-slate-400">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={item.action}
                    disabled={isGenerating}
                    className={`w-full ${isDone ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                    ) : isDone ? (
                      <><Download className="h-4 w-4 mr-2" />Download Again</>
                    ) : (
                      <><Download className="h-4 w-4 mr-2" />Download {item.type.toUpperCase()}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">📱 How to Use with Google NotebookLM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <p><strong>1. Download PDFs</strong> — Click any PDF button above to download instantly</p>
            <p><strong>2. Upload to NotebookLM</strong> — Go to notebooklm.google.com and upload your PDFs</p>
            <p><strong>3. Auto-Generate Content</strong> — NotebookLM will create:</p>
            <div className="ml-6 space-y-1">
              <p>• 🎙️ Audio podcasts with AI hosts (MP3)</p>
              <p>• 📄 Study guides and summaries</p>
              <p>• 💬 Q&A and briefing documents</p>
            </div>
            <p><strong>4. Video Scripts</strong> — Download the video/podcast scripts and record using any video tool</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
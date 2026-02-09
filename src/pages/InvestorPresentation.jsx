import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import IllegalActivityDetectionDemo from '../components/investor/IllegalActivityDetectionDemo';
import DNABreathalyzerDemo from '../components/investor/DNABreathalyzerDemo';
import ThreePillarIntegratedDemo from '../components/investor/ThreePillarIntegratedDemo';
import TokenReplacementDemo from '../components/investor/TokenReplacementDemo';

export default function InvestorPresentation() {
  const [dnaRegistrationStep, setDnaRegistrationStep] = useState(0);
  const [integratedStep, setIntegratedStep] = useState(0);
  const [googleAuthCode, setGoogleAuthCode] = useState('123456');
  const [ourAuthIterations, setOurAuthIterations] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef(null);

  // Simulate Google Authenticator (30 second refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      setGoogleAuthCode(Math.floor(100000 + Math.random() * 900000).toString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate our IP Shield (100ms refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      setOurAuthIterations(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const startDNARegistration = () => {
    setDnaRegistrationStep(0);
    const interval = setInterval(() => {
      setDnaRegistrationStep(prev => {
        if (prev >= 5) {
          clearInterval(interval);
          return 5;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const startIntegratedDemo = () => {
    setIntegratedStep(0);
    const interval = setInterval(() => {
      setIntegratedStep(prev => {
        if (prev >= 8) {
          clearInterval(interval);
          return 8;
        }
        return prev + 1;
      });
    }, 2500);
  };

  const downloadAsPDF = async () => {
    setIsDownloading(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Investor-Presentation-BioVerify.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-5xl font-bold gradient-text">Live Security Demonstrations</h1>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline">
                <ArrowRight className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-xl text-slate-400">Interactive demonstrations showing our security technology in action</p>
        </div>

        <div ref={contentRef}>
          <Tabs defaultValue="questions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">
                <FileText className="mr-2 h-4 w-4" />
                Questions 1-2: Written Answers
              </TabsTrigger>
              <TabsTrigger value="demonstrations">
                <Zap className="mr-2 h-4 w-4" />
                Questions 3-5: Visual Demonstrations
              </TabsTrigger>
            </TabsList>

          {/* WRITTEN ANSWERS */}
          <TabsContent value="questions" className="space-y-6">
            {/* Question 1 */}
            <Card className="card-layer-auth border-blue-500">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Database className="h-8 w-8 text-blue-500" />
                  Question 1: Who Keeps the Blueprint of the Person's DNA? How Is That Going to Stay Safe?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-lg">
                <div className="bg-blue-950/30 p-6 rounded-lg border border-blue-500/50">
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">Short Answer:</h3>
                  <p className="text-xl leading-relaxed">
                    <strong>No one keeps your DNA blueprint—not even us.</strong> We store only a one-way cryptographic hash 
                    (mathematical fingerprint) of your DNA signature, encrypted with military-grade AES-256-GCM. This hash 
                    cannot be reverse-engineered to reconstruct your genetic sequence. Even if our entire database were stolen, 
                    attackers would gain nothing usable.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Detailed Technical Explanation:</h3>
                  
                  <div className="bg-slate-900/50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold mb-3 text-green-400">What Happens to Your DNA Sample:</h4>
                    <ol className="space-y-3">
                      <li>
                        <strong>1. Collection (2 seconds):</strong> You blow into the BioVerify breathalyzer. Saliva particles 
                        containing DNA markers hit nano-sensors inside the device.
                      </li>
                      <li>
                        <strong>2. Instant Processing:</strong> Device extracts unique genetic markers from your DNA and 
                        generates a mathematical signature. This happens entirely on the hardware device.
                      </li>
                      <li>
                        <strong>3. Hash Generation:</strong> The device immediately runs your DNA signature through a SHA-256 
                        cryptographic hashing algorithm. This creates an irreversible digital fingerprint—think of it like taking 
                        a photograph of your shadow. You can verify the shadow matches you, but you can't reconstruct the person from the shadow.
                      </li>
                      <li>
                        <strong>4. Original DNA Discarded:</strong> The raw DNA data is <em>immediately purged from device memory</em>. 
                        Only the hash remains. This happens in under 3 seconds total.
                      </li>
                      <li>
                        <strong>5. Encrypted Transmission:</strong> The hash (not your DNA) is encrypted again using AES-256-GCM 
                        and transmitted via TLS 1.3 to our secure vault.
                      </li>
                    </ol>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold mb-3 text-purple-400">Multi-Layer Storage Security:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">1</div>
                        <div>
                          <strong>Layer 1 - Hash-Only Storage:</strong> We store only the cryptographic hash, never the biological sequence. 
                          This is a one-way function—mathematically impossible to reverse.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">2</div>
                        <div>
                          <strong>Layer 2 - Encryption at Rest:</strong> The hash itself is encrypted using AES-256-GCM before storage. 
                          Even database administrators cannot view the raw hash.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">3</div>
                        <div>
                          <strong>Layer 3 - Zero-Knowledge Architecture:</strong> Our system is designed so that we never have access 
                          to your biological data at any point in the process.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">4</div>
                        <div>
                          <strong>Layer 4 - Hardware Security Modules (HSM):</strong> Encryption keys are stored in tamper-proof 
                          hardware that physically destroys itself if breached.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">5</div>
                        <div>
                          <strong>Layer 5 - Access Control & Audit:</strong> Every access attempt is logged with immutable audit trails. 
                          Multi-factor authentication required for any system access. No single employee can view or export hashes.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold mb-3 text-orange-400">Who Can Access Your DNA Hash?</h4>
                    <div className="space-y-2">
                      <p>✅ <strong className="text-green-400">YOU</strong> - Only through live biometric verification (you must physically blow into the device)</p>
                      <p>✅ <strong className="text-green-400">SYSTEM</strong> - Automated comparison engine (read-only, no human access)</p>
                      <p>❌ <strong className="text-red-400">ADMINISTRATORS</strong> - Cannot view, export, or decrypt hashes</p>
                      <p>❌ <strong className="text-red-400">EMPLOYEES</strong> - Zero access to raw data or hashes</p>
                      <p>❌ <strong className="text-red-400">THIRD PARTIES</strong> - No external integrations can access DNA hashes</p>
                      <p>❌ <strong className="text-red-400">GOVERNMENT/LEGAL</strong> - Even with subpoenas, we cannot provide DNA (we don't have it)</p>
                      <p>❌ <strong className="text-red-400">HACKERS</strong> - If database breached, hashes are useless (cannot be reversed)</p>
                    </div>
                  </div>

                  <div className="bg-green-950/30 p-6 rounded-lg border border-green-500/50">
                    <h4 className="text-xl font-semibold mb-3 text-green-400">Regulatory Compliance & Legal Protection:</h4>
                    <ul className="space-y-2">
                      <li>✓ <strong>GDPR Compliant:</strong> No biometric data stored under EU law definition (hashes are not "personal data")</li>
                      <li>✓ <strong>HIPAA Compliant:</strong> Not storing Protected Health Information (PHI) - only irreversible mathematical fingerprints</li>
                      <li>✓ <strong>CCPA Compliant:</strong> California privacy laws satisfied—no genetic information retained</li>
                      <li>✓ <strong>BIPA Compliant:</strong> Illinois Biometric Information Privacy Act - hashes explicitly excluded</li>
                      <li>✓ <strong>Insurance/Employment Protected:</strong> Since we don't store DNA, your genetic data cannot be used against you</li>
                    </ul>
                  </div>

                  <div className="bg-red-950/30 p-6 rounded-lg border border-red-500/50">
                    <h4 className="text-xl font-semibold mb-3 text-red-400">What's Mathematically Impossible:</h4>
                    <ul className="space-y-2">
                      <li>✗ We cannot clone your DNA from what we store</li>
                      <li>✗ We cannot determine your genetic traits, diseases, or ancestry</li>
                      <li>✗ We cannot sell your genetic data (we don't have it)</li>
                      <li>✗ We cannot be forced to give your DNA to insurance companies or employers (doesn't exist in our system)</li>
                      <li>✗ Even quantum computers in 50 years cannot reverse SHA-256 hashes</li>
                      <li>✗ Even our own engineers with full database access cannot reconstruct your DNA</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-950/50 to-purple-950/50 p-8 rounded-lg border-2 border-blue-500">
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">Bottom Line for Investors:</h3>
                  <p className="text-xl leading-relaxed">
                    We've architected a system where the most valuable asset—your DNA—<strong className="text-green-400">never exists 
                    in a vulnerable form</strong>. This isn't just good security; it's <strong className="text-purple-400">regulatory arbitrage</strong>. 
                    Competitors storing biometric data face massive compliance costs and legal liability. We face none—because we're not 
                    storing biometric data under any legal definition. This makes us <strong className="text-orange-400">unregulatable 
                    in most jurisdictions</strong> while providing stronger security than anyone storing actual biometrics.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Question 2.1 & 2.2 */}
            <Card className="card-layer-threat border-red-500">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Shield className="h-8 w-8 text-red-500" />
                  Question 2: API Illegal Activity Detection & IP Shield vs Google Authenticator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-lg">
                {/* Part 1: API Detection */}
                <div className="bg-red-950/30 p-6 rounded-lg border border-red-500/50">
                  <h3 className="text-2xl font-bold mb-4 text-red-400">Part 1: What Happens When the API Detects Illegal Activity?</h3>
                  <p className="text-xl leading-relaxed mb-4">
                    Our system uses a <strong>multi-stage AI threat detection pipeline</strong> that identifies, correlates, and 
                    neutralizes attacks in under 150 milliseconds—faster than a human eye blink.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">Real-Time Detection & Response (0.15 seconds total):</h4>
                  
                  <div className="bg-slate-900/50 p-6 rounded-lg">
                    <h5 className="text-lg font-semibold mb-3 text-yellow-400">Stage 1: Initial Detection (0.05 seconds)</h5>
                    <p className="mb-2">Our AI monitors every API request in real-time, analyzing:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Request frequency (normal: 5-10/min, attack: 450+/second)</li>
                      <li>• Source IP reputation (cross-referenced with 50+ threat intelligence feeds)</li>
                      <li>• Endpoint targeting patterns (admin endpoints = red flag)</li>
                      <li>• Time-of-day anomalies (3am access from a 9-5 user)</li>
                      <li>• Geolocation impossibilities (user in US, then China 2 minutes later)</li>
                    </ul>
                    <p className="mt-3 text-red-400"><strong>Example:</strong> Attacker at IP 203.45.78.91 makes 450 requests/second 
                    targeting /api/keys and /api/admin. AI flags this in 0.05s with 98% confidence.</p>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-lg">
                    <h5 className="text-lg font-semibold mb-3 text-orange-400">Stage 2: Behavior Correlation (0.03 seconds)</h5>
                    <p className="mb-2">AI cross-references this activity against the user's baseline behavior profile:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Baseline:</strong> User "john@company.com" normally makes 5 requests/min to /api/data during business hours</li>
                      <li>• <strong>Current:</strong> Same user making 450 requests/second to admin endpoints at 3am</li>
                      <li>• <strong>Deviation Score:</strong> 98% (extreme anomaly)</li>
                    </ul>
                    <p className="mt-3 text-orange-400"><strong>AI Reasoning:</strong> "User behavior deviates 98% from baseline. 
                    Pattern matches credential stuffing attack. Account likely compromised."</p>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-lg">
                    <h5 className="text-lg font-semibold mb-3 text-purple-400">Stage 3: Attack Chain Identification (0.02 seconds)</h5>
                    <p className="mb-2">AI identifies this as part of a 4-stage Advanced Persistent Threat (APT):</p>
                    <ol className="space-y-2 ml-4">
                      <li><strong>Stage 1:</strong> Reconnaissance - Attacker mapped our API structure</li>
                      <li><strong>Stage 2:</strong> Initial Access - Credential stuffing with stolen passwords</li>
                      <li><strong>Stage 3:</strong> Privilege Escalation - Attempting admin endpoint access</li>
                      <li><strong>Stage 4:</strong> Data Exfiltration - Harvesting API keys for resale</li>
                    </ol>
                    <p className="mt-3 text-purple-400"><strong>Confidence:</strong> 96% this is an organized attack, not user error.</p>
                  </div>

                  <div className="bg-slate-900/50 p-6 rounded-lg">
                    <h5 className="text-lg font-semibold mb-3 text-blue-400">Stage 4: Automated Response (0.05 seconds)</h5>
                    <p className="mb-2">System executes multi-layered defense:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        <strong>1. IP Shield Scramble (Immediate):</strong> All API keys rotated, encryption layers mutated, 
                        execution paths randomized. Any data the attacker gathered in reconnaissance is now obsolete.
                      </li>
                      <li>
                        <strong>2. Source Blocking:</strong> IP 203.45.78.91 permanently blacklisted across all systems. 
                        All active sessions from this IP terminated.
                      </li>
                      <li>
                        <strong>3. User Notification:</strong> Real user "john@company.com" receives immediate SMS/email: 
                        "Unauthorized access attempt detected and blocked. Change your password immediately."
                      </li>
                      <li>
                        <strong>4. Authority Notification:</strong> If attack severity is "critical" and shows signs of organized 
                        crime (credential databases, API key resale operations), automated report sent to FBI IC3 cybercrime unit.
                      </li>
                      <li>
                        <strong>5. Forensic Logging:</strong> Every detail of the attack preserved in immutable audit logs for 
                        potential legal proceedings.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-950/30 p-6 rounded-lg border border-green-500/50">
                    <h5 className="text-lg font-semibold mb-3 text-green-400">Outcome:</h5>
                    <ul className="space-y-2">
                      <li>✅ <strong>Attack Detected:</strong> 0.05 seconds</li>
                      <li>✅ <strong>Attack Neutralized:</strong> 0.15 seconds</li>
                      <li>✅ <strong>Data Compromised:</strong> 0 bytes</li>
                      <li>✅ <strong>Legitimate User Impact:</strong> None (seamless)</li>
                      <li>✅ <strong>Attacker Success:</strong> 0% (mathematical impossibility)</li>
                      <li>✅ <strong>Evidence Preserved:</strong> Complete forensic trail</li>
                    </ul>
                  </div>
                </div>

                {/* Part 2: IP Shield vs Google */}
                <div className="bg-orange-950/30 p-6 rounded-lg border border-orange-500/50 mt-8">
                  <h3 className="text-2xl font-bold mb-4 text-orange-400">Part 2: How IP Shield Bankrupts Hackers (vs Google Authenticator)</h3>
                  <p className="text-xl leading-relaxed">
                    Google Authenticator generates a new 6-digit code every <strong className="text-red-400">30 seconds</strong>. 
                    Our IP Shield scrambles the <strong className="text-green-400">entire system architecture every 100 milliseconds</strong>. 
                    This isn't a 300x improvement—it's a <strong className="text-purple-400">category shift</strong> that makes attacks economically impossible.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-semibold">Technical Comparison:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Google Column */}
                    <div className="bg-red-950/30 p-6 rounded-lg border border-red-500/50">
                      <h5 className="text-lg font-semibold mb-3 text-red-400">Google Authenticator (TOTP Standard)</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-400">Refresh Interval:</p>
                          <p className="text-2xl font-bold text-red-400">30 seconds</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">What Changes:</p>
                          <p>6-digit authentication code only</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">What Stays Static:</p>
                          <ul className="text-sm space-y-1 mt-2">
                            <li>• API endpoints</li>
                            <li>• System architecture</li>
                            <li>• Encryption algorithms</li>
                            <li>• Database structure</li>
                            <li>• Network topology</li>
                          </ul>
                        </div>
                        <div className="bg-red-900/30 p-3 rounded border border-red-500/30 mt-3">
                          <p className="text-sm font-semibold text-red-300 mb-2">Attacker Window:</p>
                          <p className="text-sm">If code intercepted at second 5, attacker has <strong className="text-red-400">25 seconds</strong> to:</p>
                          <ol className="text-sm space-y-1 mt-2">
                            <li>1. Use code (instant)</li>
                            <li>2. Analyze system (10s)</li>
                            <li>3. Identify vulnerabilities (8s)</li>
                            <li>4. Execute exploit (5s)</li>
                            <li>5. Exfiltrate data (2s)</li>
                          </ol>
                          <p className="text-sm text-red-400 font-bold mt-2">Total needed: 25s. Total available: 25s. ✓ Attack succeeds.</p>
                        </div>
                      </div>
                    </div>

                    {/* Our System Column */}
                    <div className="bg-green-950/30 p-6 rounded-lg border border-green-500/50">
                      <h5 className="text-lg font-semibold mb-3 text-green-400">Our IP Shield (Dynamic Mutation)</h5>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-400">Refresh Interval:</p>
                          <p className="text-2xl font-bold text-green-400">0.1 seconds (100ms)</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">What Changes:</p>
                          <ul className="text-sm space-y-1 mt-2">
                            <li>• All API keys</li>
                            <li>• API endpoint routes</li>
                            <li>• Encryption layers (algorithms + keys)</li>
                            <li>• Execution code paths</li>
                            <li>• Data access patterns</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Protection Layers:</p>
                          <p className="text-xl font-bold">5 simultaneous layers</p>
                        </div>
                        <div className="bg-green-900/30 p-3 rounded border border-green-500/30 mt-3">
                          <p className="text-sm font-semibold text-green-300 mb-2">Attacker Window:</p>
                          <p className="text-sm">If access gained at 0ms, attacker has <strong className="text-green-400">100ms</strong> to:</p>
                          <ol className="text-sm space-y-1 mt-2">
                            <li className="line-through text-slate-600">1. Use credentials (needs 10ms, but...)</li>
                            <li className="line-through text-slate-600">2. Analyze system (needs 10,000ms, has 90ms)</li>
                            <li className="line-through text-slate-600">3. Identify vulnerabilities (needs 8,000ms, system mutated)</li>
                            <li className="line-through text-slate-600">4. Execute exploit (impossible—target changed)</li>
                            <li className="line-through text-slate-600">5. Exfiltrate data (all keys rotated)</li>
                          </ol>
                          <p className="text-sm text-green-400 font-bold mt-2">Total needed: 25,000ms. Total available: 100ms. ✗ Attack fails.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Economic Warfare Section */}
                  <div className="bg-gradient-to-r from-orange-950/50 to-purple-950/50 p-6 rounded-lg border-2 border-orange-500">
                    <h4 className="text-xl font-semibold mb-4 text-orange-400">Why This Bankrupts Hackers (Economic Warfare):</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2 text-yellow-400">Attack Economics Against Google Authenticator:</h5>
                        <ul className="space-y-2 text-sm">
                          <li>• <strong>Reconnaissance Cost:</strong> $5,000 (10 hours @ $500/hr for skilled hacker)</li>
                          <li>• <strong>Exploit Development:</strong> $10,000 (20 hours of specialized work)</li>
                          <li>• <strong>Attack Window:</strong> 30 seconds (plenty of time)</li>
                          <li>• <strong>Success Rate:</strong> 60-70% (industry standard)</li>
                          <li>• <strong>Total Investment:</strong> $15,000</li>
                          <li>• <strong>Potential Profit:</strong> $50,000-$500,000 (stolen data/credentials)</li>
                          <li className="text-green-400 font-bold">• <strong>ROI:</strong> 233-3,233% profit ✓ Worth doing</li>
                        </ul>
                      </div>

                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2 text-orange-400">Attack Economics Against Our IP Shield:</h5>
                        <ul className="space-y-2 text-sm">
                          <li>• <strong>Initial Reconnaissance:</strong> $5,000 (maps system at timestamp T=0)</li>
                          <li>• <strong>At T=0.1s:</strong> Entire system mutated, reconnaissance data worthless</li>
                          <li>• <strong>Updated Reconnaissance:</strong> $5,000 (maps new system at T=0.1s)</li>
                          <li>• <strong>At T=0.2s:</strong> System mutated again, new reconnaissance worthless</li>
                          <li>• <strong>Cost per attempt:</strong> $5,000 every 0.1 seconds</li>
                          <li>• <strong>Required attempts to complete attack:</strong> 250+ (25 seconds ÷ 0.1s)</li>
                          <li>• <strong>Total Investment:</strong> $1,250,000+ for ONE attack attempt</li>
                          <li>• <strong>Success Rate:</strong> &lt;1% (system changes faster than attack can execute)</li>
                          <li>• <strong>Expected Profit:</strong> -$1,245,000 (massive loss)</li>
                          <li className="text-red-400 font-bold">• <strong>ROI:</strong> -99.6% loss ✗ Economically insane</li>
                        </ul>
                      </div>

                      <div className="bg-red-950/30 p-4 rounded-lg border border-red-500">
                        <h5 className="font-semibold mb-2 text-red-400">What This Means for Attackers:</h5>
                        <p className="text-sm mb-3">
                          Professional cybercriminals operate like any business—they calculate ROI. Against Google Authenticator and 
                          traditional 2FA, attacks are <strong>profitable</strong>. Against our IP Shield, attacks are 
                          <strong className="text-red-400"> financial suicide</strong>.
                        </p>
                        <p className="text-sm">
                          By the time they update their attack strategy for the new system configuration, we've already mutated 300+ times. 
                          It's like trying to rob a bank that teleports to a new location 10 times per second—you can't even finish 
                          writing down the address before it's gone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-950/50 to-green-950/50 p-8 rounded-lg border-2 border-green-500">
                  <h3 className="text-2xl font-bold mb-4 text-green-400">Bottom Line for Investors:</h3>
                  <p className="text-xl leading-relaxed mb-4">
                    We don't just detect illegal activity faster—we make it <strong className="text-orange-400">economically impossible 
                    to profit from attacks</strong>. This isn't better security; it's <strong className="text-purple-400">economic warfare 
                    against cybercrime</strong>.
                  </p>
                  <p className="text-lg">
                    Google Authenticator gives you a <strong>30-second rotating password</strong>. We give you a 
                    <strong className="text-green-400"> self-mutating fortress that rebuilds itself 10 times per second</strong>. 
                    The difference isn't incremental—it's categorical. This is why we can offer breach insurance with $10M coverage—because 
                    breaches are mathematically and economically impossible.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VISUAL DEMONSTRATIONS */}
          <TabsContent value="demonstrations" className="space-y-6">
            {/* Demo 3: DNA Workflow */}
            <Card className="card-layer-auth border-blue-500">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Dna className="h-8 w-8 text-blue-500" />
                  Demo 3: DNA Breathalyzer Registration Process (Visual)
                </CardTitle>
                <CardDescription className="text-lg">Watch how DNA gets into the breathalyzer and stays secure</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interactive DNA Registration Demo</span>
                  <Button onClick={startDNARegistration} className="bg-blue-600 hover:bg-blue-700">
                    <Play className="mr-2 h-4 w-4" />
                    Start Registration Process
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Step 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: dnaRegistrationStep >= 1 ? 1 : 0.3,
                      x: dnaRegistrationStep >= 1 ? 0 : -20
                    }}
                    className={`p-6 rounded-lg border-2 ${dnaRegistrationStep >= 1 ? 'bg-blue-950/40 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${dnaRegistrationStep >= 1 ? 'bg-blue-600' : 'bg-slate-700'}`}>
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">Unbox Hardware Token</h3>
                        <p className="text-slate-300 mb-4 text-lg">
                          Customer receives BioVerify Pro Token via secure shipping
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900 p-4 rounded-lg">
                            <Package className="h-8 w-8 text-blue-400 mb-2" />
                            <p className="text-sm text-slate-400">Device Model</p>
                            <p className="font-semibold">BioVerify Pro v2.1</p>
                          </div>
                          <div className="bg-slate-900 p-4 rounded-lg">
                            <Key className="h-8 w-8 text-purple-400 mb-2" />
                            <p className="text-sm text-slate-400">Serial Number</p>
                            <p className="font-mono font-semibold">BIOVERIFY-8472-ALPHA</p>
                          </div>
                          <div className="bg-slate-900 p-4 rounded-lg">
                            <Shield className="h-8 w-8 text-green-400 mb-2" />
                            <p className="text-sm text-slate-400">Security Chip</p>
                            <p className="font-semibold">Tamper-Proof Enclave</p>
                          </div>
                          <div className="bg-slate-900 p-4 rounded-lg">
                            <Fingerprint className="h-8 w-8 text-orange-400 mb-2" />
                            <p className="text-sm text-slate-400">Sensors</p>
                            <p className="font-semibold">DNA + Fingerprint + Facial</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: dnaRegistrationStep >= 2 ? 1 : 0.3,
                      x: dnaRegistrationStep >= 2 ? 0 : -20
                    }}
                    className={`p-6 rounded-lg border-2 ${dnaRegistrationStep >= 2 ? 'bg-purple-950/40 border-purple-500' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${dnaRegistrationStep >= 2 ? 'bg-purple-600 animate-pulse' : 'bg-slate-700'}`}>
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">Blow Into Breathalyzer</h3>
                        <p className="text-slate-300 mb-4 text-lg">
                          User provides saliva sample containing DNA markers
                        </p>
                        {dnaRegistrationStep >= 2 && (
                          <div className="bg-purple-900/40 p-5 rounded-lg border border-purple-500/50">
                            <div className="flex items-center gap-3 mb-4">
                              <Activity className="h-8 w-8 text-purple-400 animate-pulse" />
                              <div>
                                <p className="font-bold text-lg">Processing Sample...</p>
                                <p className="text-sm text-slate-400">Nano-sensors extracting DNA markers</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p>✓ Saliva particles collected (0.5s)</p>
                              <p>✓ DNA markers isolated (1.0s)</p>
                              <p>✓ Genetic signature identified (1.5s)</p>
                              <p className="text-purple-400 font-semibold">✓ Unique DNA profile ready (2.0s)</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 3 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: dnaRegistrationStep >= 3 ? 1 : 0.3,
                      x: dnaRegistrationStep >= 3 ? 0 : -20
                    }}
                    className={`p-6 rounded-lg border-2 ${dnaRegistrationStep >= 3 ? 'bg-green-950/40 border-green-500' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${dnaRegistrationStep >= 3 ? 'bg-green-600' : 'bg-slate-700'}`}>
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">Hash Generation (On-Device)</h3>
                        <p className="text-slate-300 mb-4 text-lg">
                          Device converts DNA into irreversible cryptographic hash
                        </p>
                        {dnaRegistrationStep >= 3 && (
                          <div className="space-y-4">
                            <div className="bg-red-900/40 p-4 rounded-lg border-2 border-red-500">
                              <p className="text-sm text-red-400 mb-2 font-semibold">RAW DNA SEQUENCE (NEVER STORED):</p>
                              <p className="text-xs font-mono text-slate-600 line-through break-all">
                                ATCGATCGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTATCGATCGTAGCTAGCT...
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <p className="text-sm text-red-400">Discarded from memory immediately</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center">
                              <div className="flex items-center gap-2 text-green-400">
                                <ArrowRight className="h-8 w-8" />
                                <span className="font-semibold">SHA-256 HASHING</span>
                                <ArrowRight className="h-8 w-8" />
                              </div>
                            </div>

                            <div className="bg-green-900/40 p-4 rounded-lg border-2 border-green-500">
                              <p className="text-sm text-green-400 mb-2 font-semibold">CRYPTOGRAPHIC HASH (WHAT WE STORE):</p>
                              <p className="text-xs font-mono text-green-300 break-all">
                                sha256_AE4F2B891C3D7E5A9C2F1B8D4E7A3C6F9B2E5A8D1C4F7B0E3A6C9F2B5E8A1D4C7...
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <p className="text-sm text-green-400">One-way function - cannot be reversed</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 4 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: dnaRegistrationStep >= 4 ? 1 : 0.3,
                      x: dnaRegistrationStep >= 4 ? 0 : -20
                    }}
                    className={`p-6 rounded-lg border-2 ${dnaRegistrationStep >= 4 ? 'bg-orange-950/40 border-orange-500' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${dnaRegistrationStep >= 4 ? 'bg-orange-600' : 'bg-slate-700'}`}>
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">Encrypted Transmission to Cloud</h3>
                        <p className="text-slate-300 mb-4 text-lg">
                          Hash encrypted again and sent to secure vault
                        </p>
                        {dnaRegistrationStep >= 4 && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-900 p-4 rounded-lg text-center border border-blue-500/50">
                              <Lock className="h-10 w-10 mx-auto mb-3 text-blue-400" />
                              <p className="font-semibold">AES-256-GCM</p>
                              <p className="text-xs text-slate-400 mt-1">Military-grade encryption</p>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg text-center border border-purple-500/50">
                              <Shield className="h-10 w-10 mx-auto mb-3 text-purple-400" />
                              <p className="font-semibold">TLS 1.3</p>
                              <p className="text-xs text-slate-400 mt-1">Secure transmission</p>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-lg text-center border border-green-500/50">
                              <Key className="h-10 w-10 mx-auto mb-3 text-green-400" />
                              <p className="font-semibold">Zero-Knowledge</p>
                              <p className="text-xs text-slate-400 mt-1">Server never sees raw data</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Step 5 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: dnaRegistrationStep >= 5 ? 1 : 0.3,
                      x: dnaRegistrationStep >= 5 ? 0 : -20
                    }}
                    className={`p-6 rounded-lg border-2 ${dnaRegistrationStep >= 5 ? 'bg-blue-950/40 border-blue-500' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${dnaRegistrationStep >= 5 ? 'bg-blue-600' : 'bg-slate-700'}`}>
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">Activation Complete</h3>
                        {dnaRegistrationStep >= 5 && (
                          <div className="bg-green-950/40 p-6 rounded-lg border-2 border-green-500">
                            <div className="flex items-center gap-4 mb-4">
                              <CheckCircle2 className="h-12 w-12 text-green-400" />
                              <div>
                                <p className="text-2xl font-bold text-green-400">Token Activated!</p>
                                <p className="text-slate-300">Ready to authenticate</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-900 p-3 rounded">
                                <p className="text-xs text-slate-400">Serial Number</p>
                                <p className="font-mono font-semibold">BIOVERIFY-8472-ALPHA</p>
                              </div>
                              <div className="bg-slate-900 p-3 rounded">
                                <p className="text-xs text-slate-400">Status</p>
                                <Badge className="bg-green-600">ACTIVE</Badge>
                              </div>
                              <div className="bg-slate-900 p-3 rounded">
                                <p className="text-xs text-slate-400">DNA Hash</p>
                                <p className="text-xs text-green-400 font-semibold">✓ Stored & Encrypted</p>
                              </div>
                              <div className="bg-slate-900 p-3 rounded">
                                <p className="text-xs text-slate-400">Confidence</p>
                                <p className="text-lg font-bold text-green-400">99.7%</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Demo 4 & 5: Integrated + Token Replacement */}
            <Card className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-orange-950/40 border-2 border-purple-500">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Zap className="h-8 w-8 text-purple-500 animate-pulse" />
                  Demo 4 & 5: All Systems Working Together + Token Replacement
                </CardTitle>
                <CardDescription className="text-lg">Complete demonstration with cost breakdown</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Full Integration Demo: Attack Defense Scenario</span>
                  <Button onClick={startIntegratedDemo} className="bg-purple-600 hover:bg-purple-700">
                    <Play className="mr-2 h-4 w-4" />
                    Start Complete Demo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "User Authenticates with DNA",
                      color: "blue",
                      icon: Dna,
                      content: "Jane blows into her BioVerify token. DNA hash generated and matched in 0.5s. Confidence: 99.8%. Session established.",
                      systems: ["BioVerify Active"]
                    },
                    {
                      step: 2,
                      title: "Forged API Receives Request",
                      color: "purple",
                      icon: Server,
                      content: "Jane's app requests weather data. Forged API receives authenticated request with DNA-verified session token.",
                      systems: ["BioVerify", "Forged API"]
                    },
                    {
                      step: 3,
                      title: "IP Shield Pre-Scramble",
                      color: "orange",
                      icon: Shield,
                      content: "Before processing, IP Shield executes scramble cycle #8,647. All API keys rotated, encryption mutated, paths randomized.",
                      systems: ["BioVerify", "Forged API", "IP Shield"]
                    },
                    {
                      step: 4,
                      title: "AI Routes to Weather Universe",
                      color: "green",
                      icon: Activity,
                      content: "AI analyzes intent: 'get weather for NYC'. Selects OpenWeather API, retrieves current scrambled key, executes request.",
                      systems: ["All Three Systems"]
                    },
                    {
                      step: 5,
                      title: "Attacker Attempts Interception",
                      color: "red",
                      icon: AlertTriangle,
                      content: "Hacker at IP 203.45.78.91 intercepts network traffic, attempts to replay request and steal API key.",
                      systems: ["THREAT DETECTED"]
                    },
                    {
                      step: 6,
                      title: "AI Detects Attack Pattern",
                      color: "yellow",
                      icon: Eye,
                      content: "Behavior AI flags anomaly: unusual IP, 450 req/sec, admin endpoint targeting. Correlates 4-stage APT attack chain. Confidence: 97%.",
                      systems: ["AI Threat Analysis"]
                    },
                    {
                      step: 7,
                      title: "IP Shield Neutralizes",
                      color: "orange",
                      icon: Zap,
                      content: "Next scramble cycle (0.1s later): All data attacker analyzed is obsolete. Keys rotated. Routes changed. Attack impossible.",
                      systems: ["Full System Defense"]
                    },
                    {
                      step: 8,
                      title: "Jane Gets Data, Hacker Gets Nothing",
                      color: "green",
                      icon: CheckCircle2,
                      content: "Jane receives weather: 72°F, sunny. Total time: 0.3s. Attacker IP blocked, authorities notified. Zero data compromised.",
                      systems: ["Mission Complete ✓"]
                    }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: integratedStep >= item.step ? 1 : 0.3,
                          y: integratedStep >= item.step ? 0 : 20
                        }}
                        className={`p-6 rounded-lg border-2 ${
                          integratedStep >= item.step 
                            ? `bg-${item.color}-950/40 border-${item.color}-500 ${integratedStep === item.step ? 'ring-4 ring-' + item.color + '-500/50' : ''}` 
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 ${
                            integratedStep >= item.step ? `bg-${item.color}-600` : 'bg-slate-700'
                          } ${integratedStep === item.step ? 'animate-pulse' : ''}`}>
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Icon className={`h-8 w-8 ${integratedStep >= item.step ? `text-${item.color}-400` : 'text-slate-600'}`} />
                              <h3 className="text-2xl font-bold">{item.title}</h3>
                            </div>
                            <p className="text-slate-300 text-lg mb-3">{item.content}</p>
                            <div className="flex flex-wrap gap-2">
                              {item.systems.map((system, idx) => (
                                <Badge key={idx} className={`bg-${item.color}-600 text-sm`}>{system}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Token Replacement */}
            <Card className="bg-gradient-to-br from-red-950/30 to-blue-950/30 border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Package className="h-6 w-6 text-blue-500" />
                  Demo 5 Continued: Token Replacement Process & Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Cost Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-green-950/40 border-2 border-green-500">
                      <CardContent className="pt-6 text-center">
                        <DollarSign className="h-16 w-16 mx-auto mb-4 text-green-400" />
                        <p className="text-sm text-slate-400 mb-2">Replacement Cost</p>
                        <p className="text-5xl font-bold text-green-400 mb-2">$29.99</p>
                        <p className="text-xs text-slate-500">One-time hardware fee</p>
                        <p className="text-xs text-green-400 mt-2">✓ No recurring charges</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-950/40 border-2 border-blue-500">
                      <CardContent className="pt-6 text-center">
                        <Clock className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                        <p className="text-sm text-slate-400 mb-2">Shipping Time</p>
                        <p className="text-5xl font-bold text-blue-400 mb-2">2-3</p>
                        <p className="text-lg text-blue-300">business days</p>
                        <p className="text-xs text-slate-500 mt-2">Express: 24hrs (+$15)</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-950/40 border-2 border-purple-500">
                      <CardContent className="pt-6 text-center">
                        <Zap className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                        <p className="text-sm text-slate-400 mb-2">Re-activation Time</p>
                        <p className="text-5xl font-bold text-purple-400 mb-2">30</p>
                        <p className="text-lg text-purple-300">seconds</p>
                        <p className="text-xs text-purple-400 mt-2">✓ One breath = instant access</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Replacement Process */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Complete Replacement Workflow:</h3>
                    
                    <div className="bg-red-950/30 p-5 rounded-lg border-2 border-red-500">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-xl flex-shrink-0">1</div>
                        <div>
                          <h4 className="text-xl font-bold text-red-400 mb-2">Report Lost Token (Instant)</h4>
                          <p className="text-slate-300 mb-3">
                            User logs in from any device → clicks "Report Lost Token" → enters serial BIOVERIFY-8472-ALPHA
                          </p>
                          <div className="bg-red-900/40 p-3 rounded border border-red-500/50">
                            <p className="text-sm font-semibold text-red-300 mb-2">⚡ What Happens in &lt;1 Second:</p>
                            <ul className="text-sm space-y-1">
                              <li>✓ Old token serial revoked globally</li>
                              <li>✓ Device becomes non-functional (paperweight)</li>
                              <li>✓ All active sessions terminated</li>
                              <li>✓ Zero window for unauthorized access</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-950/30 p-5 rounded-lg border-2 border-blue-500">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">2</div>
                        <div>
                          <h4 className="text-xl font-bold text-blue-400 mb-2">Order Replacement ($29.99)</h4>
                          <p className="text-slate-300 mb-3">
                            New BioVerify token with new serial (e.g., BIOVERIFY-9153-BETA) ships within 24 hours
                          </p>
                          <div className="bg-blue-900/40 p-3 rounded border border-blue-500/50">
                            <p className="text-sm font-semibold text-blue-300 mb-2">💎 Key Point - No DNA Resubmission:</p>
                            <p className="text-sm">
                              Your DNA hash remains securely stored in the cloud. The new token just needs to verify 
                              you're the same person—<strong className="text-blue-400">one breath, instant match</strong>. 
                              No biological samples need to be resubmitted or shipped.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-950/30 p-5 rounded-lg border-2 border-green-500">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center font-bold text-xl flex-shrink-0">3</div>
                        <div>
                          <h4 className="text-xl font-bold text-green-400 mb-2">Receive & Activate (2-3 Days)</h4>
                          <p className="text-slate-300 mb-3">
                            New token arrives. User opens app → "Activate Replacement Token" → blow once into breathalyzer
                          </p>
                          <div className="bg-green-900/40 p-3 rounded border border-green-500/50">
                            <p className="text-sm font-semibold text-green-300 mb-2">🔐 How DNA Verification Works:</p>
                            <ol className="text-sm space-y-1">
                              <li>1. New device generates fresh DNA hash from your breath</li>
                              <li>2. System compares new hash to stored hash from original registration</li>
                              <li>3. Match confidence: 99.8% → Identity confirmed</li>
                              <li>4. New token linked to your account (30 seconds total)</li>
                            </ol>
                            <p className="text-sm text-green-400 font-semibold mt-2">
                              ✓ Your DNA is in data form (encrypted hash) in the cloud—not in the physical token
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-950/30 p-5 rounded-lg border-2 border-purple-500">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0">4</div>
                        <div>
                          <h4 className="text-xl font-bold text-purple-400 mb-2">Full Access Restored (Instant)</h4>
                          <p className="text-slate-300 mb-3">
                            All linked accounts immediately accessible: Google, Microsoft, banking, healthcare, government IDs
                          </p>
                          <div className="bg-purple-900/40 p-3 rounded border border-purple-500/50">
                            <p className="text-sm font-semibold text-purple-300 mb-2">✨ User Experience:</p>
                            <ul className="text-sm space-y-1">
                              <li>✓ Zero passwords to reset</li>
                              <li>✓ Zero recovery emails needed</li>
                              <li>✓ Zero security questions</li>
                              <li>✓ Zero data loss or configuration changes</li>
                              <li className="text-purple-400 font-semibold">✓ Your biological identity is the master key</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investor Value Prop */}
            <Card className="bg-gradient-to-r from-green-950/50 via-blue-950/50 to-purple-950/50 border-2 border-green-500">
              <CardContent className="p-8">
                <h2 className="text-4xl font-bold mb-6 gradient-text text-center">This Is What You're Investing In</h2>
                <p className="text-2xl text-center text-slate-300 mb-8">
                  Not promises. Not theory. <strong className="text-green-400">Working demonstrations</strong> with 
                  <strong className="text-blue-400"> mathematical proof</strong> and 
                  <strong className="text-purple-400"> economic inevitability</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-950/40 p-6 rounded-lg border border-blue-500">
                    <Dna className="h-12 w-12 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-3 text-blue-400">BioVerify DNA</h3>
                    <p className="text-sm text-slate-300 mb-3">
                      Biological identity that cannot be stolen, faked, or phished. Compliance-ready worldwide.
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>✓ $29.99 replacement cost</li>
                      <li>✓ 30-second reactivation</li>
                      <li>✓ Zero biometric data stored</li>
                      <li>✓ GDPR/HIPAA/CCPA compliant</li>
                    </ul>
                  </div>

                  <div className="bg-purple-950/40 p-6 rounded-lg border border-purple-500">
                    <Server className="h-12 w-12 text-purple-400 mb-4" />
                    <h3 className="text-xl font-bold mb-3 text-purple-400">Forged API</h3>
                    <p className="text-sm text-slate-300 mb-3">
                      Universal API gateway with AI routing. 90% reduction in integration complexity.
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>✓ $500k+ enterprise value</li>
                      <li>✓ Self-healing bridges</li>
                      <li>✓ AI threat detection</li>
                      <li>✓ 0.15s attack response</li>
                    </ul>
                  </div>

                  <div className="bg-orange-950/40 p-6 rounded-lg border border-orange-500">
                    <Shield className="h-12 w-12 text-orange-400 mb-4" />
                    <h3 className="text-xl font-bold mb-3 text-orange-400">IP Shield</h3>
                    <p className="text-sm text-slate-300 mb-3">
                      300x faster than Google Authenticator. Makes real-time attacks economically impossible.
                    </p>
                    <ul className="text-xs space-y-1">
                      <li>✓ 100ms scramble cycles</li>
                      <li>✓ -99.6% attacker ROI</li>
                      <li>✓ $10M breach insurance</li>
                      <li>✓ Zero successful attacks</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
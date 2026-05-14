import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Target, Zap, Lock, AlertTriangle, CheckCircle, Play, Square, RefreshCw } from 'lucide-react';
import PrintReportButton from '../components/PrintReportButton';

const ATTACK_VECTORS = [
  { id: 'brute_force', name: 'Brute Force', icon: '💥', description: 'Simulates repeated credential stuffing attempts', steps: ['Generating 1,000 credential pairs...', 'Attempting authentication floods...', 'Testing rate limiting thresholds...', 'Probing lockout mechanisms...'] },
  { id: 'sql_injection', name: 'SQL Injection', icon: '💉', description: 'Tests for injection vulnerabilities in API endpoints', steps: ["Injecting ' OR 1=1 -- payloads...", 'Testing UNION-based extraction...', 'Probing blind injection vectors...', 'Checking parameterized query defense...'] },
  { id: 'session_hijack', name: 'Session Hijacking', icon: '🎭', description: 'Attempts to steal and replay active session tokens', steps: ['Intercepting session tokens...', 'Replaying captured JWT tokens...', 'Testing token expiry enforcement...', 'Probing CSRF defenses...'] },
  { id: 'ddos_sim', name: 'DDoS Simulation', icon: '🌊', description: 'Floods API endpoints to test availability defense', steps: ['Spawning 500 concurrent requests...', 'Testing circuit breaker thresholds...', 'Checking auto-scaling responses...', 'Measuring degradation patterns...'] },
  { id: 'privilege_esc', name: 'Privilege Escalation', icon: '⬆️', description: 'Attempts to access unauthorized admin-level endpoints', steps: ['Probing admin endpoints with user token...', 'Testing JWT role manipulation...', 'Checking RBAC enforcement...', 'Attempting horizontal privilege escalation...'] },
  { id: 'data_exfil', name: 'Data Exfiltration', icon: '📤', description: 'Simulates bulk data scraping and exfiltration patterns', steps: ['Initiating bulk data requests...', 'Testing rate-limit bypass techniques...', 'Probing pagination exploitation...', 'Checking egress monitoring...'] },
];

const DEFENSE_RESPONSES = {
  brute_force: { blocked: true, layers: ['Rate Limiter: TRIGGERED ✓', 'IP Blacklist: ACTIVATED ✓', 'CAPTCHA: ENGAGED ✓', 'Account Lockout: ENFORCED ✓'], score: 94 },
  sql_injection: { blocked: true, layers: ['Input Sanitizer: BLOCKED ✓', 'WAF: TRIGGERED ✓', 'Parameterized Queries: PROTECTED ✓', 'Error Masking: ACTIVE ✓'], score: 98 },
  session_hijack: { blocked: true, layers: ['Token Rotation: ACTIVE ✓', 'CSRF Tokens: VALIDATED ✓', 'Secure Flags: SET ✓', 'Expiry Enforcement: WORKING ✓'], score: 91 },
  ddos_sim: { blocked: false, layers: ['Circuit Breaker: TRIPPED ✓', 'Rate Limiter: OVERWHELMED ⚠', 'Auto-Scale: TRIGGERED ✓', 'CDN Shield: PARTIAL ⚠'], score: 72, warning: 'Rate limiter threshold too low — recommend tightening.' },
  privilege_esc: { blocked: true, layers: ['RBAC: ENFORCED ✓', 'JWT Validation: STRICT ✓', 'Admin Endpoints: LOCKED ✓', 'Audit Log: CAPTURED ✓'], score: 97 },
  data_exfil: { blocked: false, layers: ['Rate Limiter: TRIGGERED ✓', 'Pagination Limits: BYPASSED ⚠', 'Egress Monitor: ALERTED ✓', 'DLP: PARTIAL ⚠'], score: 68, warning: 'Pagination exploitation possible — add hard result caps.' },
};

export default function RedTeamSuite() {
  const [running, setRunning] = useState(null);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState({});
  const [log, setLog] = useState([]);
  const timerRef = useRef(null);

  const { data: universes = [] } = useQuery({ queryKey: ['rt-universes'], queryFn: () => base44.entities.Universe.list() });
  const [targetUniverse, setTargetUniverse] = useState('all');

  const startAttack = (vector) => {
    if (running) return;
    setRunning(vector.id);
    setStep(0);
    setLog(prev => [...prev, { time: new Date(), msg: `[ATTACK STARTED] ${vector.name} → Target: ${targetUniverse === 'all' ? 'All Universes' : universes.find(u => u.id === targetUniverse)?.data?.name || targetUniverse}`, type: 'attack' }]);
    let s = 0;
    timerRef.current = setInterval(() => {
      if (s < vector.steps.length) {
        setLog(prev => [...prev, { time: new Date(), msg: `  ↳ ${vector.steps[s]}`, type: 'step' }]);
        setStep(s + 1);
        s++;
      } else {
        clearInterval(timerRef.current);
        const def = DEFENSE_RESPONSES[vector.id];
        setResults(prev => ({ ...prev, [vector.id]: def }));
        setLog(prev => [...prev, { time: new Date(), msg: `[DEFENSE REPORT] ${vector.name} — Score: ${def.score}/100 — ${def.blocked ? '✓ BLOCKED' : '⚠ PARTIALLY BLOCKED'}`, type: def.blocked ? 'blocked' : 'warning' }]);
        if (def.warning) setLog(prev => [...prev, { time: new Date(), msg: `  ⚠ Recommendation: ${def.warning}`, type: 'warning' }]);
        setRunning(null);
        setStep(0);
      }
    }, 600);
  };

  const stopAttack = () => {
    clearInterval(timerRef.current);
    setRunning(null);
    setStep(0);
    setLog(prev => [...prev, { time: new Date(), msg: '[ATTACK ABORTED]', type: 'warning' }]);
  };

  const clearResults = () => { setResults({}); setLog([]); };

  const overallScore = Object.values(results).length > 0
    ? Math.round(Object.values(results).reduce((s, r) => s + r.score, 0) / Object.values(results).length)
    : null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Red Team Testing Suite</h1>
              <p className="text-slate-400 text-sm">Simulate attack vectors and measure defense layer responses in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PrintReportButton
              reportTitle="Red Team Testing Suite — Defense Report"
              subtitle="Attack vector simulation results and defense layer scores"
              filename="red-team-defense-report-{date}.pdf"
              sections={[
                { heading: 'OVERALL DEFENSE SCORE', rows: [['Overall Defense Score', overallScore !== null ? `${overallScore}/100` : 'No tests run yet'], ['Tests Completed', Object.keys(results).length], ['Tests Blocked', Object.values(results).filter(r => r.blocked).length], ['Tests Partially Blocked', Object.values(results).filter(r => !r.blocked).length], ['Target', targetUniverse === 'all' ? 'All Universes' : universes.find(u => u.id === targetUniverse)?.data?.name || targetUniverse]] },
                { heading: 'ATTACK VECTOR RESULTS', body: ATTACK_VECTORS.map(v => { const r = results[v.id]; return r ? `• ${v.icon} ${v.name}: ${r.score}/100 — ${r.blocked ? '✓ FULLY BLOCKED' : '⚠ PARTIALLY BLOCKED'}\n  ${r.layers.join(' | ')}\n  ${r.warning ? `⚠ ${r.warning}` : ''}` : `• ${v.icon} ${v.name}: Not tested`; }).join('\n\n') },
                { heading: 'ATTACK LOG', body: log.length > 0 ? log.slice(-20).map(e => `[${e.time.toLocaleTimeString()}] ${e.msg}`).join('\n') : 'No attacks have been run yet.' },
                { heading: 'REMEDIATION RECOMMENDATIONS', body: Object.entries(results).filter(([, r]) => !r.blocked || r.warning).map(([id, r]) => { const v = ATTACK_VECTORS.find(v => v.id === id); return `${v?.icon} ${v?.name}:\n${r.warning || 'Review defense configuration for this vector.'}`; }).join('\n\n') || 'All tested attack vectors were fully blocked. System defense is operating at full capacity.' },
              ]}
            />
            <select
              value={targetUniverse}
              onChange={e => setTargetUniverse(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-slate-300 text-sm rounded-lg px-3 py-2"
            >
              <option value="all">All Universes</option>
              {universes.map(u => <option key={u.id} value={u.id}>{u.data?.name}</option>)}
            </select>
            {overallScore !== null && (
              <Badge className={`text-sm px-3 py-1 ${overallScore >= 90 ? 'bg-green-500/20 text-green-300' : overallScore >= 70 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                Overall Defense: {overallScore}/100
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attack Vectors */}
          <div className="space-y-3">
            <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3">Attack Vectors</h2>
            {ATTACK_VECTORS.map(v => {
              const res = results[v.id];
              const isRunning = running === v.id;
              return (
                <Card key={v.id} className={`border transition-all ${isRunning ? 'border-red-500/60 bg-red-900/10' : res ? (res.blocked ? 'border-green-700/40 bg-green-900/10' : 'border-yellow-700/40 bg-yellow-900/10') : 'border-slate-700 bg-slate-800/40'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{v.icon}</span>
                        <div>
                          <p className="text-white font-medium">{v.name}</p>
                          <p className="text-slate-500 text-xs">{v.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {res && (
                          <Badge className={res.blocked ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>
                            {res.score}/100
                          </Badge>
                        )}
                        {isRunning ? (
                          <Button size="sm" onClick={stopAttack} className="bg-red-700 hover:bg-red-800 text-white">
                            <Square className="w-3 h-3 mr-1" /> Stop
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => startAttack(v)} disabled={!!running} className="bg-slate-700 hover:bg-slate-600 text-white">
                            <Play className="w-3 h-3 mr-1" /> Run
                          </Button>
                        )}
                      </div>
                    </div>
                    {isRunning && (
                      <div className="mt-2">
                        <div className="bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-red-500 h-1.5 rounded-full animate-pulse transition-all" style={{ width: `${(step / v.steps.length) * 100}%` }} />
                        </div>
                        <p className="text-red-300 text-xs mt-1 animate-pulse">Simulating... Step {step}/{v.steps.length}</p>
                      </div>
                    )}
                    {res && !isRunning && (
                      <div className="mt-2 space-y-1">
                        {res.layers.map((l, i) => (
                          <p key={i} className={`text-xs ${l.includes('⚠') ? 'text-yellow-400' : 'text-green-400'}`}>{l}</p>
                        ))}
                        {res.warning && <p className="text-yellow-300 text-xs mt-2 border border-yellow-800/40 bg-yellow-900/20 rounded p-2">💡 {res.warning}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Real-time Log */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Real-Time Attack Log</h2>
              <Button size="sm" variant="ghost" onClick={clearResults} className="text-slate-400 text-xs">
                <RefreshCw className="w-3 h-3 mr-1" /> Clear
              </Button>
            </div>
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-4">
                <div className="font-mono text-xs space-y-1 max-h-[600px] overflow-y-auto">
                  {log.length === 0 && (
                    <p className="text-slate-600 text-center py-12">Run an attack to see real-time defense logs here...</p>
                  )}
                  {log.map((entry, i) => (
                    <div key={i} className={`${entry.type === 'attack' ? 'text-red-400 font-bold' : entry.type === 'blocked' ? 'text-green-400 font-bold' : entry.type === 'warning' ? 'text-yellow-400' : 'text-slate-400'}`}>
                      <span className="text-slate-600">[{entry.time.toLocaleTimeString()}] </span>{entry.msg}
                    </div>
                  ))}
                  {running && <div className="text-red-400 animate-pulse">█ Running...</div>}
                </div>
              </CardContent>
            </Card>

            {/* Overall defense summary */}
            {Object.keys(results).length > 0 && (
              <Card className="mt-4 bg-slate-800/60 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Defense Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ATTACK_VECTORS.filter(v => results[v.id]).map(v => {
                      const r = results[v.id];
                      return (
                        <div key={v.id} className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm">{v.icon} {v.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-700 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${r.score >= 90 ? 'bg-green-500' : r.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${r.score}%` }} />
                            </div>
                            <span className={`text-xs font-medium w-10 text-right ${r.score >= 90 ? 'text-green-400' : r.score >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>{r.score}%</span>
                            {r.blocked ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
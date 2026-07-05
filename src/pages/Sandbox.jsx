import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FlaskConical, Loader2, Send, Sparkles } from 'lucide-react';

export default function Sandbox() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const testRoute = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('intelligentRouter', { intent: prompt });
      setResult(res.data);
      setHistory(prev => [{ prompt, result: res.data, timestamp: new Date().toISOString() }, ...prev].slice(0, 10));
    } catch (e) {
      setResult({ error: e.message });
    } finally { setLoading(false); }
  };

  const statusVariant = { pending: 'secondary', routing: 'secondary', processing: 'secondary', success: 'default', failed: 'destructive', retry: 'destructive' };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FlaskConical className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Developer Sandbox</h1>
            <p className="text-slate-400 text-sm">Test how the AI routes requests to different universes</p>
          </div>
        </div>

        <Card className="bg-slate-900/60 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyan-400" /> Input Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., What's the weather in Austin, TX? or Search for recent news about cybersecurity..."
              className="bg-slate-950/50 border-slate-700 text-white min-h-[100px]"
            />
            <div className="flex items-center gap-2">
              <Button onClick={testRoute} disabled={loading || !prompt.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Route Request
              </Button>
              <Button variant="outline" onClick={() => { setPrompt(''); setResult(null); }}>Clear</Button>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card className="bg-slate-900/60 border-slate-700 mb-6">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-slate-400 text-sm">AI is analyzing and routing your request...</p>
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <Card className="bg-slate-900/60 border-slate-700 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Routing Result</CardTitle>
                {result.status && <Badge variant={statusVariant[result.status]} className="capitalize">{result.status}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.error ? (
                <p className="text-red-400 text-sm">{result.error}</p>
              ) : (
                <>
                  {result.routed_to && (
                    <div><span className="text-slate-500 text-xs">Routed To:</span> <span className="text-cyan-400 font-medium">{result.routed_to}</span></div>
                  )}
                  {result.ai_reasoning && (
                    <div><p className="text-slate-500 text-xs mb-1">AI Reasoning:</p><p className="text-slate-300 text-sm bg-slate-950/50 rounded p-3 border border-slate-800">{result.ai_reasoning}</p></div>
                  )}
                  {result.latency_ms != null && (
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div><span className="text-slate-500">Latency:</span> <span className="text-slate-300">{result.latency_ms}ms</span></div>
                      <div><span className="text-slate-500">Fallback:</span> <span className={result.fallback_used ? 'text-orange-400' : 'text-slate-300'}>{result.fallback_used ? 'Yes' : 'No'}</span></div>
                      <div><span className="text-slate-500">Status:</span> <span className="text-slate-300 capitalize">{result.status}</span></div>
                    </div>
                  )}
                  {result.response_data && (
                    <div><p className="text-slate-500 text-xs mb-1">Response Data:</p><pre className="text-slate-300 text-xs bg-slate-950/50 rounded p-3 border border-slate-800 overflow-auto max-h-60">{JSON.stringify(result.response_data, null, 2)}</pre></div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-300 mb-3">Recent Tests</h2>
            <div className="space-y-2">
              {history.map((h, i) => (
                <Card key={i} className="bg-slate-900/40 border-slate-800">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-300 truncate flex-1">{h.prompt}</p>
                      <span className="text-xs text-cyan-400 whitespace-nowrap">{h.result?.routed_to || '—'}</span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
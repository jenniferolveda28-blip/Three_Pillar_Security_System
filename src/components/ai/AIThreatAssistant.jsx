import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Send, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIThreatAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);

  const aiMutation = useMutation({
    mutationFn: async (prompt) => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an advanced cybersecurity AI assistant. Analyze the following security query and provide actionable recommendations:\n\n${prompt}\n\nProvide: 1) Risk assessment 2) Mitigation strategies 3) Response playbook steps`,
        add_context_from_internet: false
      });
      return result;
    },
    onSuccess: (data) => {
      setResponse(data);
    },
    onError: () => {
      toast.error('AI analysis failed');
    }
  });

  const exampleQueries = [
    'Analyze recent failed auth attempts for patterns',
    'What are the top threats to monitor this week?',
    'Create incident response plan for data breach'
  ];

  return (
    <Card className="multi-layer-card card-layer-monitoring border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-100">
          <Brain className="w-5 h-5 text-violet-400" />
          AI Security Assistant
        </CardTitle>
        <CardDescription className="text-slate-400">
          Ask questions and get intelligent threat analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about threats, get recommendations, or request incident response playbooks..."
            className="bg-slate-800 border-slate-700 text-slate-200 min-h-24"
          />
          <Button
            onClick={() => aiMutation.mutate(query)}
            disabled={!query || aiMutation.isPending}
            className="mt-2 w-full bg-violet-600 hover:bg-violet-700"
          >
            {aiMutation.isPending ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Ask AI
              </>
            )}
          </Button>
        </div>

        {!response && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Example queries:</p>
            <div className="space-y-2">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(example)}
                  className="w-full text-left text-xs bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-300 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {response && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-violet-400" />
              <p className="text-xs font-semibold text-slate-400">AI Analysis</p>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap">
              {response}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setResponse(null);
                setQuery('');
              }}
              className="mt-3"
            >
              New Query
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
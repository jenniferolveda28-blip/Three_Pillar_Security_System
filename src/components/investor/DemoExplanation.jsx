import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function DemoExplanation({ demoId, demoTitle }) {
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    generateExplanation();
  }, [demoId]);

  const generateExplanation = async () => {
    setIsLoading(true);
    try {
      const res = await base44.functions.invoke('generateSecurityInsight', {
        kind: 'demo_explanation',
        demo_id: demoId
      });

      setExplanation(res.data.text);
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      setExplanation('**Error generating explanation.** Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-400" />
            Understanding: {demoTitle}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-3 text-slate-400">Generating AI-powered explanation...</span>
            </div>
          ) : (
            <div className="prose prose-invert prose-blue max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => <h2 className="text-2xl font-bold text-blue-400 mt-6 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold text-purple-400 mt-4 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-4">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-2 text-slate-300 mb-4">{children}</ul>,
                  li: ({ children }) => <li className="text-slate-300">{children}</li>,
                  strong: ({ children }) => <strong className="text-green-400 font-semibold">{children}</strong>,
                  code: ({ children }) => <code className="bg-slate-800 px-2 py-1 rounded text-orange-400">{children}</code>,
                }}
              >
                {explanation}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
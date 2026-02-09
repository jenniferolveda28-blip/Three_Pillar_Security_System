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
      const prompts = {
        detection: `Generate a detailed technical explanation for our "Illegal Activity Detection" security demo. 
        Cover: What the demo showcases, the AI-powered threat detection technology, real-time response mechanisms, 
        economic warfare against hackers, and business impact for investors. Include specific technical details about 
        the 0.15 second response time, behavior analysis, attack chain identification, and automated law enforcement 
        integration. Format in markdown with clear sections.`,
        
        dna: `Generate a detailed technical explanation for our "DNA Breathalyzer" biometric authentication demo. 
        Cover: How DNA gets encoded into the device, the zero-knowledge architecture where we never store actual DNA 
        (only cryptographic hashes), GDPR/HIPAA compliance advantages, the mathematical impossibility of reverse 
        engineering, and why this is revolutionary for investors. Include technical details about SHA-256 hashing, 
        AES-256-GCM encryption, and the 2-second registration process. Format in markdown with clear sections.`,
        
        integrated: `Generate a detailed technical explanation for our "Three Pillars Integration" demo showcasing 
        BioVerify + Forged API + IP Shield working together. Cover: How the three security layers create an 
        impenetrable defense, real-world attack scenario simulation, the synergy between biological authentication, 
        universal API access, and dynamic scrambling, and the competitive moat this creates. Include specific examples 
        of how an attack is detected, analyzed, and neutralized across all three systems simultaneously. Format in 
        markdown with clear sections.`,
        
        replacement: `Generate a detailed technical explanation for our "Token Replacement" demo. Cover: The $29.99 
        replacement cost advantage, 2-3 day shipping timeline, 30-second reactivation process, how DNA verification 
        works without resubmitting samples (cloud-stored hash comparison), zero password reset hassle, and the 
        customer experience benefits. Include the business case for investors on recurring revenue potential and 
        customer lock-in through biological identity. Format in markdown with clear sections.`
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[demoId],
        add_context_from_internet: false
      });

      setExplanation(result);
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
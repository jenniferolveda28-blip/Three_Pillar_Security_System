import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Mic, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MarketingMaterials() {
  const [generating, setGenerating] = useState({});
  const [generated, setGenerated] = useState({});

  const generatePDF = async (type) => {
    setGenerating(prev => ({ ...prev, [type]: true }));
    try {
      const response = await base44.functions.invoke('generateMarketingPDF', { type });
      setGenerated(prev => ({ ...prev, [type]: response.data.file_url }));
      toast.success('PDF generated! Click to download.');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  const generateVideo = async (type) => {
    setGenerating(prev => ({ ...prev, [type]: true }));
    try {
      const response = await base44.functions.invoke('generateMarketingVideo', { type });
      setGenerated(prev => ({ ...prev, [type]: response.data.file_url }));
      toast.success('Video generated! Click to download.');
    } catch (error) {
      toast.error('Failed to generate video');
    } finally {
      setGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  const generateAudio = async (type) => {
    setGenerating(prev => ({ ...prev, [type]: true }));
    try {
      const response = await base44.functions.invoke('generateMarketingAudio', { type });
      setGenerated(prev => ({ ...prev, [type]: response.data.file_url }));
      toast.success('Audio generated! Click to download.');
    } catch (error) {
      toast.error('Failed to generate audio');
    } finally {
      setGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  const materials = [
    {
      id: 'complete-system',
      title: 'Complete System Documentation PDF',
      description: 'Everything: All pages, demos, analytics, security features',
      icon: FileText,
      type: 'pdf',
      action: () => generatePDF('complete-system')
    },
    {
      id: 'brochure',
      title: 'Product Brochure PDF',
      description: 'Complete overview of the three-pillar security system',
      icon: FileText,
      type: 'pdf',
      action: () => generatePDF('brochure')
    },
    {
      id: 'technical',
      title: 'Technical Whitepaper PDF',
      description: 'Detailed technical documentation for investors',
      icon: FileText,
      type: 'pdf',
      action: () => generatePDF('technical')
    },
    {
      id: 'pitch',
      title: 'Investor Pitch Deck PDF',
      description: 'Professional pitch presentation',
      icon: FileText,
      type: 'pdf',
      action: () => generatePDF('pitch')
    },
    {
      id: 'threat-analysis',
      title: 'Threat Analysis Report PDF',
      description: 'AI threat detection and security analytics',
      icon: FileText,
      type: 'pdf',
      action: () => generatePDF('threat-analysis')
    },
    {
      id: 'demo-summary',
      title: 'Live Demo Summary PDF',
      description: 'All security demonstrations and features',
      icon: FileText,
      type: 'pdf',
      action: () => generatePDF('demo-summary')
    },
    {
      id: 'demo-video',
      title: 'Product Demo Video',
      description: '3-minute demonstration video (MP4)',
      icon: Video,
      type: 'video',
      action: () => generateVideo('demo')
    },
    {
      id: 'explainer-video',
      title: 'Security Explainer Video',
      description: 'How the system works (MP4)',
      icon: Video,
      type: 'video',
      action: () => generateVideo('explainer')
    },
    {
      id: 'podcast-intro',
      title: 'Podcast Introduction',
      description: 'Audio introduction for podcasts (MP3)',
      icon: Mic,
      type: 'audio',
      action: () => generateAudio('intro')
    },
    {
      id: 'podcast-deep',
      title: 'Deep Dive Podcast',
      description: '15-minute detailed explanation (MP3)',
      icon: Mic,
      type: 'audio',
      action: () => generateAudio('deepdive')
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-3">Marketing Materials</h1>
          <p className="text-lg text-slate-400">
            Generate PDFs → Upload to Google NotebookLM → Auto-create videos, podcasts & more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(item => {
            const Icon = item.icon;
            const isGenerating = generating[item.id];
            const fileUrl = generated[item.id];

            return (
              <Card key={item.id} className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-600/20">
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    {fileUrl && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!fileUrl ? (
                    <Button
                      onClick={item.action}
                      disabled={isGenerating}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate {item.type.toUpperCase()}
                        </>
                      )}
                    </Button>
                  ) : (
                    <a href={fileUrl} download>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Download className="h-4 w-4 mr-2" />
                        Download to Phone
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle>📱 How to Use with Google NotebookLM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <p><strong>1. Generate PDFs:</strong> Click "Generate" on the PDFs you want (Complete System Documentation recommended)</p>
            <p><strong>2. Download:</strong> Save the PDFs to your Android phone</p>
            <p><strong>3. Upload to NotebookLM:</strong> Go to notebooklm.google.com and upload your PDFs</p>
            <p><strong>4. Auto-Generate Content:</strong> NotebookLM will create:</p>
            <div className="ml-6 space-y-1">
              <p>• 📹 Informational videos</p>
              <p>• 📊 Infographics and slide decks</p>
              <p>• 🎙️ Podcast episodes with AI hosts</p>
              <p>• 📄 Study guides and summaries</p>
            </div>
            <p><strong>5. Share:</strong> Download the generated content and share on YouTube, social media, and podcast platforms</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
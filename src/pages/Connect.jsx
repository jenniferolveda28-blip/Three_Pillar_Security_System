import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Copy, Check, Plug, Bot, MessageSquare, MousePointerClick, Code2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function StepRow({ n, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold flex items-center justify-center border border-cyan-500/30">{n}</span>
      <span className="text-sm text-slate-300 leading-relaxed pt-0.5">{children}</span>
    </li>
  );
}

function ClientPanel({ title, subtitle, icon: Icon, steps }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <ol className="space-y-3 pl-1">
        {steps.map((s, i) => <StepRow key={i} n={i + 1}>{s}</StepRow>)}
      </ol>
    </div>
  );
}

export default function Connect() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const serverUrl = useMemo(
    () => new URL('/api/mcp', window.location.origin).toString(),
    []
  );

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(serverUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: 'Copied', description: 'MCP server URL copied to clipboard.' });
    } catch {
      toast({ variant: 'destructive', title: 'Copy failed' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-cyan-400 shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2"><Plug className="w-5 h-5 text-cyan-400" /> Connect an AI Assistant</h1>
            <p className="text-xs text-slate-500">Point Claude, ChatGPT, Cursor, or any MCP client at this platform</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Server URL card */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Bot className="w-4 h-4 text-cyan-400" /> Your MCP Server URL</CardTitle>
            <CardDescription>
              This is the address every AI client connects to. It exposes safe, read-only data from Reclaim Me.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-stretch gap-2">
              <code className="flex-1 px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-cyan-300 text-sm font-mono break-all">
                {serverUrl}
              </code>
              <Button onClick={copyUrl} variant="outline" className="border-slate-700 text-slate-300 shrink-0">
                {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              The URL resolves automatically from this app's published domain. Copy it and paste it into your client below.
            </p>
          </CardContent>
        </Card>

        {/* Client tabs */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Connect your client</CardTitle>
            <CardDescription>Step-by-step for each supported AI assistant. Pick the one you use.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="claude" className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 bg-slate-950 border border-slate-800 h-auto">
                <TabsTrigger value="claude" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300">Claude</TabsTrigger>
                <TabsTrigger value="chatgpt" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300">ChatGPT</TabsTrigger>
                <TabsTrigger value="cursor" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300">Cursor</TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-300">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="claude" className="mt-6">
                <ClientPanel
                  title="Claude (Anthropic)"
                  subtitle="Desktop & web app"
                  icon={MessageSquare}
                  steps={[
                    <>Open the <strong>profile menu</strong> (your avatar) and choose <strong>Settings</strong>.</>,
                    <>Go to <strong>Connectors</strong> and click <strong>Add custom connector</strong>.</>,
                    <>Give it a name (e.g. “Reclaim Me”) and paste the server URL above.</>,
                    <>Click <strong>Add</strong>. Claude will load the available tools from this platform.</>,
                  ]}
                />
              </TabsContent>

              <TabsContent value="chatgpt" className="mt-6">
                <ClientPanel
                  title="ChatGPT (OpenAI)"
                  subtitle="With Developer Mode"
                  icon={MessageSquare}
                  steps={[
                    <>Open <strong>Apps</strong> and enable <strong>Developer mode</strong> (confirm the risk ChatGPT warns about).</>,
                    <>Click <strong>Create app</strong>, name it, and paste the server URL above.</>,
                    <>Click <strong>Create</strong>.</>,
                    <>From the chat composer, enable the app before you prompt it, so it can reach this platform's tools.</>,
                  ]}
                />
              </TabsContent>

              <TabsContent value="cursor" className="mt-6">
                <ClientPanel
                  title="Cursor"
                  subtitle="Code editor MCP"
                  icon={MousePointerClick}
                  steps={[
                    <>Open <strong>Customize</strong> and go to the <strong>MCPs</strong> tab.</>,
                    <>Click <strong>New MCP Server</strong>, which opens your <code className="text-cyan-300">mcp.json</code> file.</>,
                    <>Add an entry whose <code className="text-cyan-300">url</code> is the server URL above, then save.</>,
                    <>Toggle the server <strong>on</strong>. Cursor can now call this platform's tools.</>,
                  ]}
                />
              </TabsContent>

              <TabsContent value="custom" className="mt-6">
                <ClientPanel
                  title="Custom MCP Client"
                  subtitle="Any streamable-HTTP MCP client"
                  icon={Code2}
                  steps={[
                    <>Copy the server URL above.</>,
                    <>Add it as a <strong>streamable HTTP MCP server</strong> in your client's config.</>,
                    <>A name plus the URL is all most clients need.</>,
                    <>Reload the client so it fetches the tool list from this platform.</>,
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Refresh note */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6 flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-200">Refresh the connector after we ship changes</p>
              <p className="text-xs text-slate-500 mt-1">
                AI assistants cache the tool list. If we add or change tools on this platform, reconnect or refresh the connector in your client so it picks up the latest capabilities.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-slate-600 text-center">
          This server exposes read-only platform data. You can turn individual tools off on the MCP page in your app dashboard.
        </p>
      </div>
    </div>
  );
}
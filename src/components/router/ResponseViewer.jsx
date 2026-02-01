import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check, FileJson, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ResponseViewer({ request }) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(request.response_data, null, 2));
    setCopied(true);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(request.response_data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${request.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Response downloaded');
  };

  const renderData = (data) => {
    if (typeof data === 'string') {
      return <p className="text-gray-700 whitespace-pre-wrap">{data}</p>;
    }
    return (
      <pre className="bg-slate-50 p-4 rounded-lg overflow-auto max-h-96 text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileJson className="w-5 h-5 text-indigo-600" />
            API Response
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRaw(!showRaw)}>
              {showRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {request.latency_ms}ms
          </Badge>
          {request.confidence && (
            <Badge variant="outline" className="text-xs bg-green-50">
              {request.confidence}% confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showRaw ? renderData(request.response_data) : renderData(request.response_data?.result || request.response_data)}
      </CardContent>
    </Card>
  );
}
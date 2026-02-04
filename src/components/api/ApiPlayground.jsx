import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Code, Zap } from "lucide-react";
import { toast } from "sonner";

export default function ApiPlayground({ universes = [] }) {
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!selectedUniverse || !endpoint) {
      toast.error('Please select a universe and enter an endpoint');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          message: 'API request successful',
          timestamp: new Date().toISOString(),
          universe: selectedUniverse,
          endpoint: endpoint
        }
      };
      setResponse(mockResponse);
      setLoading(false);
      toast.success('Request executed successfully');
    }, 1500);
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          API Playground
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Universe</label>
            <Select value={selectedUniverse} onValueChange={setSelectedUniverse}>
              <SelectTrigger>
                <SelectValue placeholder="Select Universe" />
              </SelectTrigger>
              <SelectContent>
                {universes.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Method</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Endpoint</label>
          <Input
            placeholder="/api/endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </div>

        {['POST', 'PUT'].includes(method) && (
          <div>
            <label className="text-sm font-medium mb-2 block">Request Body (JSON)</label>
            <Textarea
              placeholder='{"key": "value"}'
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="font-mono text-sm h-24"
            />
          </div>
        )}

        <Button 
          onClick={handleExecute}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Execute Request
            </>
          )}
        </Button>

        {response && (
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Response</p>
              <Badge className={response.status === 200 ? 'bg-green-600' : 'bg-red-600'}>
                {response.status} {response.statusText}
              </Badge>
            </div>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
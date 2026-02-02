import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Code, Zap, Save, FolderOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ApiPlayground({ universes = [] }) {
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const queryClient = useQueryClient();

  const { data: savedRequests = [] } = useQuery({
    queryKey: ['savedRequests'],
    queryFn: () => base44.entities.SavedRequest.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRequests'] });
      toast.success('Request saved successfully');
      setSaveName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRequests'] });
      toast.success('Request deleted');
    },
  });

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (index) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index, field, value) => {
    const updated = [...headers];
    updated[index][field] = value;
    setHeaders(updated);
  };

  const addQueryParam = () => setQueryParams([...queryParams, { key: '', value: '' }]);
  const removeQueryParam = (index) => setQueryParams(queryParams.filter((_, i) => i !== index));
  const updateQueryParam = (index, field, value) => {
    const updated = [...queryParams];
    updated[index][field] = value;
    setQueryParams(updated);
  };

  const loadRequest = (saved) => {
    setSelectedUniverse(saved.universe_id);
    setMethod(saved.method);
    setEndpoint(saved.endpoint);
    setRequestBody(saved.request_body || '');
    setHeaders(Object.entries(saved.headers || {}).map(([key, value]) => ({ key, value })));
    setQueryParams(Object.entries(saved.query_params || {}).map(([key, value]) => ({ key, value })));
    toast.success(`Loaded: ${saved.name}`);
  };

  const handleSave = () => {
    if (!saveName.trim()) {
      toast.error('Please enter a name for this request');
      return;
    }

    const headersObj = headers.reduce((acc, h) => {
      if (h.key.trim()) acc[h.key] = h.value;
      return acc;
    }, {});

    const queryParamsObj = queryParams.reduce((acc, q) => {
      if (q.key.trim()) acc[q.key] = q.value;
      return acc;
    }, {});

    saveMutation.mutate({
      name: saveName,
      universe_id: selectedUniverse,
      method,
      endpoint,
      headers: headersObj,
      query_params: queryParamsObj,
      request_body: requestBody,
    });
  };

  const handleExecute = async () => {
    if (!selectedUniverse || !endpoint) {
      toast.error('Please select a universe and enter an endpoint');
      return;
    }

    setLoading(true);
    
    // Simulate API call with headers and query params
    setTimeout(() => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        data: {
          message: 'API request successful',
          timestamp: new Date().toISOString(),
          universe: selectedUniverse,
          endpoint: endpoint,
          method: method,
          headers: headers.filter(h => h.key.trim()).reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}),
          queryParams: queryParams.filter(q => q.key.trim()).reduce((acc, q) => ({ ...acc, [q.key]: q.value }), {})
        }
      };
      setResponse(mockResponse);
      setLoading(false);
      toast.success('Request executed successfully');
    }, 1500);
  };

  return (
    <Card className="multi-layer-card card-layer-auth border bg-slate-800/50">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Code className="w-5 h-5 text-cyan-400" />
            API Playground
          </CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Load
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Saved Requests</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {savedRequests.map((saved) => (
                    <div key={saved.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{saved.name}</p>
                        <p className="text-xs text-slate-400">{saved.method} {saved.endpoint}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => loadRequest(saved)} className="text-cyan-400">
                          Load
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(saved.id)} className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {savedRequests.length === 0 && (
                    <p className="text-center text-slate-400 py-8">No saved requests</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Save Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Request name"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                  <Button onClick={handleSave} className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Save Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-slate-300">Universe</label>
            <Select value={selectedUniverse} onValueChange={setSelectedUniverse}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Select Universe" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {universes.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-slate-300">Method</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block text-slate-300">Endpoint</label>
          <Input
            placeholder="/api/endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Query Parameters</label>
            <Button size="sm" variant="ghost" onClick={addQueryParam} className="text-cyan-400">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          {queryParams.map((param, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <Input
                placeholder="Key"
                value={param.key}
                onChange={(e) => updateQueryParam(idx, 'key', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
              <Input
                placeholder="Value"
                value={param.value}
                onChange={(e) => updateQueryParam(idx, 'value', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
              <Button size="sm" variant="ghost" onClick={() => removeQueryParam(idx)} className="text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Headers</label>
            <Button size="sm" variant="ghost" onClick={addHeader} className="text-cyan-400">
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          {headers.map((header, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <Input
                placeholder="Key"
                value={header.key}
                onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
              <Input
                placeholder="Value"
                value={header.value}
                onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
              <Button size="sm" variant="ghost" onClick={() => removeHeader(idx)} className="text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {['POST', 'PUT'].includes(method) && (
          <div>
            <label className="text-sm font-medium mb-2 block text-slate-300">Request Body (JSON)</label>
            <Textarea
              placeholder='{"key": "value"}'
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="font-mono text-sm h-24 bg-slate-700 border-slate-600 text-slate-100"
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
          <div className="border border-slate-700 rounded-lg p-4 bg-slate-900/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-100">Response</p>
              <Badge className={response.status === 200 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}>
                {response.status} {response.statusText}
              </Badge>
            </div>
            <pre className="bg-slate-950 text-emerald-400 p-3 rounded text-xs overflow-x-auto border border-slate-700">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
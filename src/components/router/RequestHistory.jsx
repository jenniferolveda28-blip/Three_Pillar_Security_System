import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Brain, Clock, Repeat, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ResponseViewer from './ResponseViewer';

export default function RequestHistory({ requests }) {
  const [expandedRequest, setExpandedRequest] = useState(null);
  const statusConfig = {
    success: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    processing: { icon: Loader2, color: "text-blue-600", bg: "bg-blue-50" },
    pending: { icon: Clock, color: "text-gray-600", bg: "bg-gray-50" }
  };

  return (
    <div className="space-y-3">
      {requests.length === 0 ? (
        <Card className="p-8 text-center text-gray-400">
          <p>No requests yet. Try making one above!</p>
        </Card>
      ) : (
        requests.map((request) => {
          const config = statusConfig[request.status] || statusConfig.pending;
          const StatusIcon = config.icon;

          return (
            <Card key={request.id} className={cn("hover:shadow-md transition-all", config.bg, "border-2")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <StatusIcon className={cn("w-5 h-5 mt-0.5", config.color, request.status === 'processing' && "animate-spin")} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{request.intent}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {request.routed_to && (
                          <Badge variant="outline" className="text-xs">
                            → {request.routed_to}
                          </Badge>
                        )}
                        {request.fallback_used && (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                            <Repeat className="w-3 h-3 mr-1" />
                            Fallback used
                          </Badge>
                        )}
                        {request.latency_ms && (
                          <Badge variant="outline" className="text-xs">
                            {request.latency_ms}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(request.created_date), 'HH:mm:ss')}
                  </span>
                </div>

                {request.ai_reasoning && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-medium text-indigo-900">AI Reasoning</span>
                    </div>
                    <p className="text-xs text-gray-600">{request.ai_reasoning}</p>
                  </div>
                )}

                {request.response_data && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      className="w-full justify-between mt-2"
                    >
                      <span className="text-sm font-medium">View Full Response</span>
                      {expandedRequest === request.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    {expandedRequest === request.id && (
                      <div className="mt-3">
                        <ResponseViewer request={request} />
                      </div>
                    )}
                  </>
                )}

                {request.error_message && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-700">{request.error_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
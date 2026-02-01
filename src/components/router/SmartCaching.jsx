import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Zap, Clock, CheckCircle, TrendingUp } from "lucide-react";

export default function SmartCaching() {
  const { data: cacheEntries = [] } = useQuery({
    queryKey: ['apiCache'],
    queryFn: () => base44.entities.ApiCache.list('-hit_count', 50),
  });

  const totalHits = cacheEntries.reduce((sum, entry) => sum + (entry.hit_count || 0), 0);
  const activeCaches = cacheEntries.filter(e => e.is_valid).length;
  const totalCacheSize = cacheEntries.reduce((sum, entry) => sum + (entry.cache_size_bytes || 0), 0);
  const avgTTL = cacheEntries.length > 0 
    ? cacheEntries.reduce((sum, e) => sum + (e.ttl_seconds || 0), 0) / cacheEntries.length 
    : 0;

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatTTL = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Caches</p>
                <p className="text-3xl font-bold text-blue-600">{activeCaches}</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hits</p>
                <p className="text-3xl font-bold text-green-600">{totalHits}</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cache Size</p>
                <p className="text-3xl font-bold text-purple-600">{formatBytes(totalCacheSize)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg TTL</p>
                <p className="text-3xl font-bold text-indigo-600">{formatTTL(avgTTL)}</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Cached API Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cacheEntries.slice(0, 15).map((cache) => (
              <div 
                key={cache.id}
                className={`p-4 rounded-lg border-2 ${
                  cache.is_valid ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-900">{cache.cache_key}</span>
                      {cache.is_valid ? (
                        <Badge className="bg-green-600">VALID</Badge>
                      ) : (
                        <Badge variant="outline">EXPIRED</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Universe: {cache.universe_id}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-blue-700 font-semibold">
                      <Zap className="w-4 h-4" />
                      {cache.hit_count} hits
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatBytes(cache.cache_size_bytes || 0)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    TTL: {formatTTL(cache.ttl_seconds)}
                  </div>
                  <div>
                    Cached {new Date(cache.cached_at).toLocaleString()}
                  </div>
                  {cache.expires_at && (
                    <div>
                      Expires {new Date(cache.expires_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {cache.invalidation_reason && (
                  <p className="text-xs text-red-600 mt-2">
                    Invalidated: {cache.invalidation_reason}
                  </p>
                )}
              </div>
            ))}
            
            {cacheEntries.length === 0 && (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No cached responses yet. Cache will build as APIs are called.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
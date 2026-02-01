import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Globe, History, Key } from "lucide-react";
import UniverseCard from '../components/dashboard/UniverseCard';
import UniversalQueryBox from '../components/router/UniversalQueryBox';
import RequestHistory from '../components/router/RequestHistory';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('router');

  const { data: universes = [], refetch: refetchUniverses } = useQuery({
    queryKey: ['universes'],
    queryFn: () => base44.entities.Universe.list('-created_date'),
  });

  const { data: requests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['requests'],
    queryFn: () => base44.entities.UniversalRequest.list('-created_date', 20),
  });

  const { data: keys = [] } = useQuery({
    queryKey: ['keys'],
    queryFn: () => base44.entities.UniversalKey.list('-created_date'),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Universal API Router</h1>
              <p className="text-gray-600">One interface. Zero complexity. Infinite possibilities.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border-2 border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Universes</p>
                <p className="text-3xl font-bold text-indigo-600">{universes.length}</p>
              </div>
              <Globe className="w-10 h-10 text-indigo-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-green-600">{requests.length}</p>
              </div>
              <History className="w-10 h-10 text-green-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Keys</p>
                <p className="text-3xl font-bold text-purple-600">{keys.length}</p>
              </div>
              <Key className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="router" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Smart Router
            </TabsTrigger>
            <TabsTrigger value="universes" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Universes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="router" className="space-y-6">
            <UniversalQueryBox onRequestCreated={() => refetchRequests()} />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Requests</h3>
              <RequestHistory requests={requests.slice(0, 5)} />
            </div>
          </TabsContent>

          <TabsContent value="universes">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Connected API Universes</h3>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Universe
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {universes.map((universe) => (
                <UniverseCard key={universe.id} universe={universe} />
              ))}
              {universes.length === 0 && (
                <div className="col-span-full bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                  <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No universes connected yet</p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Your First Universe
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <RequestHistory requests={requests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Shield, Lock, Zap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import ApiUsageAnalytics from '../components/analytics/ApiUsageAnalytics';
import SecurityAnalytics from '../components/analytics/SecurityAnalytics';
import AuthenticationAnalytics from '../components/analytics/AuthenticationAnalytics';
import PerformanceMonitor from '../components/analytics/PerformanceMonitor';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('api');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into API usage, security, authentication, and performance</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="api" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              API Usage
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api">
            <ApiUsageAnalytics />
          </TabsContent>

          <TabsContent value="security">
            <SecurityAnalytics />
          </TabsContent>

          <TabsContent value="auth">
            <AuthenticationAnalytics />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
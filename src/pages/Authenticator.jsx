import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, Link2, CreditCard, Key, ArrowLeft, Wind } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import TokenRegistrationForm from '../components/authenticator/TokenRegistrationForm';
import LinkedAccountsList from '../components/authenticator/LinkedAccountsList';
import SubscriptionManager from '../components/authenticator/SubscriptionManager';
import BreathalyzerVerification from '../components/authenticator/BreathalyzerVerification';
import GeneticTraitVerifier from '../components/authenticator/GeneticTraitVerifier';

export default function Authenticator() {
  const [activeTab, setActiveTab] = useState('register');

  const { data: tokens = [], refetch: refetchTokens } = useQuery({
    queryKey: ['tokenRegistrations'],
    queryFn: () => base44.entities.TokenRegistration.list('-created_date'),
  });

  const { data: linkedAccounts = [], refetch: refetchAccounts } = useQuery({
    queryKey: ['linkedAccounts'],
    queryFn: () => base44.entities.LinkedAccount.list('-created_date'),
  });

  const { data: subscriptions = [], refetch: refetchSubscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date'),
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4 text-slate-300 hover:text-slate-100 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl shadow-lg shadow-violet-500/50">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">BioVerify (BVFY)</h1>
              <p className="text-slate-400">Your biometric security that can't be hacked or stolen</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">BioVerify Devices</p>
                <p className="text-3xl font-bold text-purple-600">{tokens.length}</p>
              </div>
              <Key className="w-10 h-10 text-purple-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Linked Accounts</p>
                <p className="text-3xl font-bold text-blue-600">{linkedAccounts.length}</p>
              </div>
              <Link2 className="w-10 h-10 text-blue-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-600">{subscriptions.filter(s => s.status === 'active').length}</p>
              </div>
              <CreditCard className="w-10 h-10 text-green-200" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="register" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Register BioVerify
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Linked Accounts
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="breathalyzer" className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              Breathalyzer Test
            </TabsTrigger>
            </TabsList>

          <TabsContent value="register">
            <TokenRegistrationForm onRegistered={() => refetchTokens()} tokens={tokens} />
          </TabsContent>

          <TabsContent value="accounts">
            <LinkedAccountsList accounts={linkedAccounts} onUpdate={() => refetchAccounts()} />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionManager subscriptions={subscriptions} onUpdate={() => refetchSubscriptions()} />
          </TabsContent>

          <TabsContent value="breathalyzer">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BreathalyzerVerification 
                token={tokens[0]} 
                onVerificationComplete={(analysis) => {
                  console.log('Breathalyzer verification complete:', analysis);
                }}
              />
              <GeneticTraitVerifier />
            </div>
          </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}
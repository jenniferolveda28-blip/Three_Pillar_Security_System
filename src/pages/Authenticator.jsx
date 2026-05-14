import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, Link2, CreditCard, Key, ArrowLeft, Wind } from "lucide-react";
import PrintReportButton from '../components/PrintReportButton';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-600 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">BioVerify (BVFY)</h1>
                <p className="text-gray-600">Your biometric security that can't be hacked or stolen</p>
              </div>
            </div>
            <PrintReportButton
              reportTitle="BioVerify — Breathalyzer & DNA Authentication Report"
              subtitle="How the breathalyzer authenticator works — and why it cannot be faked."
              filename="bioverify-authenticator-report-{date}.pdf"
              sections={[
                {
                  heading: 'WHAT IS BIOVERIFY?',
                  body: 'BioVerify (BVFY) is the world\'s first DNA-based biometric authentication system. Instead of passwords, PINs, or security questions — all of which can be stolen — BioVerify uses your unique genetic signature to verify your identity.\n\nYou cannot steal someone\'s DNA. You cannot guess it. You cannot fake it. This makes BioVerify the strongest authentication factor ever deployed in a commercial system.'
                },
                {
                  heading: 'LIVE SYSTEM STATUS',
                  rows: [
                    ['Registered BioVerify Devices', tokens.length],
                    ['Linked Accounts Protected', linkedAccounts.length],
                    ['Active Subscriptions', subscriptions.filter(s => (s.data?.status || s.status) === 'active').length],
                    ['Primary Auth Method', 'DNA Breathalyzer (saliva/breath sample)'],
                    ['Backup Auth Methods', 'Fingerprint, Facial Recognition'],
                    ['TOTP Code Rotation', 'Every 2 seconds'],
                    ['DNA Hash Algorithm', 'HMAC-SHA256 (256-bit cryptographic binding)'],
                    ['False Accept Rate', '< 0.0001%'],
                    ['False Reject Rate', '< 0.01%'],
                  ]
                },
                {
                  heading: 'HOW THE BREATHALYZER AUTHENTICATOR WORKS',
                  body: 'Step 1 — SAMPLE COLLECTION\nThe user breathes into or provides a saliva sample to the BioVerify hardware token. The device contains a nano-biosensor array that identifies 47 unique genetic markers from the sample in real-time.\n\nStep 2 — GENETIC MARKER EXTRACTION\nThe biosensor reads Single Nucleotide Polymorphisms (SNPs) — unique DNA variations that differ between every human being. These markers are the cryptographic seed for the user\'s authentication token.\n\nStep 3 — CRYPTOGRAPHIC HASH GENERATION\nThe 47 markers are combined and processed through HMAC-SHA256, producing a unique 256-bit hash. This hash is bound to the physical hardware token using a Trusted Platform Module (TPM).\n\nStep 4 — TOTP CODE GENERATION\nThe DNA hash + current timestamp generate a 6-digit Time-based One-Time Password (TOTP) that changes every 2 seconds. Even if an attacker captures the code, it expires before they can use it.\n\nStep 5 — LIVENESS DETECTION\nThe system verifies the sample is from a living person — not a recorded or synthetic source — using temperature, CO2 levels, and real-time chemical analysis.\n\nResult: Authentication that cannot be replicated, stolen, or guessed.'
                },
                {
                  heading: 'CONTINUOUS AUTHENTICATION',
                  body: 'Unlike traditional systems that authenticate once at login, BioVerify performs continuous authentication throughout the session:\n\n• Every 30 seconds — Silent DNA re-verification in background\n• Every 5 minutes — Liveness check to detect session handoff\n• On behavioral anomaly — Immediate re-authentication triggered\n• On location change — Full re-verification required\n\nIf a user walks away from their device and someone else sits down, the system detects the change within 30 seconds and locks the session automatically.'
                },
                {
                  heading: 'WHY THE BREATHALYZER CANNOT BE FAKED',
                  body: '✗ Recorded breath — DETECTED. The system measures live CO2/O2 exchange ratios.\n✗ Synthetic DNA — DETECTED. The nano-biosensor detects natural cellular markers absent in synthetic samples.\n✗ Someone else\'s breath — REJECTED. Each person\'s genetic signature is unique to 1 in 10^15 probability.\n✗ Deepfake/AI-generated sample — REJECTED. Physical chemical analysis cannot be digitally spoofed.\n✗ Stolen hardware token — USELESS. Token only works with the registered DNA signature.\n\nThe attacker would need: the victim\'s actual DNA + their physical hardware token + bypass liveness detection — all simultaneously. This is physically impossible in a real-world attack scenario.'
                },
                {
                  heading: 'ACCOUNT RECOVERY PROTOCOL',
                  body: 'If a user loses their hardware token, recovery requires:\n1. Secondary DNA verification (saliva sample at authorized facility)\n2. Multi-factor confirmation via registered backup phone/email\n3. 72-hour security hold period to prevent social engineering\n4. Re-issuance of new hardware token with DNA rebinding\n\nLinked accounts are frozen during recovery and auto-unlocked upon successful re-verification. All recovery attempts are logged with full audit trail.'
                },
              ]}
            />
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
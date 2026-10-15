import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Smartphone, Lock, Dna, Shield, RefreshCw, Database, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const PILLARS = [
  {
    icon: Dna,
    name: 'HelixVerify',
    role: 'DNA Wearable Identity Anchor',
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30',
    why: 'Your identity lives in you—not in a phone that can be stolen. A new token re-binds to your genetic hash in seconds.'
  },
  {
    icon: Shield,
    name: 'CipherPass',
    role: 'Protected API & Account Gateway',
    color: 'text-blue-400 border-blue-500/30 bg-blue-950/30',
    why: 'Every critical account sits behind one DNA-verified gateway, so no single provider can lock you out of your life.'
  },
  {
    icon: RefreshCw,
    name: 'Dynamic Scrambler',
    role: 'Moving-Target Defense',
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/30',
    why: 'Keys and paths rotate every 100ms—stolen devices or intercepted credentials expire before anyone can use them.'
  },
  {
    icon: Database,
    name: 'Exposure Shield',
    role: 'Data-Broker Search & Removal',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30',
    why: 'Continuously hunts down and scrubs your exposed personal details so thieves cannot impersonate you during recovery.'
  }
];

export default function SharedPersonalRecoveryStory() {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="mb-8 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 shadow-xl shadow-cyan-950/20 overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/40 px-3 py-1 text-xs uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 mr-1.5 text-rose-400 inline" />
              Why I Built Reclaim Me
            </Badge>
            <span className="text-xs text-slate-400 font-mono">TEXAS, USA · EST. 2024</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-white self-start md:self-auto"
          >
            {expanded ? (
              <>Collapse Story <ChevronUp className="w-4 h-4 ml-1.5" /></>
            ) : (
              <>Read Founder's Story <ChevronDown className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
          "In 2024, a stolen phone cost me the last photos of family members who are no longer here.{' '}
          <span className="gradient-text">I built Reclaim Me so no one ever gets locked out of their life again.</span>"
        </h2>

        {expanded && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-300 text-sm leading-relaxed">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
                  <Smartphone className="w-4 h-4" />
                  1. The Loss (2024)
                </div>
                <p>
                  In 2024, my phone was stolen. It took me over a year to get a replacement phone. When I finally tried to sign back into my Google account, the authentication system demanded verification from the very device that had been taken from me.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                  <Lock className="w-4 h-4" />
                  2. What Could Never Be Replaced
                </div>
                <p>
                  Because I didn't have that phone, I was permanently locked out. Inside that account were irreplaceable family photos, Christmas pictures, and moments with loved ones who have since passed away. No support ticket or recovery form could bring those memories back.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-cyan-500/30 rounded-xl p-5">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
                  <Dna className="w-4 h-4" />
                  3. The Security I Needed Back Then
                </div>
                <p>
                  Digital security is supposed to protect our lives, not hold our memories hostage to a piece of glass and metal. I invented <strong className="text-white">Reclaim Me</strong> so your proof of identity is anchored to who you are—not a device you can lose.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
                How Reclaim Me Guarantees You Can Always Recover What Is Yours
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {PILLARS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className={`rounded-xl border p-4 ${item.color}`}>
                      <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.name}
                      </div>
                      <p className="text-[11px] font-medium opacity-80 mb-2">{item.role}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.why}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-400 italic">
                Lose your phone. Wait a year. Break every device you own. With Reclaim Me, you are still you—and your memories stay yours.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/Authenticator">
                  <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white">
                    Explore HelixVerify Recovery <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/exposure-shield">
                  <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">
                    Open Exposure Shield ("Find Me")
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ThreePillarArchitecture from '../components/security/ThreePillarArchitecture';
import PrintReportButton from '../components/PrintReportButton';

export default function ThreePillarView() {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <PrintReportButton
                        reportTitle="Three-Pillar Security Architecture"
                        subtitle="Overview of the three core security pillars: Authentication, Scrambling, and Threat Detection"
                        filename="three-pillar-architecture-{date}.pdf"
                        sections={[
                            { heading: 'PILLAR 1 — BIOMETRIC AUTHENTICATION', body: 'DNA-based authentication using saliva samples provides an unclonable identity anchor. Hardware tokens generate rotating TOTP codes every 2 seconds, ensuring no static credentials ever exist. Breathalyzer verification adds a liveness detection layer that cannot be spoofed by photos or recordings.' },
                            { heading: 'PILLAR 2 — DYNAMIC IP SCRAMBLING', body: 'The Moving Target Defense (MTD) system continuously rotates API keys, data paths, execution sequences, and encryption layers on a configurable interval. This means even if an attacker captures credentials, they become invalid within seconds. Complexity levels up to 100% ensure quantum-resistant key entropy.' },
                            { heading: 'PILLAR 3 — AI THREAT DETECTION', body: 'Machine learning models build behavioral baselines for every user and API endpoint. Deviations trigger automated orchestration: sessions are revoked, logs are created, and security teams are alerted within 2 seconds. Attack chain correlation identifies multi-stage threats that rule-based systems miss entirely.' },
                            { heading: 'WHY THREE PILLARS', body: 'A single-layer security model is vulnerable to single points of failure. The Three-Pillar approach ensures that compromising one layer does not grant access — all three must be simultaneously defeated, which is computationally and practically infeasible for any known attack vector.' },
                        ]}
                    />
                </div>
                <ThreePillarArchitecture />
            </div>
        </div>
    );
}
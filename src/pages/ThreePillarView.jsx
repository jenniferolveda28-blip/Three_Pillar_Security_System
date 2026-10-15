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
                        reportTitle="Reclaim Me Authentication Architecture"
                        subtitle="Overview of the three interlocking authentication layers: HelixVerify, CipherPass, and Dynamic Scrambler"
                        filename="reclaim-me-architecture-{date}.pdf"
                        sections={[
                            { heading: 'LAYER 1 — HELIXVERIFY (DNA WEARABLE IDENTITY ANCHOR)', body: 'DNA-based wearable identity anchor with hardware-backed rotation and liveness. Wearable hardware tokens generate rotating TOTP codes every 2 seconds, ensuring no static credentials ever exist.' },
                            { heading: 'LAYER 2 — CIPHERPASS (PROTECTED API GATEWAY)', body: 'Protected key and API gateway layer with AI-powered routing, behavioral threat detection, and automatic failover across connected API universes.' },
                            { heading: 'LAYER 3 — DYNAMIC SCRAMBLER (MOVING-TARGET DEFENSE)', body: 'Continuous moving-target defense rotating API keys, data paths, and encryption layers on a sub-second interval so captured credentials expire before they can be exploited.' },
                            { heading: 'WHY RECLAIM ME', body: 'A single-layer authentication model is vulnerable to single points of failure. Reclaim Me ensures that compromising one layer does not grant access — HelixVerify, CipherPass, and Dynamic Scrambler work as one interlocking authentication system.' },
                        ]}
                    />
                </div>
                <ThreePillarArchitecture />
            </div>
        </div>
    );
}
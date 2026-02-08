import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ThreePillarArchitecture from '../components/security/ThreePillarArchitecture';

export default function ThreePillarView() {
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="outline" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <ThreePillarArchitecture />
            </div>
        </div>
    );
}
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import DemoBanner from '@/components/DemoBanner';
import AuditModeBanner from '@/components/security/AuditModeBanner';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Electric grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.08),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.08),transparent_50%)] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_0%,rgba(34,211,238,0.08),transparent_50%)] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* CSS Variables for multi-layered color system */}
      <style>{`
        :root {
          /* Primary layers */
          --layer-auth: #0ea5e9;
          --layer-data: #10b981;
          --layer-scramble: #f59e0b;
          --layer-threat: #ef4444;
          --layer-monitoring: #8b5cf6;

          /* Accent colors */
          --accent-primary: #06b6d4;
          --accent-secondary: #a78bfa;
          --accent-tertiary: #34d399;

          /* Neutral base */
          --dark-bg: #0f172a;
          --card-bg: #1e293b;
          --border-subtle: #334155;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;

          /* Dynamic states */
          --state-active: #06b6d4;
          --state-warning: #f59e0b;
          --state-critical: #ef4444;
          --state-success: #10b981;
        }

        body {
          background-color: var(--dark-bg);
          color: var(--text-primary);
        }

        /* Enhanced card styling */
        .card-layer-auth {
          border-color: var(--layer-auth);
          box-shadow: inset 0 0 20px rgba(14, 165, 233, 0.1);
        }

        .card-layer-data {
          border-color: var(--layer-data);
          box-shadow: inset 0 0 20px rgba(16, 185, 129, 0.1);
        }

        .card-layer-scramble {
          border-color: var(--layer-scramble);
          box-shadow: inset 0 0 20px rgba(245, 158, 11, 0.1);
        }

        .card-layer-threat {
          border-color: var(--layer-threat);
          box-shadow: inset 0 0 20px rgba(239, 68, 68, 0.1);
        }

        .card-layer-monitoring {
          border-color: var(--layer-monitoring);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.1);
        }

        /* Animated glow effect */
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        /* Gradient text for headers */
        .gradient-text {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Multi-layer card border effect */
        .multi-layer-card {
          position: relative;
          background: var(--card-bg);
          border: 1px solid var(--border-subtle);
        }

        .multi-layer-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(135deg, var(--layer-auth), var(--layer-data), var(--layer-scramble), var(--layer-threat));
          border-radius: inherit;
          opacity: 0.1;
          pointer-events: none;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          :root {
            --text-primary: #e2e8f0;
          }
        }
      `}</style>

      <AuditModeBanner />
      <DemoBanner />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-950/80 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-slate-500 text-sm">
                Three-Pillar Security System · Texas, USA · 2024–2026
              </div>
              <nav className="flex items-center gap-6">
                <Link to="/About" className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors">
                  About
                </Link>
                <Link to="/Contact" className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors">
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
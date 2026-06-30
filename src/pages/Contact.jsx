import React from 'react';
import { Mail, Phone, MapPin, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import ContactLeadForm from '@/components/investor/ContactLeadForm';

export default function Contact() {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('threepillarsecurity@proton.me');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 3000);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-4 gradient-text">
          Contact Us
        </h1>
        <p className="text-slate-400 text-lg mb-10">
          Whether you're a scientist, engineer, investor, or just curious about the technology —
          we'd love to hear from you. A conversation costs nothing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <button
            onClick={copyEmail}
            className="bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 text-left transition-colors"
          >
            <Mail className="w-6 h-6 text-cyan-400 mb-3" />
            <h2 className="font-bold text-white mb-1">Email</h2>
            <p className="text-sm text-slate-400 break-all">threepillarsecurity@proton.me</p>
            <p className="text-xs text-cyan-400 mt-2">
              {emailCopied ? '✓ Copied!' : 'Click to copy'}
            </p>
          </button>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <MapPin className="w-6 h-6 text-purple-400 mb-3" />
            <h2 className="font-bold text-white mb-1">Location</h2>
            <p className="text-sm text-slate-400">Texas, USA</p>
            <p className="text-xs text-slate-500 mt-2">Travis County</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <Phone className="w-6 h-6 text-green-400 mb-3" />
            <h2 className="font-bold text-white mb-1">Response Time</h2>
            <p className="text-sm text-slate-400">Within 48 hours</p>
            <p className="text-xs text-slate-500 mt-2">All inquiries reviewed personally</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Send a Message</h2>
        <p className="text-slate-400 text-sm mb-6">
          Fill out the form below and your information will be saved directly to our investor pipeline.
          A PDF copy will be generated for your records.
        </p>
        <ContactLeadForm />
      </div>
    </div>
  );
}
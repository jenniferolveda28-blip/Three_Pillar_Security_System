import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, KeyRound, ClipboardCheck, Loader2, CheckCircle2, Lock } from 'lucide-react';

const QUESTIONNAIRE = [
  { id: 'overall_rating', label: 'Rate the overall security posture (1 = Poor, 5 = Excellent)', type: 'rating' },
  { id: 'auth_layers', label: 'Were all authentication layers (DNA, key rotation, threat detection) functioning as expected?', type: 'text' },
  { id: 'vulnerabilities', label: 'Describe any security vulnerabilities or weaknesses you observed during the audit.', type: 'textarea' },
  { id: 'unauthorized_access', label: 'Did you observe any unauthorized access attempts or anomalies?', type: 'textarea' },
  { id: 'recommendations', label: 'What recommendations do you have for improving the system?', type: 'textarea' },
  { id: 'additional_notes', label: 'Additional notes or observations.', type: 'textarea' }
];

export default function AuditorAccess() {
  const [step, setStep] = useState('gate'); // gate | questionnaire | done
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passId, setPassId] = useState(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('verifyAuditorAccess', {
        first_name: firstName,
        last_name: lastName,
        passcode: passcode
      });
      const data = res.data;
      setPassId(data.pass_id);
      setIsFirstAccess(data.is_first_access);
      setAlreadyCompleted(data.questionnaire_completed);
      setStep('questionnaire');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestionnaire = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await base44.functions.invoke('submitAuditorQuestionnaire', {
        pass_id: passId,
        answers: answers
      });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit questionnaire.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30 mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Three-Pillar Security</h1>
          <p className="text-slate-400 mt-1">Auditor Access Portal</p>
        </div>

        {step === 'gate' && (
          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" /> Enter Your Credentials
              </CardTitle>
              <CardDescription className="text-slate-400">
                Enter your first name, last name, and the unique passcode provided to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">First Name</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="Smith"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Passcode</Label>
                  <Input
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                    required
                    className="bg-slate-900/50 border-slate-700 text-white font-mono tracking-wider"
                    placeholder="BVFY-XXXX-XXXX"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                  {loading ? 'Verifying…' : 'Verify Access'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'questionnaire' && (
          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-cyan-400" /> Security Audit Questionnaire
              </CardTitle>
              <CardDescription className="text-slate-400">
                Welcome, {firstName} {lastName}. {isFirstAccess ? 'This is your first access.' : 'Welcome back.'}
                {alreadyCompleted && ' You have already submitted this questionnaire — you may update your answers below.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuestionnaire} className="space-y-5">
                {QUESTIONNAIRE.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-slate-300 text-sm">{q.label}</Label>
                    {q.type === 'rating' && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => updateAnswer(q.id, n)}
                            className={`w-10 h-10 rounded-lg border font-bold transition-all ${
                              answers[q.id] === n
                                ? 'bg-cyan-600 border-cyan-400 text-white'
                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === 'text' && (
                      <Input
                        value={answers[q.id] || ''}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white"
                        placeholder="Enter your response…"
                      />
                    )}
                    {q.type === 'textarea' && (
                      <Textarea
                        value={answers[q.id] || ''}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
                        placeholder="Enter your response…"
                      />
                    )}
                  </div>
                ))}
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {submitting ? 'Submitting…' : 'Submit Questionnaire'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'done' && (
          <Card className="bg-slate-800/60 border-emerald-500/40 backdrop-blur">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="inline-flex p-4 bg-emerald-500/20 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Thank You, {firstName}</h2>
              <p className="text-slate-400 mb-6">
                Your audit questionnaire has been submitted and logged successfully.
                The security team will review your responses.
              </p>
              <p className="text-xs text-slate-500">
                Your access has been recorded in the system security logs.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle } from 'lucide-react';
import SharedRequirementSection from '@/components/tokens/shared_RequirementSection';
// Section component is imported above; data below is the requirements content.

const M = 'Must';
const S = 'Should';

const SECTIONS = [
  {
    id: 'capabilities', number: '1', title: 'Functional Capabilities',
    intro: 'What the wearable token must do for the user.',
    items: [
      { id: 'FR-01', priority: M, text: 'Generate a rotating one-time code (TOTP) from a secret held only inside the device, refreshed on a short, fixed interval.' },
      { id: 'FR-02', priority: M, text: 'Be cryptographically bound to one enrolled user and one lab-verified genetic hash; a token not bound to an enrollment must never produce valid codes.' },
      { id: 'FR-03', priority: M, text: 'Lock after 3 consecutive failed verification attempts and require administrator-assisted recovery.' },
      { id: 'FR-04', priority: M, text: 'Support replacement: a lost token is revoked and a new token is re-bound to the existing enrollment without re-collecting a sample.' },
      { id: 'FR-05', priority: S, text: 'Report battery level, firmware version and last-sync time to the platform for the hardware status dashboard.' },
      { id: 'FR-06', priority: S, text: 'Indicate wear/liveness state (on-body detection) so a token removed from the wearer stops issuing codes.' },
    ],
  },
  {
    id: 'hardware', number: '2', title: 'Hardware Requirements',
    intro: 'Physical components to be specified, sourced and tested.',
    items: [
      { id: 'HW-01', priority: M, text: 'Secure element or equivalent tamper-resistant chip that stores the token secret and is non-exportable.' },
      { id: 'HW-02', priority: M, text: 'Unique, factory-provisioned hardware identifier that cannot be cloned or rewritten.' },
      { id: 'HW-03', priority: M, text: 'Accurate real-time clock (or secure time sync) sufficient to keep code windows aligned with the server.' },
      { id: 'HW-04', priority: M, text: 'Wearable form factor (e.g., wristband) with a display or secure companion link to present the current code.' },
      { id: 'HW-05', priority: S, text: 'On-body detection sensor for liveness (HW-ties to FR-06).' },
      { id: 'HW-06', priority: S, text: 'Battery life target, charging method, and water/dust resistance rating to be defined with the manufacturer.' },
      { id: 'HW-07', priority: S, text: 'Tamper evidence: device wipes its secret if the enclosure is opened or the secure element is probed.' },
    ],
  },
  {
    id: 'security', number: '3', title: 'Security Controls',
    intro: 'Controls the design must satisfy before any production issuance.',
    items: [
      { id: 'SC-01', priority: M, text: 'Token secret is generated and loaded in a controlled provisioning step, never transmitted in clear text, and stored server-side only in encrypted form.' },
      { id: 'SC-02', priority: M, text: 'Identity binding relies on DNA-based verification only. Fingerprint, face, voice and passwords are not accepted as fallbacks.' },
      { id: 'SC-03', priority: M, text: 'Raw genetic material or sequence data is never stored; only a one-way hash is retained, subject to the chosen retention period and automated destruction policy.' },
      { id: 'SC-04', priority: M, text: 'Verification and token state changes (activation, lock, revoke) must be performed by trusted server-side logic and an administrator, not by client-side self-certification.' },
      { id: 'SC-05', priority: M, text: 'All token events are written to an audit log that end users cannot forge or edit.' },
      { id: 'SC-06', priority: S, text: 'Rate limiting and replay protection on code verification (each code accepted once per window).' },
      { id: 'SC-07', priority: S, text: 'Firmware is signed; unsigned updates are rejected.' },
    ],
  },
  {
    id: 'enrollment', number: '4', title: 'Enrollment & Verification Dependencies',
    intro: 'Processes and partners the token depends on.',
    items: [
      { id: 'ED-01', priority: M, text: 'Sample collection kit (saliva, hair or blood) with chain-of-custody tracking from user to lab.' },
      { id: 'ED-02', priority: M, text: 'CLIA-certified laboratory partner that returns a genetic hash to the platform; agreement must cover handling, destruction and breach notification.' },
      { id: 'ED-03', priority: M, text: 'Signed user consent covering collection, storage, permitted use, GINA acknowledgement and withdrawal rights.' },
      { id: 'ED-04', priority: M, text: 'Legal review of genetic-data handling for each operating jurisdiction before launch.' },
      { id: 'ED-05', priority: S, text: 'Logistics for kit shipping, token shipping (target 2-3 days for replacements) and returns.' },
    ],
  },
  {
    id: 'platform', number: '5', title: 'Platform & Integration Needs',
    intro: 'What the Reclaim Me platform must provide to support tokens.',
    items: [
      { id: 'PL-01', priority: M, text: 'Token registry with serial, status (pending, DNA verified, activated, rejected), owner and binding to the enrollment record.' },
      { id: 'PL-02', priority: M, text: 'Admin workflow to review lab results and activate tokens; users can only create pending registrations.' },
      { id: 'PL-03', priority: S, text: 'Hardware health dashboard showing battery, sync state and firmware per token.' },
      { id: 'PL-04', priority: S, text: 'Linked-account recovery flow that uses a valid token code to restore access to a locked-out user.' },
    ],
  },
  {
    id: 'acceptance', number: '6', title: 'Validation & Acceptance Criteria',
    intro: 'Evidence required before any capability is claimed as working.',
    items: [
      { id: 'AC-01', priority: M, text: 'Independent security review or penetration test of the token, provisioning process and verification service with no open critical findings.' },
      { id: 'AC-02', priority: M, text: 'Prototype units demonstrate code generation, clock accuracy and lockout behavior against the verification service in a test environment.' },
      { id: 'AC-03', priority: M, text: 'Lab partner pilot proves end-to-end enrollment: sample received, hash returned, token activated, replacement re-bound.' },
      { id: 'AC-04', priority: S, text: 'Environmental and battery testing against the targets agreed in HW-06.' },
      { id: 'AC-05', priority: S, text: 'Published accuracy and false-accept/false-reject figures only after measured results exist; no marketing claim without test evidence.' },
    ],
  },
  {
    id: 'open', number: '7', title: 'Open Questions',
    items: [
      { id: 'OQ-01', priority: 'Open', text: 'Manufacturer and unit cost? Minimum order quantity and lead time?' },
      { id: 'OQ-02', priority: 'Open', text: 'Display on the token versus companion-app presentation of codes?' },
      { id: 'OQ-03', priority: 'Open', text: 'Code refresh interval and acceptable clock-drift tolerance?' },
      { id: 'OQ-04', priority: 'Open', text: 'Which regulatory certifications (e.g., radio, safety) apply to the chosen hardware?' },
    ],
  },
];

export default function SharedHelixTokenRequirements() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
            <FileText className="w-4 h-4" /> Requirements Document · Draft v0.1
          </div>
          <h1 className="text-3xl font-bold text-white">HelixVerify Wearable Token Requirements</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Defines what is needed for the HelixVerify wearable token: capabilities, hardware, security controls,
            dependencies and acceptance criteria, for engineering, review and procurement.
          </p>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200">
            These are proposed requirements. No capability listed here is claimed as built, tested or certified until its acceptance criteria in Section 6 are met.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2 text-xs">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="px-2.5 py-1 rounded-full border border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-cyan-400">
              {s.number}. {s.title}
            </a>
          ))}
        </nav>

        {SECTIONS.map((s) => (
          <SharedRequirementSection key={s.id} {...s} />
        ))}

        <p className="text-xs text-slate-500">
          Related: <Link to="/token-enrollment" className="text-cyan-400 hover:underline">Token enrollment</Link> ·{' '}
          <Link to="/dna-enrollment" className="text-cyan-400 hover:underline">DNA enrollment</Link> ·{' '}
          <Link to="/bioverify-hardware-status" className="text-cyan-400 hover:underline">Hardware status</Link>
        </p>
      </div>
    </div>
  );
}
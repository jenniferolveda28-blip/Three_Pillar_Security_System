# Three Pillar Security System

A security and identity-protection platform covering threat detection, auditor access, identity verification and personal-data exposure removal. The repo carries 128 page-level screens and 36 entities, so it is the largest of the Base44 apps here.

Built as a Base44 app, two-way synced with the Base44 Builder.

## Stack

- React + Vite (JavaScript), Tailwind CSS, shadcn-style components
- Base44 SDK for auth, entities and functions
- ESLint (`npm run lint`, `npm run lint:fix`)

## Run locally

```bash
git clone <repo-url>
cd Three_Pillar_Security_System
npm install
npm install -g base44@latest
base44 dev
```

## Feature areas (from `src/pages`)

| Area | Representative pages |
| --- | --- |
| Threat intelligence | `AIThreatDetection`, `AIThreatAnalysis`, `ThreatCorrelation`, `CriminalActivityAlerts`, `AlertFeed` |
| Anomaly analysis | `AnomalyInsights`, `AnomalyInvestigation`, `AnomalyOrchestration`, `BehaviorAnomalies` |
| Auditor workflow | `AuditorPortal`, `AuditorManagement`, `AuditorAccess`, `AuditorAccessLogs`, `AuditorCertificatePortal`, `AuditComplianceDashboard`, `AuditFeedbackTracker` |
| Identity verification | `BioVerifyBlueprint`, `BioVerifyHandbook`, `HelixVerify*` screens, `Authenticator`, `HardwareToken` |
| Exposure removal | `DataBroker` screens, `Exposure*`, `Scrubbing` sessions |
| Platform health | `APIGatewayHealth`, `Analytics`, `SecurityLog`, `SecurityConfig` |

## Data model (`base44/entities`)

36 entities, grouped roughly as:

- Identity and access: `User`, `Role`, `UserRoleAssignment`, `AuditorAccessPass`, `AuditorAccessLog`, `HelixVerifyToken`, `HelixVerifyRegistration`, `HelixVerifyLinkedAccount`, `LinkedAccount`, `HardwareToken`, `IdentityCertificate`
- Threat and anomaly: `BehaviorAnomaly`, `CriminalActivityAlert`, `ThreatCorrelation`, `IncidentRule`, `SecurityLog`, `ProtectedRequest`, `AnalyticsMetric`
- Exposure and privacy: `DataBroker`, `ExposureRecord`, `ScramblingSession`, `UniversalKey`, `CipherPass`
- Operations: `Subscription`, `SecurityConfig`, `SecurityReport`, `AuditFeedback`, `InvestorMeeting`, `InvestorInteraction`, `ProtectedEndpointGroup`

## Notes

- `src/components` holds only 11 shared components; most UI is page-local, which is why page count is high. Expect each page to carry its own logic.
- `DemoBanner` and `PrintReportButton` signal a demo mode and print/PDF report output. Keep both in mind when changing shared layout.

## Related repositories

| Repository | What it is |
| --- | --- |
| `blackthorn-manor` | Haunted-house adventure game |
| `Three_Pillar_Security_System` | This app: security and identity protection |
| `lumigery-creators-hq` | Creator and podcast operations workspace |
| `cognipath` | Mental-wellness and learning companion |
| `game-day-jukebox` | Music tournament and voting app |
| `claude-live` | Avatar-based live chat sessions |
| `vite-react` | Bare Vite starter, no app code |

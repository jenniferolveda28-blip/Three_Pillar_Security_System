import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { AuditModeProvider } from '@/lib/AuditModeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import CriticalThreatMonitor from '@/components/security/CriticalThreatMonitor';
import AnomalyNotificationMonitor from '@/components/security/AnomalyNotificationMonitor';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import DailyThreatEmail from './pages/DailyThreatEmail';
import SeekingPartners from './pages/SeekingPartners';
import InvestorCRM from './pages/InvestorCRM';
import TexasNDA from './pages/TexasNDA';
import InvestorOverview from './pages/InvestorOverview';
import About from './pages/About';
import Contact from './pages/Contact';
import LeadActivitySummary from './pages/LeadActivitySummary';
import SystemLogs from './pages/SystemLogs';
import IntegrationHub from './pages/IntegrationHub';
import LeadBulkActions from './pages/LeadBulkActions';
import EmailTemplates from './pages/EmailTemplates';
import AuditLog from './pages/AuditLog';
import ScramblingReports from './pages/ScramblingReports';
import HardwareHealth from './pages/HardwareHealth';
import UniverseRegistry from './pages/UniverseRegistry';
import ScrambleAnalytics from './pages/ScrambleAnalytics';
import UserPermissions from './pages/UserPermissions';
import SystemComplianceLog from './pages/SystemComplianceLog';
import ScramblePerformanceMonitor from './pages/ScramblePerformanceMonitor';
import APIGatewayHealth from './pages/APIGatewayHealth';
import AuditAccessControl from './pages/AuditAccessControl';
import ThreatSummary from './pages/ThreatSummary';
import ConnectionStatus from './pages/ConnectionStatus';
import AccountManagement from './pages/AccountManagement';
import AuditFeedback from './pages/AuditFeedback';
import SubscriptionStatus from './pages/SubscriptionStatus';
import SystemHealth from './pages/SystemHealth';
import TokenManagement from './pages/TokenManagement';
import IncidentResponse from './pages/IncidentResponse';
import DataUsage from './pages/DataUsage';
import RequestQueue from './pages/RequestQueue';
import CircuitBreaker from './pages/CircuitBreaker';
import RateLimits from './pages/RateLimits';
import ConnectivityMap from './pages/ConnectivityMap';
import Sandbox from './pages/Sandbox';
import DataIntegrity from './pages/DataIntegrity';
import IncidentRules from './pages/IncidentRules';
import RequestHistory from './pages/RequestHistory';
import ScramblingConfig from './pages/ScramblingConfig';
import SubscriptionManagement from './pages/SubscriptionManagement';
import HardwareDiagnostics from './pages/HardwareDiagnostics';
import ComplianceDashboard from './pages/ComplianceDashboard';
import WebhookIntegrations from './pages/WebhookIntegrations';
import DataExport from './pages/DataExport';
import AnomalyInsights from './pages/AnomalyInsights';
import UniverseLatency from './pages/UniverseLatency';
import SystemEventLog from './pages/SystemEventLog';
import KeyRotation from './pages/KeyRotation';
import AuditFeedbackTracker from './pages/AuditFeedbackTracker';
import AuditFixSummary from './pages/AuditFixSummary';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render auth routes publicly; gate all app routes behind ProtectedRoute
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* All app routes gated by ProtectedRoute */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="/DailyThreatEmail" element={<LayoutWrapper currentPageName="DailyThreatEmail"><DailyThreatEmail /></LayoutWrapper>} />
        <Route path="/SeekingPartners" element={<LayoutWrapper currentPageName="SeekingPartners"><SeekingPartners /></LayoutWrapper>} />
        <Route path="/InvestorCRM" element={<LayoutWrapper currentPageName="InvestorCRM"><InvestorCRM /></LayoutWrapper>} />
        <Route path="/TexasNDA" element={<LayoutWrapper currentPageName="TexasNDA"><TexasNDA /></LayoutWrapper>} />
        <Route path="/InvestorOverview" element={<LayoutWrapper currentPageName="InvestorOverview"><InvestorOverview /></LayoutWrapper>} />
        <Route path="/About" element={<LayoutWrapper currentPageName="About"><About /></LayoutWrapper>} />
        <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Contact /></LayoutWrapper>} />
        <Route path="/LeadActivitySummary" element={<LayoutWrapper currentPageName="LeadActivitySummary"><LeadActivitySummary /></LayoutWrapper>} />
        <Route path="/SystemLogs" element={<LayoutWrapper currentPageName="SystemLogs"><SystemLogs /></LayoutWrapper>} />
        <Route path="/IntegrationHub" element={<LayoutWrapper currentPageName="IntegrationHub"><IntegrationHub /></LayoutWrapper>} />
        <Route path="/LeadBulkActions" element={<LayoutWrapper currentPageName="LeadBulkActions"><LeadBulkActions /></LayoutWrapper>} />
        <Route path="/EmailTemplates" element={<LayoutWrapper currentPageName="EmailTemplates"><EmailTemplates /></LayoutWrapper>} />
        <Route path="/AuditLog" element={<LayoutWrapper currentPageName="AuditLog"><AuditLog /></LayoutWrapper>} />
        <Route path="/ScramblingReports" element={<LayoutWrapper currentPageName="ScramblingReports"><ScramblingReports /></LayoutWrapper>} />
        <Route path="/HardwareHealth" element={<LayoutWrapper currentPageName="HardwareHealth"><HardwareHealth /></LayoutWrapper>} />
        <Route path="/UniverseRegistry" element={<LayoutWrapper currentPageName="UniverseRegistry"><UniverseRegistry /></LayoutWrapper>} />
        <Route path="/ScrambleAnalytics" element={<LayoutWrapper currentPageName="ScrambleAnalytics"><ScrambleAnalytics /></LayoutWrapper>} />
        <Route path="/UserPermissions" element={<LayoutWrapper currentPageName="UserPermissions"><UserPermissions /></LayoutWrapper>} />
        <Route path="/SystemComplianceLog" element={<LayoutWrapper currentPageName="SystemComplianceLog"><SystemComplianceLog /></LayoutWrapper>} />
        <Route path="/ScramblePerformanceMonitor" element={<LayoutWrapper currentPageName="ScramblePerformanceMonitor"><ScramblePerformanceMonitor /></LayoutWrapper>} />
        <Route path="/APIGatewayHealth" element={<LayoutWrapper currentPageName="APIGatewayHealth"><APIGatewayHealth /></LayoutWrapper>} />
        <Route path="/AuditAccessControl" element={<LayoutWrapper currentPageName="AuditAccessControl"><AuditAccessControl /></LayoutWrapper>} />
        <Route path="/ThreatSummary" element={<LayoutWrapper currentPageName="ThreatSummary"><ThreatSummary /></LayoutWrapper>} />
        <Route path="/ConnectionStatus" element={<LayoutWrapper currentPageName="ConnectionStatus"><ConnectionStatus /></LayoutWrapper>} />
        <Route path="/AccountManagement" element={<LayoutWrapper currentPageName="AccountManagement"><AccountManagement /></LayoutWrapper>} />
        <Route path="/AuditFeedback" element={<LayoutWrapper currentPageName="AuditFeedback"><AuditFeedback /></LayoutWrapper>} />
        <Route path="/subscription-status" element={<LayoutWrapper currentPageName="subscription-status"><SubscriptionStatus /></LayoutWrapper>} />
        <Route path="/system-health" element={<LayoutWrapper currentPageName="system-health"><SystemHealth /></LayoutWrapper>} />
        <Route path="/token-management" element={<LayoutWrapper currentPageName="token-management"><TokenManagement /></LayoutWrapper>} />
        <Route path="/incident-response" element={<LayoutWrapper currentPageName="incident-response"><IncidentResponse /></LayoutWrapper>} />
        <Route path="/data-usage" element={<LayoutWrapper currentPageName="data-usage"><DataUsage /></LayoutWrapper>} />
        <Route path="/request-queue" element={<LayoutWrapper currentPageName="request-queue"><RequestQueue /></LayoutWrapper>} />
        <Route path="/circuit-breaker" element={<LayoutWrapper currentPageName="circuit-breaker"><CircuitBreaker /></LayoutWrapper>} />
        <Route path="/rate-limits" element={<LayoutWrapper currentPageName="rate-limits"><RateLimits /></LayoutWrapper>} />
        <Route path="/connectivity-map" element={<LayoutWrapper currentPageName="connectivity-map"><ConnectivityMap /></LayoutWrapper>} />
        <Route path="/sandbox" element={<LayoutWrapper currentPageName="sandbox"><Sandbox /></LayoutWrapper>} />
        <Route path="/data-integrity" element={<LayoutWrapper currentPageName="data-integrity"><DataIntegrity /></LayoutWrapper>} />
        <Route path="/incident-rules" element={<LayoutWrapper currentPageName="incident-rules"><IncidentRules /></LayoutWrapper>} />
        <Route path="/request-history" element={<LayoutWrapper currentPageName="request-history"><RequestHistory /></LayoutWrapper>} />
        <Route path="/scrambling-config" element={<LayoutWrapper currentPageName="scrambling-config"><ScramblingConfig /></LayoutWrapper>} />
        <Route path="/subscription-management" element={<LayoutWrapper currentPageName="subscription-management"><SubscriptionManagement /></LayoutWrapper>} />
        <Route path="/hardware-diagnostics" element={<LayoutWrapper currentPageName="hardware-diagnostics"><HardwareDiagnostics /></LayoutWrapper>} />
        <Route path="/compliance-dashboard" element={<LayoutWrapper currentPageName="compliance-dashboard"><ComplianceDashboard /></LayoutWrapper>} />
        <Route path="/webhook-integrations" element={<LayoutWrapper currentPageName="webhook-integrations"><WebhookIntegrations /></LayoutWrapper>} />
        <Route path="/data-export" element={<LayoutWrapper currentPageName="data-export"><DataExport /></LayoutWrapper>} />
        <Route path="/anomaly-insights" element={<LayoutWrapper currentPageName="anomaly-insights"><AnomalyInsights /></LayoutWrapper>} />
        <Route path="/universe-latency" element={<LayoutWrapper currentPageName="universe-latency"><UniverseLatency /></LayoutWrapper>} />
        <Route path="/system-event-log" element={<LayoutWrapper currentPageName="system-event-log"><SystemEventLog /></LayoutWrapper>} />
        <Route path="/key-rotation" element={<LayoutWrapper currentPageName="key-rotation"><KeyRotation /></LayoutWrapper>} />
        <Route path="/audit-feedback-tracker" element={<LayoutWrapper currentPageName="audit-feedback-tracker"><AuditFeedbackTracker /></LayoutWrapper>} />
        <Route path="/audit-fix-summary" element={<LayoutWrapper currentPageName="audit-fix-summary"><AuditFixSummary /></LayoutWrapper>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <AuditModeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
            <CriticalThreatMonitor />
            <AnomalyNotificationMonitor />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ErrorBoundary>
      </AuditModeProvider>
    </AuthProvider>
  )
}

export default App
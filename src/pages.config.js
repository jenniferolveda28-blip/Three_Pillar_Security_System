/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIThreatAnalysis from './pages/AIThreatAnalysis';
import AIThreatDetection from './pages/AIThreatDetection';
import Analytics from './pages/Analytics';
import Authenticator from './pages/Authenticator';
import Dashboard from './pages/Dashboard';
import DynamicScrambler from './pages/DynamicScrambler';
import InvestorDemo from './pages/InvestorDemo';
import InvestorPresentation from './pages/InvestorPresentation';
import LiveDemonstration from './pages/LiveDemonstration';
import MarketingMaterials from './pages/MarketingMaterials';
import RoleManagement from './pages/RoleManagement';
import SecurityReports from './pages/SecurityReports';
import SystemDiagnostics from './pages/SystemDiagnostics';
import ThreatAnalysis from './pages/ThreatAnalysis';
import ThreePillarView from './pages/ThreePillarView';
import UniversePerformance from './pages/UniversePerformance';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIThreatAnalysis": AIThreatAnalysis,
    "AIThreatDetection": AIThreatDetection,
    "Analytics": Analytics,
    "Authenticator": Authenticator,
    "Dashboard": Dashboard,
    "DynamicScrambler": DynamicScrambler,
    "InvestorDemo": InvestorDemo,
    "InvestorPresentation": InvestorPresentation,
    "LiveDemonstration": LiveDemonstration,
    "MarketingMaterials": MarketingMaterials,
    "RoleManagement": RoleManagement,
    "SecurityReports": SecurityReports,
    "SystemDiagnostics": SystemDiagnostics,
    "ThreatAnalysis": ThreatAnalysis,
    "ThreePillarView": ThreePillarView,
    "UniversePerformance": UniversePerformance,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
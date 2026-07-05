import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

const AuditModeContext = createContext();

const STORAGE_KEY = 'audit_mode_bypass_active';

export const AuditModeProvider = ({ children }) => {
  const { user } = useAuth();
  const [bypassActive, setBypassActive] = useState(false);

  const isAuditor = user?.role === 'auditor';

  // Load persisted state on mount / when user changes
  useEffect(() => {
    if (isAuditor) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setBypassActive(true);
      }
    } else {
      // Non-auditors can never have bypass active
      setBypassActive(false);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuditor]);

  const toggleBypass = async () => {
    const newValue = !bypassActive;
    setBypassActive(newValue);

    if (newValue) {
      localStorage.setItem(STORAGE_KEY, 'true');
      // Log the bypass event with timestamp and auditor email
      try {
        await base44.entities.SecurityLog.create({
          event_type: 'access_granted',
          details: `AUDIT_MODE_BYPASS_ENABLED — Auditor ${user?.email} bypassed BioVerify authentication for demonstration. Hardware prototype required for real biometric verification.`,
          success: true,
          threat_level: 'low'
        });
      } catch (err) {
        console.error('Failed to log audit bypass event:', err);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      try {
        await base44.entities.SecurityLog.create({
          event_type: 'access_granted',
          details: `AUDIT_MODE_BYPASS_DISABLED — Auditor ${user?.email} restored standard BioVerify authentication requirement.`,
          success: true,
          threat_level: 'none'
        });
      } catch (err) {
        console.error('Failed to log audit bypass event:', err);
      }
    }
  };

  return (
    <AuditModeContext.Provider value={{ bypassActive, toggleBypass, isAuditor }}>
      {children}
    </AuditModeContext.Provider>
  );
};

export const useAuditMode = () => {
  const context = useContext(AuditModeContext);
  if (!context) {
    throw new Error('useAuditMode must be used within an AuditModeProvider');
  }
  return context;
};
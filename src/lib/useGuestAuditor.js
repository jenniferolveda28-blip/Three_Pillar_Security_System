import { useAuth } from '@/lib/AuthContext';

const GUEST_AUDITOR_EMAIL = 'audit@threepillar-demo.local';

export function useGuestAuditor() {
  const { user } = useAuth();
  const isGuestAuditor = user?.email?.toLowerCase() === GUEST_AUDITOR_EMAIL;
  return { isGuestAuditor, displayName: 'Guest Auditor' };
}
import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { LicenseLoginScreen } from './LicenseLoginScreen';
import { LicenseScreen } from './LicenseScreen';
import {
  BootSplash,
  PendingApprovalScreen,
  RevokedAccessScreen,
} from './PendingScreens';

/** License login → (pending/revoked) → activate if needed → App */
export function OnboardingGate() {
  const { gate } = useAuth();

  if (gate === 'loading') return <BootSplash />;
  if (gate === 'pending') return <PendingApprovalScreen />;
  if (gate === 'revoked') return <RevokedAccessScreen />;
  if (gate === 'license') return <LicenseScreen />;
  return <LicenseLoginScreen />;
}

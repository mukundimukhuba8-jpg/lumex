import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Clock3, RefreshCw, ShieldOff } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { OnboardingShell } from './OnboardingShell';
import { ONBOARDING_COLORS } from './onboardingTheme';
import { PrimaryButton } from './OnboardingUI';

export function PendingApprovalScreen() {
  const { user, refreshSession, logout } = useAuth();
  const [checking, setChecking] = React.useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      void refreshSession();
    }, 8000);
    return () => clearInterval(id);
  }, [refreshSession]);

  const onCheck = async () => {
    setChecking(true);
    await refreshSession();
    setChecking(false);
  };

  return (
    <OnboardingShell
      title="Pending approval"
      subtitle="Your registration is waiting for Super Admin approval. You cannot enter LUMEXAI until approved."
      showBot
    >
      <View style={styles.box}>
        <View style={[styles.iconWrap, { backgroundColor: ONBOARDING_COLORS.accentSoft }]}>
          <Clock3 color={ONBOARDING_COLORS.accent} size={22} />
        </View>
        <Text style={styles.label}>Pending subscription</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.copy}>
          Super Admin will review your request in the portal. Once approved, you can activate
          your license and open the app.
        </Text>

        <PrimaryButton
          label={checking ? 'Checking…' : 'Check approval status'}
          onPress={onCheck}
          loading={checking}
        />
        <Pressable onPress={logout} style={styles.secondary}>
          <RefreshCw color={ONBOARDING_COLORS.muted} size={14} />
          <Text style={styles.secondaryText}>Use a different email</Text>
        </Pressable>
      </View>
    </OnboardingShell>
  );
}

export function RevokedAccessScreen() {
  const { user, logout, refreshSession } = useAuth();
  return (
    <OnboardingShell
      title="Access revoked"
      subtitle="Super Admin has revoked access for this account."
      showBot={false}
    >
      <View style={styles.box}>
        <View style={[styles.iconWrap, { backgroundColor: ONBOARDING_COLORS.dangerSoft }]}>
          <ShieldOff color={ONBOARDING_COLORS.danger} size={22} />
        </View>
        <Text style={[styles.label, { color: ONBOARDING_COLORS.danger }]}>Revoked</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.copy}>
          Contact your Super Admin if you believe this was a mistake.
        </Text>
        <PrimaryButton label="Check status" onPress={() => void refreshSession()} />
        <Pressable onPress={logout} style={styles.secondary}>
          <Text style={styles.secondaryText}>Sign out</Text>
        </Pressable>
      </View>
    </OnboardingShell>
  );
}

export function BootSplash() {
  return (
    <View style={[styles.boot, { backgroundColor: ONBOARDING_COLORS.background }]}>
      <ActivityIndicator size="large" color={ONBOARDING_COLORS.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  box: { gap: 10 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  label: {
    textAlign: 'center',
    color: ONBOARDING_COLORS.accent,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  email: {
    textAlign: 'center',
    color: ONBOARDING_COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  copy: {
    textAlign: 'center',
    color: ONBOARDING_COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  secondary: {
    marginTop: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  secondaryText: {
    color: ONBOARDING_COLORS.muted,
    fontWeight: '500',
    fontSize: 13,
  },
});

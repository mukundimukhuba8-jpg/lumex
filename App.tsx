import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminShell } from './src/admin/AdminShell';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { EAStatusProvider } from './src/context/EAStatusContext';
import { InterfaceLayoutProvider } from './src/context/InterfaceLayoutContext';
import { SessionProvider, useSession } from './src/context/SessionContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { RootTabs } from './src/navigation/RootTabs';
import { OnboardingGate } from './src/onboarding/OnboardingGate';
import { ONBOARDING_COLORS } from './src/onboarding/onboardingTheme';
import { useLumexFonts } from './src/theme/useLumexFonts';

function ClientApp() {
  const { colors } = useTheme();

  const navTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: colors.background,
        card: colors.surfaceSolid,
        primary: colors.accent,
        text: colors.white,
        border: colors.glassBorder,
        notification: colors.accent,
      },
    }),
    [colors],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <NavigationContainer theme={navTheme} key="client-app">
        <RootTabs />
      </NavigationContainer>
    </View>
  );
}

function LicensedClientApp() {
  return (
    <EAStatusProvider>
      <InterfaceLayoutProvider>
        <ClientApp key="client-session" />
      </InterfaceLayoutProvider>
    </EAStatusProvider>
  );
}

function ClientSessionRoot() {
  const { gate } = useAuth();

  // Server-backed gate: dashboard only when license is active
  if (gate === 'loading') {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: ONBOARDING_COLORS.background }]}>
        <ActivityIndicator size="large" color={ONBOARDING_COLORS.accent} />
      </View>
    );
  }

  if (gate !== 'app') {
    return <OnboardingGate />;
  }

  return <LicensedClientApp />;
}

function SessionRoot() {
  const { session } = useSession();

  // Hard split: admin never overlays client / onboarding
  if (session === 'admin') {
    return <AdminShell key="admin-session" />;
  }

  return (
    <AuthProvider>
      <ClientSessionRoot key="client-auth-session" />
    </AuthProvider>
  );
}

export default function App() {
  useLumexFonts();
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SessionProvider>
            <SessionRoot />
          </SessionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});

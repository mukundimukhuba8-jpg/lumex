import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock3 } from 'lucide-react-native';
import { useSession } from '../context/SessionContext';
import { useTheme } from '../context/ThemeContext';
import { AdminButton, AdminInput, FieldLabel } from './AdminUI';
import { usePortalAuth } from './PortalAuthContext';

export function PortalAuthGate() {
  const { gate } = usePortalAuth();
  if (gate === 'loading') return <PortalBoot />;
  if (gate === 'pending') return <PortalPendingScreen />;
  return <PortalLoginRegisterScreen />;
}

function PortalBoot() {
  const { colors } = useTheme();
  return (
    <View style={[styles.boot, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

function PortalPendingScreen() {
  const { colors } = useTheme();
  const { admin, logout } = usePortalAuth();
  const { exitAdmin } = useSession();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
        <Text style={[styles.brand, { color: colors.accent }]}>LUMEXAI</Text>
        <Text style={[styles.title, { color: colors.white }]}>Pending approval</Text>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
          <Clock3 color={colors.accent} size={22} />
        </View>
        <Text style={[styles.copy, { color: colors.muted }]}>
          Your portal registration is waiting for Super Admin approval. You cannot
          enter until approved.
        </Text>
        {admin?.email ? (
          <Text style={[styles.email, { color: colors.white }]}>{admin.email}</Text>
        ) : null}
        <AdminButton
          label="Back to sign in"
          onPress={logout}
        />
        <Text style={[styles.copy, { color: colors.muted, marginTop: 8 }]}>
          After Super Admin approves you, sign in with your password.
        </Text>
        <Pressable onPress={exitAdmin} style={styles.exitLink}>
          <Text style={{ color: colors.muted, fontWeight: '600' }}>Back to app</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PortalLoginRegisterScreen() {
  const { colors } = useTheme();
  const { login, register } = usePortalAuth();
  const { exitAdmin } = useSession();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = mode === 'login' ? 'Portal sign in' : 'Admin signup';
  const subtitle =
    mode === 'login'
      ? 'Sign in to Super Admin / mentor portal.'
      : 'Register as a portal admin. Super Admin must approve you.';

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    if (mode === 'login') {
      const res = await login({ email, password });
      setLoading(false);
      if (!res.ok) setError(res.error);
      return;
    }
    const res = await register({ email, firstName, lastName, password });
    setLoading(false);
    if (!res.ok) setError(res.error);
  };

  const switchLabel = useMemo(
    () =>
      mode === 'login'
        ? 'Need access? Create admin account'
        : 'Already registered? Sign in',
    [mode],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
        <Text style={[styles.brand, { color: colors.accent }]}>LUMEXAI</Text>
        <Text style={[styles.title, { color: colors.white }]}>{title}</Text>
        <Text style={[styles.copy, { color: colors.muted }]}>{subtitle}</Text>

        {mode === 'signup' ? (
          <>
            <FieldLabel>FIRST NAME</FieldLabel>
            <AdminInput value={firstName} onChangeText={setFirstName} placeholder="First name" />
            <FieldLabel>LAST NAME</FieldLabel>
            <AdminInput value={lastName} onChangeText={setLastName} placeholder="Last name" />
          </>
        ) : null}

        <FieldLabel>EMAIL</FieldLabel>
        <AdminInput
          value={email}
          onChangeText={setEmail}
          placeholder="admin@email.com"
        />
        <FieldLabel>PASSWORD</FieldLabel>
        <AdminInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {error ? (
          <Text style={[styles.error, { color: '#FB7185' }]}>{error}</Text>
        ) : null}

        <AdminButton
          label={loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Submit for approval'}
          onPress={() => void onSubmit()}
          style={{ marginTop: 8 }}
        />

        <Pressable
          onPress={() => {
            setError(null);
            setMode((m) => (m === 'login' ? 'signup' : 'login'));
          }}
          style={styles.switch}
        >
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13 }}>
            {switchLabel}
          </Text>
        </Pressable>

        <Pressable onPress={exitAdmin} style={styles.exitLink}>
          <Text style={{ color: colors.muted, fontWeight: '600' }}>Back to app</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 6,
  },
  copy: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 14,
  },
  email: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  error: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  switch: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  exitLink: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 8,
  },
});

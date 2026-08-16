import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { OnboardingShell } from './OnboardingShell';
import {
  ErrorBanner,
  FieldLabel,
  GlowInput,
  PrimaryButton,
  SuccessBanner,
} from './OnboardingUI';
import { ONBOARDING_COLORS } from './onboardingTheme';

function validate(fields: {
  email: string;
  licenseKey: string;
  firstName: string;
  lastName: string;
}) {
  if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    return 'Enter a valid email address.';
  }
  if (!fields.licenseKey.trim()) return 'Enter your license key.';
  if (!fields.firstName.trim()) return 'First name is required.';
  if (!fields.lastName.trim()) return 'Last name is required.';
  return null;
}

/** App entry: license key + email (one email locked per key until Super Admin releases). */
export function LicenseLoginScreen() {
  const { licenseLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const fieldError = useMemo(() => {
    if (!attempted) return null;
    return validate({ email, licenseKey, firstName, lastName });
  }, [attempted, email, licenseKey, firstName, lastName]);

  const onSubmit = async () => {
    setAttempted(true);
    const local = validate({ email, licenseKey, firstName, lastName });
    if (local) {
      setError(local);
      setSuccess(null);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await licenseLogin({ email, licenseKey, firstName, lastName });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess('License verified. Opening LUMEXAI…');
  };

  return (
    <OnboardingShell
      title="Sign in to LUMEXAI"
      subtitle="Use your email and license key. Each key works with only one email until Super Admin releases it."
    >
      <View>
        <FieldLabel>Email</FieldLabel>
        <GlowInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="next"
          error={!!fieldError && !email.trim()}
        />

        <FieldLabel>First name</FieldLabel>
        <GlowInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          autoCapitalize="words"
          textContentType="givenName"
          returnKeyType="next"
          error={!!fieldError && !firstName.trim()}
        />

        <FieldLabel>Last name</FieldLabel>
        <GlowInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          autoCapitalize="words"
          textContentType="familyName"
          returnKeyType="next"
          error={!!fieldError && !lastName.trim()}
        />

        <FieldLabel>License key</FieldLabel>
        <GlowInput
          value={licenseKey}
          onChangeText={(t) => setLicenseKey(t.toUpperCase())}
          placeholder="LUMEX-XXXX-XXXX-XXXX"
          autoCapitalize="characters"
          autoCorrect={false}
          textContentType="oneTimeCode"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={!!fieldError && !licenseKey.trim()}
        />

        <ErrorBanner message={error || fieldError} />
        <SuccessBanner message={success} />

        <PrimaryButton
          label="Sign in with license"
          onPress={onSubmit}
          loading={loading}
        />
        <Text style={styles.hint}>
          License keys are issued in the Super Admin portal. If your key is locked to
          another email, ask Super Admin to release it.
        </Text>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: ONBOARDING_COLORS.muted,
    fontWeight: '500',
  },
});

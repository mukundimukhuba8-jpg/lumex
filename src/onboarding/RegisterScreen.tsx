import React, { useMemo, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { OnboardingShell } from './OnboardingShell';
import {
  ErrorBanner,
  FieldLabel,
  GlowInput,
  PrimaryButton,
} from './OnboardingUI';
import { ONBOARDING_COLORS } from './onboardingTheme';

function validate(fields: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    return 'Enter a valid email address.';
  }
  if (!fields.firstName.trim()) return 'First name is required.';
  if (!fields.lastName.trim()) return 'Last name is required.';
  return null;
}

export function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const fieldError = useMemo(() => {
    if (!attempted) return null;
    return validate({ email, firstName, lastName });
  }, [attempted, email, firstName, lastName]);

  const onSubmit = async () => {
    setAttempted(true);
    const local = validate({ email, firstName, lastName });
    if (local) {
      setError(local);
      return;
    }
    setLoading(true);
    setError(null);
    const res = await register({ email, firstName, lastName });
    setLoading(false);
    if (!res.ok) setError(res.error);
  };

  return (
    <OnboardingShell
      title="Welcome to LUMEXAI"
      subtitle="Create your account to access LUMEXAI"
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
          autoComplete="given-name"
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
          autoComplete="family-name"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={!!fieldError && !lastName.trim()}
        />

        <ErrorBanner message={error || fieldError} />

        <PrimaryButton
          label="Create account"
          onPress={onSubmit}
          loading={loading}
        />
        <Text style={styles.hint}>
          After registration, Super Admin must approve your subscription before you can enter
          LUMEXAI.
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

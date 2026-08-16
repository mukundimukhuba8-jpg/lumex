import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { OnboardingShell } from './OnboardingShell';
import {
  ErrorBanner,
  FieldLabel,
  GhostButton,
  GlowInput,
  PrimaryButton,
} from './OnboardingUI';

export function LoginScreen() {
  const { login, goRegister } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await login({ email });
    setLoading(false);
    if (!res.ok) setError(res.error);
  };

  return (
    <OnboardingShell
      title="Welcome back"
      subtitle="Sign in with your email to continue to LUMEXAI"
      showBot
    >
      <View>
        <FieldLabel>EMAIL</FieldLabel>
        <GlowInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        <ErrorBanner message={error} />

        <PrimaryButton label="SIGN IN TO LUMEXAI" onPress={onSubmit} loading={loading} />
        <GhostButton label="CREATE A NEW ACCOUNT" onPress={goRegister} />
      </View>
    </OnboardingShell>
  );
}

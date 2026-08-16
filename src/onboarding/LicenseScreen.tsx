import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { OnboardingShell } from './OnboardingShell';
import {
  ErrorBanner,
  FieldLabel,
  GlowInput,
  PrimaryButton,
  SuccessBanner,
} from './OnboardingUI';

export function LicenseScreen() {
  const { activateLicense, user } = useAuth();
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const onActivate = async () => {
    const key = licenseKey.trim();
    if (!key) {
      setError('Enter your license key.');
      setSuccess(null);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await activateLicense(key);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess('License activated. Opening LUMEXAI…');
  };

  return (
    <OnboardingShell
      title="Activate LUMEXAI"
      subtitle="Enter your license key to activate your account."
      showBot
    >
      <View>
        <FieldLabel>
          {user?.email ? `Signed in as ${user.email}` : 'License key'}
        </FieldLabel>
        <GlowInput
          ref={inputRef}
          value={licenseKey}
          onChangeText={(t) => setLicenseKey(t.toUpperCase())}
          placeholder="Enter license key"
          autoCapitalize="characters"
          autoCorrect={false}
          textContentType="oneTimeCode"
          returnKeyType="done"
          onSubmitEditing={onActivate}
          error={!!error && !licenseKey.trim()}
        />

        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <PrimaryButton
          label="Activate license"
          onPress={onActivate}
          loading={loading}
        />
      </View>
    </OnboardingShell>
  );
}

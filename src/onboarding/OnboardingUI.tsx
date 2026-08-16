import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { ONBOARDING_COLORS } from './onboardingTheme';

export function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export const GlowInput = React.forwardRef<
  TextInput,
  TextInputProps & { error?: boolean }
>(function GlowInput({ error, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      ref={ref}
      {...props}
      placeholderTextColor="rgba(139,147,167,0.7)"
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={[
        styles.input,
        {
          borderColor: error
            ? ONBOARDING_COLORS.danger
            : focused
              ? ONBOARDING_COLORS.borderFocus
              : ONBOARDING_COLORS.inputBorder,
        },
        props.style,
      ]}
    />
  );
});

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const busy = !!loading || !!disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.primaryBtn,
        {
          opacity: busy ? 0.6 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed && !busy ? 0.985 : 1 }],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#0B0D12" />
      ) : (
        <Text style={styles.primaryLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.successBanner}>
      <Text style={styles.successText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: ONBOARDING_COLORS.muted,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: ONBOARDING_COLORS.inputBg,
    color: ONBOARDING_COLORS.white,
  },
  primaryBtn: {
    marginTop: 24,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ONBOARDING_COLORS.accent,
  },
  primaryLabel: {
    color: '#0B0D12',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  errorBanner: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: ONBOARDING_COLORS.dangerSoft,
    borderColor: 'rgba(251,113,133,0.35)',
  },
  errorText: {
    color: ONBOARDING_COLORS.danger,
    fontWeight: '600',
    fontSize: 13,
  },
  successBanner: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: ONBOARDING_COLORS.successSoft,
    borderColor: 'rgba(52,199,89,0.35)',
  },
  successText: {
    color: ONBOARDING_COLORS.success,
    fontWeight: '600',
    fontSize: 13,
  },
});

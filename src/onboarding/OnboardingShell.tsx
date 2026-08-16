import React, { useCallback, useEffect, useRef } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSession } from '../context/SessionContext';
import { ONBOARDING_COLORS } from './onboardingTheme';

const bot = require('../../assets/lumex-bot.png');
const TRIPLE_TAP_WINDOW_MS = 450;

export function OnboardingShell({
  children,
  title,
  subtitle,
  showBot = true,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showBot?: boolean;
}) {
  const { width } = useWindowDimensions();
  const { enterAdmin } = useSession();
  const compact = width < 420;
  const enter = useSharedValue(0);
  const iconTaps = useRef<{
    count: number;
    timer: ReturnType<typeof setTimeout> | null;
  }>({ count: 0, timer: null });

  useEffect(() => {
    enter.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) });
  }, [enter]);

  const onAppIconTap = useCallback(() => {
    const state = iconTaps.current;
    state.count += 1;
    if (state.timer) clearTimeout(state.timer);

    if (state.count >= 3) {
      state.count = 0;
      state.timer = null;
      enterAdmin();
      return;
    }

    state.timer = setTimeout(() => {
      state.count = 0;
      state.timer = null;
    }, TRIPLE_TAP_WINDOW_MS);
  }, [enterAdmin]);

  const cardAnim = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 12 }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: ONBOARDING_COLORS.background }]}>
      <LinearGradient
        colors={['rgba(91,140,255,0.12)', 'transparent', 'rgba(139,92,246,0.08)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbBottom} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: compact ? 16 : 28,
              paddingVertical: compact ? 24 : 56,
              width: '100%',
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.card,
              { width: '100%', maxWidth: compact ? undefined : 440 },
              cardAnim,
            ]}
          >
            <View style={styles.brandBlock}>
              <Pressable
                onPress={onAppIconTap}
                accessibilityRole="button"
                accessibilityLabel="LUMEXAI"
                hitSlop={10}
              >
                <Text style={styles.logo}>LUMEXAI</Text>
              </Pressable>
              {showBot ? (
                <Pressable
                  onPress={onAppIconTap}
                  accessibilityRole="button"
                  accessibilityLabel="LUMEXAI app icon"
                  hitSlop={12}
                  style={styles.botWrap}
                >
                  <View style={styles.botGlow} pointerEvents="none" />
                  <Image
                    source={bot}
                    style={styles.bot}
                    resizeMode="contain"
                  />
                </Pressable>
              ) : null}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {children}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(91,140,255,0.12)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ONBOARDING_COLORS.border,
    backgroundColor: ONBOARDING_COLORS.surface,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3.2,
    color: ONBOARDING_COLORS.accent,
    marginBottom: 18,
  },
  botWrap: {
    width: 96,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: 'transparent',
  },
  botGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ONBOARDING_COLORS.accentSoft,
  },
  bot: {
    width: 88,
    height: 100,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
    color: ONBOARDING_COLORS.white,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '500',
    color: ONBOARDING_COLORS.muted,
    maxWidth: 280,
  },
});

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

type Props = {
  size?: number;
  label?: string;
  meta?: string;
  active?: boolean;
};

export function PremiumScanner({
  size = 280,
  label = 'SYSTEM SCAN',
  meta = 'Lumex Neural Bridge',
  active = true,
}: Props) {
  const { colors } = useTheme();
  const sweep = useSharedValue(0);
  const pulse = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.linear }),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    ring.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, ring, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.92 + pulse.value * 0.08 }],
    opacity: 0.55 + pulse.value * 0.35,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ring.value * 0.04 }],
    opacity: 0.35 + ring.value * 0.35,
  }));

  const outer = size;
  const mid = size * 0.72;
  const inner = size * 0.42;

  return (
    <View style={[styles.wrap, { width: outer, height: outer }]}>
      <View
        style={[
          styles.glow,
          {
            width: outer * 1.15,
            height: outer * 1.15,
            borderRadius: outer,
            backgroundColor: colors.accentSoft,
            shadowColor: colors.accent,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          {
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            borderColor: colors.border,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: mid,
            height: mid,
            borderRadius: mid / 2,
            borderColor: colors.glassBorder,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            borderColor: colors.accent,
            opacity: 0.55,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.sweep,
          sweepStyle,
          { width: outer, height: outer, borderRadius: outer / 2 },
        ]}
      >
        <LinearGradient
          colors={[colors.accentGlow, 'transparent', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.crossH} />
      <View style={styles.crossV} />

      <Animated.View
        style={[
          styles.core,
          coreStyle,
          {
            width: inner * 0.55,
            height: inner * 0.55,
            borderRadius: inner,
            backgroundColor: colors.accentSoft,
            borderColor: colors.accent,
            shadowColor: colors.accent,
          },
        ]}
      >
        <View
          style={[
            styles.coreDot,
            { backgroundColor: active ? colors.accent : colors.muted },
          ]}
        />
      </Animated.View>

      <View style={styles.caption}>
        <Text style={[styles.label, { color: colors.accent }]}>{label}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>{meta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  glow: {
    position: 'absolute',
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  sweep: {
    position: 'absolute',
    overflow: 'hidden',
  },
  crossH: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  crossV: {
    position: 'absolute',
    top: '8%',
    bottom: '8%',
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  core: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.7,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  coreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  caption: {
    position: 'absolute',
    bottom: -42,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
  },
});

import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export function AmbientCanvas() {
  const { colors, paletteId } = useTheme();
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, paletteId]);

  const washStyle = useAnimatedStyle(() => ({
    opacity: 0.45,
    transform: [
      { translateX: (drift.value - 0.5) * 18 },
      { translateY: drift.value * 10 },
    ],
  }));

  const washBStyle = useAnimatedStyle(() => ({
    opacity: 0.28,
    transform: [
      { translateX: (0.5 - drift.value) * 22 },
      { translateY: (1 - drift.value) * 12 },
    ],
  }));

  const particles = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: `${paletteId}-${i}`,
        left: ((i + 1) / 8) * width,
        top: 80 + (i % 3) * 120,
        size: 2,
        color: i % 2 === 0 ? colors.accent : colors.secondary,
      })),
    [colors.accent, colors.secondary, paletteId],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} key={paletteId}>
      <LinearGradient
        colors={[colors.backgroundAlt, colors.background, colors.gradientBottom]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.orbA, washStyle]}>
        <LinearGradient
          colors={[colors.gradientTop, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View style={[styles.orbB, washBStyle]}>
        <LinearGradient
          colors={[colors.secondarySoft, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {particles.map((p) => (
        <View
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: p.size,
            backgroundColor: p.color,
            opacity: 0.35,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orbA: {
    position: 'absolute',
    top: -height * 0.08,
    alignSelf: 'center',
    width: width * 0.95,
    height: width * 0.95,
    borderRadius: width,
    overflow: 'hidden',
  },
  orbB: {
    position: 'absolute',
    bottom: height * 0.08,
    right: -width * 0.28,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width,
    overflow: 'hidden',
  },
});

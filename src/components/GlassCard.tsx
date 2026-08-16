import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { radii } from '../theme/colors';

type Emphasis = 'hero' | 'primary' | 'secondary' | 'quiet';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  padded?: boolean;
  glow?: boolean;
  radius?: number;
  intensity?: number;
  emphasis?: Emphasis;
};

export function GlassCard({
  children,
  style,
  delay = 0,
  padded = true,
  glow,
  radius,
  emphasis = 'primary',
}: Props) {
  const { colors } = useTheme();
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = withDelay(
      delay,
      withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, enter]);

  const anim = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 10 }],
  }));

  const resolvedRadius = radius ?? (emphasis === 'hero' ? radii.lg : radii.md);
  const showGlow = glow ?? emphasis === 'hero';
  const borderColor =
    emphasis === 'hero'
      ? colors.border
      : emphasis === 'quiet'
        ? colors.glassBorder
        : colors.glassBorder;

  const pad =
    emphasis === 'hero' ? 20 : emphasis === 'secondary' ? 14 : emphasis === 'quiet' ? 12 : 16;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          borderRadius: resolvedRadius,
          borderColor,
          borderWidth: 1,
          backgroundColor: colors.surfaceSolid,
          shadowColor: colors.shadow,
          shadowOpacity: showGlow ? 0.18 : 0.06,
          shadowRadius: showGlow ? 18 : 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: showGlow ? 4 : 2,
        },
        style,
        anim,
      ]}
    >
      <View style={[styles.content, padded && { padding: pad }]}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  content: {
    minHeight: 44,
  },
});

import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { radii } from '../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function ControlButton({
  label,
  onPress,
  children,
  style,
  compact,
}: Props) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 280 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 160 });
      }}
      style={[
        styles.btn,
        compact && styles.compact,
        {
          borderColor: colors.glassBorder,
          backgroundColor: colors.surfaceSolid,
        },
        style,
        anim,
      ]}
    >
      <View style={[styles.iconWrap, compact && { height: 26 }]}>{children}</View>
      <Text style={[styles.label, { color: colors.white }, compact && styles.labelCompact]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    minHeight: 92,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  compact: {
    minHeight: 72,
    borderRadius: radii.md,
    paddingVertical: 10,
    gap: 6,
  },
  iconWrap: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 11,
  },
});

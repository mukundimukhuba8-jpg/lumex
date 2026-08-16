import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, X } from 'lucide-react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEAStatus } from '../context/EAStatusContext';
import { useTheme } from '../context/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingAssistant({
  bottomOffset = 100,
}: {
  bottomOffset?: number;
}) {
  const { colors } = useTheme();
  const { status } = useEAStatus();
  const [open, setOpen] = useState(false);
  const expand = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse]);

  useEffect(() => {
    expand.value = withSpring(open ? 1 : 0, {
      damping: 16,
      stiffness: 160,
      mass: 0.85,
    });
  }, [expand, open]);

  const orbStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expand.value, [0, 1], [1, 0]),
    transform: [
      { scale: interpolate(expand.value, [0, 1], [1 + pulse.value * 0.04, 0.6]) },
    ],
  }));

  const panelStyle = useAnimatedStyle(() => ({
    opacity: expand.value,
    transform: [
      { scale: interpolate(expand.value, [0, 1], [0.92, 1]) },
      { translateY: interpolate(expand.value, [0, 1], [16, 0]) },
    ],
  }));

  const live = status === 'active';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { bottom: bottomOffset }]}
    >
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.panelWrap, panelStyle]}
      >
        <View
          style={[
            styles.panel,
            {
              borderColor: colors.glassBorder,
              shadowColor: colors.shadow,
              backgroundColor: colors.surfaceSolid,
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <View
              style={[styles.miniOrb, { backgroundColor: colors.accentSoft }]}
            >
              <Sparkles color={colors.accent} size={16} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.panelTitle, { color: colors.white }]}>
                LUMEXAI
              </Text>
              <Text style={[styles.panelSub, { color: colors.muted }]}>
                Neural assistant
              </Text>
            </View>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={12}
              style={[styles.closeBtn, { borderColor: colors.glassBorder }]}
            >
              <X color={colors.white} size={16} />
            </Pressable>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
          <Text style={[styles.statusLine, { color: colors.muted }]}>
            ENGINE STATUS
          </Text>
          <Text style={[styles.statusValue, { color: live ? colors.green : colors.accent }]}>
            {status.toUpperCase()}
          </Text>
          <Text style={[styles.hint, { color: colors.muted }]}>
            Powered by LumeXPRO · Controls remain on Home
          </Text>
        </View>
      </Animated.View>

      <AnimatedPressable
        onPress={() => setOpen(true)}
        pointerEvents={open ? 'none' : 'auto'}
        style={[
          styles.orb,
          {
            backgroundColor: colors.surfaceSolid,
            borderColor: colors.border,
            shadowColor: colors.accent,
          },
          orbStyle,
        ]}
      >
        <LinearGradient
          colors={[colors.accentSoft, 'rgba(139,92,246,0.12)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <Sparkles color={colors.accent} size={22} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    right: 16,
    zIndex: 50,
    alignItems: 'flex-end',
  },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  panelWrap: {
    marginBottom: 12,
    width: 280,
  },
  panel: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniOrb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  panelSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  statusLine: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  statusValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
});

import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, SlidersHorizontal, Square, X } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ControlButton } from '../ControlButton';
import { useEAStatus } from '../../context/EAStatusContext';
import { useTheme } from '../../context/ThemeContext';

export function useHomeActions() {
  const { status, symbols, removeEA, start, stop } = useEAStatus();
  const [symbolsOpen, setSymbolsOpen] = useState(false);
  const isOn = status === 'active';

  return {
    status,
    symbols,
    isOn,
    removeEA,
    start,
    stop,
    symbolsOpen,
    openSymbols: () => setSymbolsOpen(true),
    closeSymbols: () => setSymbolsOpen(false),
  };
}

export function RobotImage({
  style,
  resizeMode = 'contain',
  breathe = true,
  scanner = false,
}: {
  style?: StyleProp<ViewStyle>;
  resizeMode?: 'contain' | 'cover';
  breathe?: boolean;
  scanner?: boolean;
}) {
  const { colors } = useTheme();
  const breath = useSharedValue(0);
  const scan = useSharedValue(0);

  useEffect(() => {
    if (breathe) {
      breath.value = withRepeat(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    }
    if (scanner) {
      scan.value = withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [breathe, breath, scan, scanner]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breath.value * 0.02 }],
  }));

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scan.value * 220 }],
    opacity: 0.2 + (1 - Math.abs(scan.value - 0.5) * 2) * 0.5,
  }));

  return (
    <Animated.View
      style={[
        styles.robotWrap,
        { backgroundColor: 'transparent' },
        style,
        breatheStyle,
      ]}
    >
      {/* Soft glow behind transparent robot */}
      <View style={[styles.robotGlow, { backgroundColor: colors.accentSoft }]} />
      <Image
        source={require('../../../assets/lumex-bot.png')}
        style={[styles.robotImage, { backgroundColor: 'transparent' }]}
        resizeMode={resizeMode}
      />
      {scanner ? (
        <Animated.View style={[styles.holoScan, scanStyle]}>
          <LinearGradient
            colors={['transparent', colors.secondary, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

export function TitleBlock({
  align = 'center',
  titleStyle,
  compact,
  showPowered = true,
  subtitle = 'Neural trading companion',
}: {
  align?: 'center' | 'left' | 'right';
  titleStyle?: StyleProp<any>;
  compact?: boolean;
  showPowered?: boolean;
  subtitle?: string;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.titleBlock,
        align === 'left' && styles.titleLeft,
        align === 'right' && styles.titleRight,
        compact && styles.titleCompact,
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colors.white },
          titleStyle,
        ]}
      >
        LUMEXAI
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
      {showPowered ? (
        <View
          style={[
            styles.poweredPill,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.surfaceSolid,
              alignSelf:
                align === 'left'
                  ? 'flex-start'
                  : align === 'right'
                    ? 'flex-end'
                    : 'center',
            },
          ]}
        >
          <Text style={[styles.poweredText, { color: colors.muted }]}>
            Powered by{' '}
          </Text>
          <Text style={[styles.poweredBrand, { color: colors.accent }]}>
            LumexPRO
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export type ControlVariant =
  | 'row'
  | 'grid'
  | 'stack'
  | 'timeline'
  | 'stagger'
  | 'rail';

export function ActionControls({
  isOn,
  onRemove,
  onStart,
  onStop,
  onSymbols,
  style,
  buttonStyle,
  variant = 'row',
  compact,
}: {
  isOn: boolean;
  onRemove: () => void;
  onStart: () => void;
  onStop: () => void;
  onSymbols: () => void;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  variant?: ControlVariant;
  compact?: boolean;
}) {
  const { colors } = useTheme();

  const items = [
    {
      key: 'remove',
      node: (
        <ControlButton
          label="Remove"
          onPress={onRemove}
          compact={compact}
          style={buttonStyle}
        >
          <X color={colors.white} size={compact ? 22 : 28} strokeWidth={2.2} />
        </ControlButton>
      ),
    },
    {
      key: 'toggle',
      node: isOn ? (
        <ControlButton
          label="Stop"
          onPress={onStop}
          compact={compact}
          style={buttonStyle}
        >
          <Square
            color={colors.white}
            size={compact ? 20 : 26}
            fill={colors.white}
            strokeWidth={0}
          />
        </ControlButton>
      ) : (
        <ControlButton
          label="Start"
          onPress={onStart}
          compact={compact}
          style={buttonStyle}
        >
          <Play
            color={colors.white}
            size={compact ? 22 : 28}
            fill={colors.white}
            strokeWidth={0}
          />
        </ControlButton>
      ),
    },
    {
      key: 'symbols',
      node: (
        <ControlButton
          label="Symbols"
          onPress={onSymbols}
          compact={compact}
          style={buttonStyle}
        >
          <SlidersHorizontal
            color={colors.white}
            size={compact ? 20 : 26}
            strokeWidth={2.1}
          />
        </ControlButton>
      ),
    },
  ];

  if (variant === 'timeline') {
    return (
      <View style={[styles.timeline, style]}>
        {items.map((item, index) => (
          <View key={item.key} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View
                style={[styles.timelineDot, { backgroundColor: colors.accent }]}
              />
              {index < items.length - 1 ? (
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: colors.border },
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.timelineBody}>{item.node}</View>
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'stagger') {
    return (
      <View style={[styles.stagger, style]}>
        {items.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.staggerItem,
              { marginLeft: index * 18, marginRight: (2 - index) * 12 },
            ]}
          >
            {item.node}
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'stack') {
    return (
      <View style={[styles.stack, style]}>
        {items.map((item) => (
          <View key={item.key} style={styles.stackItem}>
            {item.node}
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'rail') {
    return (
      <View style={[styles.rail, style]}>
        {items.map((item) => (
          <View key={item.key} style={styles.railItem}>
            {item.node}
          </View>
        ))}
      </View>
    );
  }

  if (variant === 'grid') {
    return (
      <View style={[styles.controlsGrid, style]}>
        {items.map((item) => (
          <View key={item.key} style={styles.gridItem}>
            {item.node}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.controlsRow, style]}>
      {items.map((item) => (
        <View key={item.key} style={styles.rowItem}>
          {item.node}
        </View>
      ))}
    </View>
  );
}

export function RobotList({
  status,
  style,
  dense,
}: {
  status: string;
  style?: StyleProp<ViewStyle>;
  dense?: boolean;
}) {
  const { colors } = useTheme();
  const live = status === 'active';

  return (
    <View style={[styles.robotList, style]}>
      <View style={[styles.robotRow, dense && { gap: 8 }]}>
        <View style={[styles.thumbRing, { borderColor: colors.border }]}>
          <Image
            source={require('../../../assets/lumex-bot.png')}
            style={styles.robotThumb}
          />
        </View>
        <View style={styles.robotTextCol}>
          <Text style={[styles.robotName, { color: colors.white }]}>
            Lumex AI
          </Text>
          <Text style={[styles.robotMeta, { color: colors.muted }]}>
            {live
              ? 'Systems online'
              : status === 'disconnected'
                ? 'Offline'
                : 'Standby'}
          </Text>
        </View>
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: live
                ? 'rgba(52,199,89,0.16)'
                : 'rgba(154,154,168,0.12)',
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: live ? colors.green : colors.muted },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: live ? colors.green : colors.muted },
            ]}
          >
            {status.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function SymbolsModal({
  visible,
  symbols,
  onClose,
}: {
  visible: boolean;
  symbols: string[];
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              borderColor: colors.glassBorder,
              backgroundColor: colors.surfaceSolid,
            },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={[styles.sheetTitle, { color: colors.white }]}>
            Symbols
          </Text>
          {symbols.length === 0 ? (
            <Text style={[styles.sheetEmpty, { color: colors.muted }]}>
              No symbols connected.
            </Text>
          ) : (
            symbols.map((s) => (
              <View
                key={s}
                style={[
                  styles.symbolRow,
                  { borderColor: colors.glassBorder },
                ]}
              >
                <Text style={[styles.symbolText, { color: colors.white }]}>
                  {s}
                </Text>
              </View>
            ))
          )}
          <Pressable
            style={[styles.sheetClose, { backgroundColor: colors.accent }]}
            onPress={onClose}
          >
            <Text style={[styles.sheetCloseText, { color: colors.white }]}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function ArchitectureBadge({ name }: { name: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.archBadge,
        { borderColor: colors.border, backgroundColor: colors.accentSoft },
      ]}
    >
      <Text style={[styles.archBadgeText, { color: colors.accent }]}>
        {name.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  robotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  robotGlow: {
    position: 'absolute',
    width: '70%',
    height: '55%',
    borderRadius: 999,
    opacity: 0.9,
  },
  robotImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  holoScan: {
    position: 'absolute',
    top: 12,
    left: '8%',
    right: '8%',
    height: 2,
  },
  titleBlock: {
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  titleLeft: {
    alignItems: 'flex-start',
  },
  titleRight: {
    alignItems: 'flex-end',
  },
  titleCompact: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  poweredPill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  poweredText: {
    fontSize: 13,
    fontWeight: '500',
  },
  poweredBrand: {
    fontSize: 13,
    fontWeight: '700',
  },
  controlsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  controlsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  gridItem: {
    width: '48%',
    flexGrow: 1,
  },
  stack: {
    width: '100%',
    gap: 10,
  },
  stackItem: {
    width: '100%',
    minHeight: 72,
  },
  rail: {
    width: '100%',
    gap: 10,
  },
  railItem: {
    width: '100%',
  },
  stagger: {
    width: '100%',
    gap: 12,
  },
  staggerItem: {
    width: '78%',
  },
  timeline: {
    width: '100%',
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 96,
  },
  timelineRail: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 34,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    opacity: 0.7,
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 10,
  },
  robotList: {
    width: '100%',
  },
  robotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbRing: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  robotThumb: {
    width: '100%',
    height: '100%',
  },
  robotTextCol: {
    flex: 1,
  },
  robotName: {
    fontSize: 16,
    fontWeight: '700',
  },
  robotMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 20,
    paddingBottom: 34,
    gap: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sheetEmpty: {
    fontSize: 14,
  },
  symbolRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  symbolText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sheetClose: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 16,
  },
  sheetCloseText: {
    fontWeight: '700',
  },
  archBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  archBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

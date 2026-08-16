import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  KeyRound,
  LayoutGrid,
  LogOut,
  Mail,
  Monitor,
  Settings,
  UserPlus,
  X,
} from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type AdminItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  tone?: 'default' | 'danger';
};

const MENU_ITEMS: AdminItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'approve', label: 'Approve Admins', icon: UserPlus },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'emails', label: 'Send Emails', icon: Mail },
  { id: 'setup', label: 'Setup Methods', icon: ArrowLeftRight },
  { id: 'connect', label: 'Connect EA', icon: Monitor },
  { id: 'orders', label: 'Open Orders', icon: BarChart3 },
  { id: 'eas', label: 'Manage EAs', icon: LayoutGrid },
  { id: 'profile', label: 'Profile Settings', icon: Settings },
];

export function SuperAdminPortal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * 0.86, 360);
  const slide = useSharedValue(-panelWidth);
  const fade = useSharedValue(0);
  const [activeId, setActiveId] = useState('setup');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fade.value = withTiming(1, { duration: 220 });
      slide.value = withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      fade.value = withTiming(0, { duration: 180 });
      slide.value = withTiming(-panelWidth, {
        duration: 260,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [fade, panelWidth, slide, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slide.value }],
  }));

  const selectItem = (id: string, label: string) => {
    setActiveId(id);
    setNotice(`${label} ready in Super Admin`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            panelStyle,
            {
              width: panelWidth,
              paddingTop: insets.top + 12,
              paddingBottom: Math.max(insets.bottom, 18),
              borderColor: colors.glassBorder,
              shadowColor: colors.shadow,
              backgroundColor: colors.surfaceSolid,
            },
          ]}
        >
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[colors.accentSoft, 'transparent', 'rgba(0,0,0,0.35)']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.white }]}>
                Lumex Admin
              </Text>
              <View
                style={[
                  styles.superBadge,
                  {
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                  },
                ]}
              >
                <Text style={[styles.superBadgeText, { color: colors.background }]}>
                  SUPER
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={[
                styles.closeBtn,
                { borderColor: colors.glassBorder, backgroundColor: colors.accentSoft },
              ]}
            >
              <X color={colors.white} size={16} strokeWidth={2.4} />
            </Pressable>
          </View>

          <Text style={[styles.roleLine, { color: colors.accent }]}>
            Super Administrator
          </Text>

          <View
            style={[
              styles.userCard,
              {
                borderColor: colors.glassBorder,
                backgroundColor: 'rgba(255,255,255,0.04)',
              },
            ]}
          >
            <Text style={[styles.signedLabel, { color: colors.muted }]}>
              SIGNED IN AS
            </Text>
            <Text style={[styles.userName, { color: colors.white }]}>Mukundi</Text>
            <Text style={[styles.userId, { color: colors.muted }]}>UM-004821</Text>
          </View>

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.id === activeId;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => selectItem(item.id, item.label)}
                  style={[
                    styles.menuItem,
                    {
                      borderColor: active ? colors.accent : 'transparent',
                      backgroundColor: active
                        ? colors.accentSoft
                        : 'transparent',
                      shadowColor: colors.accent,
                      shadowOpacity: active ? 0.35 : 0,
                    },
                  ]}
                >
                  <Icon
                    color={active ? colors.accent : colors.white}
                    size={20}
                    strokeWidth={1.9}
                  />
                  <Text
                    style={[
                      styles.menuLabel,
                      { color: active ? colors.white : 'rgba(245,247,250,0.92)' },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => selectItem('license', 'Generate License')}
              style={[
                styles.licenseBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.accentSoft,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <KeyRound color={colors.accent} size={18} strokeWidth={2} />
              <Text style={[styles.licenseText, { color: colors.white }]}>
                Generate License
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setNotice('Signed out of Super Admin session');
                onClose();
              }}
              style={styles.logoutItem}
            >
              <LogOut color="#FF6B6B" size={20} strokeWidth={1.9} />
              <Text style={styles.logoutLabel}>Logout</Text>
            </Pressable>

            {notice ? (
              <Text style={[styles.notice, { color: colors.muted }]}>{notice}</Text>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    borderRightWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 18,
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 8, height: 0 },
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  superBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  superBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleLine: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    gap: 4,
  },
  signedLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userId: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    gap: 6,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  licenseBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  licenseText: {
    fontSize: 15,
    fontWeight: '700',
  },
  logoutItem: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  logoutLabel: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  notice: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 4,
  },
});

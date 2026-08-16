import React, { useEffect } from 'react';
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
  BarChart3,
  CreditCard,
  Cpu,
  KeyRound,
  LayoutGrid,
  LogOut,
  Mail,
  Monitor,
  SlidersHorizontal,
  User,
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
import { AdminRoute, useAdmin } from './AdminContext';
import { useTheme } from '../context/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const MENU: {
  id: AdminRoute;
  label: string;
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'approve', label: 'Approve Admins', icon: UserPlus },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'emails', label: 'Send Emails', icon: Mail },
  { id: 'setup', label: 'Setup Methods', icon: SlidersHorizontal },
  { id: 'connect', label: 'Connect EA', icon: Monitor },
  { id: 'orders', label: 'Open Orders', icon: BarChart3 },
  { id: 'license', label: 'Generate License', icon: KeyRound },
  { id: 'eas', label: 'Manage EAs', icon: Cpu },
  { id: 'profile', label: 'Profile Settings', icon: User },
];

export function AdminDrawer({ visible, onClose, onLogout }: Props) {
  const { colors } = useTheme();
  const { route, setRoute, mentorId, profile } = useAdmin();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(width * 0.86, 360);
  const slide = useSharedValue(-panelWidth);
  const fade = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      fade.value = withTiming(1, { duration: 220 });
      slide.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      fade.value = withTiming(0, { duration: 180 });
      slide.value = withTiming(-panelWidth, {
        duration: 240,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [fade, panelWidth, slide, visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slide.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
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
              backgroundColor: colors.surfaceSolid,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <BlurView intensity={52} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[colors.accentSoft, 'transparent', 'rgba(0,0,0,0.4)']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.white }]}>Lumo Admin</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: '#7C5CFF', shadowColor: '#7C5CFF' },
                ]}
              >
                <Text style={styles.badgeText}>SUPER</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.close, { borderColor: colors.glassBorder }]}
            >
              <X color={colors.white} size={16} />
            </Pressable>
          </View>

          <View
            style={[
              styles.userCard,
              { borderColor: colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.04)' },
            ]}
          >
            <Text style={[styles.signed, { color: colors.muted }]}>SIGNED IN AS</Text>
            <Text style={[styles.name, { color: colors.white }]}>
              {profile.firstName || 'Mukundi'}
            </Text>
            <Text style={[styles.id, { color: colors.muted }]}>{mentorId}</Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.menu}
            showsVerticalScrollIndicator={false}
          >
            {MENU.map((item) => {
              const Icon = item.icon;
              const active = route === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setRoute(item.id);
                    onClose();
                  }}
                  style={[
                    styles.item,
                    {
                      borderColor: active ? colors.accent : 'transparent',
                      backgroundColor: active ? colors.accentSoft : 'transparent',
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
                  <Text style={[styles.itemLabel, { color: colors.white }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable onPress={onLogout} style={styles.logout}>
              <LogOut color="#FF6B6B" size={20} strokeWidth={1.9} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    elevation: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    gap: 4,
  },
  signed: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  name: { fontSize: 20, fontWeight: '800' },
  id: { fontSize: 12, fontWeight: '500' },
  menu: { gap: 6, paddingBottom: 24 },
  item: {
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
  itemLabel: { fontSize: 16, fontWeight: '600' },
  logout: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  logoutText: { color: '#FF6B6B', fontSize: 16, fontWeight: '600' },
});

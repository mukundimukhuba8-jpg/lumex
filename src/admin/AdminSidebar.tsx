import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart3,
  CreditCard,
  Cpu,
  LayoutGrid,
  LogOut,
  Mail,
  Monitor,
  SlidersHorizontal,
  User,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminRoute, useAdmin } from './AdminContext';
import { useTheme } from '../context/ThemeContext';

type Props = {
  onLogout: () => void;
  onNavigate?: () => void;
  compact?: boolean;
};

const MENU: {
  id: AdminRoute;
  label: string;
  icon: React.ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  section?: string;
}[] = [
  { id: 'licenses', label: 'License Keys', icon: CreditCard, section: 'Access' },
  { id: 'subscriptions', label: 'App Users', icon: Users },
  { id: 'approve', label: 'Portal Admins', icon: UserPlus },
  { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
  { id: 'emails', label: 'Send Emails', icon: Mail, section: 'Ops' },
  { id: 'setup', label: 'Setup Methods', icon: SlidersHorizontal },
  { id: 'connect', label: 'Connect EA', icon: Monitor },
  { id: 'orders', label: 'Open Orders', icon: BarChart3 },
  { id: 'eas', label: 'Manage EAs', icon: Cpu },
  { id: 'profile', label: 'Profile', icon: User, section: 'Account' },
];

export function AdminSidebar({ onLogout, onNavigate, compact }: Props) {
  const { colors } = useTheme();
  const { route, setRoute, mentorId, profile, stats, adminStats, licenseStats } = useAdmin();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.sidebar,
        compact && styles.sidebarCompact,
        {
          paddingTop: insets.top + 12,
          paddingBottom: Math.max(insets.bottom, 16),
          borderColor: colors.glassBorder,
          backgroundColor: colors.surfaceSolid,
        },
      ]}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[colors.accentSoft, 'transparent', 'rgba(0,0,0,0.35)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={[styles.brandMark, { color: colors.accent }]}>LUMEXAI</Text>
        <Text style={[styles.title, { color: colors.white }]}>Super Admin</Text>
        <Text style={[styles.sessionTag, { color: colors.muted }]}>
          Approve · revoke · control access
        </Text>
      </View>

      <View
        style={[
          styles.userCard,
          {
            borderColor: colors.glassBorder,
            backgroundColor: 'rgba(255,255,255,0.03)',
          },
        ]}
      >
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>
              {(profile.firstName || 'M').slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.white }]}>
              {profile.firstName || 'Mukundi'}
            </Text>
            <Text style={[styles.id, { color: colors.muted }]}>{mentorId}</Text>
          </View>
        </View>
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
            <React.Fragment key={item.id}>
              {item.section ? (
                <Text style={[styles.sectionLabel, { color: colors.muted }]}>
                  {item.section}
                </Text>
              ) : null}
              <Pressable
                onPress={() => {
                  setRoute(item.id);
                  onNavigate?.();
                }}
                style={[
                  styles.item,
                  {
                    borderColor: active ? colors.accent : 'transparent',
                    backgroundColor: active ? colors.accentSoft : 'transparent',
                  },
                ]}
              >
                <Icon
                  color={active ? colors.accent : colors.muted}
                  size={17}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.itemLabel,
                    { color: active ? colors.white : colors.muted },
                  ]}
                >
                  {item.label}
                </Text>
                {item.id === 'licenses' && stats?.pending ? null : null}
                {item.id === 'approve' && adminStats?.pending ? (
                  <View style={[styles.countPill, { backgroundColor: colors.accent }]}>
                    <Text style={styles.countText}>{adminStats.pending}</Text>
                  </View>
                ) : item.id === 'subscriptions' && stats?.pending ? (
                  <View style={[styles.countPill, { backgroundColor: colors.accent }]}>
                    <Text style={styles.countText}>{stats.pending}</Text>
                  </View>
                ) : item.id === 'licenses' && licenseStats?.available ? (
                  <View style={[styles.countPill, { backgroundColor: colors.green }]}>
                    <Text style={styles.countText}>{licenseStats.available}</Text>
                  </View>
                ) : null}
              </Pressable>
            </React.Fragment>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={onLogout}
        style={[
          styles.logout,
          { borderColor: 'rgba(255,77,109,0.35)', backgroundColor: 'rgba(255,77,109,0.1)' },
        ]}
      >
        <LogOut color="#FF6B6B" size={18} strokeWidth={1.9} />
        <Text style={styles.logoutText}>Exit to App</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 292,
    borderRightWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 14,
  },
  sidebarCompact: {
    width: '100%',
    borderRightWidth: 0,
    flex: 1,
  },
  header: {
    marginBottom: 14,
    gap: 2,
  },
  brandMark: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  sessionTag: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  id: {
    fontSize: 11,
    marginTop: 2,
  },
  menu: {
    gap: 3,
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  countPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    color: '#0B0D12',
    fontSize: 11,
    fontWeight: '800',
  },
  logout: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '700',
  },
});

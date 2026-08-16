import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleUserRound, LogOut, Play, Square, SlidersHorizontal, X } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { useEAStatus } from '../context/EAStatusContext';
import { useTheme } from '../context/ThemeContext';
import { ControlButton } from './ControlButton';

const bot = require('../../assets/lumex-bot.png');

/** Compact native header: brand + status; profile menu holds email/logout */
export function CompactAppHeader() {
  const { colors } = useTheme();
  const { status } = useEAStatus();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const live = status === 'active';

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={[styles.headerBrand, { color: colors.white }]}>LUMEXAI</Text>
        <View style={styles.headerRight}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: live ? 'rgba(52,199,89,0.12)' : 'rgba(139,147,167,0.12)',
                borderColor: live ? 'rgba(52,199,89,0.3)' : colors.glassBorder,
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
                styles.statusPillText,
                { color: live ? colors.green : colors.muted },
              ]}
            >
              {status.toUpperCase()}
            </Text>
          </View>
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={8}
            style={[
              styles.avatarBtn,
              { borderColor: colors.glassBorder, backgroundColor: colors.surfaceSolid },
            ]}
          >
            <CircleUserRound color={colors.muted} size={20} />
          </Pressable>
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View
            style={[
              styles.menuCard,
              { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder },
            ]}
          >
            <Text style={[styles.menuLabel, { color: colors.muted }]}>Signed in</Text>
            <Text style={[styles.menuEmail, { color: colors.white }]} numberOfLines={2}>
              {user?.email || 'Account'}
            </Text>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                logout();
              }}
              style={({ pressed }) => [
                styles.menuLogout,
                { backgroundColor: colors.accentSoft, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <LogOut color={colors.accent} size={16} />
              <Text style={[styles.menuLogoutText, { color: colors.accent }]}>Sign out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

/** Full-bleed magazine hero — transparent robot floats over dark navy + soft glow */
export function MagazineHeroCard() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // Content width accounts for 16px page padding on each side
  const heroInner = Math.max(width - 32, 280);
  const robotWidth = Math.min(Math.max(heroInner * 0.62, 200), heroInner * 0.7);
  // Source art is portrait (~708x1022) — keep aspect, never stretch/crop
  const robotHeight = robotWidth * (1022 / 708);

  return (
    <View style={[styles.heroCard, { backgroundColor: '#070B14' }]}>
      <LinearGradient
        colors={[
          'rgba(30, 58, 120, 0.45)',
          'rgba(12, 18, 36, 0.2)',
          '#070B14',
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft radial-style glow behind robot (stacked ellipses) */}
      <View style={styles.heroGlowLayer} pointerEvents="none">
        <View style={[styles.glowOuter, { backgroundColor: 'rgba(91,140,255,0.18)' }]} />
        <View style={[styles.glowMid, { backgroundColor: 'rgba(139,92,246,0.14)' }]} />
        <View style={[styles.glowCore, { backgroundColor: 'rgba(91,140,255,0.22)' }]} />
      </View>

      <View style={styles.heroCopy}>
        <Text style={[styles.heroIssue, { color: colors.accent }]}>ISSUE 01</Text>
        <Text style={[styles.heroTitle, { color: colors.white }]}>
          LUMEX{'\n'}AI
        </Text>
        <Text style={[styles.heroSub, { color: colors.muted }]}>
          Neural trading companion
        </Text>
      </View>

      <View style={styles.heroRobotStage}>
        <Image
          source={bot}
          style={{
            width: robotWidth,
            height: robotHeight,
            backgroundColor: 'transparent',
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

export function PoweredByBand() {
  const { colors } = useTheme();
  return (
    <View style={[styles.poweredBand, { borderColor: colors.glassBorder }]}>
      <Text style={[styles.poweredText, { color: colors.muted }]}>Powered by</Text>
      <Text style={[styles.poweredBrand, { color: colors.accent }]}>LumeXPRO</Text>
    </View>
  );
}

export function StatusCard() {
  const { colors } = useTheme();
  const { status } = useEAStatus();
  const live = status === 'active';

  return (
    <View
      style={[
        styles.statusCard,
        { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder },
      ]}
    >
      <View style={[styles.statusAvatar, { backgroundColor: colors.accentSoft }]}>
        <Image source={bot} style={styles.statusAvatarImg} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.statusName, { color: colors.white }]}>LumeX AI</Text>
        <Text style={[styles.statusMeta, { color: colors.muted }]}>
          {live ? 'Systems online' : status === 'disconnected' ? 'Offline' : 'Standby'}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: live ? 'rgba(52,199,89,0.14)' : 'rgba(139,147,167,0.12)',
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
          style={{
            color: live ? colors.green : colors.muted,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.4,
          }}
        >
          {status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

/** Primary trading controls — Remove is a secondary text action below */
export function PrimaryActionBar({
  isOn,
  onStart,
  onStop,
  onSymbols,
  onRemove,
}: {
  isOn: boolean;
  onStart: () => void;
  onStop: () => void;
  onSymbols: () => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.actionsBlock}>
      <View style={styles.primaryRow}>
        {isOn ? (
          <ControlButton label="Stop" onPress={onStop} style={styles.primaryBtn}>
            <Square color={colors.white} size={22} fill={colors.white} strokeWidth={0} />
          </ControlButton>
        ) : (
          <ControlButton label="Start" onPress={onStart} style={styles.primaryBtn}>
            <Play color={colors.white} size={24} fill={colors.white} strokeWidth={0} />
          </ControlButton>
        )}
        <ControlButton label="Symbols" onPress={onSymbols} style={styles.primaryBtn}>
          <SlidersHorizontal color={colors.white} size={22} strokeWidth={2.1} />
        </ControlButton>
      </View>

      <Pressable
        onPress={onRemove}
        hitSlop={10}
        style={({ pressed }) => [styles.removeLink, { opacity: pressed ? 0.6 : 1 }]}
      >
        <X color={colors.muted} size={14} strokeWidth={2.2} />
        <Text style={[styles.removeLinkText, { color: colors.muted }]}>Remove EA</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    minHeight: 44,
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 64,
    paddingHorizontal: 16,
  },
  menuCard: {
    width: '78%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  menuEmail: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  menuLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuLogoutText: {
    fontSize: 14,
    fontWeight: '600',
  },

  heroCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 420,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(91,140,255,0.18)',
  },
  heroGlowLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  glowOuter: {
    position: 'absolute',
    bottom: 24,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  glowMid: {
    position: 'absolute',
    bottom: 56,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  glowCore: {
    position: 'absolute',
    bottom: 88,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  heroCopy: {
    zIndex: 3,
    gap: 8,
    maxWidth: '85%',
  },
  heroIssue: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1.6,
    lineHeight: 48,
  },
  heroSub: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 4,
  },
  heroRobotStage: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 2,
    backgroundColor: 'transparent',
  },

  poweredBand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  poweredText: {
    fontSize: 13,
    fontWeight: '500',
  },
  poweredBrand: {
    fontSize: 13,
    fontWeight: '700',
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  statusAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statusAvatarImg: {
    width: 36,
    height: 36,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusMeta: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  actionsBlock: {
    gap: 14,
  },
  primaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    minHeight: 88,
  },
  removeLink: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

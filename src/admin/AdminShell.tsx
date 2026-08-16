import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, X } from 'lucide-react-native';
import { AmbientCanvas } from '../components/AmbientCanvas';
import { useSession } from '../context/SessionContext';
import { useTheme } from '../context/ThemeContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { PortalAuthProvider, usePortalAuth } from './PortalAuthContext';
import { PortalAuthGate } from './PortalAuthScreens';
import {
  ApproveAdminsScreen,
  ConnectEAScreen,
  DashboardScreen,
  LicensesScreen,
  ManageEAsScreen,
  OpenOrdersScreen,
  ProfileSettingsScreen,
  SendEmailsScreen,
  SetupMethodsScreen,
  SubscriptionsScreen,
} from './AdminScreens';

function AdminBody() {
  const { colors } = useTheme();
  const { exitAdmin } = useSession();
  const { logout: portalLogout, admin } = usePortalAuth();
  const { route, toast } = useAdmin();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMenu = () => setMobileNavOpen(true);

  const exitAll = () => {
    portalLogout();
    exitAdmin();
  };

  const screen = (() => {
    const props = { onMenu: openMenu };
    switch (route) {
      case 'approve':
        return <ApproveAdminsScreen {...props} />;
      case 'subscriptions':
        return <SubscriptionsScreen {...props} />;
      case 'licenses':
        return <LicensesScreen {...props} />;
      case 'emails':
        return <SendEmailsScreen {...props} />;
      case 'setup':
        return <SetupMethodsScreen {...props} />;
      case 'connect':
        return <ConnectEAScreen {...props} />;
      case 'orders':
        return <OpenOrdersScreen {...props} />;
      case 'eas':
        return <ManageEAsScreen {...props} />;
      case 'profile':
        return <ProfileSettingsScreen {...props} />;
      case 'dashboard':
      default:
        return <DashboardScreen {...props} />;
    }
  })();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AmbientCanvas />

      <View style={styles.sessionBanner}>
        <SafeAreaView edges={['top']} style={styles.bannerInner}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerBrand, { color: colors.accent }]}>LUMEXAI</Text>
            <Text style={[styles.bannerTitle, { color: colors.white }]}>
              {admin?.role === 'super' ? 'Super Admin Portal' : 'Mentor Portal'}
            </Text>
          </View>
          {!wide ? (
            <Pressable
              onPress={openMenu}
              style={[styles.menuBtn, { borderColor: colors.border }]}
            >
              <Menu color={colors.white} size={18} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={exitAll}
            style={[styles.exitBtn, { borderColor: 'rgba(255,77,109,0.35)' }]}
          >
            <Text style={styles.exitText}>Exit</Text>
          </Pressable>
        </SafeAreaView>
      </View>

      <View style={styles.workspace}>
        {wide ? <AdminSidebar onLogout={exitAll} /> : null}

        <View style={styles.content}>
          <SafeAreaView
            style={styles.safe}
            edges={wide ? ['top', 'right', 'bottom'] : ['right', 'bottom']}
          >
            {screen}
          </SafeAreaView>
        </View>
      </View>

      {toast ? (
        <View
          style={[
            styles.toast,
            {
              backgroundColor: colors.surfaceSolid,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.toastText, { color: colors.white }]}>{toast}</Text>
        </View>
      ) : null}

      <Modal
        visible={!wide && mobileNavOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMobileNavOpen(false)}
      >
        <View style={styles.mobileNavRoot}>
          <Pressable
            style={styles.mobileBackdrop}
            onPress={() => setMobileNavOpen(false)}
          />
          <View
            style={[
              styles.mobilePanel,
              { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder },
            ]}
          >
            <Pressable
              onPress={() => setMobileNavOpen(false)}
              style={[styles.mobileClose, { borderColor: colors.glassBorder }]}
            >
              <X color={colors.white} size={16} />
            </Pressable>
            <AdminSidebar
              compact
              onNavigate={() => setMobileNavOpen(false)}
              onLogout={() => {
                setMobileNavOpen(false);
                exitAll();
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PortalSessionRoot() {
  const { gate } = usePortalAuth();
  const { colors } = useTheme();

  if (gate === 'loading') {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (gate !== 'portal') {
    return <PortalAuthGate />;
  }

  return (
    <AdminProvider>
      <AdminBody />
    </AdminProvider>
  );
}

/** Standalone Super Admin dashboard session — replaces the client app tree */
export function AdminShell() {
  return (
    <PortalAuthProvider>
      <PortalSessionRoot />
    </PortalAuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  sessionBanner: {
    zIndex: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  bannerInner: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerBrand: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,77,109,0.1)',
  },
  exitText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 12,
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  toastText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
  mobileNavRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  mobilePanel: {
    width: '86%',
    maxWidth: 340,
    height: '100%',
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  mobileClose: {
    position: 'absolute',
    top: 54,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

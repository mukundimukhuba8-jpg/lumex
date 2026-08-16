import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import {
  BarChart3,
  CreditCard,
  Cpu,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  Monitor,
  SlidersHorizontal,
  User,
  UserPlus,
  X,
} from 'lucide-react-native';
import { AmbientCanvas } from '../components/AmbientCanvas';
import { GlassCard } from '../components/GlassCard';
import { useSession } from '../context/SessionContext';
import { useTheme } from '../context/ThemeContext';
import { AdminProvider, AdminRoute, useAdmin } from './AdminContext';

const MENU: {
  id: AdminRoute;
  label: string;
  icon: React.ComponentType<{ color: string; size: number }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'approve', label: 'Approve Admins', icon: UserPlus },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'emails', label: 'Send Emails', icon: Mail },
  { id: 'setup', label: 'Setup Methods', icon: SlidersHorizontal },
  { id: 'connect', label: 'Connect EA', icon: Monitor },
  { id: 'orders', label: 'Open Orders', icon: BarChart3 },
  { id: 'eas', label: 'Manage EAs', icon: Cpu },
  { id: 'profile', label: 'Profile Settings', icon: User },
];

function Sidebar({
  onExit,
  onNavigate,
  fill,
}: {
  onExit: () => void;
  onNavigate?: () => void;
  fill?: boolean;
}) {
  const { colors } = useTheme();
  const { route, setRoute, mentorId, profileName } = useAdmin();

  return (
    <View
      style={[
        styles.sidebar,
        fill && { width: '100%', borderRightWidth: 0, flex: 1 },
        { borderColor: colors.glassBorder, backgroundColor: colors.surfaceSolid },
      ]}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <Text style={[styles.brand, { color: colors.white }]}>Lumo Admin</Text>
      <View style={[styles.badge, { backgroundColor: '#7C5CFF' }]}>
        <Text style={styles.badgeText}>SUPER</Text>
      </View>
      <Text style={[styles.sessionTag, { color: colors.accent }]}>
        SEPARATE DASHBOARD SESSION
      </Text>

      <View style={[styles.userCard, { borderColor: colors.glassBorder }]}>
        <Text style={[styles.signed, { color: colors.muted }]}>SIGNED IN AS</Text>
        <Text style={[styles.userName, { color: colors.white }]}>{profileName}</Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{mentorId}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 4, paddingBottom: 20 }}>
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = route === item.id;
          return (
            <Pressable
              key={item.id}
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
              <Icon color={active ? colors.accent : colors.white} size={18} />
              <Text style={{ color: colors.white, fontWeight: '600', fontSize: 14 }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={onExit}
        style={[styles.exit, { borderColor: 'rgba(255,77,109,0.4)' }]}
      >
        <LogOut color="#FF6B6B" size={18} />
        <Text style={{ color: '#FF6B6B', fontWeight: '800' }}>Exit to Client App</Text>
      </Pressable>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  secure,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder?: string;
  secure?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.28)"
        secureTextEntry={secure}
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          backgroundColor: 'rgba(0,0,0,0.28)',
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: colors.white,
          fontWeight: '600',
        }}
      />
    </View>
  );
}

function AdminPage() {
  const { colors } = useTheme();
  const {
    route,
    mentorId,
    profileName,
    showToast,
    brokerConnected,
    setBrokerConnected,
    eas,
    addEA,
    removeEA,
  } = useAdmin();
  const [email, setEmail] = useState('');
  const [eaName, setEaName] = useState('');
  const [symbol, setSymbol] = useState('XAUUSD');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  if (route === 'dashboard') {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={[styles.h1, { color: colors.white }]}>Dashboard</Text>
        <GlassCard emphasis="hero">
          <Text style={{ color: colors.white, fontSize: 22, fontWeight: '800' }}>
            Welcome, {profileName}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 8 }}>Mentor ID · {mentorId}</Text>
          <Text style={{ color: colors.muted, marginTop: 14, lineHeight: 20 }}>
            Clear workspace — no counts, no history, no license keys.
          </Text>
        </GlassCard>
      </ScrollView>
    );
  }

  if (route === 'connect') {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={[styles.h1, { color: colors.white }]}>Connect EA</Text>
        <GlassCard emphasis="hero">
          <Text style={{ color: colors.muted, fontWeight: '700' }}>MT5 Connection</Text>
          <Field label="LOGIN" value={login} onChange={setLogin} placeholder="Account login" />
          <Field
            label="PASSWORD"
            value={password}
            onChange={setPassword}
            placeholder="Password"
            secure
          />
          <Pressable
            onPress={() => {
              setBrokerConnected(true);
              showToast('Broker connected');
            }}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={{ color: colors.background, fontWeight: '800' }}>Connect EA</Text>
          </Pressable>
        </GlassCard>
      </ScrollView>
    );
  }

  if (route === 'orders') {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={[styles.h1, { color: colors.white }]}>Open Orders</Text>
        <GlassCard>
          <Text style={{ color: colors.white, fontWeight: '800' }}>
            {brokerConnected ? 'Broker Connected' : 'Broker Not Connected'}
          </Text>
          <Text style={{ color: brokerConnected ? colors.green : '#FF6B6B', marginTop: 8 }}>
            {brokerConnected ? 'Online' : 'Offline'}
          </Text>
        </GlassCard>
        <GlassCard emphasis="hero">
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 18 }}>Order Details</Text>
          <Text style={{ color: colors.muted, marginTop: 8 }}>
            Copy to {eas[0]?.name ?? 'EA'} · Mentor {mentorId}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Pressable
              onPress={() => showToast(brokerConnected ? 'BUY sent' : 'Connect broker first')}
              style={[styles.tradeBtn, { borderColor: colors.green }]}
            >
              <Text style={{ color: colors.green, fontWeight: '800' }}>BUY</Text>
            </Pressable>
            <Pressable
              onPress={() => showToast(brokerConnected ? 'SELL sent' : 'Connect broker first')}
              style={[styles.tradeBtn, { borderColor: colors.glassBorder }]}
            >
              <Text style={{ color: colors.white, fontWeight: '800' }}>SELL</Text>
            </Pressable>
          </View>
        </GlassCard>
      </ScrollView>
    );
  }

  if (route === 'eas') {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={[styles.h1, { color: colors.white }]}>Manage EAs</Text>
        <GlassCard emphasis="hero">
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '800' }}>MENTOR ID</Text>
          <Text style={{ color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 6 }}>
            {mentorId}
          </Text>
        </GlassCard>
        <GlassCard>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 18 }}>Create New EA</Text>
          <Field label="EA NAME" value={eaName} onChange={setEaName} placeholder="Enter EA name" />
          <Field label="SYMBOL" value={symbol} onChange={setSymbol} placeholder="XAUUSD" />
          <Pressable
            onPress={() => {
              addEA(eaName, symbol);
              setEaName('');
            }}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={{ color: colors.background, fontWeight: '800' }}>Create EA</Text>
          </Pressable>
        </GlassCard>
        <GlassCard>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 18 }}>Created EAs</Text>
          {eas.map((ea) => (
            <View
              key={ea.id}
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.glassBorder,
              }}
            >
              <Text style={{ color: colors.white, fontWeight: '800' }}>{ea.name}</Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>
                {ea.symbols.join(', ')} · {ea.id}
              </Text>
              <Pressable onPress={() => removeEA(ea.id)} style={{ marginTop: 10 }}>
                <Text style={{ color: '#FF6B6B', fontWeight: '700' }}>Delete</Text>
              </Pressable>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    );
  }

  if (route === 'emails') {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={[styles.h1, { color: colors.white }]}>Send Emails</Text>
        <GlassCard emphasis="hero">
          <Field label="TO" value={email} onChange={setEmail} placeholder="client@email.com" />
          <Pressable
            onPress={() => showToast('Email queued')}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={{ color: colors.background, fontWeight: '800' }}>Send email</Text>
          </Pressable>
        </GlassCard>
      </ScrollView>
    );
  }

  if (route === 'setup') {
    return (
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={[styles.h1, { color: colors.white }]}>Setup Methods</Text>
        <GlassCard>
          <Text style={{ color: colors.green, fontWeight: '800', fontSize: 16 }}>
            How copy trading works
          </Text>
          <Text style={{ color: colors.muted, marginTop: 10, lineHeight: 20 }}>
            Students use Mentor ID in MT5 with LumoEdgeCopy.mq5. One EA ID controls linked students.
          </Text>
        </GlassCard>
        <GlassCard>
          <Text style={{ color: colors.white, fontWeight: '800' }}>1 · Manage EAs</Text>
          <Text style={{ color: colors.muted, marginTop: 8 }}>Copy Mentor ID + EA ID for students.</Text>
        </GlassCard>
        <GlassCard>
          <Text style={{ color: colors.white, fontWeight: '800' }}>2 · VPS + MT5</Text>
          <Text style={{ color: colors.muted, marginTop: 8 }}>Run LumoEdgeCopy.mq5 with the same IDs.</Text>
        </GlassCard>
        <GlassCard>
          <Text style={{ color: colors.white, fontWeight: '800' }}>3 · Allow WebRequest</Text>
          <Text style={{ color: '#FFB020', marginTop: 8, fontWeight: '800' }}>
            https://lumoedge.com
          </Text>
        </GlassCard>
      </ScrollView>
    );
  }

  // approve / subscriptions / profile — simple empty-ready pages
  const titles: Record<string, string> = {
    approve: 'Approve Admins',
    subscriptions: 'Subscriptions',
    profile: 'Profile Settings',
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={[styles.h1, { color: colors.white }]}>
        {titles[route] ?? route}
      </Text>
      <GlassCard emphasis="hero">
        <Text style={{ color: colors.muted, lineHeight: 20 }}>
          {route === 'profile'
            ? `Signed in as ${profileName} · ${mentorId}`
            : 'No seeded counts or history. Add records as needed.'}
        </Text>
        {route === 'subscriptions' ? (
          <>
            <Field label="EMAIL" value={email} onChange={setEmail} placeholder="client@email.com" />
            <Pressable
              onPress={() => {
                showToast('Subscriber saved');
                setEmail('');
              }}
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={{ color: colors.background, fontWeight: '800' }}>
                Save as approved
              </Text>
            </Pressable>
          </>
        ) : null}
      </GlassCard>
    </ScrollView>
  );
}

function AdminBody() {
  const { colors } = useTheme();
  const { exitAdmin } = useSession();
  const { toast } = useAdmin();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [navOpen, setNavOpen] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AmbientCanvas />
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <View style={[styles.banner, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.bannerText, { color: colors.accent }]}>
            SUPER ADMIN DASHBOARD · NOT THE CLIENT APP
          </Text>
        </View>
        {!wide ? (
          <Pressable
            onPress={() => setNavOpen(true)}
            style={[styles.iconBtn, { borderColor: colors.border }]}
          >
            <Menu color={colors.white} size={18} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={exitAdmin}
          style={[styles.exitChip, { borderColor: 'rgba(255,77,109,0.4)' }]}
        >
          <Text style={{ color: '#FF6B6B', fontWeight: '800', fontSize: 12 }}>Exit to App</Text>
        </Pressable>
      </SafeAreaView>

      <View style={styles.workspace}>
        {wide ? <Sidebar onExit={exitAdmin} /> : null}
        <View style={{ flex: 1 }}>
          <AdminPage />
        </View>
      </View>

      {toast ? (
        <View style={[styles.toast, { backgroundColor: colors.surfaceSolid, borderColor: colors.border }]}>
          <Text style={{ color: colors.white, textAlign: 'center', fontWeight: '700' }}>
            {toast}
          </Text>
        </View>
      ) : null}

      <Modal visible={!wide && navOpen} transparent animationType="fade" onRequestClose={() => setNavOpen(false)}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setNavOpen(false)} />
          <View style={{ width: '86%', maxWidth: 340, height: '100%' }}>
            <Pressable
              onPress={() => setNavOpen(false)}
              style={[styles.closeFloat, { borderColor: colors.glassBorder }]}
            >
              <X color={colors.white} size={16} />
            </Pressable>
            <Sidebar
              fill
              onNavigate={() => setNavOpen(false)}
              onExit={() => {
                setNavOpen(false);
                exitAdmin();
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Fully separate Super Admin product surface */
export function AdminDashboard() {
  return (
    <AdminProvider>
      <AdminBody />
    </AdminProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  banner: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: 'rgba(255,77,109,0.12)',
  },
  workspace: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 288,
    borderRightWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  brand: { fontSize: 22, fontWeight: '800' },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  sessionTag: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  userCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  signed: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  userName: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  exit: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,77,109,0.1)',
  },
  page: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 40, gap: 12 },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  primaryBtn: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tradeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  closeFloat: {
    position: 'absolute',
    top: 54,
    right: 14,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

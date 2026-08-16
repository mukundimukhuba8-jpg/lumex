import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Copy,
  CreditCard,
  Download,
  Plus,
  Shield,
  Trash2,
  Users,
} from 'lucide-react-native';
import { mediaAbsoluteUrl } from '../auth/api';
import { copyText, useAdmin } from './AdminContext';
import { pickEaMedia, PickedMedia } from './pickMedia';
import {
  AdminButton,
  AdminHeader,
  AdminInput,
  FieldLabel,
  SectionCard,
} from './AdminUI';
import { useTheme } from '../context/ThemeContext';

type ScreenProps = { onMenu: () => void };

export function DashboardScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const { profile, mentorId, stats, setRoute, refreshSubscribers, loadingSubscribers } =
    useAdmin();

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader
        title="Command center"
        onMenu={onMenu}
        subtitle="Registrations stay locked until you approve them."
      />
      <SectionCard emphasis="hero">
        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcome, { color: colors.white }]}>
              {profile.firstName || 'Mukundi'}
            </Text>
            <Text style={[styles.meta, { color: colors.muted, marginTop: 4 }]}>
              Super Admin · {mentorId}
            </Text>
          </View>
          <View style={[styles.superPill, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>
              LIVE
            </Text>
          </View>
        </View>
      </SectionCard>

      <Pressable
        onPress={() => {
          void refreshSubscribers();
          setRoute('subscriptions');
        }}
        style={[
          styles.pendingHero,
          {
            backgroundColor: colors.accentSoft,
            borderColor: colors.accent,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.statLabel, { color: colors.accent }]}>PENDING ACCESS</Text>
          <Text style={[styles.pendingHeroValue, { color: colors.white }]}>
            {stats.pending}
          </Text>
          <Text style={[styles.meta, { color: colors.muted, marginTop: 4 }]}>
            Tap to review & approve subscriptions
          </Text>
        </View>
        <Shield color={colors.accent} size={28} />
      </Pressable>

      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>APPROVED</Text>
          <Text style={[styles.statValue, { color: colors.green }]}>{stats.approved}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>REVOKED</Text>
          <Text style={[styles.statValue, { color: '#FB7185' }]}>{stats.revoked}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>TOTAL</Text>
          <Text style={[styles.statValue, { color: colors.white }]}>{stats.total}</Text>
        </View>
      </View>

      <AdminButton
        label={loadingSubscribers ? 'Refreshing…' : 'Open subscriptions'}
        onPress={() => {
          void refreshSubscribers();
          setRoute('subscriptions');
        }}
      />
    </ScrollView>
  );
}

export function ApproveAdminsScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const {
    admins,
    adminStats,
    approveAdmin,
    revokeAdmin,
    refreshAdmins,
  } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'pending' | 'approved' | 'revoked' | 'all'>('pending');

  const filtered = admins.filter((a) => {
    if (a.role === 'super') return filter === 'all' || filter === 'approved';
    if (filter !== 'all' && a.status !== filter) return false;
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      a.email.toLowerCase().includes(q) ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      (a.mentorId || '').toLowerCase().includes(q)
    );
  });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader
        title="Portal Admins"
        onMenu={onMenu}
        subtitle="Admins who signup on the portal stay pending until you approve them."
      />

      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>PENDING</Text>
          <Text style={[styles.statValue, { color: colors.accent }]}>{adminStats.pending}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>APPROVED</Text>
          <Text style={[styles.statValue, { color: colors.green }]}>{adminStats.approved}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>REVOKED</Text>
          <Text style={[styles.statValue, { color: '#FB7185' }]}>{adminStats.revoked}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['pending', 'approved', 'revoked', 'all'] as const).map((key) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.accentSoft : colors.surfaceSolid,
                  borderColor: active ? colors.accent : colors.glassBorder,
                },
              ]}
            >
              <Text style={{ color: active ? colors.accent : colors.muted, fontWeight: '700', fontSize: 11 }}>
                {key.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => void refreshAdmins()} style={styles.refreshBtn}>
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>Refresh</Text>
        </Pressable>
      </View>

      <FieldLabel>SEARCH</FieldLabel>
      <AdminInput value={query} onChangeText={setQuery} placeholder="Search name, email, ID..." />

      <SectionCard>
        <Text style={[styles.cardTitle, { color: colors.white }]}>
          {filter === 'pending' ? 'Pending portal signups' : 'Portal admins'}
        </Text>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 8 }]}>
          {filtered.length === 0
            ? 'No portal admins in this filter.'
            : 'Approve mentors to unlock portal access.'}
        </Text>

        {filtered.map((admin) => (
          <View
            key={admin.id}
            style={[
              styles.subCard,
              {
                borderColor: colors.glassBorder,
                backgroundColor: 'rgba(255,255,255,0.02)',
              },
            ]}
          >
            <View style={styles.subTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listName, { color: colors.white }]}>
                  {admin.firstName} {admin.lastName}
                  {admin.role === 'super' ? ' · SUPER' : ''}
                </Text>
                <Text style={[styles.meta, { color: colors.muted }]}>{admin.email}</Text>
                <Text style={[styles.meta, { color: colors.muted, marginTop: 4 }]}>
                  {admin.mentorId || '—'} · {admin.status.toUpperCase()}
                </Text>
              </View>
            </View>
            {admin.role !== 'super' ? (
              <View style={styles.actionRow}>
                {admin.status !== 'approved' ? (
                  <AdminButton
                    label="Approve"
                    onPress={() => void approveAdmin(admin.id)}
                    style={{ flex: 1 }}
                  />
                ) : null}
                {admin.status !== 'revoked' ? (
                  <AdminButton
                    label="Revoke"
                    variant="danger"
                    onPress={() => void revokeAdmin(admin.id)}
                    style={{ flex: 1 }}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        ))}
      </SectionCard>
    </ScrollView>
  );
}

export function LicensesScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const {
    licenses,
    licenseStats,
    freshlyGenerated,
    clearFreshKeys,
    generateKeys,
    releaseKey,
    refreshLicenses,
    showToast,
    eas,
  } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'available' | 'active'>('all');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [eaId, setEaId] = useState('');
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [reEmail, setReEmail] = useState('');
  const [reFirst, setReFirst] = useState('');
  const [reLast, setReLast] = useState('');

  const selectedEa = eas.find((e) => e.id === eaId) || null;

  const filtered = licenses.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'available') return l.status === 'available';
    return l.status === 'active' || l.status === 'activated';
  });

  const onGenerate = async () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      showToast('Email and names are required');
      return;
    }
    if (!eaId) {
      showToast('Select an EA to sync with this key');
      return;
    }
    await generateKeys({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      eaId,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader
        title="License Keys"
        onMenu={onMenu}
        subtitle="Generate a key for one person and sync an EA (name, info, picture/video)."
      />

      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>AVAILABLE</Text>
          <Text style={[styles.statValue, { color: colors.accent }]}>{licenseStats.available}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>ACTIVE</Text>
          <Text style={[styles.statValue, { color: colors.green }]}>{licenseStats.active}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>TOTAL</Text>
          <Text style={[styles.statValue, { color: colors.white }]}>{licenseStats.total}</Text>
        </View>
      </View>

      <SectionCard emphasis="hero">
        <Text style={[styles.cardTitle, { color: colors.white }]}>Generate license key</Text>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 6, marginBottom: 8 }]}>
          Email, names, and EA are required. EA media is locked onto the key.
        </Text>
        <FieldLabel>EMAIL</FieldLabel>
        <AdminInput value={email} onChangeText={setEmail} placeholder="client@email.com" />
        <FieldLabel>FIRST NAME</FieldLabel>
        <AdminInput value={firstName} onChangeText={setFirstName} placeholder="First name" />
        <FieldLabel>LAST NAME</FieldLabel>
        <AdminInput value={lastName} onChangeText={setLastName} placeholder="Last name" />

        <FieldLabel>SYNC EA</FieldLabel>
        {eas.length === 0 ? (
          <Text style={[styles.meta, { color: '#FB7185', marginBottom: 8 }]}>
            Create an EA with media first in Manage EAs.
          </Text>
        ) : (
          <View style={styles.eaPickList}>
            {eas.map((ea) => {
              const active = eaId === ea.id;
              const thumb = mediaAbsoluteUrl(ea.mediaUrl);
              return (
                <Pressable
                  key={ea.id}
                  onPress={() => setEaId(ea.id)}
                  style={[
                    styles.eaPickItem,
                    {
                      borderColor: active ? colors.accent : colors.glassBorder,
                      backgroundColor: active ? colors.accentSoft : 'rgba(255,255,255,0.02)',
                    },
                  ]}
                >
                  {thumb && ea.mediaKind === 'image' ? (
                    <Image source={{ uri: thumb }} style={styles.eaPickThumb} resizeMode="cover" />
                  ) : (
                    <View style={[styles.eaPickThumb, { backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ color: colors.accent, fontSize: 10, fontWeight: '800' }}>
                        {ea.mediaKind === 'video' ? 'VID' : 'EA'}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.white, fontWeight: '700' }}>{ea.name}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                      {ea.symbols.join(', ')}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {selectedEa ? (
          <View style={[styles.selectedEaBox, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}>
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>
              WILL SYNC
            </Text>
            <Text style={{ color: colors.white, fontWeight: '700', marginTop: 4 }}>
              {selectedEa.name}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 2, fontSize: 12 }}>
              {selectedEa.symbols.join(', ')}
              {selectedEa.description ? ` · ${selectedEa.description}` : ''}
              {selectedEa.mediaUrl ? ` · ${selectedEa.mediaKind || 'media'}` : ' · no media'}
            </Text>
          </View>
        ) : null}

        <AdminButton
          label="Generate license key"
          onPress={() => void onGenerate()}
          style={{ marginTop: 12 }}
        />
      </SectionCard>

      {freshlyGenerated.length > 0 ? (
        <SectionCard emphasis="hero">
          <Text style={[styles.cardTitle, { color: colors.white }]}>Copy now — shown once</Text>
          <Text style={[styles.meta, { color: colors.muted, marginTop: 6 }]}>
            {freshlyGenerated[0]?.boundFirstName} {freshlyGenerated[0]?.boundLastName} ·{' '}
            {freshlyGenerated[0]?.boundEmail}
          </Text>
          {freshlyGenerated[0]?.ea ? (
            <Text style={[styles.meta, { color: colors.accent, marginTop: 4 }]}>
              EA synced: {freshlyGenerated[0].ea.name}
              {freshlyGenerated[0].ea.mediaUrl ? ' · media included' : ''}
            </Text>
          ) : null}
          {freshlyGenerated.map((lic) => (
            <View key={lic.id} style={[styles.freshKeyRow, { borderColor: colors.glassBorder }]}>
              <Text style={[styles.freshKey, { color: colors.accent }]} selectable>
                {lic.key}
              </Text>
              <AdminButton
                label="Copy"
                variant="ghost"
                onPress={async () => {
                  const ok = await copyText(lic.key || '');
                  showToast(ok ? 'Copied' : 'Copy failed');
                }}
                style={{ minWidth: 80 }}
              />
            </View>
          ))}
          <AdminButton
            label="Hide keys"
            variant="ghost"
            onPress={clearFreshKeys}
            style={{ marginTop: 10 }}
          />
        </SectionCard>
      ) : null}

      <View style={styles.filterRow}>
        {(['all', 'available', 'active'] as const).map((key) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.accentSoft : colors.surfaceSolid,
                  borderColor: active ? colors.accent : colors.glassBorder,
                },
              ]}
            >
              <Text style={{ color: active ? colors.accent : colors.muted, fontWeight: '700', fontSize: 11 }}>
                {key.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => void refreshLicenses()} style={styles.refreshBtn}>
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>Refresh</Text>
        </Pressable>
      </View>

      <SectionCard>
        <Text style={[styles.cardTitle, { color: colors.white }]}>Issued licenses</Text>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 8 }]}>
          Release requires a new email and names to reassign the same key.
        </Text>
        {filtered.map((lic) => {
          const eaThumb = mediaAbsoluteUrl(lic.ea?.mediaUrl || null);
          return (
            <View
              key={lic.id}
              style={[
                styles.subCard,
                {
                  borderColor: colors.glassBorder,
                  backgroundColor: 'rgba(255,255,255,0.02)',
                },
              ]}
            >
              <View style={styles.row}>
                {eaThumb && lic.ea?.mediaKind === 'image' ? (
                  <Image source={{ uri: eaThumb }} style={styles.eaPickThumb} resizeMode="cover" />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listName, { color: colors.white }]}>{lic.hint}</Text>
                  <Text style={[styles.meta, { color: colors.muted, marginTop: 4 }]}>
                    {String(lic.status).toUpperCase()}
                    {lic.boundFirstName || lic.boundLastName
                      ? ` · ${lic.boundFirstName || ''} ${lic.boundLastName || ''}`.trim()
                      : ''}
                    {lic.boundEmail ? ` · ${lic.boundEmail}` : ' · Unassigned'}
                  </Text>
                  {lic.ea?.name ? (
                    <Text style={[styles.meta, { color: colors.accent, marginTop: 4 }]}>
                      EA · {lic.ea.name}
                      {lic.ea.symbols?.length ? ` · ${lic.ea.symbols.join(', ')}` : ''}
                    </Text>
                  ) : null}
                </View>
              </View>

              {releasingId === lic.id ? (
                <View style={{ marginTop: 12 }}>
                  <FieldLabel>NEW EMAIL</FieldLabel>
                  <AdminInput value={reEmail} onChangeText={setReEmail} placeholder="new@email.com" />
                  <FieldLabel>FIRST NAME</FieldLabel>
                  <AdminInput value={reFirst} onChangeText={setReFirst} placeholder="First name" />
                  <FieldLabel>LAST NAME</FieldLabel>
                  <AdminInput value={reLast} onChangeText={setReLast} placeholder="Last name" />
                  <View style={styles.actionRow}>
                    <AdminButton
                      label="Confirm release"
                      variant="danger"
                      onPress={async () => {
                        if (!reEmail.trim() || !reFirst.trim() || !reLast.trim()) {
                          showToast('New email and names are required');
                          return;
                        }
                        await releaseKey(lic.id, {
                          email: reEmail.trim(),
                          firstName: reFirst.trim(),
                          lastName: reLast.trim(),
                        });
                        setReleasingId(null);
                        setReEmail('');
                        setReFirst('');
                        setReLast('');
                      }}
                      style={{ flex: 1 }}
                    />
                    <AdminButton
                      label="Cancel"
                      variant="ghost"
                      onPress={() => setReleasingId(null)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ) : (
                <AdminButton
                  label="Release & reassign"
                  variant="danger"
                  onPress={() => {
                    setReleasingId(lic.id);
                    setReEmail('');
                    setReFirst('');
                    setReLast('');
                  }}
                  style={{ marginTop: 12 }}
                />
              )}
            </View>
          );
        })}
        {filtered.length === 0 ? (
          <Text style={[styles.meta, { color: colors.muted, marginTop: 12 }]}>
            No licenses in this filter. Generate one above.
          </Text>
        ) : null}
      </SectionCard>
    </ScrollView>
  );
}

export function SubscriptionsScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const {
    subscribers,
    stats,
    loadingSubscribers,
    refreshSubscribers,
    approveAccess,
    revokeAccess,
    markPending,
  } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'pending' | 'approved' | 'revoked' | 'all'>('pending');

  const filtered = subscribers.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      s.email.toLowerCase().includes(q) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
    );
  });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader
        title="Subscriptions"
        onMenu={onMenu}
        subtitle="App registrations land here as pending until you approve or revoke access."
      />

      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>PENDING</Text>
          <Text style={[styles.statValue, { color: colors.accent }]}>{stats.pending}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>APPROVED</Text>
          <Text style={[styles.statValue, { color: colors.green }]}>{stats.approved}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder }]}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>REVOKED</Text>
          <Text style={[styles.statValue, { color: '#FB7185' }]}>{stats.revoked}</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['pending', 'approved', 'revoked', 'all'] as const).map((key) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.accentSoft : colors.surfaceSolid,
                  borderColor: active ? colors.accent : colors.glassBorder,
                },
              ]}
            >
              <Text style={{ color: active ? colors.accent : colors.muted, fontWeight: '700', fontSize: 11 }}>
                {key.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => void refreshSubscribers()} style={styles.refreshBtn}>
          <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>
            {loadingSubscribers ? '…' : 'Refresh'}
          </Text>
        </Pressable>
      </View>

      <FieldLabel>SEARCH</FieldLabel>
      <AdminInput value={query} onChangeText={setQuery} placeholder="Search name or email..." />

      <SectionCard>
        <Text style={[styles.cardTitle, { color: colors.white }]}>
          {filter === 'pending' ? 'Pending subscriptions' : 'Subscribers'}
        </Text>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 8 }]}>
          {filtered.length === 0
            ? filter === 'pending'
              ? 'No pending registrations right now.'
              : 'No subscribers in this filter.'
            : 'Approve to unlock license activation. Revoke to block the app.'}
        </Text>

        {filtered.map((s) => (
          <View
            key={s.id}
            style={[
              styles.subCard,
              {
                borderColor: colors.glassBorder,
                backgroundColor: 'rgba(255,255,255,0.02)',
              },
            ]}
          >
            <View style={styles.subTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listName, { color: colors.white }]}>
                  {s.firstName} {s.lastName}
                </Text>
                <Text style={[styles.meta, { color: colors.muted }]}>{s.email}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      s.status === 'approved'
                        ? 'rgba(52,199,89,0.14)'
                        : s.status === 'revoked'
                          ? 'rgba(251,113,133,0.14)'
                          : colors.accentSoft,
                    borderColor:
                      s.status === 'approved'
                        ? colors.green
                        : s.status === 'revoked'
                          ? '#FB7185'
                          : colors.accent,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      s.status === 'approved'
                        ? colors.green
                        : s.status === 'revoked'
                          ? '#FB7185'
                          : colors.accent,
                    fontWeight: '800',
                    fontSize: 10,
                  }}
                >
                  {String(s.status).toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={[styles.meta, { color: colors.muted, marginTop: 8 }]}>
              Registered {s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}
              {s.license?.status === 'active' && s.license.hint
                ? ` · License ${s.license.hint}`
                : ' · No license yet'}
            </Text>

            <View style={styles.actionRow}>
              {s.status !== 'approved' ? (
                <AdminButton
                  label="Approve"
                  onPress={() => void approveAccess(s.id)}
                  style={{ flex: 1 }}
                />
              ) : null}
              {s.status !== 'revoked' ? (
                <AdminButton
                  label="Revoke"
                  variant="danger"
                  onPress={() => void revokeAccess(s.id)}
                  style={{ flex: 1 }}
                />
              ) : null}
              {s.status !== 'pending' ? (
                <AdminButton
                  label="Pending"
                  variant="ghost"
                  onPress={() => void markPending(s.id)}
                  style={{ flex: 1 }}
                />
              ) : null}
            </View>
          </View>
        ))}
      </SectionCard>
    </ScrollView>
  );
}

export function SendEmailsScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const { showToast } = useAdmin();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader
        title="Send Emails"
        onMenu={onMenu}
        subtitle="Broadcast updates to clients from Super Admin."
      />
      <SectionCard emphasis="hero">
        <FieldLabel>TO</FieldLabel>
        <AdminInput value={to} onChangeText={setTo} placeholder="client@email.com or all@approved" />
        <FieldLabel>SUBJECT</FieldLabel>
        <AdminInput value={subject} onChangeText={setSubject} placeholder="Account update" />
        <FieldLabel>MESSAGE</FieldLabel>
        <AdminInput
          value={body}
          onChangeText={setBody}
          placeholder="Write your message..."
          multiline
        />
        <AdminButton
          label="Send email"
          onPress={() => showToast('Email queued')}
          style={{ marginTop: 16 }}
        />
      </SectionCard>
    </ScrollView>
  );
}

export function SetupMethodsScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const { showToast } = useAdmin();
  const url = 'https://lumoedge.com';
  const mq5 = 'https://lumoedge.com/LumoEdgeCopy.mq5';

  const steps = [
    {
      n: 1,
      title: 'Manage EAs — copy Mentor ID + EA ID',
      body: 'Copy Mentor ID and EA ID (e.g. ea-1784470635215) to give students.',
      icon: <Shield color={colors.accent} size={16} />,
    },
    {
      n: 2,
      title: 'Students: VPS + MT5',
      body: 'Students run MT5 on a VPS or PC with LumoEdgeCopy.mq5 using the same IDs.',
      icon: <CreditCard color={colors.accent} size={16} />,
    },
    {
      n: 3,
      title: 'Download LumoEdgeCopy.mq5',
      body: mq5,
      icon: <Download color={colors.accent} size={16} />,
      download: true,
    },
    {
      n: 4,
      title: 'Allow WebRequest URL in MT5 (required)',
      body: 'MT5 blocks trades until this URL is allowed under Tools → Options → Expert Advisors.',
      icon: <ArrowIcon color={colors.accent} />,
      highlightUrl: url,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader
        title="Setup Methods"
        onMenu={onMenu}
        subtitle="EA-based copy trading — one EA ID controls all linked students under that EA."
      />

      <SectionCard>
        <Text style={{ color: colors.green, fontWeight: '800', fontSize: 16 }}>
          How copy trading works now
        </Text>
        <Text style={[styles.meta, { color: colors.green, marginTop: 8, opacity: 0.9 }]}>
          Pick an EA on Open Orders and tap COPY TRADE. Students use Mentor ID in MT5
          with LumoEdgeCopy.mq5.
        </Text>
      </SectionCard>

      {steps.map((step) => (
        <SectionCard key={step.n} delay={step.n * 40}>
          <View style={styles.stepHead}>
            <View style={[styles.stepBadge, { borderColor: colors.border }]}>
              <Text style={{ color: colors.white, fontWeight: '800' }}>{step.n}</Text>
            </View>
            {step.icon}
            <Text style={[styles.cardTitle, { color: colors.white, flex: 1 }]}>
              {step.title}
            </Text>
          </View>
          <Text style={[styles.meta, { color: colors.muted, marginTop: 10 }]}>{step.body}</Text>
          {step.highlightUrl ? (
            <View
              style={[
                styles.amberBox,
                { borderColor: '#FFB020', backgroundColor: 'rgba(255,176,32,0.08)' },
              ]}
            >
              <Text style={{ color: '#FFB020', fontWeight: '800', flex: 1 }}>
                {step.highlightUrl}
              </Text>
              <Pressable
                onPress={async () => {
                  await copyText(step.highlightUrl!);
                  showToast('URL copied');
                }}
              >
                <Copy color="#FFB020" size={16} />
              </Pressable>
            </View>
          ) : null}
          {step.download ? (
            <View style={styles.row}>
              <Pressable
                onPress={async () => {
                  await copyText(mq5);
                  showToast('Download link copied');
                }}
                style={{ padding: 8 }}
              >
                <Copy color={colors.accent} size={16} />
              </Pressable>
              <AdminButton
                label="Download"
                onPress={() => showToast('Download started')}
                style={{ flex: 1 }}
              />
            </View>
          ) : null}
        </SectionCard>
      ))}
    </ScrollView>
  );
}

function ArrowIcon({ color }: { color: string }) {
  return <Text style={{ color, fontWeight: '900' }}>↗</Text>;
}

export function ConnectEAScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const { setBrokerConnected, showToast } = useAdmin();
  const [broker, setBroker] = useState('Razor Markets');
  const [server, setServer] = useState('RazorMarkets-Live');
  const [accountType, setAccountType] = useState('100% Bonus Standard');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [eaName, setEaName] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader title="Connect EA" accentWord="EA" onMenu={onMenu} />
      <SectionCard emphasis="hero">
        <Text style={[styles.cardTitle, { color: colors.muted }]}>MT5 Connection</Text>
        <FieldLabel>BROKER</FieldLabel>
        <AdminInput value={broker} onChangeText={setBroker} />
        <FieldLabel>SELECT SERVER</FieldLabel>
        <AdminInput value={server} onChangeText={setServer} />
        <FieldLabel>ACCOUNT TYPE</FieldLabel>
        <AdminInput value={accountType} onChangeText={setAccountType} />
        <FieldLabel>LOGIN</FieldLabel>
        <AdminInput value={login} onChangeText={setLogin} placeholder="Account login" />
        <FieldLabel>PASSWORD</FieldLabel>
        <AdminInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />
        <FieldLabel>EA NAME</FieldLabel>
        <AdminInput value={eaName} onChangeText={setEaName} placeholder="EA display name" />
        <AdminButton
          label="Connect EA"
          onPress={() => {
            setBrokerConnected(true);
            showToast('Broker connected');
          }}
          style={{ marginTop: 18 }}
        />
      </SectionCard>
    </ScrollView>
  );
}

export function OpenOrdersScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const { eas, mentorId, brokerConnected, showToast } = useAdmin();
  const [symbol, setSymbol] = useState('XAUUSD');
  const [volume, setVolume] = useState('0.01');
  const [sl, setSl] = useState('0.00');
  const [tp, setTp] = useState('0.00');
  const [comment, setComment] = useState('');
  const [trades, setTrades] = useState('1');
  const selected = eas[0];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader title="Open Orders" onMenu={onMenu} />

      <SectionCard>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { color: colors.white }]}>
            {brokerConnected ? 'Broker Connected' : 'Broker Not Connected'}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: brokerConnected ? colors.green : '#FF4D6D' },
              ]}
            />
            <Text
              style={{
                color: brokerConnected ? colors.green : '#FF4D6D',
                fontWeight: '800',
              }}
            >
              {brokerConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        {!brokerConnected ? (
          <View
            style={[
              styles.warnBox,
              { borderColor: '#FF4D6D', backgroundColor: 'rgba(255,77,109,0.12)' },
            ]}
          >
            <Text style={{ color: '#FF8FA3', lineHeight: 20 }}>
              Connect your broker through Connect EA before sending trades.
            </Text>
          </View>
        ) : null}
      </SectionCard>

      <SectionCard emphasis="hero">
        <Text style={[styles.cardTitle, { color: colors.white }]}>Order Details</Text>
        <FieldLabel>COPY TO EA *</FieldLabel>
        <AdminInput
          value={selected ? `${selected.name} (${selected.id})` : ''}
          onChangeText={() => {}}
        />
        <Text style={[styles.meta, { color: colors.muted, marginTop: 6 }]}>
          Mentor ID: {mentorId}
        </Text>
        <FieldLabel>SYMBOL *</FieldLabel>
        <AdminInput value={symbol} onChangeText={setSymbol} />
        <View style={[styles.chip, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
          <Text style={{ color: colors.accent, fontWeight: '800' }}>{symbol || 'SYMBOL'}</Text>
        </View>
        <View style={[styles.row, { marginTop: 14 }]}>
          <AdminButton
            label="BUY"
            variant="success"
            style={{ flex: 1 }}
            onPress={() => showToast(brokerConnected ? 'BUY sent' : 'Connect broker first')}
          />
          <AdminButton
            label="SELL"
            variant="ghost"
            style={{ flex: 1 }}
            onPress={() => showToast(brokerConnected ? 'SELL sent' : 'Connect broker first')}
          />
        </View>
        <FieldLabel>VOLUME (LOTS)</FieldLabel>
        <AdminInput value={volume} onChangeText={setVolume} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <FieldLabel>STOP LOSS</FieldLabel>
            <AdminInput value={sl} onChangeText={setSl} />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>TAKE PROFIT</FieldLabel>
            <AdminInput value={tp} onChangeText={setTp} />
          </View>
        </View>
        <FieldLabel>EA COMMENT</FieldLabel>
        <AdminInput value={comment} onChangeText={setComment} multiline placeholder="Optional comment" />
        <FieldLabel>NUMBER OF TRADES (1-50)</FieldLabel>
        <AdminInput value={trades} onChangeText={setTrades} />
      </SectionCard>
    </ScrollView>
  );
}

export function ManageEAsScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const { mentorId, eas, addEA, removeEA, showToast } = useAdmin();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader
        title="Manage EAs"
        onMenu={onMenu}
        subtitle="Upload a picture or video with each EA. License keys sync this media."
      />

      <SectionCard emphasis="hero">
        <Text style={[styles.meta, { color: colors.muted }]}>MENTOR ID</Text>
        <View style={styles.rowBetween}>
          <Text style={{ color: colors.white, fontSize: 24, fontWeight: '900' }}>
            {mentorId}
          </Text>
          <AdminButton
            label="Copy"
            variant="ghost"
            onPress={async () => {
              await copyText(mentorId);
              showToast('Mentor ID copied');
            }}
            style={{ paddingHorizontal: 16, minWidth: 90 }}
          />
        </View>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 10 }]}>
          All students under your EAs use this Mentor ID in LumoEdgeCopy.mq5.
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.cardTitle, { color: colors.white }]}>Create New EA</Text>
        <FieldLabel>EA NAME</FieldLabel>
        <AdminInput value={name} onChangeText={setName} placeholder="Enter EA name" />
        <FieldLabel>DESCRIPTION</FieldLabel>
        <AdminInput
          value={description}
          onChangeText={setDescription}
          placeholder="Short info shown with the license"
          multiline
        />
        <FieldLabel>SYMBOLS / PAIRS</FieldLabel>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AdminInput
              value={symbol}
              onChangeText={setSymbol}
              placeholder="Type symbol (e.g. XAUUSD)"
            />
          </View>
          <Pressable
            onPress={() => {
              const s = symbol.trim().toUpperCase();
              if (!s) return;
              setSymbols((prev) => (prev.includes(s) ? prev : [...prev, s]));
              setSymbol('');
            }}
            style={[styles.plusBtn, { backgroundColor: colors.accent }]}
          >
            <Plus color={colors.background} size={22} strokeWidth={2.5} />
          </Pressable>
        </View>
        <View style={styles.chipRow}>
          {symbols.map((s) => (
            <View key={s} style={[styles.chip, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}>
              <Text style={{ color: colors.accent, fontWeight: '800' }}>{s}</Text>
            </View>
          ))}
        </View>

        <FieldLabel>PICTURE / VIDEO</FieldLabel>
        <AdminButton
          label={media ? `Change media (${media.kind})` : 'Upload picture or video'}
          variant="ghost"
          onPress={async () => {
            const picked = await pickEaMedia();
            if (!picked) {
              showToast('Media picker unavailable on this device');
              return;
            }
            setMedia(picked);
          }}
        />
        {media ? (
          <View style={[styles.mediaPreview, { borderColor: colors.glassBorder }]}>
            {media.kind === 'image' ? (
              <Image source={{ uri: media.uri }} style={styles.mediaImage} resizeMode="cover" />
            ) : (
              <Text style={{ color: colors.muted, fontWeight: '600' }}>
                Video selected · {media.name}
              </Text>
            )}
            <AdminButton
              label="Remove media"
              variant="danger"
              onPress={() => setMedia(null)}
              style={{ marginTop: 10 }}
            />
          </View>
        ) : null}

        <AdminButton
          label={saving ? 'Creating…' : 'Create EA'}
          onPress={async () => {
            setSaving(true);
            const ok = await addEA({
              name,
              symbols,
              description,
              media,
            });
            setSaving(false);
            if (ok) {
              setName('');
              setSymbols([]);
              setDescription('');
              setMedia(null);
            }
          }}
          style={{ marginTop: 16 }}
        />
      </SectionCard>

      <SectionCard>
        <Text style={[styles.cardTitle, { color: colors.white }]}>Created EAs</Text>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 6 }]}>
          These sync into license keys when you generate access.
        </Text>
        {eas.map((ea) => {
          const mediaUri = mediaAbsoluteUrl(ea.mediaUrl);
          return (
            <View key={ea.id} style={[styles.listBlock, { borderTopColor: colors.glassBorder }]}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  {mediaUri && ea.mediaKind === 'image' ? (
                    <Image
                      source={{ uri: mediaUri }}
                      style={styles.eaThumb}
                      resizeMode="cover"
                    />
                  ) : mediaUri && ea.mediaKind === 'video' ? (
                    <View style={[styles.eaThumb, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft }]}>
                      <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 11 }}>VIDEO</Text>
                    </View>
                  ) : null}
                  <Text style={[styles.listName, { color: colors.white, marginTop: 8 }]}>{ea.name}</Text>
                  <Text style={[styles.meta, { color: colors.muted }]}>
                    {ea.symbols.join(', ')} · lot {ea.lot} · {ea.direction}
                  </Text>
                  {ea.description ? (
                    <Text style={[styles.meta, { color: colors.muted, marginTop: 4 }]}>
                      {ea.description}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => void removeEA(ea.id)}
                  style={[styles.trash, { borderColor: '#FF4D6D' }]}
                >
                  <Trash2 color="#FF4D6D" size={16} />
                </Pressable>
              </View>
              <View style={[styles.chip, { marginTop: 10, alignSelf: 'flex-start', borderColor: colors.glassBorder }]}>
                <Text style={{ color: colors.muted, fontWeight: '700' }}>EA ID · {ea.id}</Text>
              </View>
            </View>
          );
        })}
        {eas.length === 0 ? (
          <Text style={[styles.meta, { color: colors.muted, marginTop: 12 }]}>
            No EAs yet. Create one with a picture or video above.
          </Text>
        ) : null}
      </SectionCard>
    </ScrollView>
  );
}

export function ProfileSettingsScreen({ onMenu }: ScreenProps) {
  const { colors } = useTheme();
  const { profile, setProfile, setRoute, showToast } = useAdmin();

  const shortcuts = [
    { label: 'Subscriptions / people', route: 'subscriptions' as const, icon: <CreditCard color={colors.accent} size={18} /> },
    { label: 'Manage EAs', route: 'eas' as const, icon: <Shield color={colors.accent} size={18} /> },
    { label: 'Approve mentors', route: 'approve' as const, icon: <Users color={colors.accent} size={18} /> },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AdminHeader title="Profile Settings" onMenu={onMenu} />

      <SectionCard emphasis="hero">
        <Text style={[styles.cardTitle, { color: colors.white }]}>Portal shortcuts</Text>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 6 }]}>
          Jump to subscribers, EAs, and mentor approvals.
        </Text>
        <View style={styles.shortcutGrid}>
          {shortcuts.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => setRoute(item.route)}
              style={[
                styles.shortcut,
                { borderColor: colors.border, backgroundColor: colors.accentSoft },
              ]}
            >
              {item.icon}
              <Text style={{ color: colors.white, fontWeight: '700', marginTop: 8, fontSize: 13 }}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.cardTitle, { color: colors.white }]}>Personal Information</Text>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 6 }]}>
          Saved to your live account — tap Update Profile after editing names.
        </Text>
        <FieldLabel>FIRST NAME</FieldLabel>
        <AdminInput
          value={profile.firstName}
          onChangeText={(firstName) => setProfile((p) => ({ ...p, firstName }))}
        />
        <FieldLabel>LAST NAME</FieldLabel>
        <AdminInput
          value={profile.lastName}
          onChangeText={(lastName) => setProfile((p) => ({ ...p, lastName }))}
          placeholder="Last name"
        />
        <FieldLabel>EMAIL ADDRESS</FieldLabel>
        <AdminInput
          value={profile.email}
          onChangeText={(email) => setProfile((p) => ({ ...p, email }))}
        />
        <FieldLabel>PHONE NUMBER</FieldLabel>
        <AdminInput
          value={profile.phone}
          onChangeText={(phone) => setProfile((p) => ({ ...p, phone }))}
          placeholder="Optional"
        />
        <AdminButton
          label="Update Profile"
          onPress={() => showToast('Profile updated')}
          style={{ marginTop: 16 }}
        />
      </SectionCard>

      <SectionCard>
        <Text style={[styles.cardTitle, { color: colors.white }]}>Background Manager</Text>
        <Text style={[styles.meta, { color: colors.muted, marginTop: 6 }]}>
          0/3 backgrounds • same cloud save as profile picture.
        </Text>
        <Text style={{ color: '#FF4D6D', marginTop: 10, fontWeight: '700' }}>
          Cloud sync timed out — try again on a stronger connection.
        </Text>
        {['Background 1', 'Background 2', 'Background 3'].map((bg) => (
          <View
            key={bg}
            style={[
              styles.bgRow,
              { borderColor: colors.glassBorder, backgroundColor: 'rgba(0,0,0,0.2)' },
            ]}
          >
            <View style={[styles.bgThumb, { borderColor: colors.glassBorder }]}>
              <Text style={{ color: colors.muted, fontSize: 10 }}>{bg}</Text>
            </View>
            <Text style={{ color: colors.white, fontWeight: '700', flex: 1 }}>{bg}</Text>
            <Text style={{ color: colors.accent, fontWeight: '800' }}>Upload</Text>
          </View>
        ))}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
  },
  welcomeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  welcome: {
    fontSize: 22,
    fontWeight: '800',
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  superPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  adminTools: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  listBlock: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  listName: {
    fontSize: 16,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  stepHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amberBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  warnBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  chip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  eaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  eaThumb: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  eaThumbSm: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  plusBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trash: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  shortcut: {
    width: '48%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 88,
  },
  bgRow: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bgThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  pendingHero: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pendingHeroValue: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 4,
  },
  subCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  subTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  freshKeyRow: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  freshKey: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  mediaPreview: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  mediaImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  eaThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  eaPickList: {
    gap: 8,
    marginBottom: 10,
  },
  eaPickItem: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eaPickThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  selectedEaBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  refreshBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});

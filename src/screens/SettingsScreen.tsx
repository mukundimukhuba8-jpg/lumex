import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Check,
  LayoutTemplate,
  LogOut,
  Palette,
  Settings2,
  Sparkles,
} from 'lucide-react-native';
import { AmbientCanvas } from '../components/AmbientCanvas';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../auth/AuthContext';
import { useEAStatus } from '../context/EAStatusContext';
import {
  INTERFACE_GALLERY,
  InterfaceLayoutId,
  useInterfaceLayout,
} from '../context/InterfaceLayoutContext';
import { useTheme } from '../context/ThemeContext';
import { type as typography } from '../theme/typography';

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        {icon}
        <Text style={[styles.sectionTitle, { color: colors.white }]}>{title}</Text>
      </View>
      <Text style={[styles.sectionHint, { color: colors.muted }]}>{subtitle}</Text>
    </View>
  );
}

export function SettingsScreen() {
  const { status } = useEAStatus();
  const { layoutId, setLayoutId, current } = useInterfaceLayout();
  const { colors, palettes, paletteId, setPaletteId } = useTheme();
  const { user, logout } = useAuth();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AmbientCanvas />
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.overline, { color: colors.accent }]}>SYSTEM</Text>
          <Text style={[styles.title, { color: colors.white }]}>Settings</Text>
          <Text style={[styles.hint, { color: colors.muted }]}>
            Appearance, colour identity, and interface architecture
          </Text>

          <SectionHeader
            icon={<Sparkles color={colors.accent} size={18} />}
            title="Appearance"
            subtitle="Core system identity"
          />
          <GlassCard emphasis="hero" delay={40}>
            <View style={styles.infoStack}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>
                  Product
                </Text>
                <Text style={[styles.infoValue, { color: colors.white }]}>
                  LUMEXAI
                </Text>
              </View>
              <View
                style={[styles.hairline, { backgroundColor: colors.glassBorder }]}
              />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>
                  Engine
                </Text>
                <Text style={[styles.infoValue, { color: colors.white }]}>
                  LumexPRO
                </Text>
              </View>
              <View
                style={[styles.hairline, { backgroundColor: colors.glassBorder }]}
              />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.muted }]}>
                  Status
                </Text>
                <Text style={[styles.infoValue, { color: colors.accent }]}>
                  {status.toUpperCase()}
                </Text>
              </View>
            </View>
          </GlassCard>

          <SectionHeader
            icon={<Palette color={colors.accent} size={18} />}
            title="Colours"
            subtitle="Accent colour rethemes the full operating system"
          />
          <GlassCard emphasis="primary" delay={80} padded={false}>
            <View style={styles.paletteList}>
              {palettes.map((palette, index) => {
                const selected = palette.id === paletteId;
                return (
                  <Pressable
                    key={palette.id}
                    onPress={() => setPaletteId(palette.id)}
                    style={({ pressed }) => [
                      styles.paletteRow,
                      index > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: colors.glassBorder,
                      },
                      pressed && { opacity: 0.85 },
                      selected && { backgroundColor: palette.accentSoft },
                    ]}
                  >
                    <View
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: palette.accent,
                          shadowColor: palette.accent,
                        },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.paletteName, { color: colors.white }]}>
                        {palette.name}
                      </Text>
                      <Text style={[styles.paletteMeta, { color: colors.muted }]}>
                        {palette.accent.toUpperCase()}
                      </Text>
                    </View>
                    {selected ? (
                      <View
                        style={[
                          styles.checkCircle,
                          { backgroundColor: palette.accent },
                        ]}
                      >
                        <Check color={palette.background} size={12} strokeWidth={3} />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.radioEmpty,
                          { borderColor: colors.glassBorder },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </GlassCard>

          <SectionHeader
            icon={<LayoutTemplate color={colors.accent} size={18} />}
            title="Layouts"
            subtitle={`Architecture gallery · Active: ${current.name}`}
          />
          <View style={styles.layoutList}>
            {INTERFACE_GALLERY.map((item, index) => {
              const selected = item.id === layoutId;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => setLayoutId(item.id as InterfaceLayoutId)}
                  style={({ pressed }) => [
                    pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
                  ]}
                >
                  <GlassCard
                    emphasis={selected ? 'primary' : 'quiet'}
                    delay={100 + index * 18}
                    glow={selected}
                    style={
                      selected
                        ? { borderColor: colors.accent, borderWidth: 1.5 }
                        : undefined
                    }
                  >
                    <View style={styles.layoutRow}>
                      <View
                        style={[
                          styles.layoutIndex,
                          {
                            backgroundColor: selected
                              ? colors.accentSoft
                              : 'rgba(255,255,255,0.04)',
                            borderColor: selected
                              ? colors.accent
                              : colors.glassBorder,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: selected ? colors.accent : colors.muted,
                            fontWeight: '800',
                            fontSize: 12,
                          }}
                        >
                          {item.number}
                        </Text>
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[styles.layoutName, { color: colors.white }]}>
                          {item.name}
                        </Text>
                        <Text
                          style={[styles.layoutDesc, { color: colors.muted }]}
                        >
                          {item.description}
                        </Text>
                      </View>
                      {selected ? (
                        <Check color={colors.accent} size={18} strokeWidth={2.6} />
                      ) : null}
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>

          <SectionHeader
            icon={<Settings2 color={colors.accent} size={18} />}
            title="Advanced"
            subtitle="Open Home after changing architecture to preview"
          />
          <GlassCard emphasis="secondary" delay={200}>
            <Text style={[styles.advancedText, { color: colors.muted }]}>
              Colour themes rewrite navigation, scanner glow, buttons, borders,
              shadows, and ambient lighting instantly. Layouts change composition
              only — features stay identical.
            </Text>
          </GlassCard>

          <SectionHeader
            icon={<LogOut color={colors.accent} size={18} />}
            title="Account"
            subtitle={user ? `Signed in as ${user.email}` : 'Session'}
          />
          <Pressable
            onPress={logout}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <GlassCard emphasis="primary" delay={220}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoValue, { color: colors.accent }]}>
                  Sign out of LUMEXAI
                </Text>
                <LogOut color={colors.accent} size={18} />
              </View>
            </GlassCard>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140,
    gap: 16,
    width: '100%',
  },
  overline: {
    ...typography.overline,
    marginBottom: 6,
  },
  title: {
    ...typography.hero,
  },
  hint: {
    ...typography.body,
    marginBottom: 10,
    maxWidth: 320,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 4,
    gap: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    ...typography.section,
  },
  sectionHint: {
    ...typography.caption,
    paddingLeft: 28,
  },
  infoStack: { gap: 0 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
  },
  paletteList: {
    overflow: 'hidden',
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 12,
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  paletteName: {
    fontSize: 15,
    fontWeight: '700',
  },
  paletteMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  layoutList: {
    gap: 12,
  },
  layoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  layoutIndex: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layoutName: {
    fontSize: 15,
    fontWeight: '700',
  },
  layoutDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  advancedText: {
    ...typography.body,
  },
});

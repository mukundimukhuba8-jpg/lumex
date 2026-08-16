import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { Menu } from 'lucide-react-native';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';

export function AdminHeader({
  title,
  accentWord,
  onMenu,
  subtitle,
}: {
  title: string;
  accentWord?: string;
  onMenu: () => void;
  subtitle?: string;
}) {
  const { colors } = useTheme();
  const parts = accentWord
    ? title.split(new RegExp(`(${accentWord})`, 'i'))
    : [title];

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onMenu}
        style={[
          styles.menuBtn,
          { borderColor: colors.border, shadowColor: colors.accent },
        ]}
      >
        <Menu color={colors.secondary} size={18} strokeWidth={2.2} />
      </Pressable>
      <View style={styles.headerText}>
        <Text style={styles.title}>
          {parts.map((part, i) => {
            const isAccent =
              accentWord && part.toLowerCase() === accentWord.toLowerCase();
            return (
              <Text
                key={`${part}-${i}`}
                style={{
                  color: isAccent ? colors.accent : colors.white,
                  fontSize: 22,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                }}
              >
                {part}
              </Text>
            );
          })}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 42 }} />
    </View>
  );
}

export function FieldLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.fieldLabel, { color: colors.muted }]}>{children}</Text>
  );
}

export function AdminInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  style,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.28)"
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      style={[
        styles.input,
        multiline && { minHeight: 84, textAlignVertical: 'top' },
        {
          color: colors.white,
          borderColor: colors.glassBorder,
          backgroundColor: 'rgba(0,0,0,0.28)',
        },
        style,
      ]}
    />
  );
}

export function AdminButton({
  label,
  onPress,
  variant = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'success';
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const border =
    variant === 'danger'
      ? '#FF4D6D'
      : variant === 'success'
        ? colors.green
        : variant === 'ghost'
          ? colors.glassBorder
          : colors.accent;
  const bg =
    variant === 'primary'
      ? colors.accent
      : variant === 'danger'
        ? 'rgba(255,77,109,0.12)'
        : variant === 'success'
          ? 'rgba(52,199,89,0.14)'
          : 'rgba(255,255,255,0.04)';
  const textColor =
    variant === 'primary' ? colors.background : border;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: border,
          backgroundColor: bg,
          shadowColor: border,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function StatCard({
  value,
  label,
  color,
  icon,
}: {
  value: string | number;
  label: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <GlassCard emphasis="secondary" style={styles.statCard}>
      <View style={styles.statRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: `${color}22` }]}>
          {icon}
        </View>
      </View>
    </GlassCard>
  );
}

export function SectionCard({
  children,
  delay = 0,
  emphasis = 'primary' as const,
}: {
  children: React.ReactNode;
  delay?: number;
  emphasis?: 'hero' | 'primary' | 'secondary' | 'quiet';
}) {
  return (
    <GlassCard delay={delay} emphasis={emphasis} style={styles.section}>
      {children}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  headerText: {
    flex: 1,
    paddingTop: 4,
    gap: 4,
  },
  title: {
    flexDirection: 'row',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 14,
  },
});

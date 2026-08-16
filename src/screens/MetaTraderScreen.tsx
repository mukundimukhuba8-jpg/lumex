import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Radio } from 'lucide-react-native';
import { AmbientCanvas } from '../components/AmbientCanvas';
import { GlassCard } from '../components/GlassCard';
import { PremiumScanner } from '../components/PremiumScanner';
import { useEAStatus } from '../context/EAStatusContext';
import { useTheme } from '../context/ThemeContext';
import { type as typography } from '../theme/typography';

export function MetaTraderScreen() {
  const { status, symbols } = useEAStatus();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const live = status === 'active';
  const scannerSize = Math.min(width * 0.72, 280);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AmbientCanvas />
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.overline, { color: colors.accent }]}>
              MARKET LINK
            </Text>
            <Text style={[styles.title, { color: colors.white }]}>Scanner</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Neural market link through MetaTrader
            </Text>
          </View>

          <View style={styles.scannerStage}>
            <PremiumScanner
              size={scannerSize}
              active={live}
              label={live ? 'SCANNING LIVE' : 'STANDBY SCAN'}
              meta="Lumex Neural Bridge"
            />
          </View>

          <View style={styles.secondaryBlock}>
            <GlassCard emphasis="primary" delay={80}>
              <View style={styles.row}>
                <View
                  style={[
                    styles.iconBubble,
                    { backgroundColor: colors.accentSoft },
                  ]}
                >
                  <Activity color={colors.accent} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, { color: colors.muted }]}>
                    Bridge channel
                  </Text>
                  <Text style={[styles.cardTitle, { color: colors.white }]}>
                    Lumex Bridge
                  </Text>
                </View>
                <View
                  style={[
                    styles.pill,
                    {
                      backgroundColor: live
                        ? 'rgba(52,199,89,0.16)'
                        : colors.accentSoft,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: live ? colors.green : colors.accent,
                      fontWeight: '800',
                      fontSize: 11,
                      letterSpacing: 0.6,
                    }}
                  >
                    {status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <GlassCard emphasis="secondary" delay={140}>
              <View style={styles.symbolsHead}>
                <Radio color={colors.secondary} size={18} />
                <Text style={[styles.cardTitle, { color: colors.white }]}>
                  Linked symbols
                </Text>
              </View>
              {symbols.length === 0 ? (
                <Text style={[styles.empty, { color: colors.muted }]}>
                  No symbols connected.
                </Text>
              ) : (
                <View style={styles.symbolWrap}>
                  {symbols.map((symbol) => (
                    <View
                      key={symbol}
                      style={[
                        styles.symbolChip,
                        {
                          borderColor: colors.glassBorder,
                          backgroundColor: colors.accentSoft,
                        },
                      ]}
                    >
                      <Text style={[styles.symbolText, { color: colors.white }]}>
                        {symbol}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </View>
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
    width: '100%',
  },
  header: {
    gap: 6,
    marginBottom: 16,
  },
  overline: {
    ...typography.overline,
  },
  title: {
    ...typography.hero,
  },
  subtitle: {
    ...typography.body,
    maxWidth: '100%',
  },
  scannerStage: {
    marginTop: 20,
    marginBottom: 28,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
    width: '100%',
  },
  secondaryBlock: {
    gap: 14,
    marginTop: 4,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  cardTitle: {
    ...typography.section,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  symbolsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  empty: {
    ...typography.body,
  },
  symbolWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symbolChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  symbolText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

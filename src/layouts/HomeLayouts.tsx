import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AmbientCanvas } from '../components/AmbientCanvas';
import { GlassCard } from '../components/GlassCard';
import {
  MagazineHeroCard,
  PoweredByBand,
  PrimaryActionBar,
  StatusCard,
} from '../components/NativeMobileUI';
import {
  ActionControls,
  ArchitectureBadge,
  RobotImage,
  RobotList,
  SymbolsModal,
  TitleBlock,
  useHomeActions,
} from '../components/home/HomeShared';
import { useInterfaceLayout } from '../context/InterfaceLayoutContext';
import { useTheme } from '../context/ThemeContext';

const SCREEN_H = Dimensions.get('window').height;
const SCREEN_W = Dimensions.get('window').width;

type Actions = ReturnType<typeof useHomeActions>;

function Shell({
  children,
  actions,
  scroll = true,
  contentStyle,
  edges = ['left', 'right'] as ('top' | 'left' | 'right')[],
  showBadge = true,
}: {
  children: React.ReactNode;
  actions: Actions;
  scroll?: boolean;
  contentStyle?: object;
  edges?: ('top' | 'left' | 'right')[];
  showBadge?: boolean;
}) {
  const { colors } = useTheme();
  const { current } = useInterfaceLayout();
  const enter = useSharedValue(0);

  useEffect(() => {
    enter.value = 0;
    enter.value = withTiming(1, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
    });
  }, [current.id, enter]);

  const pageAnim = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 8 }],
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <AmbientCanvas />
      <SafeAreaView style={styles.safe} edges={edges}>
        <Animated.View style={[{ flex: 1 }, pageAnim]}>
          {showBadge ? (
            <View style={styles.badgeWrap}>
              <ArchitectureBadge name={current.name} />
            </View>
          ) : null}
          {scroll ? (
            <ScrollView
              contentContainerStyle={[styles.baseContent, contentStyle]}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
          )}
        </Animated.View>
      </SafeAreaView>
      <SymbolsModal
        visible={actions.symbolsOpen}
        symbols={actions.symbols}
        onClose={actions.closeSymbols}
      />
    </View>
  );
}

/** 1 – Native mobile home (premium app shell) */
export function FullScreenPosterLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell
      actions={a}
      edges={['left', 'right']}
      showBadge={false}
      contentStyle={styles.nativeHomeContent}
    >
      <MagazineHeroCard />
      <PoweredByBand />
      <StatusCard />
      <PrimaryActionBar
        isOn={a.isOn}
        onStart={a.start}
        onStop={a.stop}
        onSymbols={a.openSymbols}
        onRemove={a.removeEA}
      />
      <View style={{ height: 8 }} />
      <Text style={[styles.nativeHint, { color: colors.muted }]}>
        Start the EA, manage symbols, or open Scanner for live market link.
      </Text>
    </Shell>
  );
}

/** 2 – Magazine (same native hero system, editorial spacing) */
export function MagazineLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell
      actions={a}
      edges={['left', 'right']}
      showBadge={false}
      contentStyle={styles.nativeHomeContent}
    >
      <MagazineHeroCard />
      <PoweredByBand />
      <StatusCard />
      <PrimaryActionBar
        isOn={a.isOn}
        onStart={a.start}
        onStop={a.stop}
        onSymbols={a.openSymbols}
        onRemove={a.removeEA}
      />
      <Text style={[styles.nativeHint, { color: colors.muted }]}>
        Editorial home — same controls, refined composition.
      </Text>
    </Shell>
  );
}

/** 3 – Bento Grid */
export function BentoGridLayout() {
  const a = useHomeActions();
  const { width } = useWindowDimensions();
  const gap = 10;
  const col = (width - 32 - gap) / 2;

  return (
    <Shell actions={a} contentStyle={styles.bentoContent}>
      <View style={[styles.bentoRow, { gap }]}>
        <GlassCard
          delay={0}
          padded={false}
          radius={22}
          style={{ width: col * 1.15, height: SCREEN_H * 0.34 }}
        >
          <RobotImage style={{ width: '100%', height: '100%' }} />
        </GlassCard>
        <View style={{ flex: 1, gap }}>
          <GlassCard delay={60} radius={22} style={{ flex: 1 }}>
            <TitleBlock align="left" compact showPowered={false} titleStyle={{ fontSize: 22 }} />
          </GlassCard>
          <GlassCard delay={100} radius={22}>
            <Text style={styles.bentoLabel}>ENGINE</Text>
            <Text style={styles.bentoValue}>LumexPRO</Text>
          </GlassCard>
        </View>
      </View>
      <GlassCard delay={140} radius={22} style={{ width: '100%' }}>
        <RobotList status={a.status} />
      </GlassCard>
      <View style={[styles.bentoRow, { gap }]}>
        <GlassCard delay={180} radius={22} style={{ width: col }}>
          <ActionControls
            variant="stack"
            compact
            isOn={a.isOn}
            onRemove={a.removeEA}
            onStart={a.start}
            onStop={a.stop}
            onSymbols={a.openSymbols}
          />
        </GlassCard>
        <GlassCard
          delay={220}
          radius={22}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Text style={styles.bentoLabel}>SURFACE</Text>
          <Text style={styles.bentoValue}>Bento Grid</Text>
          <Text style={styles.bentoHint}>Mixed tile proportions</Text>
        </GlassCard>
      </View>
    </Shell>
  );
}

/** 4 – Layered Interface */
export function LayeredLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell actions={a} scroll={false} contentStyle={styles.layeredRoot}>
      <View style={styles.layeredStage}>
        <View
          style={[
            styles.layerBack,
            { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder },
          ]}
        />
        <View style={styles.layerHero}>
          <RobotImage style={{ width: '100%', height: '100%' }} />
        </View>
        <GlassCard delay={80} style={styles.layerInfo} radius={24}>
          <TitleBlock align="left" compact titleStyle={{ fontSize: 28 }} />
          <RobotList status={a.status} />
        </GlassCard>
        <GlassCard delay={140} style={styles.layerControls} radius={24}>
          <ActionControls
            compact
            isOn={a.isOn}
            onRemove={a.removeEA}
            onStart={a.start}
            onStop={a.stop}
            onSymbols={a.openSymbols}
          />
        </GlassCard>
      </View>
    </Shell>
  );
}

/** 5 – Vertical Timeline */
export function VerticalTimelineLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell actions={a} contentStyle={styles.timelineContent}>
      <View style={styles.timelineHero}>
        <RobotImage style={{ width: 160, height: 160 }} scanner={false} />
        <TitleBlock compact titleStyle={{ fontSize: 30 }} />
      </View>

      <View style={styles.checkpoint}>
        <View style={[styles.checkpointDot, { backgroundColor: colors.accent }]} />
        <View style={[styles.checkpointCard, { borderColor: colors.border }]}>
          <Text style={[styles.checkpointLabel, { color: colors.accent }]}>
            01 · IDENTITY
          </Text>
          <Text style={[styles.checkpointBody, { color: colors.muted }]}>
            Powered By LumexPRO
          </Text>
        </View>
      </View>

      <View style={styles.checkpoint}>
        <View style={[styles.checkpointDot, { backgroundColor: colors.accent }]} />
        <View style={[styles.checkpointCard, { borderColor: colors.border }]}>
          <Text style={[styles.checkpointLabel, { color: colors.accent }]}>
            02 · STATUS
          </Text>
          <RobotList status={a.status} />
        </View>
      </View>

      <View style={styles.checkpoint}>
        <View style={[styles.checkpointDot, { backgroundColor: colors.accent }]} />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.checkpointLabel,
              { color: colors.accent, marginBottom: 10 },
            ]}
          >
            03 · CONTROLS
          </Text>
          <ActionControls
            variant="timeline"
            compact
            isOn={a.isOn}
            onRemove={a.removeEA}
            onStart={a.start}
            onStop={a.stop}
            onSymbols={a.openSymbols}
          />
        </View>
      </View>
    </Shell>
  );
}

/** 6 – Offset Layout */
export function OffsetLayout() {
  const a = useHomeActions();
  const { width } = useWindowDimensions();

  return (
    <Shell actions={a} contentStyle={styles.offsetContent}>
      <RobotImage
        style={{
          width: width * 0.62,
          height: SCREEN_H * 0.36,
          alignSelf: 'flex-start',
          marginLeft: -8,
        }}
      />
      <View style={{ alignSelf: 'flex-end', width: '70%', marginTop: -40 }}>
        <TitleBlock align="right" titleStyle={{ fontSize: 34 }} />
      </View>
      <ActionControls
        variant="stagger"
        compact
        isOn={a.isOn}
        onRemove={a.removeEA}
        onStart={a.start}
        onStop={a.stop}
        onSymbols={a.openSymbols}
        style={{ marginTop: 20 }}
      />
      <GlassCard
        delay={120}
        style={{ marginTop: 18, marginLeft: 28, width: '82%' }}
        radius={20}
      >
        <RobotList status={a.status} />
      </GlassCard>
    </Shell>
  );
}

/** 7 – Sidebar Mobile */
export function SidebarMobileLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell actions={a} scroll={false} contentStyle={styles.sidebarRoot}>
      <View style={styles.sidebarRow}>
        <View
          style={[
            styles.sideColumn,
            { backgroundColor: colors.surfaceSolid, borderColor: colors.glassBorder },
          ]}
        >
          <Text style={[styles.sideBrand, { color: colors.accent }]}>LX</Text>
          <View style={styles.sideNavMarks}>
            {['H', 'M', 'S'].map((label) => (
              <View
                key={label}
                style={[styles.sideMark, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.white, fontWeight: '700', fontSize: 11 }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }} />
          <View
            style={[styles.sideStatus, { backgroundColor: colors.accent }]}
          />
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.sideMain}
          showsVerticalScrollIndicator={false}
        >
          <TitleBlock align="left" titleStyle={{ fontSize: 28 }} />
          <RobotImage
            style={{ width: '100%', height: SCREEN_H * 0.32, marginTop: 12 }}
          />
          <ActionControls
            variant="stack"
            compact
            isOn={a.isOn}
            onRemove={a.removeEA}
            onStart={a.start}
            onStop={a.stop}
            onSymbols={a.openSymbols}
            style={{ marginTop: 14 }}
          />
          <GlassCard delay={100} style={{ marginTop: 14 }} radius={18}>
            <RobotList status={a.status} />
          </GlassCard>
        </ScrollView>
      </View>
    </Shell>
  );
}

/** 8 – Split Canvas */
export function SplitCanvasLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell actions={a} scroll={false} edges={['left', 'right']}>
      <View style={styles.splitRoot}>
        <View style={styles.splitHero}>
          <RobotImage style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.splitHeroText}>
            <Text style={[styles.splitTitle, { color: colors.white }]}>
              Lumex AI
            </Text>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>
              LumexPRO
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.splitPanel,
            { backgroundColor: colors.surfaceSolid },
          ]}
        >
          <Text style={[styles.splitPanelLabel, { color: colors.muted }]}>
            CONTROLS
          </Text>
          <Text style={[styles.splitPanelSub, { color: colors.white }]}>
            Neural trading companion
          </Text>
          <ActionControls
            variant="stack"
            compact
            isOn={a.isOn}
            onRemove={a.removeEA}
            onStart={a.start}
            onStop={a.stop}
            onSymbols={a.openSymbols}
            style={{ marginTop: 16 }}
          />
          <View style={{ marginTop: 16 }}>
            <RobotList status={a.status} dense />
          </View>
        </View>
      </View>
    </Shell>
  );
}

/** 9 – Hero Overlay */
export function HeroOverlayLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell actions={a} scroll={false} edges={['left', 'right']} showBadge>
      <View style={{ flex: 1 }}>
        <RobotImage
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.35)',
            'transparent',
            'rgba(0,0,0,0.82)',
          ]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.overlaySafe} edges={['top', 'bottom']}>
          <TitleBlock titleStyle={{ fontSize: 40 }} />
          <View style={{ flex: 1 }} />
          <ActionControls
            compact
            isOn={a.isOn}
            onRemove={a.removeEA}
            onStart={a.start}
            onStop={a.stop}
            onSymbols={a.openSymbols}
          />
          <View
            style={[
              styles.overlayStatus,
              { borderColor: 'rgba(255,255,255,0.12)' },
            ]}
          >
            <RobotList status={a.status} />
          </View>
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 8 }}>
            Fade · Gradient · Overlay
          </Text>
        </SafeAreaView>
      </View>
    </Shell>
  );
}

/** 10 – Dashboard Mosaic */
export function DashboardMosaicLayout() {
  const a = useHomeActions();
  const { width } = useWindowDimensions();
  const left = width * 0.42;

  return (
    <Shell actions={a} contentStyle={styles.mosaicContent}>
      <View style={styles.mosaicRow}>
        <GlassCard
          delay={0}
          padded={false}
          radius={18}
          style={{ width: left, height: 210 }}
        >
          <RobotImage style={{ width: '100%', height: '100%' }} />
        </GlassCard>
        <View style={{ flex: 1, gap: 10 }}>
          <GlassCard delay={40} radius={18} style={{ height: 96 }}>
            <TitleBlock
              align="left"
              compact
              showPowered={false}
              titleStyle={{ fontSize: 20 }}
            />
          </GlassCard>
          <GlassCard delay={80} radius={18} style={{ flex: 1 }}>
            <RobotList status={a.status} dense />
          </GlassCard>
        </View>
      </View>
      <View style={styles.mosaicRow}>
        <GlassCard delay={120} radius={18} style={{ flex: 1.2, minHeight: 150 }}>
          <ActionControls
            variant="grid"
            compact
            isOn={a.isOn}
            onRemove={a.removeEA}
            onStart={a.start}
            onStop={a.stop}
            onSymbols={a.openSymbols}
          />
        </GlassCard>
        <GlassCard delay={160} radius={18} style={{ width: width * 0.3, minHeight: 150 }}>
          <Text style={styles.bentoLabel}>POWER</Text>
          <Text style={styles.bentoValue}>LumexPRO</Text>
        </GlassCard>
      </View>
      <GlassCard delay={200} radius={18} style={{ height: 72, justifyContent: 'center' }}>
        <Text style={styles.bentoHint}>Mosaic · Uneven heights · Dashboard rhythm</Text>
      </GlassCard>
    </Shell>
  );
}

/** 11 – Carousel */
export function CarouselLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const ref = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setPage(Math.round(x / width));
  };

  return (
    <Shell actions={a} scroll={false} edges={['left', 'right']}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        <View style={[styles.carouselPage, { width }]}>
          <RobotImage
            style={{ width: '100%', height: '70%' }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', colors.background]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.carouselCaption}>
            <Text style={[styles.posterTitle, { color: colors.white }]}>
              Lumex AI
            </Text>
            <Text style={{ color: colors.muted }}>Swipe for controls →</Text>
          </View>
        </View>

        <View style={[styles.carouselPage, { width, padding: 20 }]}>
          <TitleBlock />
          <View style={{ marginTop: 24 }}>
            <RobotList status={a.status} />
          </View>
          <Text style={[styles.carouselHint, { color: colors.muted }]}>
            Page 2 · Status
          </Text>
        </View>

        <View style={[styles.carouselPage, { width, padding: 20 }]}>
          <Text style={[styles.carouselHint, { color: colors.accent }]}>
            Page 3 · Controls
          </Text>
          <ActionControls
            variant="stack"
            isOn={a.isOn}
            onRemove={a.removeEA}
            onStart={a.start}
            onStop={a.stop}
            onSymbols={a.openSymbols}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === page ? colors.accent : colors.muted,
                opacity: i === page ? 1 : 0.35,
              },
            ]}
          />
        ))}
      </View>
    </Shell>
  );
}

/** 12 – Floating Windows */
export function FloatingWindowsLayout() {
  const a = useHomeActions();

  return (
    <Shell actions={a} contentStyle={styles.windowsContent}>
      <GlassCard
        delay={0}
        radius={16}
        style={[styles.window, { marginTop: 8, transform: [{ rotate: '-1deg' }] }]}
      >
        <Text style={styles.windowTitle}>hero.exe</Text>
        <RobotImage style={{ width: '100%', height: SCREEN_H * 0.28 }} />
      </GlassCard>
      <GlassCard
        delay={80}
        radius={16}
        style={[styles.window, { marginLeft: 18, transform: [{ rotate: '1.2deg' }] }]}
      >
        <Text style={styles.windowTitle}>identity.txt</Text>
        <TitleBlock align="left" compact titleStyle={{ fontSize: 26 }} />
      </GlassCard>
      <GlassCard
        delay={140}
        radius={16}
        style={[styles.window, { marginRight: 14, transform: [{ rotate: '-0.6deg' }] }]}
      >
        <Text style={styles.windowTitle}>controls.app</Text>
        <ActionControls
          compact
          isOn={a.isOn}
          onRemove={a.removeEA}
          onStart={a.start}
          onStop={a.stop}
          onSymbols={a.openSymbols}
        />
      </GlassCard>
      <GlassCard
        delay={200}
        radius={16}
        style={[styles.window, { marginLeft: 10, transform: [{ rotate: '0.8deg' }] }]}
      >
        <Text style={styles.windowTitle}>status.panel</Text>
        <RobotList status={a.status} />
      </GlassCard>
    </Shell>
  );
}

/** 13 – Folded Layout */
export function FoldedLayout() {
  const a = useHomeActions();

  return (
    <Shell actions={a} contentStyle={styles.foldedContent}>
      <GlassCard delay={0} padded={false} radius={26} style={styles.foldA}>
        <RobotImage style={{ width: '100%', height: SCREEN_H * 0.36 }} />
      </GlassCard>
      <GlassCard delay={80} radius={26} style={styles.foldB}>
        <TitleBlock compact titleStyle={{ fontSize: 30 }} />
      </GlassCard>
      <GlassCard delay={140} radius={26} style={styles.foldC}>
        <ActionControls
          compact
          isOn={a.isOn}
          onRemove={a.removeEA}
          onStart={a.start}
          onStop={a.stop}
          onSymbols={a.openSymbols}
        />
      </GlassCard>
      <GlassCard delay={200} radius={26} style={styles.foldD}>
        <RobotList status={a.status} />
      </GlassCard>
    </Shell>
  );
}

/** 14 – Edge Layout */
export function EdgeLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell
      actions={a}
      contentStyle={styles.edgeContent}
      edges={['left', 'right']}
    >
      <RobotImage
        style={{
          width: SCREEN_W + 24,
          height: SCREEN_H * 0.42,
          marginLeft: -12,
        }}
        resizeMode="cover"
      />
      <View style={styles.edgeBody}>
        <View style={styles.edgeTitleRow}>
          <Text style={[styles.edgeHuge, { color: colors.white }]}>Lumex</Text>
          <Text style={[styles.edgeHugeAccent, { color: colors.accent }]}>
            AI
          </Text>
        </View>
        <Text style={[styles.edgeSub, { color: colors.muted }]}>
          Neural trading companion · Powered By LumexPRO
        </Text>
        <ActionControls
          isOn={a.isOn}
          onRemove={a.removeEA}
          onStart={a.start}
          onStop={a.stop}
          onSymbols={a.openSymbols}
          style={{ marginTop: 18 }}
        />
        <View
          style={[
            styles.edgeStatus,
            { borderTopColor: colors.border },
          ]}
        >
          <RobotList status={a.status} />
        </View>
      </View>
    </Shell>
  );
}

/** 15 – Swiss Minimal */
export function SwissMinimalLayout() {
  const a = useHomeActions();
  const { colors } = useTheme();

  return (
    <Shell actions={a} contentStyle={styles.swissContent}>
      <Text style={[styles.swissTiny, { color: colors.muted }]}>LUMEX / 01</Text>
      <Text style={[styles.swissTitle, { color: colors.white }]}>Lumex AI</Text>
      <Text style={[styles.swissSub, { color: colors.muted }]}>
        Neural trading companion
      </Text>
      <View style={{ height: 28 }} />
      <RobotImage
        style={{ width: 180, height: 180, alignSelf: 'flex-start' }}
        scanner={false}
        breathe={false}
      />
      <View style={{ height: 36 }} />
      <Text style={[styles.swissMeta, { color: colors.accent }]}>
        Powered By LumexPRO
      </Text>
      <View style={{ height: 28 }} />
      <ActionControls
        compact
        isOn={a.isOn}
        onRemove={a.removeEA}
        onStart={a.start}
        onStop={a.stop}
        onSymbols={a.openSymbols}
      />
      <View style={{ height: 32 }} />
      <View style={[styles.swissRule, { backgroundColor: colors.border }]} />
      <View style={{ height: 16 }} />
      <RobotList status={a.status} />
    </Shell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  baseContent: { paddingBottom: 120, paddingTop: 4, width: '100%' },
  badgeWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  nativeHomeContent: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 140,
    gap: 18,
  },
  nativeHint: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  posterOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 110,
  },
  posterTitle: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
  },
  posterSub: {
    marginTop: 6,
    fontSize: 14,
  },
  posterPower: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },

  magazineContent: {
    paddingBottom: 120,
    gap: 18,
  },
  magazineTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  magazineText: {
    flex: 1,
    paddingRight: 12,
    gap: 8,
  },
  magEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  magTitle: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 48,
    letterSpacing: -1.5,
  },
  magSub: {
    fontSize: 13,
    marginTop: 4,
  },
  magazineBand: {
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 14,
    gap: 12,
  },

  bentoContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 10,
  },
  bentoRow: {
    flexDirection: 'row',
  },
  bentoLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  bentoValue: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  bentoHint: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginTop: 8,
  },

  layeredRoot: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  layeredStage: {
    flex: 1,
    marginTop: 8,
  },
  layerBack: {
    position: 'absolute',
    top: 30,
    left: 18,
    right: 0,
    bottom: 40,
    borderRadius: 28,
    borderWidth: 1,
    opacity: 0.75,
  },
  layerHero: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '72%',
    height: '48%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  layerInfo: {
    position: 'absolute',
    top: '38%',
    right: 0,
    width: '78%',
    gap: 12,
  },
  layerControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 12,
  },

  timelineContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    gap: 18,
  },
  timelineHero: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  checkpoint: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  checkpointDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 6,
  },
  checkpointCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  checkpointLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  checkpointBody: {
    fontSize: 14,
  },

  offsetContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },

  sidebarRoot: { flex: 1 },
  sidebarRow: { flex: 1, flexDirection: 'row' },
  sideColumn: {
    width: 64,
    borderRightWidth: 1,
    paddingTop: 10,
    paddingBottom: 110,
    alignItems: 'center',
    gap: 16,
  },
  sideBrand: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  sideNavMarks: { gap: 10 },
  sideMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  sideMain: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 120,
  },

  splitRoot: { flex: 1, flexDirection: 'row' },
  splitHero: {
    width: '58%',
    justifyContent: 'flex-end',
  },
  splitHeroText: {
    padding: 16,
    paddingBottom: 120,
    gap: 6,
  },
  splitTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  splitPanel: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 110,
  },
  splitPanelLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  splitPanelSub: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
  },

  overlaySafe: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 110,
    justifyContent: 'flex-end',
    gap: 14,
  },
  overlayStatus: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },

  mosaicContent: {
    paddingHorizontal: 12,
    paddingTop: 4,
    gap: 10,
  },
  mosaicRow: {
    flexDirection: 'row',
    gap: 10,
  },

  carouselPage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  carouselCaption: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 140,
    gap: 8,
  },
  carouselHint: {
    marginTop: 24,
    fontSize: 13,
    fontWeight: '600',
  },
  dots: {
    position: 'absolute',
    bottom: 108,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  windowsContent: {
    paddingHorizontal: 14,
    paddingTop: 4,
    gap: 16,
  },
  window: {
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  windowTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  foldedContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 140,
  },
  foldA: {
    zIndex: 1,
  },
  foldB: {
    marginTop: -36,
    marginLeft: 22,
    zIndex: 2,
  },
  foldC: {
    marginTop: -28,
    marginRight: 18,
    zIndex: 3,
  },
  foldD: {
    marginTop: -22,
    marginLeft: 12,
    zIndex: 4,
  },

  edgeContent: {
    paddingBottom: 120,
  },
  edgeBody: {
    paddingHorizontal: 16,
    marginTop: -28,
  },
  edgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  edgeHuge: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  edgeHugeAccent: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  edgeSub: {
    marginTop: 8,
    fontSize: 13,
  },
  edgeStatus: {
    marginTop: 22,
    borderTopWidth: 1,
    paddingTop: 16,
  },

  swissContent: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 130,
  },
  swissTiny: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 18,
  },
  swissTitle: {
    fontSize: 56,
    fontWeight: '300',
    letterSpacing: -1.8,
  },
  swissSub: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '400',
  },
  swissMeta: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  swissRule: {
    height: 1,
    width: '40%',
  },
});

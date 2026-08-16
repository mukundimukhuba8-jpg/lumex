import React from 'react';
import { useInterfaceLayout } from '../context/InterfaceLayoutContext';
import {
  BentoGridLayout,
  CarouselLayout,
  DashboardMosaicLayout,
  EdgeLayout,
  FloatingWindowsLayout,
  FoldedLayout,
  FullScreenPosterLayout,
  HeroOverlayLayout,
  LayeredLayout,
  MagazineLayout,
  OffsetLayout,
  SidebarMobileLayout,
  SplitCanvasLayout,
  SwissMinimalLayout,
  VerticalTimelineLayout,
} from '../layouts/HomeLayouts';

export function HomeScreen() {
  const { layoutId } = useInterfaceLayout();

  // Force remount so architecture changes are unmistakable
  switch (layoutId) {
    case 'magazine':
      return <MagazineLayout key={layoutId} />;
    case 'bentoGrid':
      return <BentoGridLayout key={layoutId} />;
    case 'layered':
      return <LayeredLayout key={layoutId} />;
    case 'verticalTimeline':
      return <VerticalTimelineLayout key={layoutId} />;
    case 'offset':
      return <OffsetLayout key={layoutId} />;
    case 'sidebarMobile':
      return <SidebarMobileLayout key={layoutId} />;
    case 'splitCanvas':
      return <SplitCanvasLayout key={layoutId} />;
    case 'heroOverlay':
      return <HeroOverlayLayout key={layoutId} />;
    case 'dashboardMosaic':
      return <DashboardMosaicLayout key={layoutId} />;
    case 'carousel':
      return <CarouselLayout key={layoutId} />;
    case 'floatingWindows':
      return <FloatingWindowsLayout key={layoutId} />;
    case 'folded':
      return <FoldedLayout key={layoutId} />;
    case 'edge':
      return <EdgeLayout key={layoutId} />;
    case 'swissMinimal':
      return <SwissMinimalLayout key={layoutId} />;
    case 'fullScreenPoster':
    default:
      return <FullScreenPosterLayout key="fullScreenPoster" />;
  }
}

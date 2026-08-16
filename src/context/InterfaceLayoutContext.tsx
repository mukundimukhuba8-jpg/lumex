import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { readStored, writeStored } from '../theme/storage';

export type InterfaceLayoutId =
  | 'fullScreenPoster'
  | 'magazine'
  | 'bentoGrid'
  | 'layered'
  | 'verticalTimeline'
  | 'offset'
  | 'sidebarMobile'
  | 'splitCanvas'
  | 'heroOverlay'
  | 'dashboardMosaic'
  | 'carousel'
  | 'floatingWindows'
  | 'folded'
  | 'edge'
  | 'swissMinimal';

export type InterfaceLayoutMeta = {
  id: InterfaceLayoutId;
  name: string;
  number: number;
  description: string;
};

export const INTERFACE_GALLERY: InterfaceLayoutMeta[] = [
  {
    id: 'fullScreenPoster',
    name: 'Native Home',
    number: 1,
    description: 'Premium mobile home with magazine hero and primary controls',
  },
  {
    id: 'magazine',
    name: 'Magazine',
    number: 2,
    description: 'Editorial home composition with integrated robot hero',
  },
  {
    id: 'bentoGrid',
    name: 'Bento Grid',
    number: 3,
    description: 'Apple-style mixed tile sizes in a mosaic grid',
  },
  {
    id: 'layered',
    name: 'Layered Interface',
    number: 4,
    description: 'Stacked floating layers: background, hero, info, controls',
  },
  {
    id: 'verticalTimeline',
    name: 'Vertical Timeline',
    number: 5,
    description: 'Journey checkpoints instead of stacked cards',
  },
  {
    id: 'offset',
    name: 'Offset Layout',
    number: 6,
    description: 'Left hero, right title, staggered artistic alignment',
  },
  {
    id: 'sidebarMobile',
    name: 'Sidebar Mobile',
    number: 7,
    description: 'Thin left rail with content in the remaining canvas',
  },
  {
    id: 'splitCanvas',
    name: 'Split Canvas',
    number: 8,
    description: 'Unequal split — hero vs controls with strong contrast',
  },
  {
    id: 'heroOverlay',
    name: 'Hero Overlay',
    number: 9,
    description: 'Massive artwork with nearly invisible overlay containers',
  },
  {
    id: 'dashboardMosaic',
    name: 'Dashboard Mosaic',
    number: 10,
    description: 'Uneven dashboard tiles with mixed heights and widths',
  },
  {
    id: 'carousel',
    name: 'Carousel',
    number: 11,
    description: 'Full-screen horizontal pages instead of vertical scroll',
  },
  {
    id: 'floatingWindows',
    name: 'Floating Windows',
    number: 12,
    description: 'Desktop-window panels with layered shadows',
  },
  {
    id: 'folded',
    name: 'Folded Layout',
    number: 13,
    description: 'Partially overlapping folded sections for depth',
  },
  {
    id: 'edge',
    name: 'Edge Layout',
    number: 14,
    description: 'Content hugs edges; hero breaks normal margins',
  },
  {
    id: 'swissMinimal',
    name: 'Swiss Minimal',
    number: 15,
    description: 'Huge whitespace, large type, precise quiet alignment',
  },
];

const STORAGE_KEY = 'edgeflow.interfaceLayout';

type Ctx = {
  layoutId: InterfaceLayoutId;
  setLayoutId: (id: InterfaceLayoutId) => void;
  current: InterfaceLayoutMeta;
};

const InterfaceLayoutContext = createContext<Ctx | null>(null);

function isLayoutId(value: string | null): value is InterfaceLayoutId {
  return !!value && INTERFACE_GALLERY.some((item) => item.id === value);
}

export function InterfaceLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [layoutId, setLayoutIdState] = useState<InterfaceLayoutId>(() => {
    const stored = readStored(STORAGE_KEY);
    return isLayoutId(stored) ? stored : 'fullScreenPoster';
  });

  const setLayoutId = useCallback((id: InterfaceLayoutId) => {
    setLayoutIdState(id);
    writeStored(STORAGE_KEY, id);
  }, []);

  const current =
    INTERFACE_GALLERY.find((item) => item.id === layoutId) ??
    INTERFACE_GALLERY[0];

  const value = useMemo(
    () => ({ layoutId, setLayoutId, current }),
    [layoutId, setLayoutId, current],
  );

  return (
    <InterfaceLayoutContext.Provider value={value}>
      {children}
    </InterfaceLayoutContext.Provider>
  );
}

export function useInterfaceLayout() {
  const ctx = useContext(InterfaceLayoutContext);
  if (!ctx) {
    throw new Error(
      'useInterfaceLayout must be used within InterfaceLayoutProvider',
    );
  }
  return ctx;
}

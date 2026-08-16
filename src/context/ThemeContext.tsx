import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  COLOR_PALETTES,
  ColorTokens,
  colors as defaultColors,
} from '../theme/colors';
import { readStored, writeStored } from '../theme/storage';

const STORAGE_KEY = 'edgeflow.colorPalette';

type Ctx = {
  paletteId: string;
  colors: ColorTokens;
  palettes: ColorTokens[];
  setPaletteId: (id: string) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function resolvePalette(id: string | null): ColorTokens {
  return COLOR_PALETTES.find((p) => p.id === id) ?? defaultColors;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteId, setPaletteIdState] = useState(
    () => readStored(STORAGE_KEY) ?? 'lumexModern',
  );

  const setPaletteId = useCallback((id: string) => {
    setPaletteIdState(id);
    writeStored(STORAGE_KEY, id);
  }, []);

  const colors = useMemo(() => resolvePalette(paletteId), [paletteId]);

  const value = useMemo(
    () => ({
      paletteId: colors.id,
      colors,
      palettes: COLOR_PALETTES,
      setPaletteId,
    }),
    [colors, setPaletteId],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

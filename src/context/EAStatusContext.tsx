import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type EAStatus = 'active' | 'paused' | 'disconnected';

type EAStatusContextValue = {
  status: EAStatus;
  symbols: string[];
  setStatus: (status: EAStatus) => void;
  removeEA: () => void;
  start: () => void;
  stop: () => void;
};

const EAStatusContext = createContext<EAStatusContextValue | null>(null);

export function EAStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<EAStatus>('paused');
  const [symbols, setSymbols] = useState(['XAUUSD', 'EURUSD', 'BTCUSD', 'NAS100']);

  const removeEA = useCallback(() => {
    setStatus('disconnected');
    setSymbols([]);
  }, []);

  const start = useCallback(() => setStatus('active'), []);
  const stop = useCallback(() => setStatus('paused'), []);

  const value = useMemo(
    () => ({ status, symbols, setStatus, removeEA, start, stop }),
    [status, symbols, removeEA, start, stop],
  );

  return (
    <EAStatusContext.Provider value={value}>{children}</EAStatusContext.Provider>
  );
}

export function useEAStatus() {
  const ctx = useContext(EAStatusContext);
  if (!ctx) throw new Error('useEAStatus must be used within EAStatusProvider');
  return ctx;
}

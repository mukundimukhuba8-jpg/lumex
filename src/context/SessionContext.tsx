import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

export type AppSession = 'app' | 'admin';

type Ctx = {
  session: AppSession;
  enterAdmin: () => void;
  exitAdmin: () => void;
};

const SessionContext = createContext<Ctx | null>(null);

function readInitialSession(): AppSession {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (
      path === '/admin' ||
      path.endsWith('/admin') ||
      hash.includes('admin') ||
      search.includes('session=admin')
    ) {
      return 'admin';
    }
  }
  return 'app';
}

function syncUrl(session: AppSession) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    url.hash = session === 'admin' ? 'admin' : '';
    url.searchParams.delete('session');
    window.history.replaceState({}, '', url.toString());
  } catch {
    // ignore
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AppSession>(() => readInitialSession());

  const enterAdmin = useCallback(() => {
    setSession('admin');
    syncUrl('admin');
  }, []);

  const exitAdmin = useCallback(() => {
    setSession('app');
    syncUrl('app');
  }, []);

  const value = useMemo(
    () => ({ session, enterAdmin, exitAdmin }),
    [session, enterAdmin, exitAdmin],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

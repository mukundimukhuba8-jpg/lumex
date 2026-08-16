import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  PortalAdmin,
  fetchPortalMe,
  getPortalToken,
  portalLogin,
  portalRegister,
  setPortalToken,
} from '../auth/api';

export type PortalGate = 'loading' | 'auth' | 'pending' | 'portal';

type PortalAuthContextValue = {
  gate: PortalGate;
  admin: PortalAdmin | null;
  bootstrapping: boolean;
  login: (input: {
    email: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string; pending?: boolean }>;
  register: (input: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) => Promise<{ ok: true; pending: boolean } | { ok: false; error: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [admin, setAdmin] = useState<PortalAdmin | null>(null);
  const [pendingLocal, setPendingLocal] = useState(false);

  const refresh = useCallback(async () => {
    const token = getPortalToken();
    if (!token) {
      // Keep local pending registration state (no token until approved login)
      return;
    }
    const me = await fetchPortalMe();
    if (!me.ok) {
      setPortalToken(null);
      setAdmin(null);
      return;
    }
    setAdmin(me.data.admin);
    setPendingLocal(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const res = await portalLogin(input);
      if (!res.ok) {
        if (res.code === 'PORTAL_PENDING') {
          setPendingLocal(true);
          setAdmin((res.data?.admin as PortalAdmin) || null);
          return { ok: false as const, error: res.error, pending: true };
        }
        return { ok: false as const, error: res.error };
      }
      setPortalToken(res.data.token);
      setAdmin(res.data.admin);
      setPendingLocal(false);
      return { ok: true as const };
    },
    [],
  );

  const register = useCallback(
    async (input: {
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    }) => {
      const res = await portalRegister(input);
      if (!res.ok) return { ok: false as const, error: res.error };
      setAdmin(res.data.admin);
      setPendingLocal(true);
      return { ok: true as const, pending: true };
    },
    [],
  );

  const logout = useCallback(() => {
    setPortalToken(null);
    setAdmin(null);
    setPendingLocal(false);
  }, []);

  const gate: PortalGate = bootstrapping
    ? 'loading'
    : admin && admin.status === 'approved' && getPortalToken()
      ? 'portal'
      : pendingLocal || (admin && admin.status === 'pending')
        ? 'pending'
        : 'auth';

  const value = useMemo(
    () => ({
      gate,
      admin,
      bootstrapping,
      login,
      register,
      logout,
      refresh,
    }),
    [gate, admin, bootstrapping, login, register, logout, refresh],
  );

  return (
    <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider');
  return ctx;
}

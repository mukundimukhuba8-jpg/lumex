import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AccessStatus,
  AuthUser,
  LicenseInfo,
  activateLicenseKey,
  fetchMe,
  getStoredToken,
  licenseLogin as licenseLoginRequest,
  registerAccount,
  setStoredToken,
  verifyProtectedAccess,
} from './api';

export type AuthGate =
  | 'loading'
  | 'register'
  | 'pending'
  | 'revoked'
  | 'license'
  | 'app';

type AuthContextValue = {
  gate: AuthGate;
  user: AuthUser | null;
  license: LicenseInfo | null;
  accessStatus: AccessStatus | null;
  bootstrapping: boolean;
  register: (input: {
    email: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  licenseLogin: (input: {
    email: string;
    licenseKey: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  activateLicense: (
    key: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveGate(
  authenticated: boolean,
  accessStatus: AccessStatus | null,
  license: LicenseInfo | null,
): AuthGate {
  if (!authenticated) return 'register';
  if (accessStatus === 'revoked') return 'revoked';
  if (accessStatus !== 'approved') return 'pending';
  if (license?.status === 'active') return 'app';
  return 'license';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);

  const applySession = useCallback(
    (
      nextUser: AuthUser | null,
      nextLicense: LicenseInfo | null,
      nextAccess: AccessStatus | null,
    ) => {
      setUser(nextUser);
      setLicense(nextLicense);
      setAccessStatus(nextAccess);
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      applySession(null, null, null);
      return;
    }
    const me = await fetchMe(token);
    if (!me.ok) {
      setStoredToken(null);
      applySession(null, null, null);
      return;
    }
    const access = me.data.accessStatus || me.data.user.accessStatus || 'pending';
    applySession(me.data.user, me.data.license, access);

    if (access === 'approved' && me.data.license.status === 'active') {
      const protectedCheck = await verifyProtectedAccess();
      if (!protectedCheck.ok) {
        // Server denied — re-fetch next gate from access codes
        if (protectedCheck.code === 'ACCESS_REVOKED') {
          applySession(me.data.user, me.data.license, 'revoked');
        } else if (protectedCheck.code === 'APPROVAL_REQUIRED') {
          applySession(me.data.user, me.data.license, 'pending');
        } else {
          applySession(me.data.user, { status: 'none', hint: null, activatedAt: null }, access);
        }
      }
    }
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshSession();
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const onVis = () => {
        if (document.visibilityState === 'visible') void refreshSession();
      };
      document.addEventListener('visibilitychange', onVis);
      const timer = setInterval(() => {
        void refreshSession();
      }, 12000);
      return () => {
        document.removeEventListener('visibilitychange', onVis);
        clearInterval(timer);
      };
    }

    const { AppState } = require('react-native') as typeof import('react-native');
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshSession();
    });
    const timer = setInterval(() => {
      void refreshSession();
    }, 12000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [refreshSession]);

  const register = useCallback(
    async (input: {
      email: string;
      firstName: string;
      lastName: string;
    }) => {
      const res = await registerAccount(input);
      if (!res.ok) return { ok: false as const, error: res.error };
      setStoredToken(res.data.token);
      applySession(
        res.data.user,
        res.data.license,
        res.data.accessStatus || res.data.user.accessStatus || 'pending',
      );
      return { ok: true as const };
    },
    [applySession],
  );

  const licenseLogin = useCallback(
    async (input: {
      email: string;
      licenseKey: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const res = await licenseLoginRequest(input);
      if (!res.ok) return { ok: false as const, error: res.error };
      setStoredToken(res.data.token);
      applySession(
        res.data.user,
        res.data.license,
        res.data.accessStatus || res.data.user.accessStatus || 'pending',
      );
      return { ok: true as const };
    },
    [applySession],
  );

  const activateLicense = useCallback(
    async (key: string) => {
      const res = await activateLicenseKey(key);
      if (!res.ok) return { ok: false as const, error: res.error };
      setLicense(res.data.license);
      const protectedCheck = await verifyProtectedAccess();
      if (!protectedCheck.ok) {
        setLicense({ status: 'none', hint: null, activatedAt: null });
        return {
          ok: false as const,
          error: protectedCheck.error || 'License could not be verified.',
        };
      }
      return { ok: true as const };
    },
    [],
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    applySession(null, null, null);
  }, [applySession]);

  const gate = bootstrapping
    ? 'loading'
    : resolveGate(!!user, accessStatus, license);

  const value = useMemo<AuthContextValue>(
    () => ({
      gate,
      user,
      license,
      accessStatus,
      bootstrapping,
      register,
      licenseLogin,
      activateLicense,
      logout,
      refreshSession,
    }),
    [
      gate,
      user,
      license,
      accessStatus,
      bootstrapping,
      register,
      licenseLogin,
      activateLicense,
      logout,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

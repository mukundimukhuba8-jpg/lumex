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
  PortalEa,
  PortalLicense,
  PortalSubscriber,
  approvePortalAdmin,
  approveSubscriber,
  createAdminEa,
  deleteAdminEa,
  fetchAdminEas,
  fetchAdminLicenses,
  fetchAdminSubscriptions,
  fetchPortalAdmins,
  generateAdminLicenses,
  pendSubscriber,
  releaseAdminLicense,
  revokePortalAdmin,
  revokeSubscriber,
} from '../auth/api';
import { usePortalAuth } from './PortalAuthContext';
import type { PickedMedia } from './pickMedia';

export type AdminRoute =
  | 'dashboard'
  | 'approve'
  | 'subscriptions'
  | 'licenses'
  | 'emails'
  | 'setup'
  | 'connect'
  | 'orders'
  | 'eas'
  | 'profile';

export type ManagedEA = PortalEa;

export type Subscriber = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt?: string;
  reviewedAt?: string | null;
  license?: {
    status: string;
    hint: string | null;
    activatedAt: string | null;
  };
};

type Stats = { pending: number; approved: number; revoked: number; total: number };
type LicenseStats = {
  available: number;
  active: number;
  expired: number;
  suspended: number;
  total: number;
};

type AdminContextValue = {
  route: AdminRoute;
  setRoute: (route: AdminRoute) => void;
  mentorId: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  setProfile: React.Dispatch<
    React.SetStateAction<AdminContextValue['profile']>
  >;
  eas: ManagedEA[];
  refreshEas: () => Promise<void>;
  addEA: (input: {
    name: string;
    symbols: string[];
    description?: string;
    media?: PickedMedia | null;
  }) => Promise<boolean>;
  removeEA: (id: string) => Promise<void>;
  subscribers: Subscriber[];
  stats: Stats;
  loadingSubscribers: boolean;
  refreshSubscribers: () => Promise<void>;
  approveAccess: (id: string) => Promise<void>;
  revokeAccess: (id: string) => Promise<void>;
  markPending: (id: string) => Promise<void>;
  addSubscriber: (input: {
    email: string;
    firstName: string;
    lastName: string;
  }) => void;
  admins: PortalAdmin[];
  adminStats: Stats;
  refreshAdmins: () => Promise<void>;
  approveAdmin: (id: string) => Promise<void>;
  revokeAdmin: (id: string) => Promise<void>;
  licenses: PortalLicense[];
  licenseStats: LicenseStats;
  freshlyGenerated: PortalLicense[];
  clearFreshKeys: () => void;
  refreshLicenses: () => Promise<void>;
  generateKeys: (input: {
    email: string;
    firstName: string;
    lastName: string;
    eaId: string;
  }) => Promise<void>;
  releaseKey: (
    id: string,
    input: { email: string; firstName: string; lastName: string },
  ) => Promise<void>;
  brokerConnected: boolean;
  setBrokerConnected: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

function mapPortal(s: PortalSubscriber): Subscriber {
  return {
    id: s.id,
    email: s.email,
    firstName: s.firstName,
    lastName: s.lastName,
    status: s.status,
    createdAt: s.createdAt,
    reviewedAt: s.reviewedAt,
    license: s.license,
  };
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { admin: signedIn } = usePortalAuth();
  const [route, setRoute] = useState<AdminRoute>('licenses');
  const [toast, setToast] = useState<string | null>(null);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    approved: 0,
    revoked: 0,
    total: 0,
  });
  const [adminStats, setAdminStats] = useState<Stats>({
    pending: 0,
    approved: 0,
    revoked: 0,
    total: 0,
  });
  const [licenseStats, setLicenseStats] = useState<LicenseStats>({
    available: 0,
    active: 0,
    expired: 0,
    suspended: 0,
    total: 0,
  });
  const [profile, setProfile] = useState({
    firstName: signedIn?.firstName || 'Mukundi',
    lastName: signedIn?.lastName || '',
    email: signedIn?.email || '',
    phone: '',
  });
  const [eas, setEas] = useState<ManagedEA[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [admins, setAdmins] = useState<PortalAdmin[]>([]);
  const [licenses, setLicenses] = useState<PortalLicense[]>([]);
  const [freshlyGenerated, setFreshlyGenerated] = useState<PortalLicense[]>([]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const refreshEas = useCallback(async () => {
    const res = await fetchAdminEas();
    if (!res.ok) return;
    setEas(res.data.eas);
  }, []);

  const refreshSubscribers = useCallback(async () => {
    setLoadingSubscribers(true);
    const res = await fetchAdminSubscriptions();
    setLoadingSubscribers(false);
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    setStats(res.data.stats);
    setSubscribers(res.data.subscribers.map(mapPortal));
  }, [showToast]);

  const refreshAdmins = useCallback(async () => {
    const res = await fetchPortalAdmins();
    if (!res.ok) {
      return;
    }
    setAdminStats(res.data.stats);
    setAdmins(res.data.admins);
  }, []);

  const refreshLicenses = useCallback(async () => {
    const res = await fetchAdminLicenses();
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    setLicenseStats(res.data.stats);
    setLicenses(res.data.licenses);
  }, [showToast]);

  useEffect(() => {
    void refreshSubscribers();
    void refreshAdmins();
    void refreshLicenses();
    void refreshEas();
    const id = setInterval(() => {
      void refreshSubscribers();
      void refreshAdmins();
      void refreshLicenses();
      void refreshEas();
    }, 8000);
    return () => clearInterval(id);
  }, [refreshSubscribers, refreshAdmins, refreshLicenses, refreshEas]);

  useEffect(() => {
    if (!signedIn) return;
    setProfile((p) => ({
      ...p,
      firstName: signedIn.firstName || p.firstName,
      lastName: signedIn.lastName || p.lastName,
      email: signedIn.email || p.email,
    }));
  }, [signedIn]);

  const approveAccess = useCallback(
    async (id: string) => {
      const res = await approveSubscriber(id);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      showToast('Subscriber approved');
      await refreshSubscribers();
    },
    [refreshSubscribers, showToast],
  );

  const revokeAccess = useCallback(
    async (id: string) => {
      const res = await revokeSubscriber(id);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      showToast('Access revoked');
      await refreshSubscribers();
    },
    [refreshSubscribers, showToast],
  );

  const markPending = useCallback(
    async (id: string) => {
      const res = await pendSubscriber(id);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      showToast('Moved to pending');
      await refreshSubscribers();
    },
    [refreshSubscribers, showToast],
  );

  const approveAdmin = useCallback(
    async (id: string) => {
      const res = await approvePortalAdmin(id);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      showToast('Portal admin approved');
      await refreshAdmins();
    },
    [refreshAdmins, showToast],
  );

  const revokeAdmin = useCallback(
    async (id: string) => {
      const res = await revokePortalAdmin(id);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      showToast('Portal admin revoked');
      await refreshAdmins();
    },
    [refreshAdmins, showToast],
  );

  const generateKeys = useCallback(
    async (input: {
      email: string;
      firstName: string;
      lastName: string;
      eaId: string;
    }) => {
      const res = await generateAdminLicenses(input);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      setFreshlyGenerated(res.data.licenses);
      showToast('License key generated — EA synced');
      await refreshLicenses();
    },
    [refreshLicenses, showToast],
  );

  const releaseKey = useCallback(
    async (
      id: string,
      input: { email: string; firstName: string; lastName: string },
    ) => {
      const res = await releaseAdminLicense(id, input);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      showToast(res.data.message || 'License reassigned');
      await refreshLicenses();
    },
    [refreshLicenses, showToast],
  );

  const clearFreshKeys = useCallback(() => setFreshlyGenerated([]), []);

  const addEA = useCallback(
    async (input: {
      name: string;
      symbols: string[];
      description?: string;
      media?: PickedMedia | null;
    }) => {
      const cleaned = input.name.trim();
      if (!cleaned) {
        showToast('Enter an EA name');
        return false;
      }
      if (!input.symbols.length) {
        showToast('Add at least one symbol');
        return false;
      }
      const res = await createAdminEa({
        name: cleaned,
        symbols: input.symbols,
        description: input.description,
        media: input.media
          ? {
              uri: input.media.uri,
              name: input.media.name,
              type: input.media.type,
              file: input.media.file,
            }
          : null,
      });
      if (!res.ok) {
        showToast(res.error);
        return false;
      }
      showToast('EA created');
      await refreshEas();
      return true;
    },
    [refreshEas, showToast],
  );

  const removeEA = useCallback(
    async (id: string) => {
      const res = await deleteAdminEa(id);
      if (!res.ok) {
        showToast(res.error);
        return;
      }
      showToast('EA removed');
      await refreshEas();
    },
    [refreshEas, showToast],
  );

  const addSubscriber = useCallback(() => {
    showToast('App users appear automatically after license login');
  }, [showToast]);

  const value = useMemo(
    () => ({
      route,
      setRoute,
      mentorId: signedIn?.mentorId || 'LM-004821',
      profile,
      setProfile,
      eas,
      refreshEas,
      addEA,
      removeEA,
      subscribers,
      stats,
      loadingSubscribers,
      refreshSubscribers,
      approveAccess,
      revokeAccess,
      markPending,
      addSubscriber,
      admins,
      adminStats,
      refreshAdmins,
      approveAdmin,
      revokeAdmin,
      licenses,
      licenseStats,
      freshlyGenerated,
      clearFreshKeys,
      refreshLicenses,
      generateKeys,
      releaseKey,
      brokerConnected,
      setBrokerConnected,
      toast,
      showToast,
    }),
    [
      route,
      signedIn,
      profile,
      eas,
      refreshEas,
      addEA,
      removeEA,
      subscribers,
      stats,
      loadingSubscribers,
      refreshSubscribers,
      approveAccess,
      revokeAccess,
      markPending,
      addSubscriber,
      admins,
      adminStats,
      refreshAdmins,
      approveAdmin,
      revokeAdmin,
      licenses,
      licenseStats,
      freshlyGenerated,
      clearFreshKeys,
      refreshLicenses,
      generateKeys,
      releaseKey,
      brokerConnected,
      toast,
      showToast,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}

export async function copyText(value: string) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

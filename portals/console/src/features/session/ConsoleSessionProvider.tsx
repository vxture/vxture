"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  login,
  logout,
  restoreSession,
  switchTenantSession,
} from "@/api/console-bff";
import type { SessionSnapshot } from "@/entities/console";

type SessionStatus = "idle" | "loading" | "ready";
const SESSION_SYNC_INTERVAL_MS = 2000;
const SESSION_SYNC_THROTTLE_MS = 1500;
const ANONYMOUS_SESSION: SessionSnapshot = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  tenantOptions: [],
  capabilities: [],
};

interface RefreshSessionOptions {
  silent?: boolean;
}

interface SessionContextValue {
  session: SessionSnapshot;
  status: SessionStatus;
  signIn: (
    identifier: string,
    password: string,
    turnstileToken?: string,
  ) => Promise<void>;
  signOut: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshSession: (options?: RefreshSessionOptions) => Promise<SessionSnapshot>;
}

const SessionContext = createContext<SessionContextValue>({
  session: ANONYMOUS_SESSION,
  status: "idle",
  signIn: async () => undefined,
  signOut: () => undefined,
  switchTenant: async () => undefined,
  refreshSession: async () => ANONYMOUS_SESSION,
});

const ACTIVE_TENANT_STORAGE_KEY = "vx-console-active-tenant-id";

function readStoredTenantId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY) ?? undefined;
}

function writeStoredTenantId(tenantId: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId);
  }
}

async function applyStoredTenant(snapshot: SessionSnapshot) {
  const storedTenantId = readStoredTenantId();
  if (!storedTenantId || snapshot.tenant?.id === storedTenantId) {
    return snapshot;
  }

  const canUseStoredTenant = (snapshot.tenantOptions ?? []).some(
    (tenant) => tenant.id === storedTenantId,
  );
  return canUseStoredTenant ? switchTenantSession(storedTenantId) : snapshot;
}

function getSessionIdentity(snapshot: SessionSnapshot) {
  return JSON.stringify({
    isAuthenticated: snapshot.isAuthenticated,
    user: snapshot.user,
    tenant: snapshot.tenant,
    tenantOptions: snapshot.tenantOptions ?? [],
    capabilities: snapshot.capabilities,
  });
}

export function ConsoleSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionSnapshot>(ANONYMOUS_SESSION);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const sessionRef = useRef<SessionSnapshot>(ANONYMOUS_SESSION);
  const lastSyncAtRef = useRef(0);
  const syncInFlightRef = useRef(false);

  const commitSession = useCallback((snapshot: SessionSnapshot) => {
    const previous = sessionRef.current;
    sessionRef.current = snapshot;

    if (getSessionIdentity(previous) !== getSessionIdentity(snapshot)) {
      setSession(snapshot);
    }
  }, []);

  const refreshSession = useCallback(
    async (options: RefreshSessionOptions = {}) => {
      if (!options.silent) {
        setStatus("loading");
      }

      try {
        const snapshot = await applyStoredTenant(await restoreSession());
        commitSession(snapshot);
        setStatus("ready");

        return snapshot;
      } catch (error) {
        if (!options.silent) {
          commitSession(ANONYMOUS_SESSION);
        }

        setStatus("ready");
        return options.silent ? sessionRef.current : ANONYMOUS_SESSION;
      }
    },
    [commitSession],
  );

  useEffect(() => {
    lastSyncAtRef.current = Date.now();
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    const syncIfStale = () => {
      const now = Date.now();
      if (
        syncInFlightRef.current ||
        now - lastSyncAtRef.current < SESSION_SYNC_THROTTLE_MS
      ) {
        return;
      }

      syncInFlightRef.current = true;
      lastSyncAtRef.current = now;

      void refreshSession({ silent: true }).finally(() => {
        syncInFlightRef.current = false;
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncIfStale();
      }
    };

    const intervalId = window.setInterval(
      syncIfStale,
      SESSION_SYNC_INTERVAL_MS,
    );
    window.addEventListener("focus", syncIfStale);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", syncIfStale);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSession, status]);

  async function signIn(
    identifier: string,
    password: string,
    turnstileToken?: string,
  ) {
    setStatus("loading");
    try {
      const snapshot = await applyStoredTenant(
        await login({ identifier, password, turnstileToken }),
      );
      commitSession(snapshot);
      setStatus("ready");
    } catch (error) {
      commitSession(ANONYMOUS_SESSION);
      setStatus("ready");
      throw error;
    }
  }

  async function signOut() {
    await logout();
    commitSession(ANONYMOUS_SESSION);
    setStatus("ready");
  }

  async function switchTenant(tenantId: string) {
    setStatus("loading");
    const snapshot = await switchTenantSession(tenantId);
    writeStoredTenantId(tenantId);
    commitSession(snapshot);
    setStatus("ready");
  }

  return (
    <SessionContext.Provider
      value={{ session, status, signIn, signOut, switchTenant, refreshSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useConsoleSession() {
  return useContext(SessionContext);
}

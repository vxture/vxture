'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login, logout, restoreSession } from '@/api/console-bff';
import type { SessionSnapshot } from '@/entities/console';
import { anonymousSession } from '@/shared/mock-console-data';

type SessionStatus = 'idle' | 'loading' | 'ready';

interface SessionContextValue {
  session: SessionSnapshot;
  status: SessionStatus;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue>({
  session: anonymousSession,
  status: 'idle',
  signIn: async () => undefined,
  signOut: () => undefined,
  switchTenant: async () => undefined,
  refreshSession: async () => undefined,
});

const ACTIVE_TENANT_STORAGE_KEY = 'vx-console-active-tenant-id';

function readStoredTenantId() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY) ?? undefined;
}

function writeStoredTenantId(tenantId: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId);
  }
}

export function ConsoleSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionSnapshot>(anonymousSession);
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    let active = true;

    void restoreSession(readStoredTenantId()).then((snapshot) => {
      if (!active) {
        return;
      }

      setSession(snapshot);
      setStatus('ready');
    });

    return () => {
      active = false;
    };
  }, []);

  async function signIn(identifier: string, password: string) {
    setStatus('loading');
    try {
      const snapshot = await login({ identifier, password }, readStoredTenantId());
      setSession(snapshot);
      setStatus('ready');
    } catch (error) {
      setSession(anonymousSession);
      setStatus('ready');
      throw error;
    }
  }

  async function signOut() {
    await logout();
    setSession(anonymousSession);
    setStatus('ready');
  }

  async function switchTenant(tenantId: string) {
    setStatus('loading');
    writeStoredTenantId(tenantId);
    const snapshot = await restoreSession(tenantId);
    setSession(snapshot);
    setStatus('ready');
  }

  async function refreshSession() {
    setStatus('loading');
    const snapshot = await restoreSession(readStoredTenantId());
    setSession(snapshot);
    setStatus('ready');
  }

  return (
    <SessionContext.Provider value={{ session, status, signIn, signOut, switchTenant, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useConsoleSession() {
  return useContext(SessionContext);
}

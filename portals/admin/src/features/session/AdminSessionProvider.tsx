'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login, logout, restoreSession } from '@/api/admin-bff';
import type { SessionSnapshot } from '@/entities/console';
import { anonymousSession } from '@/shared/mock-console-data';

type SessionStatus = 'idle' | 'loading' | 'ready';

interface SessionContextValue {
  session: SessionSnapshot;
  status: SessionStatus;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue>({
  session: anonymousSession,
  status: 'idle',
  signIn: async () => undefined,
  signOut: async () => undefined,
  refreshSession: async () => undefined,
});

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionSnapshot>(anonymousSession);
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    let active = true;

    void restoreSession().then((snapshot) => {
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
      const snapshot = await login({ identifier, password });
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

  async function refreshSession() {
    setStatus('loading');
    const snapshot = await restoreSession();
    setSession(snapshot);
    setStatus('ready');
  }

  return (
    <SessionContext.Provider value={{ session, status, signIn, signOut, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useAdminSession() {
  return useContext(SessionContext);
}

'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login, logout, restoreSession } from '@/api/admin-bff';
import type { SessionSnapshot } from '@/entities/console';

type SessionStatus = 'idle' | 'loading' | 'ready';

const EMPTY_SESSION: SessionSnapshot = {
  isAuthenticated: false,
  user: null,
  capabilities: [],
};

interface SessionContextValue {
  session: SessionSnapshot;
  status: SessionStatus;
  signIn: (identifier: string, password: string, captchaToken: string, captchaPosition: number) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue>({
  session: EMPTY_SESSION,
  status: 'idle',
  signIn: async () => undefined,
  signOut: async () => undefined,
  refreshSession: async () => undefined,
});

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionSnapshot>(EMPTY_SESSION);
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

  async function signIn(identifier: string, password: string, captchaToken: string, captchaPosition: number) {
    setStatus('loading');
    try {
      const snapshot = await login({ identifier, password, captchaToken, captchaPosition });
      setSession(snapshot);
      setStatus('ready');
    } catch (error) {
      setSession(EMPTY_SESSION);
      setStatus('ready');
      throw error;
    }
  }

  async function signOut() {
    await logout();
    setSession(EMPTY_SESSION);
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

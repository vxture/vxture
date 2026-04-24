'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

export function AuthSessionBootstrap() {
  useEffect(() => {
    void useAuthStore.getState().restoreSession();
  }, []);

  return null;
}

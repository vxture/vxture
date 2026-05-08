'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'active'; user: RuyinUser };

interface RuyinUser {
  id: string;
  email?: string;
  role?: string;
  tenantId?: string;
  permissions?: string[];
  provider?: string;
}

interface LoginResponse {
  status?: string;
  loginUrl?: string;
}

export function RuyinHome() {
  const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refreshSession = useCallback(async () => {
    setSession((current) => current.status === 'active' ? current : { status: 'loading' });
    const response = await fetch('/api/ruyin/session', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      setSession({ status: 'anonymous' });
      return;
    }

    const data = await response.json() as { user?: RuyinUser };
    setSession(data.user ? { status: 'active', user: data.user } : { status: 'anonymous' });
  }, []);

  useEffect(() => {
    refreshSession().catch(() => setSession({ status: 'anonymous' }));
  }, [refreshSession]);

  const statusText = useMemo(() => {
    if (session.status === 'loading') return '检查中';
    if (session.status === 'active') return '已登录';
    return '未登录';
  }, [session.status]);

  async function handleLogin() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/ruyin/login', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({})) as LoginResponse;

      if (response.status === 401 && data.loginUrl) {
        window.location.href = data.loginUrl;
        return;
      }

      if (!response.ok) {
        setMessage('登录同步失败，请确认 auth-bff、ruyin-bff 已启动。');
        return;
      }

      await refreshSession();
      setMessage('登录状态已同步。');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/ruyin/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        setMessage('登出失败，请稍后重试。');
        return;
      }

      setSession({ status: 'anonymous' });
      setMessage('已登出。');
    } finally {
      setBusy(false);
    }
  }

  const active = session.status === 'active';

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="brand-row">
          <span className="brand-mark">R</span>
          <div>
            <h1>Ruyin</h1>
            <p>Tenant agent workspace</p>
          </div>
        </div>

        <div className={`status-card ${active ? 'is-active' : ''}`}>
          <span className="status-dot" />
          <div>
            <span className="label">登录状态</span>
            <strong>{statusText}</strong>
          </div>
        </div>

        {active ? (
          <div className="user-card">
            <div>
              <span className="label">Account</span>
              <strong>{session.user.email || session.user.id}</strong>
            </div>
            <div>
              <span className="label">Tenant</span>
              <strong>{session.user.tenantId || '-'}</strong>
            </div>
            <div>
              <span className="label">Role</span>
              <strong>{session.user.role || 'member'}</strong>
            </div>
          </div>
        ) : null}

        <div className="actions">
          {active ? (
            <button type="button" className="secondary-button" disabled={busy} onClick={handleLogout}>
              {busy ? '处理中' : '登出'}
            </button>
          ) : (
            <button type="button" className="primary-button" disabled={busy} onClick={handleLogin}>
              {busy ? '同步中' : '登录'}
            </button>
          )}
          <button type="button" className="ghost-button" disabled={busy} onClick={() => refreshSession()}>
            刷新状态
          </button>
        </div>

        {message ? <p className="message">{message}</p> : null}
      </section>
    </main>
  );
}

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui/primitives';
import { ConsoleBffError } from '@/api/console-bff';
import { ConsoleSessionProvider, useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { useConsoleTranslations } from '@/lib/console-intl';

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, status } = useConsoleSession();
  const t = useConsoleTranslations('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier || !password) {
      setError(t('errors.required'));
      return;
    }

    if (!acceptedTerms) {
      setError(t('errors.terms'));
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await signIn(identifier, password);
      const next = searchParams.get('next') || '/';
      router.replace(next);
    } catch (error) {
      if (error instanceof ConsoleBffError && error.status === 401) {
        setError(t('errors.invalid'));
      } else if (error instanceof ConsoleBffError && error.status === 503) {
        setError(t('errors.unavailable'));
      } else if (error instanceof ConsoleBffError && error.message) {
        setError(error.message);
      } else {
        setError(t('errors.invalid'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <div className="auth-brand">
          <img className="auth-brand__mark" src="/brand/vxture-logo-white.png" alt="" aria-hidden="true" />
          <span>Vxture Studio</span>
        </div>
      </header>

      <section className="auth-stage">
        <div className="auth-card">
          <Card className="vx-login-card">
            <CardHeader>
              <CardTitle className="vx-card-title">{t('card.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
                <label className="auth-field" htmlFor="console-login-username">
                  <span>{t('form.account')}</span>
                  <Input
                    id="console-login-username"
                    name="username"
                    type="text"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder={t('form.accountPlaceholder')}
                    autoComplete="username"
                    disabled={submitting || status === 'loading'}
                  />
                </label>
                <label className="auth-field" htmlFor="console-login-password">
                  <span className="auth-field__label">{t('form.password')}</span>
                  <Input
                    id="console-login-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t('form.passwordPlaceholder')}
                    autoComplete="current-password"
                    disabled={submitting || status === 'loading'}
                  />
                  <a className="auth-forgot-link" href="#forgot-password">
                    {t('form.forgotPassword')}
                  </a>
                </label>
                <label className="auth-agreement">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    disabled={submitting || status === 'loading'}
                  />
                  <span>
                    {t('form.acceptPrefix')}
                    <a href="#terms">{t('form.terms')}</a>
                    {t('form.acceptJoiner')}
                    <a href="#privacy">{t('form.privacy')}</a>
                  </span>
                </label>
                {error ? <p className="auth-error">{error}</p> : null}
                <div className="auth-actions">
                  <Button type="submit" className="auth-submit" disabled={submitting || status === 'loading'}>
                    {submitting || status === 'loading' ? t('form.submitting') : t('form.submit')}
                  </Button>
                </div>
              </form>
              <div className="auth-social" aria-label={t('social.label')}>
                <span className="auth-social__divider">{t('social.divider')}</span>
                <div className="auth-social__actions">
                  <button type="button" className="auth-social__button" aria-label={t('social.dingtalk')} disabled>
                    <span className="auth-provider-mark auth-provider-mark--dingtalk" aria-hidden="true" />
                    <span className="auth-provider-label">{t('social.dingtalkShort')}</span>
                  </button>
                  <button type="button" className="auth-social__button" aria-label={t('social.feishu')} disabled>
                    <span className="auth-provider-mark auth-provider-mark--feishu" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="auth-provider-label">{t('social.feishuShort')}</span>
                  </button>
                  <button type="button" className="auth-social__button" aria-label={t('social.wechat')} disabled>
                    <span className="auth-provider-mark auth-provider-mark--wechat" aria-hidden="true">
                      <span />
                      <span />
                    </span>
                    <span className="auth-provider-label">{t('social.wechatShort')}</span>
                  </button>
                </div>
              </div>
              <div className="auth-actions">
                <a className="auth-register-link" href="#register">
                  {t('form.register')}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="auth-footer">
        <span>{t('footer.copyright')}</span>
        <a href="#privacy">{t('footer.privacy')}</a>
        <a href="#terms">{t('footer.terms')}</a>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <ConsoleSessionProvider>
      <LoginScreen />
    </ConsoleSessionProvider>
  );
}

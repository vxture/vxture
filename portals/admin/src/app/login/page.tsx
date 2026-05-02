'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui/primitives';
import { AdminBffError, getCaptchaChallenge } from '@/api/admin-bff';
import { AdminSessionProvider, useAdminSession } from '@/features/session/AdminSessionProvider';
import { useConsoleTranslations } from '@/lib/console-intl';

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const CAPTCHA_HANDLE_SIZE = 42;
const CAPTCHA_PIECE_SIZE = 42;
/** 客户端像素容差，决定"视觉上是否对齐"，服务端独立校验比例容差 */
const CAPTCHA_TOLERANCE = 10;
const CAPTCHA_RETURN_MS = 220;

// ─── 组件 ─────────────────────────────────────────────────────────────────────

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, status } = useAdminSession();
  const t = useConsoleTranslations('login');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaOffset, setCaptchaOffset] = useState(0);
  const [captchaDragging, setCaptchaDragging] = useState(false);
  const [captchaReturning, setCaptchaReturning] = useState(false);
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captchaTargetRatio, setCaptchaTargetRatio] = useState(0.6);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pendingCredentialsRef = useRef({ identifier: '', password: '' });
  const captchaTokenRef = useRef('');
  const captchaSliderRef = useRef<HTMLDivElement | null>(null);
  const captchaHandleRef = useRef<HTMLButtonElement | null>(null);
  const captchaPieceRef = useRef<HTMLDivElement | null>(null);
  const captchaProgressRef = useRef<HTMLDivElement | null>(null);
  const captchaMaxRef = useRef(0);
  const captchaOffsetRef = useRef(0);
  const captchaAnimationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (captchaAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(captchaAnimationFrameRef.current);
      }
    };
  }, []);

  function captchaGeometry() {
    const slider = captchaSliderRef.current;
    if (!slider) return { max: 0, target: 0 };
    const max = Math.max(0, slider.getBoundingClientRect().width - CAPTCHA_HANDLE_SIZE);
    return {
      max,
      target: Math.round(max * captchaTargetRatio),
    };
  }

  function applyCaptchaOffset(value: number) {
    const max = captchaMaxRef.current;
    captchaOffsetRef.current = value;

    if (captchaAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(captchaAnimationFrameRef.current);
    }

    captchaAnimationFrameRef.current = window.requestAnimationFrame(() => {
      const transform = `translate3d(${value}px, 0, 0)`;
      if (captchaHandleRef.current) {
        captchaHandleRef.current.style.transform = transform;
      }
      if (captchaPieceRef.current) {
        captchaPieceRef.current.style.transform = transform;
      }
      if (captchaProgressRef.current) {
        captchaProgressRef.current.style.transform = `scaleX(${max ? value / max : 0})`;
      }
    });
  }

  function resetCaptcha() {
    setCaptchaOffset(0);
    setCaptchaDragging(false);
    setCaptchaReturning(false);
    setCaptchaSolved(false);
    captchaOffsetRef.current = 0;
    captchaMaxRef.current = 0;
    captchaTokenRef.current = '';
    applyCaptchaOffset(0);
  }

  function handleCaptchaPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (captchaSolved || submitting || status === 'loading') return;
    const { max } = captchaGeometry();
    captchaMaxRef.current = max;
    captchaOffsetRef.current = captchaOffset;
    setCaptchaReturning(false);
    event.currentTarget.setPointerCapture(event.pointerId);
    setCaptchaDragging(true);
    setError('');
  }

  function handleCaptchaPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!captchaDragging || captchaSolved) return;
    const slider = captchaSliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    const max = captchaMaxRef.current || captchaGeometry().max;
    const next = Math.min(max, Math.max(0, event.clientX - rect.left - CAPTCHA_HANDLE_SIZE / 2));
    applyCaptchaOffset(next);
  }

  function handleCaptchaPointerEnd() {
    if (!captchaDragging || captchaSolved) return;
    setCaptchaDragging(false);
    const { max, target } = captchaGeometry();
    captchaMaxRef.current = max;
    const offset = captchaOffsetRef.current;

    if (Math.abs(offset - target) <= CAPTCHA_TOLERANCE) {
      setCaptchaSolved(true);
      setCaptchaOffset(target);
      applyCaptchaOffset(target);
      setError('');
      // 将像素偏移转换为比例，传给服务端校验
      const position = max > 0 ? offset / max : 0;
      void continueSignIn(captchaTokenRef.current, position);
      return;
    }

    setCaptchaReturning(true);
    setCaptchaOffset(0);
    applyCaptchaOffset(0);
    window.setTimeout(() => setCaptchaReturning(false), CAPTCHA_RETURN_MS);
  }

  function readLoginForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    return {
      identifier: String(formData.get('username') ?? '').trim(),
      password: String(formData.get('password') ?? ''),
    };
  }

  function validateLoginForm(form: HTMLFormElement) {
    const credentials = readLoginForm(form);
    if (!credentials.identifier || !credentials.password) {
      setError(t('errors.required'));
      return false;
    }

    if (!acceptedTerms) {
      setError(t('errors.terms'));
      return false;
    }

    pendingCredentialsRef.current = credentials;
    return true;
  }

  async function continueSignIn(captchaToken: string, captchaPosition: number) {
    setError('');
    setSubmitting(true);

    try {
      const { identifier, password } = pendingCredentialsRef.current;
      await signIn(identifier, password, captchaToken, captchaPosition);
      const next = searchParams.get('next') || '/';
      router.replace(next);
    } catch (error) {
      if (error instanceof AdminBffError && error.status === 429) {
        setError(error.message || t('errors.tooManyAttempts'));
      } else if (error instanceof AdminBffError && error.status === 401) {
        setError(t('errors.invalid'));
      } else if (error instanceof AdminBffError && error.status === 503) {
        setError(t('errors.unavailable'));
      } else if (error instanceof AdminBffError && error.message) {
        setError(error.message);
      } else {
        setError(t('errors.invalid'));
      }
    } finally {
      setSubmitting(false);
      setCaptchaOpen(false);
      resetCaptcha();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateLoginForm(event.currentTarget)) return;

    resetCaptcha();
    setSubmitting(true);
    setError('');

    try {
      // 从服务端获取签名挑战令牌，目标位置由服务端决定
      const challenge = await getCaptchaChallenge();
      captchaTokenRef.current = challenge.token;
      setCaptchaTargetRatio(challenge.targetRatio);
      setCaptchaOpen(true);
    } catch (error) {
      if (error instanceof AdminBffError && error.status === 503) {
        setError(t('errors.unavailable'));
      } else {
        setError(t('errors.captchaUnavailable'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-topbar">
        <div className="auth-brand">
          <Image
            className="auth-brand__mark"
            src="/brand/vxture-logo-white.png"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            priority
          />
          <span>Vxture Admin</span>
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
                <label className="auth-field" htmlFor="admin-login-username">
                  <span>{t('form.account')}</span>
                  <Input
                    id="admin-login-username"
                    name="username"
                    type="text"
                    placeholder={t('form.accountPlaceholder')}
                    autoComplete="username"
                    disabled={submitting || status === 'loading'}
                  />
                </label>
                <label className="auth-field" htmlFor="admin-login-password">
                  <span className="auth-field__label">{t('form.password')}</span>
                  <Input
                    id="admin-login-password"
                    name="password"
                    type="password"
                    placeholder={t('form.passwordPlaceholder')}
                    autoComplete="current-password"
                    disabled={submitting || status === 'loading'}
                  />
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
                <div className="auth-secondary-actions">
                  <a className="auth-forgot-link" href="#forgot-password">
                    {t('form.forgotPassword')}
                  </a>
                </div>
              </form>
              {captchaOpen ? (
                <div className="auth-captcha-modal" role="dialog" aria-modal="true" aria-label={t('form.dragToVerify')}>
                  <div className="auth-captcha-modal__backdrop" />
                  <div className="auth-captcha-modal__panel">
                    <button
                      type="button"
                      className="auth-captcha-modal__close"
                      aria-label={t('form.closeVerification')}
                      onClick={() => {
                        setCaptchaOpen(false);
                        resetCaptcha();
                      }}
                      disabled={submitting}
                    >
                      ×
                    </button>
                    <div className="auth-captcha-modal__header">
                      <strong>{t('form.humanVerification')}</strong>
                      <span>{t('form.dragToVerify')}</span>
                    </div>
                    <div
                      className={[
                        'auth-captcha',
                        captchaDragging ? 'auth-captcha--dragging' : '',
                        captchaReturning ? 'auth-captcha--returning' : '',
                        captchaSolved ? 'auth-captcha--solved' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <div className="auth-captcha__image" aria-hidden="true">
                        <div className="auth-captcha__target" style={{ left: `calc((100% - ${CAPTCHA_PIECE_SIZE}px) * ${captchaTargetRatio})` }} />
                        <div ref={captchaPieceRef} className="auth-captcha__piece" style={{ transform: `translate3d(${captchaOffset}px, 0, 0)` }} />
                      </div>
                      <div className="auth-captcha__slider" ref={captchaSliderRef}>
                        <div ref={captchaProgressRef} className="auth-captcha__progress" style={{ transform: `scaleX(${captchaMaxRef.current ? captchaOffset / captchaMaxRef.current : 0})` }} aria-hidden="true" />
                        <span className="auth-captcha__hint">{captchaSolved ? t('form.verificationPassed') : t('form.dragToVerify')}</span>
                        <button
                          type="button"
                          ref={captchaHandleRef}
                          className="auth-captcha__handle"
                          style={{ transform: `translate3d(${captchaOffset}px, 0, 0)` }}
                          onPointerDown={handleCaptchaPointerDown}
                          onPointerMove={handleCaptchaPointerMove}
                          onPointerUp={handleCaptchaPointerEnd}
                          onPointerCancel={handleCaptchaPointerEnd}
                          aria-label={t('form.dragToVerify')}
                          disabled={captchaSolved || submitting || status === 'loading'}
                        >
                          <span aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
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
    <AdminSessionProvider>
      <LoginScreen />
    </AdminSessionProvider>
  );
}

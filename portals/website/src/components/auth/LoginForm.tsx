'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  AuthField,
  AuthFlowForm,
  AuthLoginLayout,
  AuthLoginOptions,
  AuthPrimaryButton,
  AuthSocialButtons,
  AuthTabs,
  AuthTurnstile,
  UnifiedAuthPage,
  useAuthVerificationCountdown,
  type AuthLoginScreen,
  type AuthLoginTab,
} from '@vxture/design-system';
import { AuthFooter, AuthHeader } from '@/components/auth/AuthChrome';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { forgotPassword, loginWithPhone, sendPhoneCode } from '@/api/auth.api';

interface LoginFormProps {
  className?: string;
  initialScreen?: AuthLoginScreen;
}

const BG_SRC = '/images/login-bg-light.jpg';
const REMEMBER_LOGIN_KEY = 'vxture-login-remember';
const REMEMBER_IDENTIFIER_KEY = 'vxture-login-identifier';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_CF_TURNSTILE_TENANT_SITE_KEY ?? '';
const TURNSTILE_ACTION = 'tenant_auth';
type TurnstileStatus = 'pending' | 'ready' | 'failed';

export function LoginForm({ className = '', initialScreen = 'login' }: LoginFormProps) {
  const [screen, setScreen] = useState<AuthLoginScreen>(initialScreen);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberLogin, setRememberLogin] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [turnstileStatus, setTurnstileStatus] = useState<TurnstileStatus>(TURNSTILE_SITE_KEY ? 'pending' : 'ready');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);

  // 手机验证码登录状态
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneErrors, setPhoneErrors] = useState<Record<string, string>>({});
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { login, isLoading: authLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const loading = localLoading || authLoading;
  const nextPath = searchParams.get('next') ?? '/';

  useEffect(() => {
    const shouldRemember = window.localStorage.getItem(REMEMBER_LOGIN_KEY) === '1';
    const savedIdentifier = window.localStorage.getItem(REMEMBER_IDENTIFIER_KEY);

    setRememberLogin(shouldRemember);
    if (shouldRemember && savedIdentifier) {
      setIdentifier(savedIdentifier);
      setPhone(savedIdentifier);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(nextPath as '/');
    }
  }, [isAuthenticated, nextPath, router, user]);

  const openScreen = (nextScreen: AuthLoginScreen) => {
    setScreen(nextScreen);
    setErrors({});
    setPhoneErrors({});
    setResetSent(false);
    setTurnstileToken('');
    setTurnstileStatus(TURNSTILE_SITE_KEY ? 'pending' : 'ready');
    setTurnstileResetSignal((value) => value + 1);
  };

  const handleAcceptedTermsChange = (checked: boolean) => {
    setAcceptedTerms(checked);
    setErrors((current) => {
      const { form, ...rest } = current;
      return form ? rest : current;
    });
    setPhoneErrors((current) => {
      const { form, ...rest } = current;
      return form ? rest : current;
    });
  };

  const resetTurnstile = () => {
    if (!TURNSTILE_SITE_KEY) return;
    setTurnstileToken('');
    setTurnstileStatus('pending');
    setTurnstileResetSignal((value) => value + 1);
  };

  const requireTurnstileToken = () => {
    if (!TURNSTILE_SITE_KEY) return undefined;
    if (turnstileToken) return turnstileToken;
    return null;
  };

  const turnstileNode = (
    <AuthTurnstile
      siteKey={TURNSTILE_SITE_KEY}
      action={TURNSTILE_ACTION}
      resetSignal={turnstileResetSignal}
      onToken={(token) => {
        setTurnstileToken(token);
        setTurnstileStatus('ready');
      }}
      onExpire={() => {
        setTurnstileToken('');
        setTurnstileStatus(TURNSTILE_SITE_KEY ? 'pending' : 'ready');
      }}
      onError={() => {
        setTurnstileToken('');
        setTurnstileStatus('failed');
        setErrors((current) => ({ ...current, form: '人机验证加载失败，请刷新后重试。' }));
        setPhoneErrors((current) => ({ ...current, form: '人机验证加载失败，请刷新后重试。' }));
      }}
    />
  );
  const verificationPending = turnstileStatus === 'pending';
  const verificationFailed = turnstileStatus === 'failed';
  const verificationCountdown = useAuthVerificationCountdown(verificationPending);

  // 发送手机验证码（含倒计时）
  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setPhoneErrors({ phone: '请输入有效的中国大陆手机号' });
      return;
    }
    const token = requireTurnstileToken();
    if (token === null) {
      setPhoneErrors({ form: '请先完成人机验证。' });
      return;
    }
    setPhoneErrors({});
    setCodeSending(true);
    try {
      await sendPhoneCode(phone.trim(), token);
      addNotification('验证码已发送，请查收短信', 'success');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      addNotification(error instanceof Error ? error.message : '验证码发送失败', 'error');
    } finally {
      setCodeSending(false);
      resetTurnstile();
    }
  };

  // 手机验证码登录
  const handlePhoneLogin = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) nextErrors.phone = '请输入有效的中国大陆手机号';
    if (phoneCode.trim().length !== 6) nextErrors.code = '请输入 6 位验证码';
    if (!acceptedTerms) nextErrors.form = '请先阅读并同意用户协议和隐私政策。';
    if (Object.keys(nextErrors).length > 0) {
      setPhoneErrors(nextErrors);
      return;
    }
    const token = requireTurnstileToken();
    if (token === null) {
      setPhoneErrors({ form: '请先完成人机验证。' });
      return;
    }
    setPhoneErrors({});
    setLocalLoading(true);
    try {
      const trimmedPhone = phone.trim();
      await loginWithPhone(trimmedPhone, phoneCode.trim(), token);
      if (rememberLogin) {
        window.localStorage.setItem(REMEMBER_LOGIN_KEY, '1');
        window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, trimmedPhone);
      } else {
        window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
        window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
      }
      addNotification('登录成功', 'success');
      router.push(nextPath as '/');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : '登录失败，请稍后重试', 'error');
    } finally {
      setLocalLoading(false);
      resetTurnstile();
    }
  };

  const validateLogin = () => {
    const nextErrors: Record<string, string> = {};
    if (!identifier.trim()) {
      nextErrors.identifier = '请输入邮箱、用户名或手机号';
    }

    if (!password) {
      nextErrors.password = '请输入密码';
    }
    if (!acceptedTerms) {
      nextErrors.form = '请先阅读并同意用户协议和隐私政策。';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateLogin()) return;

    const token = requireTurnstileToken();
    if (token === null) {
      setErrors((current) => ({ ...current, form: '请先完成人机验证。' }));
      return;
    }
    setLocalLoading(true);
    try {
      const trimmedIdentifier = identifier.trim();
      await login(trimmedIdentifier, password, token);
      if (rememberLogin) {
        window.localStorage.setItem(REMEMBER_LOGIN_KEY, '1');
        window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, trimmedIdentifier);
      } else {
        window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
        window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
      }

      // 通知浏览器保存凭据，下次可自动填充（Chrome/Edge 支持，Firefox/Safari 静默忽略）
      const PasswordCredentialCtor = (window as Window & {
        PasswordCredential?: new (data: { id: string; password: string }) => Credential;
      }).PasswordCredential;
      if (PasswordCredentialCtor) {
        try {
          await navigator.credentials.store(new PasswordCredentialCtor({ id: trimmedIdentifier, password }));
        } catch {
          // 隐私模式或用户拒绝时静默忽略
        }
      }

      addNotification('登录成功', 'success');
      router.push(nextPath as '/');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : '登录失败，请稍后重试', 'error');
    } finally {
      setLocalLoading(false);
      resetTurnstile();
    }
  };

  const handleForgetMe = async () => {
    setIdentifier('');
    setPassword('');
    setRememberLogin(false);
    window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
    window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
    // 告知浏览器不再自动填充此站点凭据
    if (navigator.credentials?.preventSilentAccess) {
      try {
        await navigator.credentials.preventSilentAccess();
      } catch {
        // 静默忽略
      }
    }
  };

  const handleForgotSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !identifier.includes('@')) {
      setErrors({ identifier: '请输入有效邮箱' });
      return;
    }

    setErrors({});
    setLocalLoading(true);
    try {
      await forgotPassword({ email: identifier.trim() });
    } catch {
      // 出错时与正常情况相同，防止邮箱枚举
    } finally {
      setLocalLoading(false);
      setResetSent(true);
    }
  };

  return (
    <UnifiedAuthPage
      className={className}
      pageBackgroundImage={BG_SRC}
      header={<AuthHeader />}
      footer={<AuthFooter />}
    >
      {screen === 'forgot' ? (
        <ForgotPanel
          email={identifier}
          error={errors.identifier}
          loading={loading}
          resetSent={resetSent}
          onBack={() => openScreen('login')}
          onChange={setIdentifier}
          onSubmit={handleForgotSubmit}
        />
      ) : (
        <AuthLoginLayout title='欢迎回来'>
          {screen === 'phone' ? (
            <PhoneLoginPanel
              tabs={<AuthTabs active={screen as AuthLoginTab} onChange={openScreen} />}
              phone={phone}
              code={phoneCode}
              errors={phoneErrors}
              loading={localLoading}
              countdown={countdown}
              codeSending={codeSending}
              rememberLogin={rememberLogin}
              acceptedTerms={acceptedTerms}
              onRememberLoginChange={setRememberLogin}
              onAcceptedTermsChange={handleAcceptedTermsChange}
              onForgot={() => openScreen('forgot')}
              onForgetMe={handleForgetMe}
              onChangePhone={setPhone}
              onChangeCode={setPhoneCode}
              onSendCode={handleSendCode}
              onSubmit={handlePhoneLogin}
              onRegister={() => router.push('/signup')}
              turnstile={turnstileNode}
              verificationPending={verificationPending}
              verificationFailed={verificationFailed}
              verificationCountdown={verificationCountdown}
            />
          ) : (
            <LoginPanel
              tabs={<AuthTabs active={screen as AuthLoginTab} onChange={openScreen} />}
              identifier={identifier}
              password={password}
              rememberLogin={rememberLogin}
              acceptedTerms={acceptedTerms}
              errors={errors}
              loading={loading}
              onChangeIdentifier={setIdentifier}
              onChangePassword={setPassword}
              onRememberLoginChange={setRememberLogin}
              onAcceptedTermsChange={handleAcceptedTermsChange}
              onForgot={() => openScreen('forgot')}
              onForgetMe={handleForgetMe}
              onRegister={() => router.push('/signup')}
              onSubmit={handleSubmit}
              turnstile={turnstileNode}
              verificationPending={verificationPending}
              verificationFailed={verificationFailed}
              verificationCountdown={verificationCountdown}
            />
          )}
        </AuthLoginLayout>
      )}
    </UnifiedAuthPage>
  );
}

function LoginPanel({
  tabs,
  identifier,
  password,
  rememberLogin,
  acceptedTerms,
  errors,
  loading,
  onChangeIdentifier,
  onChangePassword,
  onRememberLoginChange,
  onAcceptedTermsChange,
  onForgot,
  onForgetMe,
  onRegister,
  onSubmit,
  turnstile,
  verificationPending,
  verificationFailed,
  verificationCountdown,
}: {
  tabs: ReactNode;
  identifier: string;
  password: string;
  rememberLogin: boolean;
  acceptedTerms: boolean;
  errors: Record<string, string>;
  loading: boolean;
  onChangeIdentifier: (value: string) => void;
  onChangePassword: (value: string) => void;
  onRememberLoginChange: (value: boolean) => void;
  onAcceptedTermsChange: (value: boolean) => void;
  onForgot: () => void;
  onForgetMe: () => void;
  onRegister: () => void;
  onSubmit: (event: FormEvent) => void;
  turnstile?: ReactNode;
  verificationPending: boolean;
  verificationFailed: boolean;
  verificationCountdown: number;
}) {
  const handleRememberLoginChange = (checked: boolean) => {
    onRememberLoginChange(checked);
    if (!checked) {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
      window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
    }
  };

  return (
    <AuthFlowForm
      onSubmit={onSubmit}
      input={
        <>
          {tabs}
          <div className='vx-auth-field-stack'>
            <AuthField
              label='邮箱'
              name='username'
              type='text'
              placeholder='email / username / phone'
              icon='user'
              value={identifier}
              error={errors.identifier}
              autoComplete='username'
              autoFocus
              disabled={loading}
              onChange={onChangeIdentifier}
            />
            <AuthField
              label='密码'
              name='password'
              type='password'
              placeholder='请输入密码'
              icon='lock'
              value={password}
              error={errors.password}
              autoComplete='current-password'
              disabled={loading}
              onChange={onChangePassword}
            />

            <AuthLoginOptions
              disabled={loading}
              rememberChecked={rememberLogin}
              agreementChecked={acceptedTerms}
              onRememberChange={handleRememberLoginChange}
              onAgreementChange={onAcceptedTermsChange}
              onForgot={onForgot}
              onForgetMe={onForgetMe}
            />
          </div>
        </>
      }
      primary={
        <>
          {turnstile}
          {errors.form ? <p className='vx-auth-error vx-auth-form-error'>{errors.form}</p> : null}
          <AuthPrimaryButton
            loading={loading}
            disabled={verificationPending || verificationFailed}
            label='登录'
            loadingLabel='登录中...'
            disabledLabel={verificationFailed ? '验证不可用' : `安全验证中... ${verificationCountdown}s`}
          />
        </>
      }
      social={<SocialLoginButtons />}
      footer={
        <p className='vx-auth-switch'>
          还没有账号？
          <button type='button' onClick={onRegister}>
            注册账号
          </button>
        </p>
      }
    />
  );
}

function PhoneLoginPanel({
  tabs,
  phone,
  code,
  errors,
  loading,
  countdown,
  codeSending,
  rememberLogin,
  acceptedTerms,
  onRememberLoginChange,
  onAcceptedTermsChange,
  onForgot,
  onForgetMe,
  onChangePhone,
  onChangeCode,
  onSendCode,
  onSubmit,
  onRegister,
  turnstile,
  verificationPending,
  verificationFailed,
  verificationCountdown,
}: {
  tabs: ReactNode;
  phone: string;
  code: string;
  errors: Record<string, string>;
  loading: boolean;
  countdown: number;
  codeSending: boolean;
  rememberLogin: boolean;
  acceptedTerms: boolean;
  onRememberLoginChange: (value: boolean) => void;
  onAcceptedTermsChange: (value: boolean) => void;
  onForgot: () => void;
  onForgetMe: () => void;
  onChangePhone: (v: string) => void;
  onChangeCode: (v: string) => void;
  onSendCode: () => void;
  onSubmit: (event: FormEvent) => void;
  onRegister: () => void;
  turnstile?: ReactNode;
  verificationPending: boolean;
  verificationFailed: boolean;
  verificationCountdown: number;
}) {
  const handleRememberLoginChange = (checked: boolean) => {
    onRememberLoginChange(checked);
    if (!checked) {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
      window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
    }
  };

  return (
    <AuthFlowForm
      onSubmit={onSubmit}
      input={
        <>
          {tabs}
          <div className='vx-auth-field-stack'>
            <div className='vx-auth-phone-row'>
              <AuthField
                label='手机号'
                name='phone'
                type='tel'
                placeholder='请输入手机号'
                icon='phone'
                value={phone}
                error={errors.phone}
                autoComplete='tel'
                autoFocus
                disabled={loading}
                onChange={onChangePhone}
              />
            </div>

            <div className='vx-auth-code-field-wrap'>
              <div className='vx-auth-code-row'>
                <AuthField
                  label='验证码'
                  name='code'
                  type='text'
                  placeholder='请输入 6 位验证码'
                  icon='shield'
                  value={code}
                  error={errors.code}
                  autoComplete='one-time-code'
                  disabled={loading}
                  onChange={onChangeCode}
                />
                <button
                  type='button'
                  className='vx-auth-send-code'
                  onClick={onSendCode}
                  disabled={loading || codeSending || countdown > 0 || verificationPending || verificationFailed}
                >
                  {countdown > 0
                    ? `${countdown}s 后重试`
                    : codeSending
                      ? '发送中...'
                      : verificationPending
                        ? '验证中...'
                        : '获取验证码'}
                </button>
              </div>
            </div>
            <AuthLoginOptions
              disabled={loading}
              rememberChecked={rememberLogin}
              agreementChecked={acceptedTerms}
              onRememberChange={handleRememberLoginChange}
              onAgreementChange={onAcceptedTermsChange}
              onForgot={onForgot}
              onForgetMe={onForgetMe}
            />
          </div>
        </>
      }
      primary={
        <>
          {turnstile}
          {errors.form ? <p className='vx-auth-error vx-auth-form-error'>{errors.form}</p> : null}
          <AuthPrimaryButton
            loading={loading}
            disabled={verificationPending || verificationFailed}
            label='登录'
            loadingLabel='登录中...'
            disabledLabel={verificationFailed ? '验证不可用' : `安全验证中... ${verificationCountdown}s`}
          />
        </>
      }
      social={<SocialLoginButtons />}
      footer={
        <p className='vx-auth-switch'>
          还没有账号？
          <button type='button' onClick={onRegister}>
            注册账号
          </button>
        </p>
      }
    />
  );
}

function ForgotPanel({
  email,
  error,
  loading,
  resetSent,
  onBack,
  onChange,
  onSubmit,
}: {
  email: string;
  error?: string;
  loading: boolean;
  resetSent: boolean;
  onBack: () => void;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  if (resetSent) {
    return (
      <>
        <BackButton onClick={onBack}>返回登录</BackButton>
        <div className='vx-auth-reset-done'>
          <div className='vx-auth-check'>✓</div>
          <h1>重置邮件已发送</h1>
          <p>
            重置链接已发送至 <strong>{email || '您的邮箱'}</strong>，请在 15 分钟内查收并完成重置。
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--vx-color-text-muted)', marginTop: '0.5rem' }}>
            未收到邮件？请检查垃圾邮件文件夹。
          </p>
          <button type='button' onClick={onBack} style={{ marginTop: '1rem' }}>
            返回登录
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <BackButton onClick={onBack}>返回登录</BackButton>
      <div className='vx-auth-panel-heading'>
        <h1>重置密码</h1>
        <p>输入注册邮箱，获取重置链接</p>
      </div>

      <form onSubmit={onSubmit} autoComplete='on'>
        <AuthField
          label='邮箱'
          name='email'
          type='email'
          placeholder='you@company.com'
          icon='mail'
          value={email}
          error={error}
          autoComplete='email'
          autoFocus
          disabled={loading}
          onChange={onChange}
        />
        <AuthPrimaryButton loading={loading} label='获取重置链接' loadingLabel='生成中...' />
      </form>
    </>
  );
}

function BackButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type='button' className='vx-auth-back' onClick={onClick}>
      <span>←</span>
      {children}
    </button>
  );
}

function buildOAuthStartUrl(provider: 'dingtalk' | 'feishu'): string {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
  const authApiPrefix = (process.env.NEXT_PUBLIC_AUTH_API_PREFIX ?? '/auth-api').replace(/\/+$/, '');
  const returnTo = typeof window !== 'undefined' ? window.location.origin + '/' : '/';
  return `${apiUrl}${authApiPrefix}/auth/oauth/${provider}/start?returnTo=${encodeURIComponent(returnTo)}&source=website`;
}

const OFFICIAL_SOCIAL_ICON_SRC = {
  feishu: '/brand/feishu-logo-icon.svg',
  dingtalk: '/brand/dingtalk-logo-icon.svg',
  wechat: '/brand/wechat_logo_icon.svg',
} as const;

function SocialLoginButtons() {
  const handleDingTalk = () => {
    window.location.href = buildOAuthStartUrl('dingtalk');
  };

  const handleFeishu = () => {
    window.location.href = buildOAuthStartUrl('feishu');
  };

  return (
    <AuthSocialButtons
      providers={[
        { provider: 'feishu', label: '飞书', iconSrc: OFFICIAL_SOCIAL_ICON_SRC.feishu, onClick: handleFeishu },
        { provider: 'dingtalk', label: '钉钉', iconSrc: OFFICIAL_SOCIAL_ICON_SRC.dingtalk, onClick: handleDingTalk },
        { provider: 'wechat', label: '微信', iconSrc: OFFICIAL_SOCIAL_ICON_SRC.wechat, disabled: true },
      ]}
    />
  );
}

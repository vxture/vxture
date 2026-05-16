'use client';

/**
 * @package @vxture/console
 * @layer Presentation
 * @category Auth
 * @author AI-Generated
 * @date 2026-05-04
 */

import { useEffect, useState, type FormEvent } from 'react';
import {
  AuthChromeFooter,
  AuthChromeHeader,
  AuthForgotPasswordPanel,
  AuthLoginTemplate,
  AuthPasswordLoginPanel,
  AuthPhoneLoginPanel,
  AuthSocialButtons,
  AuthTabs,
  AuthTurnstile,
  Button,
  useAuthVerificationCountdown,
  useTheme,
  type AuthLoginScreen,
  type AuthLoginTab,
} from '@vxture/design-system';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { ConsoleBffError, forgotPassword, loginWithPhone, sendPhoneCode } from '@/api/console-bff';
import { setGlobalLocalePreference, setGlobalThemePreference } from '@vxture/platform-browser';
import type { Locale, Theme } from '@vxture/shared';

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

  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneErrors, setPhoneErrors] = useState<Record<string, string>>({});
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { session, signIn, status } = useConsoleSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loading = localLoading || status === 'loading';
  const nextPath = searchParams.get('next') || '/';

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
    if (status === 'ready' && session.isAuthenticated && session.user && session.tenant) {
      router.replace(nextPath);
    }
  }, [nextPath, router, session.isAuthenticated, session.tenant, session.user, status]);

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
      setCountdown(60);
      const timer = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      if (error instanceof ConsoleBffError) {
        setPhoneErrors({ phone: error.message });
      } else {
        setPhoneErrors({ phone: '验证码发送失败，请稍后重试' });
      }
    } finally {
      setCodeSending(false);
      resetTurnstile();
    }
  };

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
      await loginWithPhone({ phone: trimmedPhone, code: phoneCode.trim(), turnstileToken: token });
      if (rememberLogin) {
        window.localStorage.setItem(REMEMBER_LOGIN_KEY, '1');
        window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, trimmedPhone);
      } else {
        window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
        window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
      }
      router.replace(nextPath);
    } catch (error) {
      if (error instanceof ConsoleBffError && error.status === 400) {
        setPhoneErrors({ code: error.message || '验证码错误或已过期' });
      } else if (error instanceof ConsoleBffError && error.status === 401) {
        setPhoneErrors({ phone: '该手机号尚未注册，请先注册账号' });
      } else if (error instanceof ConsoleBffError) {
        setPhoneErrors({ form: error.message });
      } else {
        setPhoneErrors({ form: '登录失败，请稍后重试' });
      }
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
      await signIn(trimmedIdentifier, password, token);

      if (rememberLogin) {
        window.localStorage.setItem(REMEMBER_LOGIN_KEY, '1');
        window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, trimmedIdentifier);
      } else {
        window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
        window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
      }

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

      router.replace(nextPath);
    } catch (error) {
      if (error instanceof ConsoleBffError && error.status === 401) {
        setErrors({ form: '用户名或密码错误，请重试。' });
      } else if (error instanceof ConsoleBffError && error.status === 503) {
        setErrors({ form: '服务暂时不可用，请稍后再试。' });
      } else if (error instanceof ConsoleBffError && error.message) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: '登录失败，请稍后重试。' });
      }
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
    if (navigator.credentials?.preventSilentAccess) {
      try {
        await navigator.credentials.preventSilentAccess();
      } catch {
        // 静默忽略
      }
    }
  };

  const handleRememberLoginChange = (checked: boolean) => {
    setRememberLogin(checked);
    if (!checked) {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
      window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
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
    <AuthLoginTemplate
      className={className}
      pageBackgroundImage={BG_SRC}
      header={<AuthHeader />}
      footer={<AuthFooter />}
      title='欢迎回来'
      useLoginLayout={screen !== 'forgot'}
    >
      {screen === 'forgot' ? (
        <AuthForgotPasswordPanel
          email={identifier}
          error={errors.identifier}
          loading={loading}
          resetSent={resetSent}
          onBack={() => openScreen('login')}
          onChangeEmail={setIdentifier}
          onSubmit={handleForgotSubmit}
        />
      ) : (
        screen === 'phone' ? (
          <AuthPhoneLoginPanel
            tabs={<AuthTabs active={screen as AuthLoginTab} onChange={openScreen} />}
            phone={phone}
            code={phoneCode}
            errors={phoneErrors}
            loading={localLoading}
            codeCountdown={countdown}
            codeSending={codeSending}
            rememberChecked={rememberLogin}
            agreementChecked={acceptedTerms}
            onRememberChange={handleRememberLoginChange}
            onAgreementChange={handleAcceptedTermsChange}
            onForgot={() => openScreen('forgot')}
            onForgetMe={handleForgetMe}
            onChangePhone={setPhone}
            onChangeCode={setPhoneCode}
            onSendCode={handleSendCode}
            onSubmit={handlePhoneLogin}
            turnstile={turnstileNode}
            sendCodeDisabled={verificationPending || verificationFailed}
            primaryDisabled={verificationPending || verificationFailed}
            primaryDisabledLabel={verificationFailed ? '验证不可用' : `安全验证中... ${verificationCountdown}s`}
            social={<SocialLoginButtons />}
            footer={<RegisterLink onRegister={() => router.push('#register')} />}
          />
        ) : (
          <AuthPasswordLoginPanel
            tabs={<AuthTabs active={screen as AuthLoginTab} onChange={openScreen} />}
            identifier={identifier}
            password={password}
            rememberChecked={rememberLogin}
            agreementChecked={acceptedTerms}
            errors={errors}
            loading={loading}
            onChangeIdentifier={setIdentifier}
            onChangePassword={setPassword}
            onRememberChange={handleRememberLoginChange}
            onAgreementChange={handleAcceptedTermsChange}
            onForgot={() => openScreen('forgot')}
            onForgetMe={handleForgetMe}
            onSubmit={handleSubmit}
            turnstile={turnstileNode}
            primaryDisabled={verificationPending || verificationFailed}
            primaryDisabledLabel={verificationFailed ? '验证不可用' : `安全验证中... ${verificationCountdown}s`}
            social={<SocialLoginButtons />}
            footer={<RegisterLink onRegister={() => router.push('#register')} />}
          />
        )
      )}
    </AuthLoginTemplate>
  );
}

function RegisterLink({ onRegister }: { onRegister: () => void }) {
  return (
    <p className='vx-auth-switch'>
      还没有账号？
      <Button variant='link' onClick={onRegister}>
        注册账号
      </Button>
    </p>
  );
}

function buildOAuthStartUrl(provider: 'dingtalk' | 'feishu'): string {
  const authBffUrl = (process.env.NEXT_PUBLIC_AUTH_BFF_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3090').replace(/\/+$/, '');
  const usesDirectAuthBff = Boolean(process.env.NEXT_PUBLIC_AUTH_BFF_URL?.trim()) || !process.env.NEXT_PUBLIC_API_URL?.trim();
  const authApiPrefix = (process.env.NEXT_PUBLIC_AUTH_API_PREFIX ?? (usesDirectAuthBff ? '' : '/auth-api')).replace(/\/+$/, '');
  const returnTo = typeof window !== 'undefined' ? window.location.origin + '/' : '/';
  return `${authBffUrl}${authApiPrefix}/auth/oauth/${provider}/start?returnTo=${encodeURIComponent(returnTo)}&source=console`;
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

function AuthHeader() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isZh = locale === 'zh-CN';

  return (
    <AuthChromeHeader
      brandHref="/"
      brandLogoSrc="/brand/vxture-logo-white.png"
      brandLogoAlt="vxture.ai"
      brandLabel="vxture.ai"
      currentLocale={locale}
      currentTheme={theme}
      localeButtonLabel={isZh ? '选择语言' : 'Language'}
      localePanelLabel={isZh ? '语言选择' : 'Language'}
      lightThemeLabel={isZh ? '浅色模式' : 'Light mode'}
      darkThemeLabel={isZh ? '深色模式' : 'Dark mode'}
      onLocaleChange={(nextLocale) => {
        setGlobalLocalePreference(nextLocale);
        router.replace(pathname, { locale: nextLocale });
      }}
      onThemeChange={(nextTheme) => {
        setTheme(nextTheme);
        setGlobalThemePreference(nextTheme as Theme);
      }}
    />
  );
}

function AuthFooter() {
  const t = useTranslations('login');

  return (
    <AuthChromeFooter
      copyright={t('footer.copyright')}
      links={[
        { href: '/legal/terms', label: t('footer.terms') },
        { href: '/legal/privacy', label: t('footer.privacy') },
        { href: '/legal/cookies', label: t('footer.cookies') },
      ]}
    />
  );
}

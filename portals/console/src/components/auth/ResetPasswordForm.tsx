'use client';

/**
 * ResetPasswordForm.tsx - 控制台密码重置表单
 * @package @vxture/console
 * @layer Presentation
 * @category Auth
 * @description
 *   对接 console-bff 的密码重置接口，承接忘记密码邮件中的 reset token。
 *
 * @author AI-Generated
 * @date 2026-05-16
 */

import { useState, type FormEvent } from 'react';
import {
  AuthChromeFooter,
  AuthChromeHeader,
  AuthLoginTemplate,
  Button,
  Input,
  useTheme,
} from '@vxture/design-system';
import { resetPassword } from '@/api/console-bff';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { setGlobalLocalePreference, setGlobalThemePreference } from '@vxture/platform-browser';
import type { Locale, Theme } from '@vxture/shared';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

// ============================================================================
// Types
// ============================================================================

type ResetStep = 'form' | 'done' | 'invalid';

interface FormStepProps {
  readonly newPassword: string;
  readonly confirmPassword: string;
  readonly error: string;
  readonly loading: boolean;
  readonly onChangeNew: (value: string) => void;
  readonly onChangeConfirm: (value: string) => void;
  readonly onSubmit: (event: FormEvent) => void;
}

// ============================================================================
// Constants
// ============================================================================

const BG_SRC = '/images/login-bg-light.jpg';

// ============================================================================
// Components
// ============================================================================

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const router = useRouter();

  const [step, setStep] = useState<ResetStep>(token ? 'form' : 'invalid');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('密码至少 8 位字符');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setStep('done');
    } catch {
      setStep('invalid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLoginTemplate
      className="vx-auth-page--console"
      pageBackgroundImage={BG_SRC}
      header={<AuthHeader />}
      footer={<AuthFooter />}
      title="设置新密码"
      useLoginLayout={false}
      ariaLabel="console reset password"
    >
      <div className="vx-auth-form-panel">
        {step === 'form' ? (
          <FormStep
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            error={error}
            loading={loading}
            onChangeNew={setNewPassword}
            onChangeConfirm={setConfirmPassword}
            onSubmit={handleSubmit}
          />
        ) : null}
        {step === 'done' ? <DoneStep onSignIn={() => router.push('/signin')} /> : null}
        {step === 'invalid' ? <InvalidStep onRetry={() => router.push('/signin')} /> : null}
      </div>
    </AuthLoginTemplate>
  );
}

function FormStep({
  newPassword,
  confirmPassword,
  error,
  loading,
  onChangeNew,
  onChangeConfirm,
  onSubmit,
}: FormStepProps) {
  return (
    <>
      <div className="vx-auth-panel-heading">
        <h1>设置新密码</h1>
        <p>请输入您的新密码，至少 8 位字符。</p>
      </div>

      <form onSubmit={onSubmit} autoComplete="off">
        <div className="vx-auth-field">
          <label>新密码</label>
          <Input
            type="password"
            value={newPassword}
            placeholder="至少 8 位字符"
            autoComplete="new-password"
            autoFocus
            disabled={loading}
            onChange={(event) => onChangeNew(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        <div className="vx-auth-field">
          <label>确认密码</label>
          <Input
            type="password"
            value={confirmPassword}
            placeholder="再次输入新密码"
            autoComplete="new-password"
            disabled={loading}
            onChange={(event) => onChangeConfirm(event.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>

        {error ? <p className="vx-auth-error">{error}</p> : null}

        <Button type="submit" className="vx-auth-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="vx-auth-spinner" />
              重置中...
            </>
          ) : (
            '确认重置密码'
          )}
        </Button>
      </form>
    </>
  );
}

function DoneStep({ onSignIn }: { readonly onSignIn: () => void }) {
  return (
    <div className="vx-auth-reset-done">
      <div className="vx-auth-check">✓</div>
      <h1>密码已重置</h1>
      <p>您的密码已成功更新，请使用新密码登录。</p>
      <Button className="vx-auth-primary" onClick={onSignIn}>
        去登录
      </Button>
    </div>
  );
}

function InvalidStep({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="vx-auth-reset-done">
      <div className="vx-auth-check vx-auth-check--error">✕</div>
      <h1>链接已失效</h1>
      <p>该重置链接已过期或已使用。请重新申请密码重置。</p>
      <Button className="vx-auth-primary" onClick={onRetry}>
        重新申请
      </Button>
    </div>
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

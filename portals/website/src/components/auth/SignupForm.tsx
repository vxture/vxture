/**
 * SignupForm.tsx - 用户注册表单
 * @package @vxture/website
 * @layer Presentation
 * @category Auth
 *
 * 流程：填写基本信息 → Turnstile 人机验证 → 调用 /api/auth/signup → 跳转 /verify
 *
 * @author AI-Generated
 * @date 2026-05-02
 */

'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { AuthFooter, AuthHeader } from '@/components/auth/AuthChrome';
import { AuthTurnstile, useAuthVerificationCountdown } from '@vxture/design-system';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/stores/notification.store';
import { Link, useRouter } from '@/lib/i18n/navigation';

// ─── 类型 ──────────────────────────────────────────────────────────────────────

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

// ─── 常量 ──────────────────────────────────────────────────────────────────────

const BG_SRC = '/images/login-bg-light.jpg';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_CF_TURNSTILE_TENANT_SITE_KEY ?? '';
const TURNSTILE_ACTION = 'tenant_auth';
type TurnstileStatus = 'pending' | 'ready' | 'failed';

// ─── 主组件 ────────────────────────────────────────────────────────────────────

export interface SignupFormProps {
  className?: string;
}

export function SignupForm({ className = '' }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [turnstileStatus, setTurnstileStatus] = useState<TurnstileStatus>(TURNSTILE_SITE_KEY ? 'pending' : 'ready');
  const [errors, setErrors] = useState<SignupErrors>({});

  const { signup, isLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const router = useRouter();
  const verificationPending = turnstileStatus === 'pending';
  const verificationCountdown = useAuthVerificationCountdown(verificationPending);

  // ─── 校验 ────────────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const nextErrors: SignupErrors = {};

    if (!name.trim()) {
      nextErrors.name = '请输入姓名';
    }

    if (!email.trim() || !email.includes('@')) {
      nextErrors.email = '请输入有效邮箱';
    }

    if (password.length < 8) {
      nextErrors.password = '密码至少 8 位字符';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ─── 事件处理 ─────────────────────────────────────────────────────────────────

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const token = requireTurnstileToken();
    if (token === null) {
      setErrors({ form: '请先完成人机验证。' });
      return;
    }

    try {
      await signup(email.trim(), name.trim(), password, token);

      // 通知浏览器保存凭据，支持后续自动填充
      if ('PasswordCredential' in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cred = new (window as any).PasswordCredential({ id: email.trim(), password });
          await navigator.credentials.store(cred);
        } catch {
          // 隐私模式或浏览器拒绝时静默忽略
        }
      }

      addNotification('注册成功，欢迎加入 vxture！', 'success');
      router.push('/verify');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : '注册失败，请稍后重试', 'error');
    } finally {
      resetTurnstile();
    }
  };

  const handleSocialLogin = (provider: string) => {
    addNotification(`${provider} 一键注册正在接入`, 'info');
  };

  // ─── 渲染 ─────────────────────────────────────────────────────────────────────

  return (
    <section
      className={`vx-auth-page vx-signup-page ${className}`}
      style={{ '--vx-auth-bg': `url(${BG_SRC})` } as CSSProperties}
    >
      <AuthHeader />

      <main className='vx-signup-main'>
        <div className='vx-signup-card' aria-label='vxture signup'>
          <div className='vx-auth-panel-heading vx-signup-heading'>
            <h1>创建账号</h1>
            <p>开始使用 vxture 智能体平台</p>
          </div>

          <form onSubmit={handleSubmit} className='vx-signup-form' autoComplete='on' noValidate>
            <SignupField
              label='姓名'
              name='name'
              type='text'
              placeholder='请输入您的姓名'
              value={name}
              error={errors.name}
              autoComplete='name'
              autoFocus
              disabled={isLoading}
              onChange={setName}
            />
            <SignupField
              label='邮箱'
              name='username'
              type='email'
              placeholder='you@company.com'
              value={email}
              error={errors.email}
              autoComplete='username'
              disabled={isLoading}
              onChange={setEmail}
            />
            <SignupField
              label='密码'
              name='new-password'
              type='password'
              placeholder='至少 8 位字符'
              value={password}
              error={errors.password}
              autoComplete='new-password'
              disabled={isLoading}
              onChange={setPassword}
            />
            <SignupField
              label='确认密码'
              name='confirm-password'
              type='password'
              placeholder='再次输入密码'
              value={confirmPassword}
              error={errors.confirmPassword}
              autoComplete='new-password'
              disabled={isLoading}
              onChange={setConfirmPassword}
            />
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
              }}
            />
            {errors.form ? <p className='vx-auth-error vx-auth-form-error'>{errors.form}</p> : null}

            <button
              type='submit'
              className='vx-auth-primary vx-signup-primary'
              disabled={isLoading || verificationPending || turnstileStatus === 'failed'}
            >
              {isLoading ? (
                <>
                  <span className='vx-auth-spinner' />
                  注册中...
                </>
              ) : verificationPending ? (
                `安全验证中... ${verificationCountdown}s`
              ) : turnstileStatus === 'failed' ? (
                '验证不可用'
              ) : (
                '注册账号'
              )}
            </button>
          </form>

          <SocialRegisterButtons onSocialLogin={handleSocialLogin} />

          <p className='vx-signup-terms'>
            注册即表示您同意 <Link href='/legal/terms'>服务条款</Link> 与 <Link href='/legal/privacy'>隐私政策</Link>
          </p>
          <p className='vx-signup-login'>
            已有账号？
            <Link href='/signin'>返回登录</Link>
          </p>
        </div>
      </main>

      <AuthFooter />
    </section>
  );
}

// ─── 子组件 ────────────────────────────────────────────────────────────────────

function SignupField({
  label,
  name,
  type,
  placeholder,
  value,
  error,
  autoComplete,
  autoFocus,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className='vx-signup-field'>
      <label>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error ? <p>{error}</p> : null}
    </div>
  );
}

function SocialRegisterButtons({ onSocialLogin }: { onSocialLogin: (provider: string) => void }) {
  return (
    <>
      <div className='vx-auth-or vx-signup-or'>
        <span />
        <em>其他方式注册</em>
        <span />
      </div>
      <div className='vx-auth-socials vx-signup-socials'>
        <SocialButton className='wechat' icon={<WechatIcon />} label='微信' onClick={() => onSocialLogin('微信')} />
        <SocialButton className='dingtalk' icon={<DingTalkIcon />} label='钉钉' onClick={() => onSocialLogin('钉钉')} />
        <SocialButton className='feishu' icon={<FeishuIcon />} label='飞书' onClick={() => onSocialLogin('飞书')} />
      </div>
    </>
  );
}

function SocialButton({
  icon,
  label,
  className,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button type='button' className={`vx-auth-social ${className}`} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

function WechatIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' aria-hidden='true'>
      <path d='M9.5 4C5.36 4 2 6.91 2 10.5c0 1.98 1.01 3.75 2.6 4.96L4 18l2.8-1.4c.86.24 1.77.4 2.7.4.23 0 .46 0 .69-.02A5.7 5.7 0 0 1 10 15.5c0-3.04 2.86-5.5 6.5-5.5.23 0 .46.01.69.03C16.54 7.12 13.3 4 9.5 4z' fill='#07C160' />
      <path d='M16.5 11c-3.04 0-5.5 2.02-5.5 4.5S13.46 20 16.5 20c.7 0 1.37-.12 1.98-.34L21 21l-.52-2.6A4.35 4.35 0 0 0 22 15.5C22 13.02 19.54 11 16.5 11z' fill='#07C160' />
    </svg>
  );
}

function DingTalkIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' aria-hidden='true'>
      <circle cx='12' cy='12' r='10' fill='#1677FF' />
      <path d='M13.5 7l-4 5.5h3l-1 4.5 5-6.5h-3.2L13.5 7z' fill='white' />
    </svg>
  );
}

function FeishuIcon() {
  return (
    <svg width='16' height='16' viewBox='0 0 24 24' aria-hidden='true'>
      <path d='M4 12.5C4 8.36 7.36 5 11.5 5c1.5 0 2.9.45 4.05 1.22L7.22 15.55A7.5 7.5 0 0 1 4 12.5z' fill='#3370FF' />
      <path d='M12 19.5a7.5 7.5 0 0 1-3.6-.92l8.38-9.33A7.5 7.5 0 0 1 12 19.5z' fill='#56D5CC' />
    </svg>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { AuthFooter, AuthHeader } from '@/components/auth/AuthChrome';
import { SliderCaptcha } from '@/components/auth/SliderCaptcha';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/stores/notification.store';
import { useRouter } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { forgotPassword, loginWithPhone, sendPhoneCode } from '@/api/auth.api';

type AuthScreen = 'login' | 'phone' | 'forgot';

interface LoginFormProps {
  className?: string;
  initialScreen?: AuthScreen;
}

interface FieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const BG_SRC = '/images/login-bg-light.jpg';
const REMEMBER_LOGIN_KEY = 'vxture-login-remember';
const REMEMBER_IDENTIFIER_KEY = 'vxture-login-identifier';

export function LoginForm({ className = '', initialScreen = 'login' }: LoginFormProps) {
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberLogin, setRememberLogin] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [captchaOpen, setCaptchaOpen] = useState(false);
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const loading = localLoading || authLoading;

  useEffect(() => {
    const shouldRemember = window.localStorage.getItem(REMEMBER_LOGIN_KEY) === '1';
    const savedIdentifier = window.localStorage.getItem(REMEMBER_IDENTIFIER_KEY);

    setRememberLogin(shouldRemember);
    if (shouldRemember && savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, []);

  const openScreen = (nextScreen: AuthScreen) => {
    setScreen(nextScreen);
    setErrors({});
    setPhoneErrors({});
    setResetSent(false);
  };

  // 发送手机验证码（含倒计时）
  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setPhoneErrors({ phone: '请输入有效的中国大陆手机号' });
      return;
    }
    setPhoneErrors({});
    setCodeSending(true);
    try {
      await sendPhoneCode(phone.trim());
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
    }
  };

  // 手机验证码登录
  const handlePhoneLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) nextErrors.phone = '请输入有效的中国大陆手机号';
    if (phoneCode.trim().length !== 6) nextErrors.code = '请输入 6 位验证码';
    if (Object.keys(nextErrors).length > 0) {
      setPhoneErrors(nextErrors);
      return;
    }
    setPhoneErrors({});
    setLocalLoading(true);
    try {
      await loginWithPhone(phone.trim(), phoneCode.trim());
      addNotification('登录成功', 'success');
      router.push((searchParams.get('next') ?? '/') as '/');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : '登录失败，请稍后重试', 'error');
    } finally {
      setLocalLoading(false);
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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateLogin()) {
      setCaptchaOpen(true);
    }
  };

  const handleCaptchaSuccess = async () => {
    setCaptchaOpen(false);

    setLocalLoading(true);
    try {
      const trimmedIdentifier = identifier.trim();
      await login(trimmedIdentifier, password);
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
      router.push((searchParams.get('next') ?? '/') as '/');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : '登录失败，请稍后重试', 'error');
    } finally {
      setLocalLoading(false);
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

  const handleForgotSubmit = async (event: React.FormEvent) => {
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
    <section className={`vx-auth-page ${className}`} style={{ '--vx-auth-bg': `url(${BG_SRC})` } as React.CSSProperties}>
      {captchaOpen ? (
        <SliderCaptcha onClose={() => setCaptchaOpen(false)} onSuccess={handleCaptchaSuccess} />
      ) : null}

      <AuthHeader />

      <main className='vx-auth-main'>
        <div className='vx-auth-card' aria-label='vxture authentication'>
          <VisualPanel />
          <div className='vx-auth-divider' />
          <div className='vx-auth-form-panel'>
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
              <>
                <div className='vx-auth-panel-heading'>
                  <h1>欢迎回来</h1>
                  <p>登录您的 vxture 工作区</p>
                </div>

                <div className='vx-auth-tabs'>
                  <button
                    type='button'
                    className={`vx-auth-tab${screen === 'login' ? ' vx-auth-tab--active' : ''}`}
                    onClick={() => openScreen('login')}
                  >
                    密码登录
                  </button>
                  <button
                    type='button'
                    className={`vx-auth-tab${screen === 'phone' ? ' vx-auth-tab--active' : ''}`}
                    onClick={() => openScreen('phone')}
                  >
                    验证码登录
                  </button>
                </div>

                {screen === 'phone' ? (
                  <PhoneLoginPanel
                    phone={phone}
                    code={phoneCode}
                    errors={phoneErrors}
                    loading={localLoading}
                    countdown={countdown}
                    codeSending={codeSending}
                    onChangePhone={setPhone}
                    onChangeCode={setPhoneCode}
                    onSendCode={handleSendCode}
                    onSubmit={handlePhoneLogin}
                    onRegister={() => router.push('/signup')}
                  />
                ) : (
                  <LoginPanel
                    identifier={identifier}
                    password={password}
                    rememberLogin={rememberLogin}
                    errors={errors}
                    loading={loading}
                    onChangeIdentifier={setIdentifier}
                    onChangePassword={setPassword}
                    onRememberLoginChange={setRememberLogin}
                    onForgot={() => openScreen('forgot')}
                    onForgetMe={handleForgetMe}
                    onRegister={() => router.push('/signup')}
                    onSubmit={handleSubmit}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <AuthFooter />
    </section>
  );
}

function VisualPanel() {
  return (
    <aside className='vx-auth-visual'>
      <NodeGraph />
      <div className='vx-auth-grid' />
      <div className='vx-auth-scan' />
      <div className='vx-auth-fade' />

      <div className='vx-auth-status'>
        <span className='vx-auth-status-dot' />
        <span>All systems operational</span>
      </div>

      <div className='vx-auth-copy'>
        <h2>Build intelligence into everything.</h2>
        <p>Orchestrate models, manage pipelines, and deploy AI workflows at scale from a single workspace.</p>
        <div className='vx-auth-stats'>
          <Stat value='40ms' label='avg latency' />
          <Stat value='99.97%' label='uptime SLA' />
          <Stat value='12B+' label='tokens/day' />
        </div>
      </div>
    </aside>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function LoginPanel({
  identifier,
  password,
  rememberLogin,
  errors,
  loading,
  onChangeIdentifier,
  onChangePassword,
  onRememberLoginChange,
  onForgot,
  onForgetMe,
  onRegister,
  onSubmit,
}: {
  identifier: string;
  password: string;
  rememberLogin: boolean;
  errors: Record<string, string>;
  loading: boolean;
  onChangeIdentifier: (value: string) => void;
  onChangePassword: (value: string) => void;
  onRememberLoginChange: (value: boolean) => void;
  onForgot: () => void;
  onForgetMe: () => void;
  onRegister: () => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const handleRememberLoginChange = (checked: boolean) => {
    onRememberLoginChange(checked);
    if (!checked) {
      window.localStorage.removeItem(REMEMBER_LOGIN_KEY);
      window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} autoComplete='on'>
        <Field
          label='邮箱'
          name='username'
          type='text'
          placeholder='email / username / phone'
          value={identifier}
          error={errors.identifier}
          autoComplete='username'
          autoFocus
          disabled={loading}
          onChange={onChangeIdentifier}
        />
        <Field
          label='密码'
          name='password'
          type='password'
          placeholder='请输入密码'
          value={password}
          error={errors.password}
          autoComplete='current-password'
          disabled={loading}
          onChange={onChangePassword}
        />

        <div className='vx-auth-options'>
          <label className='vx-auth-remember'>
            <input
              type='checkbox'
              checked={rememberLogin}
              disabled={loading}
              onChange={(event) => handleRememberLoginChange(event.target.checked)}
            />
            <span>记住登录信息</span>
          </label>
          <div className='vx-auth-link-group'>
            <button type='button' className='vx-auth-forgot-link' onClick={onForgot}>
              忘记密码？
            </button>
            <button type='button' className='vx-auth-forget-me-link' onClick={onForgetMe} disabled={loading} title='清除浏览器保存的账号密码'>
              忘记我
            </button>
          </div>
        </div>

        <PrimaryButton loading={loading} label='登录' loadingLabel='登录中...' />

        <SocialLoginButtons />

        <p className='vx-auth-switch'>
          还没有账号？
          <button type='button' onClick={onRegister}>
            注册账号
          </button>
        </p>
      </form>
    </>
  );
}

function PhoneLoginPanel({
  phone,
  code,
  errors,
  loading,
  countdown,
  codeSending,
  onChangePhone,
  onChangeCode,
  onSendCode,
  onSubmit,
  onRegister,
}: {
  phone: string;
  code: string;
  errors: Record<string, string>;
  loading: boolean;
  countdown: number;
  codeSending: boolean;
  onChangePhone: (v: string) => void;
  onChangeCode: (v: string) => void;
  onSendCode: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onRegister: () => void;
}) {
  return (
    <form onSubmit={onSubmit} autoComplete='on'>
      <div className='vx-auth-code-row'>
        <Field
          label='手机号'
          name='phone'
          type='tel'
          placeholder='请输入手机号'
          value={phone}
          error={errors.phone}
          autoComplete='tel'
          autoFocus
          disabled={loading}
          onChange={onChangePhone}
        />
        <button
          type='button'
          className='vx-auth-send-code'
          onClick={onSendCode}
          disabled={loading || codeSending || countdown > 0}
        >
          {countdown > 0 ? `${countdown}s` : codeSending ? '发送中…' : '获取验证码'}
        </button>
      </div>

      <div className='vx-auth-code-field-wrap'>
        <Field
          label='验证码'
          name='code'
          type='text'
          placeholder='请输入 6 位验证码'
          value={code}
          error={errors.code}
          autoComplete='one-time-code'
          disabled={loading}
          onChange={onChangeCode}
        />
      </div>

      <PrimaryButton loading={loading} label='登录' loadingLabel='登录中...' />

      <SocialLoginButtons />

      <p className='vx-auth-switch'>
        还没有账号？
        <button type='button' onClick={onRegister}>
          注册账号
        </button>
      </p>
    </form>
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
  onSubmit: (event: React.FormEvent) => void;
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
          <p style={{ fontSize: '0.85rem', color: 'var(--vx-text-muted, #888)', marginTop: '0.5rem' }}>
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
        <Field
          label='邮箱'
          name='email'
          type='email'
          placeholder='you@company.com'
          value={email}
          error={error}
          autoComplete='email'
          autoFocus
          disabled={loading}
          onChange={onChange}
        />
        <PrimaryButton loading={loading} label='获取重置链接' loadingLabel='生成中...' />
      </form>
    </>
  );
}

function BackButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type='button' className='vx-auth-back' onClick={onClick}>
      <span>←</span>
      {children}
    </button>
  );
}

function Field({ label, name, type, placeholder, value, error, hint, autoComplete, autoFocus, disabled, onChange }: FieldProps) {
  return (
    <div className='vx-auth-field'>
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
      {error ? <p className='vx-auth-error'>{error}</p> : null}
      {hint && !error ? <p className='vx-auth-hint'>{hint}</p> : null}
    </div>
  );
}

function PrimaryButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type='submit' className='vx-auth-primary' disabled={loading}>
      {loading ? (
        <>
          <span className='vx-auth-spinner' />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function buildOAuthStartUrl(provider: 'dingtalk' | 'feishu'): string {
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
  const apiPrefix = (process.env.NEXT_PUBLIC_WEBSITE_API_PREFIX ?? '/website-api').replace(/\/+$/, '');
  const returnTo = typeof window !== 'undefined' ? window.location.origin + '/' : '/';
  return `${apiUrl}${apiPrefix}/api/auth/oauth/${provider}/start?returnTo=${encodeURIComponent(returnTo)}`;
}

function SocialLoginButtons() {
  const handleDingTalk = () => {
    window.location.href = buildOAuthStartUrl('dingtalk');
  };

  const handleFeishu = () => {
    window.location.href = buildOAuthStartUrl('feishu');
  };

  return (
    <>
      <div className='vx-auth-or'>
        <span />
        <em>其他方式登录</em>
        <span />
      </div>
      <div className='vx-auth-socials'>
        <SocialButton className='wechat' icon={<WechatIcon />} label='微信' disabled />
        <SocialButton className='dingtalk' icon={<DingTalkIcon />} label='钉钉' onClick={handleDingTalk} />
        <SocialButton className='feishu' icon={<FeishuIcon />} label='飞书' onClick={handleFeishu} />
      </div>
    </>
  );
}

function SocialButton({ icon, label, className, onClick, disabled }: {
  icon: React.ReactNode;
  label: string;
  className: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type='button' className={`vx-auth-social ${className}`} onClick={onClick} disabled={disabled}>
      {icon}
      {label}
    </button>
  );
}

function WechatIcon() {
  return (
    <svg width='15' height='15' viewBox='0 0 24 24' aria-hidden='true'>
      <path
        d='M9.5 4C5.36 4 2 6.91 2 10.5c0 1.98 1.01 3.75 2.6 4.96L4 18l2.8-1.4c.86.24 1.77.4 2.7.4.23 0 .46 0 .69-.02A5.7 5.7 0 0 1 10 15.5c0-3.04 2.86-5.5 6.5-5.5.23 0 .46.01.69.03C16.54 7.12 13.3 4 9.5 4z'
        fill='#07C160'
      />
      <path
        d='M16.5 11c-3.04 0-5.5 2.02-5.5 4.5S13.46 20 16.5 20c.7 0 1.37-.12 1.98-.34L21 21l-.52-2.6A4.35 4.35 0 0 0 22 15.5C22 13.02 19.54 11 16.5 11z'
        fill='#07C160'
      />
    </svg>
  );
}

function DingTalkIcon() {
  return (
    <svg width='15' height='15' viewBox='0 0 24 24' aria-hidden='true'>
      <circle cx='12' cy='12' r='10' fill='#1677FF' />
      <path d='M13.5 7l-4 5.5h3l-1 4.5 5-6.5h-3.2L13.5 7z' fill='white' />
    </svg>
  );
}

function FeishuIcon() {
  return (
    <svg width='15' height='15' viewBox='0 0 24 24' aria-hidden='true'>
      <path d='M4 12.5C4 8.36 7.36 5 11.5 5c1.5 0 2.9.45 4.05 1.22L7.22 15.55A7.5 7.5 0 0 1 4 12.5z' fill='#3370FF' />
      <path d='M12 19.5a7.5 7.5 0 0 1-3.6-.92l8.38-9.33A7.5 7.5 0 0 1 12 19.5z' fill='#56D5CC' />
    </svg>
  );
}

function NodeGraph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    let frame = 0;
    let width = 0;
    let height = 0;
    let nodes: Array<{ x: number; y: number; vx: number; vy: number; radius: number; phase: number }> = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(22, Math.floor((width * height) / 9000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.6,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;

      for (const node of nodes) {
        node.phase += 0.014;
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) {
          node.vx *= -1;
        }
        if (node.y < 0 || node.y > height) {
          node.vy *= -1;
        }

        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 100) {
          node.x += (dx / distance) * 0.5;
          node.y += (dy / distance) * 0.5;
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const first = nodes[i];
          const second = nodes[j];
          if (!first || !second) {
            continue;
          }

          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance < 140) {
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.strokeStyle = `rgba(147,197,253,${(1 - distance / 140) * 0.35})`;
            context.lineWidth = 0.6;
            context.stroke();
          }
        }
      }

      for (const node of nodes) {
        const pulse = Math.sin(node.phase) * 0.5 + 0.5;
        context.beginPath();
        context.arc(node.x, node.y, node.radius * (1 + pulse * 0.35), 0, Math.PI * 2);
        context.fillStyle = `rgba(147,197,253,${0.45 + pulse * 0.4})`;
        context.fill();
      }

      frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className='vx-auth-nodegraph' aria-hidden='true' />;
}

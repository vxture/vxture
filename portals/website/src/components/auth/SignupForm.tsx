'use client';

import { useState } from 'react';
import { AuthFooter, AuthHeader } from '@/components/auth/AuthChrome';
import { SliderCaptcha } from '@/components/auth/SliderCaptcha';
import { useNotificationStore } from '@/stores/notification.store';
import { Link, useRouter } from '@/lib/i18n/navigation';

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const BG_SRC = '/images/login-bg-light.jpg';

export interface SignupFormProps {
  className?: string;
}

export function SignupForm({ className = '' }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});

  const router = useRouter();
  const { addNotification } = useNotificationStore();

  const validate = () => {
    const nextErrors: SignupErrors = {};
    if (!name.trim()) {
      nextErrors.name = '请输入姓名';
    }

    if (!email.includes('@')) {
      nextErrors.email = '请输入有效邮箱';
    }

    if (password.length < 8) {
      nextErrors.password = '密码至少 8 位';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setCaptchaOpen(true);
  };

  const completeSignup = () => {
    setCaptchaOpen(false);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      addNotification('注册功能正在接入，请先使用已有账号登录', 'info');
      router.push('/signin');
    }, 500);
  };

  const handleSocialLogin = (provider: string) => {
    addNotification(`${provider} 一键登录正在接入`, 'info');
  };

  return (
    <section className={`vx-auth-page vx-signup-page ${className}`} style={{ '--vx-auth-bg': `url(${BG_SRC})` } as React.CSSProperties}>
      {captchaOpen ? <SliderCaptcha onClose={() => setCaptchaOpen(false)} onSuccess={completeSignup} /> : null}

      <AuthHeader />

      <main className='vx-signup-main'>
        <div className='vx-signup-card' aria-label='vxture signup'>
          <div className='vx-auth-panel-heading vx-signup-heading'>
            <h1>创建账号</h1>
            <p>开始使用 vxture 智能体平台</p>
          </div>

          <form onSubmit={handleSignup} className='vx-signup-form'>
            <SignupField
              label='姓名'
              type='text'
              placeholder='请输入您的姓名'
              value={name}
              error={errors.name}
              autoFocus
              disabled={loading}
              onChange={setName}
            />
            <SignupField
              label='邮箱'
              type='email'
              placeholder='you@company.com'
              value={email}
              error={errors.email}
              disabled={loading}
              onChange={setEmail}
            />
            <SignupField
              label='密码'
              type='password'
              placeholder='至少 8 位字符'
              value={password}
              error={errors.password}
              disabled={loading}
              onChange={setPassword}
            />
            <SignupField
              label='确认密码'
              type='password'
              placeholder='再次输入密码'
              value={confirmPassword}
              error={errors.confirmPassword}
              disabled={loading}
              onChange={setConfirmPassword}
            />

            <button type='submit' className='vx-auth-primary vx-signup-primary' disabled={loading}>
              {loading ? (
                <>
                  <span className='vx-auth-spinner' />
                  注册中...
                </>
              ) : (
                '注册账号'
              )}
            </button>
          </form>

          <SocialRegisterButtons onSocialLogin={handleSocialLogin} />

          <p className='vx-signup-terms'>
            注册即表示您同意 <a href='#terms'>服务条款</a> 与 <a href='#privacy'>隐私政策</a>
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

function SignupField({
  label,
  type,
  placeholder,
  value,
  error,
  autoFocus,
  disabled,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className='vx-signup-field'>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
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

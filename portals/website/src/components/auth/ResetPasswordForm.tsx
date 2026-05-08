/**
 * ResetPasswordForm.tsx - 密码重置表单
 * @package @vxture/website
 * @layer Presentation
 * @category Auth
 *
 * 从 URL query ?token=xxx 读取重置令牌，用户输入新密码后调用
 * POST /api/auth/reset-password，成功后跳转登录页。
 *
 * @author AI-Generated
 * @date 2026-05-02
 */

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthFooter, AuthHeader } from '@/components/auth/AuthChrome';
import { resetPassword } from '@/api/auth.api';
import { useRouter } from '@/lib/i18n/navigation';

// ─── 类型 ──────────────────────────────────────────────────────────────────────

type ResetStep = 'form' | 'done' | 'invalid';

// ─── 主组件 ────────────────────────────────────────────────────────────────────

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [step, setStep] = useState<ResetStep>(token ? 'form' : 'invalid');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ─── 事件处理 ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (event: React.FormEvent) => {
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
      // token 无效或已过期
      setStep('invalid');
    } finally {
      setLoading(false);
    }
  };

  // ─── 渲染 ─────────────────────────────────────────────────────────────────────

  return (
    <section
      className='vx-auth-page'
      style={{ '--vx-auth-bg': 'url(/images/login-bg-light.jpg)' } as React.CSSProperties}
    >
      <AuthHeader />

      <main className='vx-auth-main'>
        <div className='vx-auth-card' aria-label='reset password'>
          <div className='vx-auth-form-panel'>
            {step === 'form' && (
              <FormStep
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                error={error}
                loading={loading}
                onChangeNew={setNewPassword}
                onChangeConfirm={setConfirmPassword}
                onSubmit={handleSubmit}
              />
            )}
            {step === 'done' && (
              <DoneStep onSignIn={() => router.push('/signin')} />
            )}
            {step === 'invalid' && (
              <InvalidStep onRetry={() => router.push('/signin')} />
            )}
          </div>
        </div>
      </main>

      <AuthFooter />
    </section>
  );
}

// ─── 步骤子组件 ────────────────────────────────────────────────────────────────

function FormStep({
  newPassword,
  confirmPassword,
  error,
  loading,
  onChangeNew,
  onChangeConfirm,
  onSubmit,
}: {
  newPassword: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
  onChangeNew: (v: string) => void;
  onChangeConfirm: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <div className='vx-auth-panel-heading'>
        <h1>设置新密码</h1>
        <p>请输入您的新密码，至少 8 位字符</p>
      </div>

      <form onSubmit={onSubmit} autoComplete='off'>
        <div className='vx-auth-field'>
          <label>新密码</label>
          <input
            type='password'
            value={newPassword}
            placeholder='至少 8 位字符'
            autoComplete='new-password'
            autoFocus
            disabled={loading}
            onChange={(e) => onChangeNew(e.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>
        <div className='vx-auth-field'>
          <label>确认密码</label>
          <input
            type='password'
            value={confirmPassword}
            placeholder='再次输入新密码'
            autoComplete='new-password'
            disabled={loading}
            onChange={(e) => onChangeConfirm(e.target.value)}
            aria-invalid={Boolean(error)}
          />
        </div>

        {error ? <p className='vx-auth-error'>{error}</p> : null}

        <button type='submit' className='vx-auth-primary' disabled={loading}>
          {loading ? (
            <>
              <span className='vx-auth-spinner' />
              重置中...
            </>
          ) : (
            '确认重置密码'
          )}
        </button>
      </form>
    </>
  );
}

function DoneStep({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className='vx-auth-reset-done'>
      <div className='vx-auth-check'>✓</div>
      <h1>密码已重置</h1>
      <p>您的密码已成功更新，请使用新密码登录。</p>
      <button type='button' className='vx-auth-primary' onClick={onSignIn}>
        去登录
      </button>
    </div>
  );
}

function InvalidStep({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='vx-auth-reset-done'>
      <div className='vx-auth-check' style={{ background: 'var(--vx-color-error)' }}>✕</div>
      <h1>链接已失效</h1>
      <p>该重置链接已过期或已使用。请重新申请密码重置。</p>
      <button type='button' className='vx-auth-primary' onClick={onRetry}>
        重新申请
      </button>
    </div>
  );
}

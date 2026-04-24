/**
 * LoginForm.tsx - 登录表单组件
 * @package @vxture/website
 * @layer Presentation
 * @category Components
 *
 * 功能：
 * - 提供登录表单 UI
 * - 表单验证
 * - 调用 useAuth 钩子
 * - 处理错误状态
 *
 * @file LoginForm.tsx
 * @desc 登录表单组件
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/stores/notification.store';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';

export interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className = '' }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isLoading: loginLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const router = useRouter();
  const t = useTranslations('auth.signin');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      addNotification(t('required'), 'error');
      return;
    }

    setLoading(true);
    try {
      await login(identifier, password);
      addNotification(t('success'), 'success');
      router.push('/'); // 登录成功后跳转到首页
    } catch (error) {
      addNotification(error instanceof Error ? error.message : t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 ${className}`}>
      <h1 className='text-2xl font-bold mb-6'>{t('title')}</h1>
      <form onSubmit={handleLogin} className='space-y-4'>
        <div>
          <label className='block mb-2'>{t('email')}</label>
          <input
            type='text'
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='email / username / phone'
            disabled={loading || loginLoading}
          />
        </div>
        <div>
          <label className='block mb-2'>{t('password')}</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='password'
            disabled={loading || loginLoading}
          />
        </div>
        <button
          type='submit'
          disabled={loading || loginLoading}
          className='w-full p-2 bg-blue-500 text-white rounded disabled:opacity-70'
        >
          {loading || loginLoading ? '登录中...' : t('loginButton')}
        </button>
      </form>
    </div>
  );
}

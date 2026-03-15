/**
 * SignupForm.tsx - 注册表单组件
 * @package @vxture/website
 * @layer Presentation
 * @category Components
 *
 * 功能：
 * - 提供注册表单 UI
 * - 表单验证
 * - 调用 useAuth 钩子
 * - 处理错误状态
 *
 * @file SignupForm.tsx
 * @desc 注册表单组件
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

export interface SignupFormProps {
  className?: string;
}

export function SignupForm({ className = '' }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isLoading: loginLoading } = useAuth();
  const { addNotification } = useNotificationStore();
  const router = useRouter();
  const t = useTranslations('auth.signup');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      addNotification('请输入邮箱、密码和姓名', 'error');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call BFF signup API
      await login(email, password);
      addNotification(t('success'), 'success');
      router.push('/');
    } catch {
      addNotification(t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 ${className}`}>
      <h1 className='text-2xl font-bold mb-6'>{t('title')}</h1>
      <form onSubmit={handleSignup} className='space-y-4'>
        <div>
          <label className='block mb-2'>{t('name')}</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='your name'
            disabled={loading || loginLoading}
          />
        </div>
        <div>
          <label className='block mb-2'>{t('email')}</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='your@email.com'
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
          {loading || loginLoading ? '注册中...' : t('signupButton')}
        </button>
      </form>
    </div>
  );
}

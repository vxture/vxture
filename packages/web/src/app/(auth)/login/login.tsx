'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 从Auth Store获取登录方法
  const { login } = useAuthStore();
  // 通知工具
  const { addNotification } = useNotificationStore();
  // 路由导航
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addNotification('请输入邮箱和密码', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addNotification('登录成功', 'success');
      router.push('/'); // 登录成功后跳转到首页
    } catch (error) {
      addNotification('登录失败，请检查账号密码', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-md mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>登录</h1>
      <form onSubmit={handleLogin} className='space-y-4'>
        <div>
          <label className='block mb-2'>邮箱</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='your@email.com'
          />
        </div>
        <div>
          <label className='block mb-2'>密码</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='password'
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='w-full p-2 bg-blue-500 text-white rounded disabled:opacity-70'
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}

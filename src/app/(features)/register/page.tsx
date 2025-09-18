'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAppContext } from '@/lib/contexts/AppContext';

export default function RegisterPage() {
  const router = useRouter();
  const { dispatch } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 简单验证
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不匹配');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('请同意服务条款和隐私政策');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟注册成功
      const mockUser = {
        id: '1',
        name: formData.name,
        email: formData.email,
      };
      
      // 更新应用状态
      dispatch({ type: 'LOGIN', payload: mockUser });
      
      // 重定向到控制面板
      router.push('/dashboard');
    } catch (err) {
      setError('注册失败，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            创建新账户
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            或{' '}
            <Link href="/login" className="text-primary hover:text-primary-dark">
              使用已有账户登录
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="form-control"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">电子邮箱</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="form-control"
              value={formData.password}
              onChange={handleChange}
            />
            <small className="form-group__help">
              密码至少8位，包含字母和数字
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              className="h-4 w-4 text-primary border-gray-300 rounded"
              checked={formData.agreeTerms}
              onChange={handleChange}
            />
            <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              我同意 <Link href="/terms" className="text-primary hover:text-primary-dark">服务条款</Link> 和 
              <Link href="/privacy" className="text-primary hover:text-primary-dark"> 隐私政策</Link>
            </label>
          </div>
          
          <div>
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '注册中...' : '创建账户'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                或使用其他方式
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              微信
            </button>
            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              支付宝
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

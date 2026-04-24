/**
 * page.tsx - 登录页面别名
 * @package @vxture/website
 */

'use client';

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginAliasPage() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <LoginForm />
    </div>
  );
}

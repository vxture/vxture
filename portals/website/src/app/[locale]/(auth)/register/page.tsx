/**
 * page.tsx - 注册页面别名
 * @package @vxture/website
 */

'use client';

import { SignupForm } from '@/components/auth/SignupForm';

export default function RegisterAliasPage() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <SignupForm />
    </div>
  );
}

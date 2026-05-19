/**
 * page.tsx - 密码重置页
 * @package @vxture/website
 * @layer Presentation
 * @category Pages
 *
 * 读取 URL ?token=xxx，用户填写新密码后调用重置接口。
 * ResetPasswordForm 使用 useSearchParams，必须包在 Suspense 内。
 *
 * @author AI-Generated
 * @date 2026-05-02
 */

import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

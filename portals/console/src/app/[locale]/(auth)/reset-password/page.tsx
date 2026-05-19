"use client";

/**
 * page.tsx - 控制台密码重置页
 * @package @vxture/console
 * @layer Presentation
 * @category Auth
 * @description
 *   接收 console-bff 忘记密码邮件中的 token，并渲染密码重置表单。
 *
 * @author AI-Generated
 * @date 2026-05-16
 */

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

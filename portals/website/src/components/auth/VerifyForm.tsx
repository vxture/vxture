/**
 * VerifyForm.tsx - 注册后租户类型选择
 * @package @vxture/website
 * @layer Presentation
 * @category Auth
 *
 * 注册成功后引导用户选择租户类型（个人 / 企业），选择后调用
 * POST /api/auth/tenant/init 完成租户创建与 JWT 刷新，随即跳转 console。
 *
 * @author AI-Generated
 * @date 2026-05-02
 */

"use client";

import { useState } from "react";
import { Button } from "@vxture/design-system";
import { AuthFooter, AuthHeader } from "@/components/auth/AuthChrome";
import { useRouter } from "@/lib/i18n/navigation";
import { initTenant } from "@/api/auth.api";

// ─── 类型 ──────────────────────────────────────────────────────────────────────

type TenantType = "individual" | "organization";

// ─── 主组件 ────────────────────────────────────────────────────────────────────

export interface VerifyFormProps {
  className?: string;
}

export function VerifyForm({ className = "" }: VerifyFormProps) {
  const [selecting, setSelecting] = useState<TenantType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const CONSOLE_URL =
    process.env.NEXT_PUBLIC_CONSOLE_URL ?? "http://localhost:3020";

  const handleChoose = async (type: TenantType) => {
    setSelecting(type);
    setError(null);

    try {
      await initTenant({ type });
      // 租户创建成功，cookie 已更新，跳转到 console 工作台
      window.location.href = CONSOLE_URL;
    } catch {
      setError("初始化失败，请稍后重试");
      setSelecting(null);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <section className="vx-auth-page vx-auth-page--default-bg vx-verify-page">
      <AuthHeader />

      <main className={`vx-signup-main ${className}`}>
        <div
          className="vx-signup-card vx-verify-card"
          aria-label="tenant type selection"
        >
          <div className="vx-auth-panel-heading vx-signup-heading">
            <h1>选择使用方式</h1>
            <p>告诉我们您以什么身份使用平台，以便提供更合适的功能</p>
          </div>

          {error && (
            <p role="alert" className="vx-form-error vx-form-error--centered">
              {error}
            </p>
          )}

          <div className="vx-verify-choices">
            <Button
              variant="ghost"
              className="vx-verify-choice"
              disabled={selecting !== null}
              onClick={() => handleChoose("individual")}
            >
              <span className="vx-verify-choice__icon" aria-hidden="true">
                👤
              </span>
              <strong>个人使用</strong>
              <span>个人开发者、独立创作者、自由职业者</span>
            </Button>

            <Button
              variant="ghost"
              className="vx-verify-choice"
              disabled={selecting !== null}
              onClick={() => handleChoose("organization")}
            >
              <span className="vx-verify-choice__icon" aria-hidden="true">
                🏢
              </span>
              <strong>企业 / 团队使用</strong>
              <span>公司、机构、政府单位、研究团队</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            className="vx-verify-skip"
            disabled={selecting !== null}
            onClick={handleSkip}
          >
            跳过，稍后再设置
          </Button>
        </div>
      </main>

      <AuthFooter />
    </section>
  );
}

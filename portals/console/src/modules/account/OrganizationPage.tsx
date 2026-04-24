'use client';

import { useEffect, useState } from 'react';
import { fetchOrganizationProfile } from '@/api/console-bff';
import type { ConsoleOrganizationProfile } from '@/entities/console';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { PageHeader } from '@/modules/shared/PageHeader';

const VERIFIED_STATUS_LABEL: Record<NonNullable<ConsoleOrganizationProfile['verifiedStatus']>, string> = {
  unverified: '未认证',
  pending: '审核中',
  verified: '已认证',
  rejected: '已拒绝',
};

const TENANT_STATUS_LABEL: Record<ConsoleOrganizationProfile['status'], string> = {
  trial: '试用中',
  active: '正常',
  suspended: '已暂停',
  cancelled: '已注销',
};

export function OrganizationPage() {
  const { session } = useConsoleSession();
  const [profile, setProfile] = useState<ConsoleOrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetchOrganizationProfile(session.tenant?.mode === 'tenant' ? session.tenant.id : undefined)
      .then((data) => {
        if (!active) {
          return;
        }

        setProfile(data);
        setError(data ? null : '未读取到组织资料。');
      })
      .catch(() => {
        if (active) {
          setError('组织资料读取失败，请稍后重试。');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session.tenant?.id]);

  const displayName = profile?.displayName ?? profile?.companyName ?? profile?.tenantName ?? '--';
  const initials = displayName.slice(0, 2).toUpperCase();
  const location = [profile?.countryCode, profile?.province, profile?.city, profile?.district]
    .filter(Boolean)
    .join(' / ');

  return (
    <div className="vx-page-stack vx-profile-page">
      <PageHeader
        title="组织信息"
        description="展示当前租户的真实组织资料、认证状态、联系信息与本地化配置。"
      />

      {error ? <p className="vx-profile-error">{error}</p> : null}

      <section className="vx-profile-group">
        <header className="vx-profile-group__header">
          <div>
            <h2>基础资料</h2>
            <p>来自 tenant 与 tenant_organization 表的当前租户真实数据。</p>
          </div>
        </header>
        <div className="vx-profile-row">
          <span>Logo</span>
          <div className="vx-profile-avatar">
            {profile?.logoUrl ? <img src={profile.logoUrl} alt={displayName} /> : <strong>{initials}</strong>}
          </div>
        </div>
        <div className="vx-profile-row">
          <span>组织名称</span>
          <strong>{loading ? '...' : displayName}</strong>
        </div>
        <div className="vx-profile-row">
          <span>企业名称</span>
          <strong>{loading ? '...' : profile?.companyName || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>租户编码</span>
          <strong>{loading ? '...' : profile?.tenantCode || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>描述</span>
          <strong>{loading ? '...' : profile?.description || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>行业 / 规模</span>
          <strong>{loading ? '...' : [profile?.industry, profile?.scale].filter(Boolean).join(' / ') || '--'}</strong>
        </div>
      </section>

      <section className="vx-profile-group">
        <header className="vx-profile-group__header">
          <div>
            <h2>认证与状态</h2>
            <p>反映租户运行状态与企业认证信息。</p>
          </div>
        </header>
        <div className="vx-profile-row">
          <span>租户状态</span>
          <strong>{loading ? '...' : (profile ? TENANT_STATUS_LABEL[profile.status] : '--')}</strong>
        </div>
        <div className="vx-profile-row">
          <span>认证状态</span>
          <strong>{loading ? '...' : (profile?.verifiedStatus ? VERIFIED_STATUS_LABEL[profile.verifiedStatus] : '--')}</strong>
        </div>
        <div className="vx-profile-row">
          <span>统一社会信用代码</span>
          <strong>{loading ? '...' : profile?.unifiedSocialCreditCode || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>认证时间</span>
          <strong>{loading ? '...' : profile?.verifiedAt ? new Date(profile.verifiedAt).toLocaleString() : '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>拒绝原因</span>
          <strong>{loading ? '...' : profile?.rejectedReason || '--'}</strong>
        </div>
      </section>

      <section className="vx-profile-group">
        <header className="vx-profile-group__header">
          <div>
            <h2>联系与地址</h2>
            <p>联系人、域名与注册地址信息。</p>
          </div>
        </header>
        <div className="vx-profile-row">
          <span>联系人</span>
          <strong>{loading ? '...' : profile?.contactName || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>联系电话</span>
          <strong>{loading ? '...' : profile?.contactPhone || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>联系邮箱</span>
          <strong>{loading ? '...' : profile?.contactEmail || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>主域名</span>
          <strong>{loading ? '...' : profile?.primaryDomain || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>地区</span>
          <strong>{loading ? '...' : location || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>详细地址</span>
          <strong>{loading ? '...' : profile?.address || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>邮编</span>
          <strong>{loading ? '...' : profile?.postalCode || '--'}</strong>
        </div>
      </section>

      <section className="vx-profile-group">
        <header className="vx-profile-group__header">
          <div>
            <h2>本地化配置</h2>
            <p>决定控制台默认语言与时间显示。</p>
          </div>
        </header>
        <div className="vx-profile-row">
          <span>语言</span>
          <strong>{loading ? '...' : profile?.language || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>时区</span>
          <strong>{loading ? '...' : profile?.timeZone || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>营业执照</span>
          <strong>{loading ? '...' : profile?.businessLicenseUrl || '--'}</strong>
        </div>
        <div className="vx-profile-row">
          <span>最近更新时间</span>
          <strong>{loading ? '...' : profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '--'}</strong>
        </div>
      </section>
    </div>
  );
}

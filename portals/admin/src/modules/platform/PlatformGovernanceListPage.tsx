'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Input } from '@/components/ui/primitives';
import { fetchPlatformGovernanceRecords } from '@/api/admin-bff';
import type {
  PlatformGovernanceKind,
  PlatformGovernanceRecord,
  PlatformGovernanceStatus,
} from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type ViewMode = 'list' | 'cards';

interface GovernanceConfig {
  title: string;
  description: string;
  icon: IconName;
  primaryAction: string;
  searchPlaceholder: string;
  objectLabel: string;
  scopeLabel: string;
  ownerLabel: string;
  policyLabel: string;
  records: PlatformGovernanceRecord[];
}

const statusMeta = {
  normal: { label: '正常', icon: 'check', className: 'vx-platform-governance-status--normal' },
  warning: { label: '关注', icon: 'info', className: 'vx-platform-governance-status--warning' },
  blocked: { label: '阻断', icon: 'x', className: 'vx-platform-governance-status--blocked' },
  pending: { label: '待处理', icon: 'clock', className: 'vx-platform-governance-status--pending' },
} satisfies Record<PlatformGovernanceStatus, { label: string; icon: IconName; className: string }>;

const governanceConfigs = {
  admins: {
    title: '用户管理',
    description: '管理平台内部管理员、运营人员和运维人员，明确岗位、角色、准入状态和最近访问。',
    icon: 'user',
    primaryAction: '新增人员',
    searchPlaceholder: '搜索人员、岗位、角色或职责',
    objectLabel: '人员',
    scopeLabel: '岗位',
    ownerLabel: '角色',
    policyLabel: '准入策略',
    records: [
      {
        id: 'admin-001',
        name: '平台负责人',
        status: 'normal',
        scope: '平台管理',
        owner: '超级管理员',
        policy: 'MFA + 全域审计',
        updatedAt: '2026-04-30 18:42',
        description: '负责平台策略、资源配置和高风险操作授权。',
        tags: ['全域权限', '二次确认'],
      },
      {
        id: 'admin-002',
        name: '运营主管',
        status: 'normal',
        scope: '租户运营',
        owner: '租户管理员',
        policy: 'MFA + 租户数据隔离',
        updatedAt: '2026-04-30 16:20',
        description: '处理租户生命周期、认证审核、订阅和工单升级。',
        tags: ['运营域', '租户隔离'],
      },
      {
        id: 'admin-003',
        name: '运维值守',
        status: 'warning',
        scope: '运行可靠性',
        owner: '配置管理员',
        policy: 'MFA + 夜间告警',
        updatedAt: '2026-04-29 22:10',
        description: '观察服务健康、任务队列和运行异常。',
        tags: ['服务监控', '告警处置'],
      },
    ],
  },
  secrets: {
    title: '密钥配置',
    description: '集中管理平台级 API Key、服务凭据、轮换周期和最小可见范围。',
    icon: 'key',
    primaryAction: '新增密钥',
    searchPlaceholder: '搜索密钥、用途、负责人或策略',
    objectLabel: '密钥',
    scopeLabel: '作用域',
    ownerLabel: '负责人',
    policyLabel: '轮换策略',
    records: [
      {
        id: 'secret-llm',
        name: 'LLM Provider Key',
        status: 'normal',
        scope: '模型接入',
        owner: '平台负责人',
        policy: '30 天轮换',
        updatedAt: '2026-04-28 11:16',
        description: '用于平台模型网关调用外部 Provider，租户不可见。',
        tags: ['平台级', '只读掩码'],
      },
      {
        id: 'secret-webhook',
        name: 'Billing Webhook Secret',
        status: 'warning',
        scope: '商业回调',
        owner: '运维值守',
        policy: '7 天内待轮换',
        updatedAt: '2026-04-26 09:34',
        description: '用于收款回调签名校验，轮换期临近。',
        tags: ['签名校验', '待轮换'],
      },
      {
        id: 'secret-audit',
        name: 'Audit Export Token',
        status: 'blocked',
        scope: '审计导出',
        owner: '审计管理员',
        policy: '已冻结',
        updatedAt: '2026-04-20 15:02',
        description: '审计导出令牌已冻结，等待审批中心复核。',
        tags: ['冻结', '需审批'],
      },
    ],
  },
  jobs: {
    title: '任务队列',
    description: '观察平台异步任务、重试、死信、调度状态和关键后台作业。',
    icon: 'workflow',
    primaryAction: '新增任务',
    searchPlaceholder: '搜索任务、队列、负责人或策略',
    objectLabel: '任务',
    scopeLabel: '队列',
    ownerLabel: '负责人',
    policyLabel: '调度策略',
    records: [
      {
        id: 'job-metering',
        name: '用量聚合',
        status: 'normal',
        scope: 'usage-metering',
        owner: '系统调度',
        policy: '每 15 分钟',
        updatedAt: '2026-05-01 09:00',
        description: '聚合租户、产品、模型维度的用量数据。',
        tags: ['定时任务', '可重试'],
      },
      {
        id: 'job-invoice',
        name: '账单生成',
        status: 'pending',
        scope: 'billing',
        owner: '商业服务',
        policy: '月结触发',
        updatedAt: '2026-05-01 08:45',
        description: '生成账单草稿并等待财务确认。',
        tags: ['月结', '等待确认'],
      },
      {
        id: 'job-notify',
        name: '通知投递',
        status: 'warning',
        scope: 'notification',
        owner: '运营平台',
        policy: '失败 3 次入死信',
        updatedAt: '2026-05-01 08:20',
        description: '处理公告、告警和系统消息投递。',
        tags: ['死信 2', '重试中'],
      },
    ],
  },
  approvals: {
    title: '审批中心',
    description: '承接高风险操作的二次确认、审批流、执行凭证和审计闭环。',
    icon: 'check',
    primaryAction: '新增审批',
    searchPlaceholder: '搜索审批、对象、发起人或策略',
    objectLabel: '审批',
    scopeLabel: '对象',
    ownerLabel: '发起人',
    policyLabel: '审批策略',
    records: [
      {
        id: 'approval-secret',
        name: '解冻审计导出令牌',
        status: 'pending',
        scope: 'Audit Export Token',
        owner: '审计管理员',
        policy: '双人审批',
        updatedAt: '2026-05-01 08:12',
        description: '高风险令牌恢复必须经过二次确认与双人审批。',
        tags: ['高风险', '待审批'],
      },
      {
        id: 'approval-plan',
        name: '企业套餐手动调整',
        status: 'normal',
        scope: 'tenant-ent-042',
        owner: '运营主管',
        policy: '主管确认',
        updatedAt: '2026-04-30 19:05',
        description: '企业客户套餐调整已完成确认并写入审计。',
        tags: ['已完成', '审计可查'],
      },
      {
        id: 'approval-model',
        name: '模型 Provider 切换',
        status: 'warning',
        scope: '模型接入',
        owner: '平台负责人',
        policy: '维护窗口',
        updatedAt: '2026-04-30 17:48',
        description: '涉及平台级模型路由，等待维护窗口执行。',
        tags: ['待执行', '维护窗口'],
      },
    ],
  },
} satisfies Record<PlatformGovernanceKind, GovernanceConfig>;

function recordSearchText(record: PlatformGovernanceRecord) {
  return [record.id, record.name, record.scope, record.owner, record.policy, record.description, ...record.tags].join(' ').toLowerCase();
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]'));
}

function GovernanceActionsMenu({
  record,
  open,
  onToggle,
  onClose,
}: {
  record: PlatformGovernanceRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuWidth = 160;
      const menuHeight = menuRef.current?.offsetHeight ?? 136;
      const left = Math.max(8, Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth));
      const belowTop = rect.bottom + 4;
      const top = belowTop + menuHeight > window.innerHeight - 8 ? Math.max(8, rect.top - menuHeight - 4) : belowTop;
      setMenuPosition({ left, top });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose, open]);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="vx-tenant-actions__menu vx-tenant-actions__menu--portal"
          role="menu"
          style={{ left: menuPosition.left, top: menuPosition.top }}
        >
          <button type="button" role="menuitem" disabled>
            <Icon name="info" size="xs" fallback="placeholder" />
            查看详情
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="edit" size="xs" fallback="placeholder" />
            编辑配置
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="shield-check" size="xs" fallback="placeholder" />
            审计记录
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()}>
      <button ref={triggerRef} className="vx-tenant-actions__trigger" type="button" aria-label={`${record.name} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {menu}
    </div>
  );
}

export function PlatformGovernanceListPage({ kind }: { kind: PlatformGovernanceKind }) {
  const config = governanceConfigs[kind];
  const [sourceRecords, setSourceRecords] = useState<PlatformGovernanceRecord[]>(config.records);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlatformGovernanceStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const pageSelectRef = useRef<HTMLInputElement | null>(null);

  const records = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sourceRecords.filter((record) => {
      const matchesQuery = !normalizedQuery || recordSearchText(record).includes(normalizedQuery);
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, sourceRecords, statusFilter]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSourceRecords(config.records);

    fetchPlatformGovernanceRecords(kind, config.records)
      .then((nextRecords) => {
        if (!active) return;
        setSourceRecords(nextRecords);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [config.records, kind]);

  const selectedOnPage = records.filter((record) => selectedIds.has(record.id)).length;
  const isPageSelected = records.length > 0 && selectedOnPage === records.length;
  const isPagePartiallySelected = selectedOnPage > 0 && selectedOnPage < records.length;

  useEffect(() => {
    if (pageSelectRef.current) {
      pageSelectRef.current.indeterminate = isPagePartiallySelected;
    }
  }, [isPagePartiallySelected]);

  function toggleRecord(recordId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(recordId);
      else next.delete(recordId);
      return next;
    });
  }

  function togglePage(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      records.forEach((record) => {
        if (checked) next.add(record.id);
        else next.delete(record.id);
      });
      return next;
    });
  }

  const summary = {
    total: sourceRecords.length,
    normal: sourceRecords.filter((record) => record.status === 'normal').length,
    risk: sourceRecords.filter((record) => record.status === 'warning' || record.status === 'blocked').length,
    pending: sourceRecords.filter((record) => record.status === 'pending').length,
  };

  return (
    <div className="vx-page-stack vx-platform-governance-page">
      <PageHeader
        icon={config.icon}
        title={config.title}
        description={config.description}
        action={<Button>{config.primaryAction}</Button>}
      />

      <section className="vx-tenant-summary vx-platform-governance-summary" aria-label={`${config.title}统计`}>
        <article className="vx-tenant-summary__item vx-tenant-tone--blue">
          <Icon name={config.icon} size="lg" fallback="placeholder" />
          <div><span>总数</span><p><strong>{formatNumber(summary.total)}</strong><em>{config.objectLabel}</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--green">
          <Icon name="check" size="lg" fallback="placeholder" />
          <div><span>正常</span><p><strong>{formatNumber(summary.normal)}</strong><em>可用</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--amber">
          <Icon name="info" size="lg" fallback="placeholder" />
          <div><span>风险</span><p><strong>{formatNumber(summary.risk)}</strong><em>需关注</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--rose">
          <Icon name="clock" size="lg" fallback="placeholder" />
          <div><span>待处理</span><p><strong>{formatNumber(summary.pending)}</strong><em>队列</em></p></div>
        </article>
      </section>

      <section className="vx-tenant-directory vx-platform-governance-directory">
        <div className="vx-tenant-directory__toolbar">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.searchPlaceholder} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PlatformGovernanceStatus | 'all')} className="vx-select-trigger">
            <option value="all">全部状态</option>
            <option value="normal">正常</option>
            <option value="warning">关注</option>
            <option value="blocked">阻断</option>
            <option value="pending">待处理</option>
          </select>
          <div className="vx-tenant-directory__toolbar-actions">
            <ActionButton icon="shield-check" disabled={selectedIds.size === 0}>
              批量审计{selectedIds.size ? ` (${selectedIds.size})` : ''}
            </ActionButton>
            <ViewModeSwitch value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {loading ? (
          <EmptyState title="正在加载自治数据" description="正在读取平台自治域的治理记录。" />
        ) : records.length === 0 ? (
          <EmptyState title="暂无匹配记录" description="调整关键词或筛选条件后再查看。" />
        ) : viewMode === 'list' ? (
          <div className="vx-platform-governance-list" role="region" aria-label={`${config.title}清单`}>
            <div className="vx-platform-governance-list__header">
              <span>
                <input
                  ref={pageSelectRef}
                  type="checkbox"
                  className="vx-model-select-checkbox"
                  checked={isPageSelected}
                  onChange={(event) => togglePage(event.target.checked)}
                  aria-label={`选择当前页${config.objectLabel}`}
                />
              </span>
              <span>序号</span>
              <span>{config.objectLabel}</span>
              <span>状态</span>
              <span>{config.scopeLabel}</span>
              <span>{config.ownerLabel}</span>
              <span>{config.policyLabel}</span>
              <span>更新</span>
              <span>操作</span>
            </div>
            {records.map((record, index) => {
              const meta = statusMeta[record.status];
              const selected = selectedIds.has(record.id);
              return (
                <div
                  key={record.id}
                  className={joinClasses('vx-platform-governance-row', selected ? 'vx-platform-governance-row--selected' : '')}
                  onClick={(event) => {
                    if (isInteractiveTarget(event.target)) return;
                    toggleRecord(record.id, !selected);
                  }}
                >
                  <span className="vx-platform-governance-row__select">
                    <input
                      type="checkbox"
                      className="vx-model-select-checkbox"
                      checked={selected}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => toggleRecord(record.id, event.target.checked)}
                      aria-label={`选择 ${record.name}`}
                    />
                  </span>
                  <span className="vx-platform-governance-row__index">{formatNumber(index + 1)}</span>
                  <span className="vx-platform-governance-row__identity">
                    <Icon name={config.icon} size="sm" fallback="placeholder" />
                    <span>
                      <strong>{record.name}</strong>
                      <small>{record.description}</small>
                    </span>
                  </span>
                  <span className="vx-platform-governance-row__status">
                    <Badge className={`vx-platform-governance-status ${meta.className}`}>
                      <Icon name={meta.icon} size="xs" fallback="placeholder" />
                      {meta.label}
                    </Badge>
                  </span>
                  <span>{record.scope}</span>
                  <span>{record.owner}</span>
                  <span className="vx-platform-governance-row__policy">
                    <strong>{record.policy}</strong>
                    <small>{record.tags.join(' / ')}</small>
                  </span>
                  <span className="vx-platform-governance-row__updated">{record.updatedAt}</span>
                  <GovernanceActionsMenu
                    record={record}
                    open={openMenuId === record.id}
                    onToggle={() => setOpenMenuId(openMenuId === record.id ? null : record.id)}
                    onClose={() => setOpenMenuId(null)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="vx-platform-governance-cards" aria-label={`${config.title}卡片`}>
            {records.map((record) => {
              const meta = statusMeta[record.status];
              return (
                <article key={record.id} className="vx-platform-governance-card">
                  <header>
                    <Icon name={config.icon} size="lg" fallback="placeholder" />
                    <div>
                      <strong>{record.name}</strong>
                      <span>{record.scope} · {record.owner}</span>
                    </div>
                    <Badge className={`vx-platform-governance-status ${meta.className}`}>
                      <Icon name={meta.icon} size="xs" fallback="placeholder" />
                      {meta.label}
                    </Badge>
                  </header>
                  <p>{record.description}</p>
                  <div className="vx-platform-governance-card__tags">
                    {record.tags.map((tag) => <Badge key={tag} className="vx-tenant-pill">{tag}</Badge>)}
                  </div>
                  <footer>
                    <span>{record.policy}</span>
                    <strong>{record.updatedAt}</strong>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

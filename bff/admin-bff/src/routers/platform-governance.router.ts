import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type {
  PlatformGovernanceKind,
  PlatformGovernanceRecord,
  RequestContext,
} from '../types/console.types';

@Controller('api/platform-governance')
export class PlatformGovernanceRouter {
  @Get(':kind')
  listGovernanceRecords(
    @Req() req: Request & RequestContext,
    @Param('kind') kind: PlatformGovernanceKind,
  ): PlatformGovernanceRecord[] {
    assertCanReadPlatformGovernance(req);
    return platformGovernanceRecords[kind] ?? [];
  }
}

function assertCanReadPlatformGovernance(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException('No active session');
  }

  if (
    req.capabilities &&
    !req.capabilities.includes('platform.admin.manage') &&
    !req.capabilities.includes('platform.model.manage') &&
    !req.capabilities.includes('platform.audit.read')
  ) {
    throw new ForbiddenException('Missing platform governance capability');
  }
}

const platformGovernanceRecords: Record<PlatformGovernanceKind, PlatformGovernanceRecord[]> = {
  admins: [
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
  secrets: [
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
  jobs: [
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
  approvals: [
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
};

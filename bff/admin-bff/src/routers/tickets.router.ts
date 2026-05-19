import {
  BadGatewayException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import type { Pool } from "pg";
import { ADMIN_BFF_RO_POOL } from "../tokens";
import type {
  RequestContext,
  SupportTicketRecord,
  TenantOperationTicket,
} from "../types/console.types";

@Controller("api/tickets")
export class TicketsRouter {
  constructor(@Inject(ADMIN_BFF_RO_POOL) private readonly pool: Pool) {}

  @Get()
  async listTickets(
    @Req() req: Request & RequestContext,
  ): Promise<SupportTicketRecord[]> {
    assertCanManageTickets(req);

    const tableCheck = await this.pool.query<{ table_name: string | null }>(
      "select to_regclass('support.ticket')::text as table_name",
    );
    if (!tableCheck.rows[0]?.table_name) {
      throw new BadGatewayException(
        "Support ticket database is not connected. Confirm the schema design before enabling ticket data.",
      );
    }

    const ticketRows =
      await this.pool.query<SupportTicketRow>(SUPPORT_TICKET_SQL);
    return ticketRows.rows.map(mapSupportTicketRow);
  }
}

function assertCanManageTickets(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException("No active session");
  }

  if (
    req.capabilities &&
    !req.capabilities.includes("platform.tenant.manage")
  ) {
    throw new ForbiddenException("Missing platform.tenant.manage capability");
  }
}

function normalizeTicketStatus(
  status: string,
): TenantOperationTicket["status"] {
  if (status === "open" || status === "new") return "open";
  if (
    status === "processing" ||
    status === "in_progress" ||
    status === "pending"
  )
    return "processing";
  if (status === "blocked" || status === "waiting") return "blocked";
  return "closed";
}

function normalizeTicketPriority(
  priority: string,
): TenantOperationTicket["priority"] {
  if (priority === "p0" || priority === "urgent" || priority === "critical")
    return "p0";
  if (priority === "p1" || priority === "high") return "p1";
  if (priority === "p3" || priority === "low") return "p3";
  return "p2";
}

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function mapSupportTicketRow(row: SupportTicketRow): SupportTicketRecord {
  return {
    id: row.ticket_no ?? row.id,
    title: row.title,
    status: normalizeTicketStatus(row.status),
    priority: normalizeTicketPriority(row.priority),
    updatedAt: toIso(row.updated_at),
    tenantId: row.tenant_id,
    tenantCode: row.tenant_code,
    tenantName: row.display_name ?? row.tenant_name,
    tenantType: row.tenant_type === "individual" ? "individual" : "company",
    tenantStatus: row.tenant_status,
    tenantRiskLevel:
      row.risk_level === "high"
        ? "high"
        : row.risk_level === "follow_up" || row.risk_level === "medium"
          ? "follow_up"
          : "normal",
    region: [row.province, row.city].filter(Boolean).join(" / ") || "未设置",
    industry: row.industry ?? "未设置",
    ownerName: row.owner_name ?? "未设置",
  };
}

const SUPPORT_TICKET_SQL = `
select
  ticket.id,
  ticket.ticket_no,
  ticket.title,
  ticket.status,
  ticket.priority,
  ticket.updated_at,
  tenant.id as tenant_id,
  tenant.tenant_code,
  tenant.tenant_name,
  coalesce(tenant.display_name, tenant.tenant_name) as display_name,
  tenant.tenant_type,
  tenant.status as tenant_status,
  coalesce(config.risk_level, 'normal') as risk_level,
  tenant.province,
  tenant.city,
  tenant.industry,
  coalesce(ticket.assignee_name, ticket.reporter_name, tenant.contact_name) as owner_name
from support.ticket ticket
join tenant.tenant tenant on tenant.id = ticket.tenant_id
left join tenant.tenant_setting config on config.tenant_id = tenant.id
where ticket.deleted_at is null
order by
  case ticket.priority
    when 'p0' then 0
    when 'urgent' then 0
    when 'critical' then 0
    when 'p1' then 1
    when 'high' then 1
    when 'p2' then 2
    when 'medium' then 2
    else 3
  end,
  ticket.updated_at desc
`;

interface SupportTicketRow {
  id: string;
  ticket_no: string | null;
  title: string;
  status: string;
  priority: string;
  updated_at: Date | string | null;
  tenant_id: string;
  tenant_code: string;
  tenant_name: string;
  display_name: string | null;
  tenant_type: "company" | "individual";
  tenant_status: SupportTicketRecord["tenantStatus"];
  risk_level: string;
  province: string | null;
  city: string | null;
  industry: string | null;
  owner_name: string | null;
}

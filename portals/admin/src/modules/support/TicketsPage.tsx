"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@vxture/design-system";
import type { IconName } from "@vxture/design-system";
import { fetchSupportTicketsStrict } from "@/api/admin-bff";
import { Badge, Button, Checkbox, Input, NativeSelect } from "@vxture/design-system";
import type { SupportTicketRecord, TenantOperationTicket } from "@/entities/console";
import { EmptyState } from "@/modules/shared/EmptyState";
import { PageHeader } from "@/modules/shared/PageHeader";
import {
  formatNumber,
  ticketStatusLabel,
  typeLabel,
} from "@/modules/tenants/tenant-utils";

type TicketStatusFilter = "all" | TenantOperationTicket["status"];
type TicketPriorityFilter = "all" | TenantOperationTicket["priority"];

const priorityLabels: Record<TenantOperationTicket["priority"], string> = {
  p0: "P0 紧急",
  p1: "P1 高",
  p2: "P2 中",
  p3: "P3 低",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function ticketStatusIcon(status: TenantOperationTicket["status"]): IconName {
  if (status === "open") return "clock";
  if (status === "processing") return "settings";
  if (status === "blocked") return "warning";
  return "check";
}

function ticketTone(ticket: TenantOperationTicket) {
  if (ticket.priority === "p0" || ticket.status === "blocked") return "danger";
  if (ticket.priority === "p1" || ticket.status === "open") return "warning";
  if (ticket.status === "closed") return "muted";
  return "normal";
}

function ticketSearchText(ticket: SupportTicketRecord) {
  return [
    ticket.id,
    ticket.title,
    ticket.status,
    ticket.priority,
    ticket.tenantName,
    ticket.tenantCode,
    ticket.region,
    ticket.industry,
    ticket.ownerName,
  ]
    .join(" ")
    .toLowerCase();
}

function SummaryItem({
  icon,
  label,
  value,
  tags,
  tone = "blue",
}: {
  icon: IconName;
  label: string;
  value: string;
  tags: string[];
  tone?: "blue" | "green" | "amber" | "rose";
}) {
  return (
    <article className={`vx-tenant-summary__item vx-tenant-tone--${tone}`}>
      <Icon name={icon} size="lg" fallback="placeholder" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>
          {tags.map((tag) => (
            <em key={tag}>{tag}</em>
          ))}
        </p>
      </div>
    </article>
  );
}

function TicketActionsMenu({
  ticket,
  open,
  onToggle,
  onClose,
}: {
  ticket: SupportTicketRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className="vx-tenant-actions"
      onClick={(event) => event.stopPropagation()}
      onMouseLeave={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        className="vx-tenant-actions__trigger"
        aria-label={`${ticket.title} 工单操作`}
        title="操作"
        onClick={onToggle}
      >
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </Button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <Button
            variant="ghost"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push(`/tenants/${encodeURIComponent(ticket.tenantId)}`);
            }}
          >
            <Icon name="buildings" size="xs" fallback="placeholder" />
            查看租户
          </Button>
          <Button
            variant="ghost"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push("/ops-todos");
            }}
          >
            <Icon name="table" size="xs" fallback="placeholder" />
            运营待办
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function TicketRow({
  ticket,
  index,
  selected,
  menuOpen,
  onToggleSelected,
  onOpenMenu,
  onCloseMenu,
}: {
  ticket: SupportTicketRecord;
  index: number;
  selected: boolean;
  menuOpen: boolean;
  onToggleSelected: (checked: boolean) => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
}) {
  const tone = ticketTone(ticket);
  const router = useRouter();

  return (
    <div
      className={`vx-tenant-directory-row vx-ticket-row vx-ticket-operation-row vx-commercial-row--${tone} ${selected ? "vx-ticket-operation-row--selected" : ""}`}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (
          target.closest(
            'button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]',
          )
        )
          return;
        onToggleSelected(!selected);
      }}
    >
      <span className="vx-ticket-operation-row__select">
        <Checkbox
          className="vx-model-select-checkbox"
          checked={selected}
          onCheckedChange={(value) => onToggleSelected(value === true)}
          aria-label={`选择工单 ${ticket.id}`}
        />
      </span>
      <span className="vx-tenant-directory-row__index">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="vx-commercial-row__main">
        <Button
          variant="link"
          className="vx-model-name-button"
          onClick={() =>
            router.push(`/tenants/${encodeURIComponent(ticket.tenantId)}`)
          }
        >
          {ticket.title}
        </Button>
        <small>
          {ticket.id} / {ticket.ownerName}
        </small>
      </span>
      <span className="vx-commercial-row__tenant">
        <Icon
          name={ticket.tenantType === "company" ? "buildings" : "user"}
          size="sm"
          fallback="placeholder"
        />
        <span>
          <strong>{ticket.tenantName}</strong>
          <small>
            {ticket.tenantCode} / {typeLabel(ticket.tenantType)}
          </small>
        </span>
      </span>
      <span className="vx-commercial-status-line">
        <span
          className={`vx-commercial-status-dot vx-commercial-status-dot--${tone === "danger" ? "danger" : tone === "warning" ? "warning" : tone === "muted" ? "muted" : "normal"}`}
        >
          <Icon
            name={ticketStatusIcon(ticket.status)}
            size="xs"
            fallback="placeholder"
          />
        </span>
        <Badge
          className={`vx-tenant-pill vx-commercial-pill vx-commercial-pill--${tone}`}
        >
          {ticketStatusLabel(ticket.status)}
        </Badge>
      </span>
      <span className="vx-tenant-directory-row__tag-line">
        <Badge
          className={`vx-tenant-pill vx-commercial-pill vx-commercial-pill--${tone}`}
        >
          {priorityLabels[ticket.priority]}
        </Badge>
        <Badge className="vx-tenant-pill vx-commercial-pill vx-commercial-pill--muted">
          {ticket.industry}
        </Badge>
      </span>
      <span>
        <strong>{formatDateTime(ticket.updatedAt)}</strong>
        <small>{ticket.region}</small>
      </span>
      <TicketActionsMenu
        ticket={ticket}
        open={menuOpen}
        onToggle={onOpenMenu}
        onClose={onCloseMenu}
      />
    </div>
  );
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatusFilter>("all");
  const [priority, setPriority] = useState<TicketPriorityFilter>("all");
  const [selectedTicketIds, setSelectedTicketIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setLoadError(null);

    fetchSupportTicketsStrict()
      .then((records) => {
        if (!cancelled) {
          setTickets(records);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setTickets([]);
          setLoadError(error instanceof Error ? error.message : "工单数据读取失败");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesQuery =
        !normalizedQuery || ticketSearchText(ticket).includes(normalizedQuery);
      return (
        matchesQuery &&
        (status === "all" || ticket.status === status) &&
        (priority === "all" || ticket.priority === priority)
      );
    });
  }, [priority, query, status, tickets]);

  const openTickets = tickets.filter((ticket) => ticket.status !== "closed");
  const urgentTickets = tickets.filter(
    (ticket) => ticket.priority === "p0" || ticket.priority === "p1",
  );
  const blockedTickets = tickets.filter(
    (ticket) => ticket.status === "blocked",
  );
  const affectedTenants = new Set(openTickets.map((ticket) => ticket.tenantId))
    .size;
  const visibleTicketIds = useMemo(
    () => visibleTickets.map((ticket) => `${ticket.tenantId}-${ticket.id}`),
    [visibleTickets],
  );
  const selectedVisibleTicketCount = visibleTicketIds.filter((id) =>
    selectedTicketIds.has(id),
  ).length;
  const isTicketPageSelected =
    visibleTicketIds.length > 0 &&
    selectedVisibleTicketCount === visibleTicketIds.length;

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setPriority("all");
  }

  function toggleTicketSelection(id: string, checked: boolean) {
    setSelectedTicketIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleTicketPageSelection(checked: boolean) {
    setSelectedTicketIds((current) => {
      const next = new Set(current);
      visibleTicketIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-tickets-page">
      <PageHeader
        icon="chat-circle"
        eyebrow="客户服务"
        title="工单中心"
        description="聚合租户侧待处理工单，按优先级、阻塞状态和更新时间推进支持闭环。"
        secondary={<Badge>只读聚合</Badge>}
      />

      <section className="vx-tenant-summary" aria-label="工单统计">
        <SummaryItem
          icon="chat-circle"
          label="未关闭工单"
          value={formatNumber(openTickets.length)}
          tags={[`影响租户 ${formatNumber(affectedTenants)}`]}
          tone={openTickets.length ? "amber" : "green"}
        />
        <SummaryItem
          icon="warning"
          label="P0/P1 工单"
          value={formatNumber(urgentTickets.length)}
          tags={["优先处理"]}
          tone={urgentTickets.length ? "rose" : "green"}
        />
        <SummaryItem
          icon="clock"
          label="阻塞中"
          value={formatNumber(blockedTickets.length)}
          tags={["需要协同"]}
          tone={blockedTickets.length ? "rose" : "green"}
        />
        <SummaryItem
          icon="table"
          label="工单总数"
          value={formatNumber(tickets.length)}
          tags={["来自工单数据库"]}
        />
      </section>

      <section className="vx-tenant-toolbar" aria-label="工单筛选">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索工单、租户、行业、负责人"
          className="vx-tenant-search vx-commercial-search"
          aria-label="搜索工单"
        />
        <div className="vx-tenant-toolbar__spacer" aria-hidden="true" />
        <label aria-label="状态筛选">
          <NativeSelect
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as TicketStatusFilter)
            }
          >
            <option value="all">全部状态</option>
            <option value="open">待处理</option>
            <option value="processing">处理中</option>
            <option value="blocked">搁置</option>
            <option value="closed">完成</option>
          </NativeSelect>
        </label>
        <label aria-label="优先级筛选">
          <NativeSelect
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TicketPriorityFilter)
            }
          >
            <option value="all">全部优先级</option>
            <option value="p0">P0</option>
            <option value="p1">P1</option>
            <option value="p2">P2</option>
            <option value="p3">P3</option>
          </NativeSelect>
        </label>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          重置
        </Button>
      </section>

      <section
        className="vx-tenant-directory vx-ticket-directory"
        aria-label="工单列表"
      >
        <header className="vx-tenant-directory__header">
          <strong>工单队列</strong>
          <span>{formatNumber(visibleTickets.length)} 条匹配</span>
        </header>
        {isLoading ? (
          <div className="vx-service-health-empty">
            <EmptyState
              title="正在加载工单"
              description="正在从工单数据库读取数据。"
            />
          </div>
        ) : loadError ? (
          <div className="vx-service-health-empty">
            <EmptyState
              title="工单数据读取失败"
              description={loadError}
            />
          </div>
        ) : visibleTickets.length ? (
          <div className="vx-tenant-directory-list vx-ticket-directory-list">
            <div className="vx-tenant-directory-list__header">
              <span>
                <Checkbox
                  className="vx-model-select-checkbox"
                  checked={isTicketPageSelected ? true : selectedVisibleTicketCount > 0 ? "indeterminate" : false}
                  onCheckedChange={(value) => toggleTicketPageSelection(value === true)}
                  aria-label="选择当前页工单"
                />
              </span>
              <span>#</span>
              <span>工单</span>
              <span>租户</span>
              <span>状态</span>
              <span>标签</span>
              <span>更新时间</span>
              <span>操作</span>
            </div>
            {visibleTickets.map((ticket, index) => {
              const ticketKey = `${ticket.tenantId}-${ticket.id}`;

              return (
                <TicketRow
                  key={ticketKey}
                  ticket={ticket}
                  index={index}
                  selected={selectedTicketIds.has(ticketKey)}
                  menuOpen={openMenuId === ticketKey}
                  onToggleSelected={(checked) =>
                    toggleTicketSelection(ticketKey, checked)
                  }
                  onOpenMenu={() =>
                    setOpenMenuId((current) =>
                      current === ticketKey ? null : ticketKey,
                    )
                  }
                  onCloseMenu={() => setOpenMenuId(null)}
                />
              );
            })}
          </div>
        ) : (
          <div className="vx-service-health-empty">
            <EmptyState
              title="没有匹配的工单"
              description="调整筛选条件，或重置后查看全部工单。"
              action={
                <Button variant="outline" onClick={resetFilters}>
                  重置
                </Button>
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}

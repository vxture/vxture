"use client";

import { useState, type CSSProperties, type FC, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "overview" | "flow" | "thirdparty" | "modules";

interface ThirdParty {
  name: string;
  tag: string;
  desc: string;
  color: string;
  free: boolean;
}

interface Protocol {
  name: string;
  desc: string;
}

interface SocialLogin {
  name: string;
  icon: string;
  color: string;
  type: string;
}

interface CoreService {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: string[];
  business: string;
}

interface BizModule {
  name: string;
  icon: string;
  desc: string;
}

interface StorageItem {
  name: string;
  icon: string;
  tech: string;
}

interface FlowStep {
  step: string;
  label: string;
  sub: string;
}

interface Tab {
  id: TabId;
  label: string;
}

interface PlatformPoint {
  name: string;
  color: string;
  icon: string;
  points: string[];
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const thirdParty: ThirdParty[] = [
  {
    name: "Authing",
    tag: "免费额度",
    desc: "支持钉钉、飞书、微信，月活5000免费，国内最成熟",
    color: "#6366f1",
    free: true,
  },
  {
    name: "Casdoor",
    tag: "完全开源",
    desc: "开源 IAM，原生支持三平台 OAuth，可私有化部署",
    color: "#0ea5e9",
    free: true,
  },
  {
    name: "Logto",
    tag: "开源 / 云版",
    desc: "现代 OIDC 服务，社区版免费，支持自定义社交登录",
    color: "#8b5cf6",
    free: true,
  },
  {
    name: "Keycloak",
    tag: "完全开源",
    desc: "企业级开源 IdP，通过插件接入钉钉/飞书/微信",
    color: "#10b981",
    free: true,
  },
];

const protocols: Protocol[] = [
  { name: "OAuth 2.0", desc: "授权框架" },
  { name: "OIDC", desc: "身份层" },
  { name: "SAML 2.0", desc: "企业 SSO" },
  { name: "JWT", desc: "令牌标准" },
  { name: "MFA / TOTP", desc: "多因素认证" },
];

const socialLogin: SocialLogin[] = [
  { name: "钉钉", icon: "🔷", color: "#1677ff", type: "企业" },
  { name: "飞书", icon: "🟢", color: "#0fc86f", type: "企业" },
  { name: "微信", icon: "💬", color: "#07c160", type: "C端" },
  { name: "微信企业", icon: "🏢", color: "#1aad19", type: "企业" },
  { name: "手机号", icon: "📱", color: "#f59e0b", type: "通用" },
  { name: "邮箱密码", icon: "📧", color: "#6b7280", type: "通用" },
];

const coreServices: CoreService[] = [
  {
    id: "account",
    name: "账户系统",
    icon: "👤",
    color: "#6366f1",
    items: ["用户注册/登录", "账户绑定/解绑", "账户合并", "个人信息管理"],
    business: "账户系统",
  },
  {
    id: "sso",
    name: "SSO 单点登录",
    icon: "🔑",
    color: "#0ea5e9",
    items: ["统一登录入口", "Token 下发", "会话管理", "跨域 SSO"],
    business: "账户系统",
  },
  {
    id: "rbac",
    name: "权限管理 RBAC",
    icon: "🛡️",
    color: "#8b5cf6",
    items: ["角色定义", "权限分配", "资源鉴权", "数据权限"],
    business: "权限管理",
  },
  {
    id: "tenant",
    name: "租户隔离",
    icon: "🏢",
    color: "#10b981",
    items: ["租户注册", "成员管理", "租户 SSO", "配额管理"],
    business: "租户平台",
  },
  {
    id: "subscription",
    name: "订阅授权",
    icon: "💳",
    color: "#f59e0b",
    items: ["套餐绑定", "授权校验", "用量统计", "到期处理"],
    business: "订阅授权",
  },
  {
    id: "audit",
    name: "审计日志",
    icon: "📋",
    color: "#ef4444",
    items: ["登录记录", "操作日志", "安全告警", "合规报告"],
    business: "系统监测",
  },
];

const bizModules: BizModule[] = [
  { name: "企业官网", icon: "🌐", desc: "营销/注册入口" },
  { name: "运营平台", icon: "⚙️", desc: "内部管理后台" },
  { name: "租户平台", icon: "🏢", desc: "租户自助控制台" },
  { name: "工单系统", icon: "🎫", desc: "客服支持" },
  { name: "智能体服务", icon: "🤖", desc: "AI 业务入口" },
  { name: "大模型接入", icon: "🧠", desc: "LLM API 鉴权" },
  { name: "系统监测", icon: "📊", desc: "监控告警" },
];

const storage: StorageItem[] = [
  { name: "用户数据库", icon: "🗄️", tech: "PostgreSQL" },
  { name: "Session Store", icon: "⚡", tech: "Redis" },
  { name: "Token Store", icon: "🔐", tech: "Redis" },
  { name: "审计日志库", icon: "📁", tech: "ClickHouse" },
];

const flowSteps: FlowStep[] = [
  { step: "1", label: "用户发起登录", sub: "任意业务入口" },
  { step: "2", label: "重定向 SSO", sub: "统一认证中心" },
  { step: "3", label: "选择认证方式", sub: "钉钉/飞书/微信/账密" },
  { step: "4", label: "三方 OAuth", sub: "跳转三方授权页" },
  { step: "5", label: "回调 & 账号关联", sub: "绑定或创建账号" },
  { step: "6", label: "颁发 JWT Token", sub: "含角色/租户信息" },
  { step: "7", label: "鉴权 & 业务访问", sub: "RBAC 权限校验" },
];

const tabs: Tab[] = [
  { id: "overview", label: "总体架构" },
  { id: "flow", label: "登录流程" },
  { id: "thirdparty", label: "三方接入" },
  { id: "modules", label: "模块清单" },
];

const moduleRows: string[][] = [
  ["企业官网", "邮箱/手机号", "访客/注册用户", "微信快速注册", "可匿名访问"],
  ["运营平台", "邮箱+MFA", "超级管理员/运营", "❌ 仅内部账号", "IP 白名单限制"],
  ["租户平台", "SSO 统一登录", "租户管理员/成员", "钉钉/飞书企业登录", "按租户隔离"],
  ["账户系统", "—（核心服务）", "—", "OAuth Provider", "IAM 核心"],
  ["权限管理", "SSO Token", "平台管理员", "❌", "RBAC 控制台"],
  ["订阅授权", "API Key / Token", "账单管理员", "❌", "关联订阅验证"],
  ["工单系统", "SSO 单点登录", "普通用户/客服", "微信/钉钉通知", "客服独立角色"],
  ["系统监测", "SSO+MFA", "SRE/管理员", "❌ 仅内部", "告警通道对接"],
  ["智能体服务", "JWT / API Key", "租户用户/API", "三方账号鉴权", "用量与授权绑定"],
  ["大模型接入", "API Key", "系统级", "❌", "速率限制+授权校验"],
];

const platformPoints: PlatformPoint[] = [
  {
    name: "钉钉",
    color: "#1677ff",
    icon: "🔷",
    points: ["企业内部应用免费", "corpId 识别租户", "扫码/免密登录", "通讯录同步"],
  },
  {
    name: "飞书",
    color: "#0fc86f",
    icon: "🟢",
    points: ["企业自建应用免费", "tenant_key 识别", "SSO 套件完善", "机器人通知"],
  },
  {
    name: "微信",
    color: "#07c160",
    icon: "💬",
    points: ["开放平台需认证", "UnionID 统一体系", "小程序/公众号互通", "企业微信分开接入"],
  },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

interface LayerBoxProps {
  title: string;
  color: string;
  children: ReactNode;
}

const LayerBox: FC<LayerBoxProps> = ({ title, color, children }) => (
  <div
    style={{
      border: `1px solid ${color}33`,
      borderRadius: "14px",
      overflow: "hidden",
      marginBottom: "4px",
    }}
  >
    <div
      style={{
        background: `${color}18`,
        padding: "8px 16px",
        fontSize: "11px",
        fontWeight: 700,
        color,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        borderBottom: `1px solid ${color}22`,
      }}
    >
      {title}
    </div>
    <div style={{ padding: "16px" }}>{children}</div>
  </div>
);

const Arrow: FC = () => (
  <div
    style={{
      textAlign: "center",
      fontSize: "18px",
      color: "#334155",
      margin: "6px 0",
      lineHeight: 1,
    }}
  >
    ↓
  </div>
);

// ─── Tab Views ────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  hoveredService: string | null;
  onHover: (id: string | null) => void;
}

const OverviewTab: FC<OverviewTabProps> = ({ hoveredService, onHover }) => (
  <div style={{ maxWidth: 960, margin: "0 auto" }}>
    {/* 接入层 */}
    <LayerBox title="接入层 · 社交 & 密码登录" color="#1677ff">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        {socialLogin.map((s) => (
          <div
            key={s.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${s.color}44`,
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "13px",
            }}
          >
            <span>{s.icon}</span>
            <span style={{ color: s.color, fontWeight: 600 }}>{s.name}</span>
            <span
              style={{
                fontSize: "10px",
                background: `${s.color}22`,
                color: s.color,
                borderRadius: "4px",
                padding: "1px 5px",
              }}
            >
              {s.type}
            </span>
          </div>
        ))}
      </div>
    </LayerBox>

    <Arrow />

    {/* 认证协议层 */}
    <LayerBox title="认证协议层 · Standards" color="#0ea5e9">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        {protocols.map((p) => (
          <div
            key={p.name}
            style={{
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.25)",
              borderRadius: "8px",
              padding: "6px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "13px", color: "#38bdf8" }}>{p.name}</div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>{p.desc}</div>
          </div>
        ))}
      </div>
    </LayerBox>

    <Arrow />

    {/* 核心服务层 */}
    <LayerBox title="核心服务层 · Core Services" color="#8b5cf6">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {coreServices.map((s) => (
          <div
            key={s.id}
            onMouseEnter={() => onHover(s.id)}
            onMouseLeave={() => onHover(null)}
            style={{
              background: hoveredService === s.id ? `${s.color}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${hoveredService === s.id ? s.color + "60" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "10px",
              padding: "12px",
              cursor: "default",
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
              <span style={{ fontSize: "18px" }}>{s.icon}</span>
              <span style={{ fontWeight: 600, fontSize: "13px", color: s.color }}>{s.name}</span>
            </div>
            {s.items.map((item) => (
              <div
                key={item}
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  padding: "2px 0",
                  borderLeft: `2px solid ${s.color}44`,
                  paddingLeft: "7px",
                  marginBottom: "2px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </LayerBox>

    <Arrow />

    {/* 业务接入层 */}
    <LayerBox title="业务接入层 · Business Modules" color="#10b981">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        {bizModules.map((b) => (
          <div
            key={b.name}
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "8px",
              padding: "8px 14px",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <div style={{ fontSize: "18px", marginBottom: "2px" }}>{b.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "12px", color: "#34d399" }}>{b.name}</div>
            <div style={{ fontSize: "10px", color: "#475569" }}>{b.desc}</div>
          </div>
        ))}
      </div>
    </LayerBox>

    <Arrow />

    {/* 数据存储层 */}
    <LayerBox title="数据存储层 · Storage" color="#f59e0b">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
        {storage.map((s) => (
          <div
            key={s.name}
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "8px",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px" }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#fbbf24" }}>{s.name}</div>
              <div style={{ fontSize: "10px", color: "#64748b" }}>{s.tech}</div>
            </div>
          </div>
        ))}
      </div>
    </LayerBox>
  </div>
);

const FlowTab: FC = () => (
  <div style={{ maxWidth: 760, margin: "0 auto" }}>
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "28px",
      }}
    >
      <h3
        style={{ margin: "0 0 24px", fontSize: "15px", color: "#94a3b8", textAlign: "center" }}
      >
        三方 OAuth 统一登录时序（以钉钉/飞书/微信为例）
      </h3>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {flowSteps.map((f, i) => (
          <div key={f.step} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                {f.step}
              </div>
              {i < flowSteps.length - 1 && (
                <div
                  style={{
                    width: 2,
                    height: 36,
                    background: "rgba(99,102,241,0.3)",
                    margin: "2px 0",
                  }}
                />
              )}
            </div>
            <div
              style={{
                paddingTop: "6px",
                paddingBottom: i < flowSteps.length - 1 ? "4px" : 0,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#e2e8f0" }}>
                {f.label}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "28px",
          padding: "14px 16px",
          background: "rgba(99,102,241,0.08)",
          borderRadius: "10px",
          border: "1px solid rgba(99,102,241,0.2)",
          fontSize: "12px",
          color: "#94a3b8",
          lineHeight: 1.8,
        }}
      >
        <strong style={{ color: "#a5b4fc" }}>关键设计：</strong>
        <br />· SSO 中心统一颁发 Token，各业务系统无需独立实现认证
        <br />· Token 内嵌 tenant_id + roles，业务层只做鉴权不做认证
        <br />· 同一手机号/邮箱可绑定多个三方账号（账号合并）
        <br />· 钉钉/飞书通过企业 corpId 实现租户自动识别
      </div>
    </div>
  </div>
);

const ThirdPartyTab: FC = () => (
  <div style={{ maxWidth: 860, margin: "0 auto" }}>
    <div style={{ textAlign: "center", marginBottom: "20px", color: "#64748b", fontSize: "13px" }}>
      推荐使用以下开源 / 免费 IAM 服务对接三方账号，避免自研成本
    </div>

    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}
    >
      {thirdParty.map((t) => (
        <div
          key={t.name}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${t.color}33`,
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ fontWeight: 700, fontSize: "18px", color: t.color }}>{t.name}</div>
            <span
              style={{
                fontSize: "10px",
                background: `${t.color}22`,
                color: t.color,
                borderRadius: "4px",
                padding: "2px 7px",
                fontWeight: 600,
              }}
            >
              {t.tag}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>{t.desc}</p>
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
      {platformPoints.map((p) => (
        <div
          key={p.name}
          style={{
            background: `${p.color}0a`,
            border: `1px solid ${p.color}30`,
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <span style={{ fontSize: "16px" }}>{p.icon}</span>
            <span style={{ fontWeight: 700, color: p.color }}>{p.name} 接入要点</span>
          </div>
          {p.points.map((pt) => (
            <div
              key={pt}
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                padding: "3px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              · {pt}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const ModulesTab: FC = () => (
  <div style={{ maxWidth: 860, margin: "0 auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          {["业务模块", "认证方式", "权限层级", "三方接入", "备注"].map((h) => (
            <th
              key={h}
              style={{
                padding: "10px 14px",
                textAlign: "left",
                color: "#64748b",
                fontWeight: 600,
                fontSize: "11px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {moduleRows.map((row, i) => (
          <tr
            key={i}
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            {row.map((cell, j) => (
              <td
                key={j}
                style={{
                  padding: "10px 14px",
                  color: j === 0 ? "#e2e8f0" : "#94a3b8",
                  fontWeight: j === 0 ? 600 : 400,
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Page Component ───────────────────────────────────────────────────────────

/**
 * AuthArchitecture
 *
 * Next.js 15 App Router · React 19 · TypeScript 5
 *
 * Usage (App Router):
 *   Place in: app/auth-architecture/page.tsx
 *   Or use as a Client Component in any layout.
 *
 * The "use client" directive at the top is required because this component
 * uses useState. In Next.js 15 App Router all components are Server Components
 * by default; this directive opts into the Client Component boundary.
 */
export default function AuthArchitecture() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    background: "#0a0e1a",
    color: "#e2e8f0",
    fontFamily: "'SF Pro Display', 'PingFang SC', system-ui, sans-serif",
    padding: "24px",
  };

  return (
    <div style={pageStyle}>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "20px",
            padding: "4px 14px",
            marginBottom: "16px",
            fontSize: "12px",
            color: "#a5b4fc",
            letterSpacing: "0.05em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#6366f1",
              display: "inline-block",
            }}
          />
          ARCHITECTURE DESIGN · v0.1 概要规划
        </div>
        <h1
          style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}
        >
          账号验证体系架构设计
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          统一身份认证平台 · IAM / SSO / OAuth2
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "28px" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "7px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              transition: "all 0.2s",
              background: activeTab === t.id ? "#6366f1" : "rgba(255,255,255,0.06)",
              color: activeTab === t.id ? "#fff" : "#94a3b8",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "overview" && (
        <OverviewTab hoveredService={hoveredService} onHover={setHoveredService} />
      )}
      {activeTab === "flow" && <FlowTab />}
      {activeTab === "thirdparty" && <ThirdPartyTab />}
      {activeTab === "modules" && <ModulesTab />}

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", marginTop: "36px", fontSize: "11px", color: "#334155" }}>
        概要架构规划 · 静态仿真版本 · 可根据实际技术选型调整
      </div>
    </div>
  );
}
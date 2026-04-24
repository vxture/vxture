import http from 'node:http';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { URL } from 'node:url';

// ─── 全局常量 ──────────────────────────────────────────────────────────────────

const ROOT_DIR        = 'D:\\MyWebSite\\vxture';
const PANEL_PORT      = Number(process.env.DEV_PANEL_PORT ?? 8090);
const MAX_LOG_LINES   = 300;
const START_WAIT_TIMEOUT_MS  = 30_000;
const START_WAIT_INTERVAL_MS = 1_000;

// ─── 服务清单 ──────────────────────────────────────────────────────────────────

/** @type {Array<{id:string,name:string,port:number,url:string,command:string,priority:number,healthChecks:Array<{label:string,url:string,okStatuses:number[]}>}>} */
const SERVICES = [
  {
    id: 'website-bff',
    name: 'Website BFF',
    port: 3001,
    priority: 0,                              // P0 — 最高优先级，前置依赖
    url: 'http://localhost:3001',
    command: 'pnpm --filter @vxture/bff-website dev',
    healthChecks: [
      { label: 'healthz',  url: 'http://localhost:3001/healthz',       okStatuses: [200] },
      { label: 'auth.me',  url: 'http://localhost:3001/api/auth/me',   okStatuses: [401] },
    ],
  },
  {
    id: 'console-bff',
    name: 'Console BFF',
    port: 3003,
    priority: 0,                              // P0 — 最高优先级，前置依赖
    url: 'http://localhost:3003',
    command: 'pnpm --filter @vxture/bff-console dev',
    healthChecks: [
      { label: 'healthz',     url: 'http://localhost:3003/healthz',            okStatuses: [200] },
      { label: 'auth.session', url: 'http://localhost:3003/api/auth/session',   okStatuses: [401] },
    ],
  },
  {
    id: 'gateway',
    name: 'Gateway BFF',
    port: 8000,
    priority: 1,                              // P1 — 依赖 website-bff + console-bff
    url: 'http://localhost:8000',
    command: 'pnpm dev:gateway',
    healthChecks: [
      { label: 'healthz',      url: 'http://localhost:8000/healthz',                          okStatuses: [200] },
      { label: 'website-api',  url: 'http://localhost:8000/website-api/api/auth/me',          okStatuses: [401] },
      { label: 'console-api',  url: 'http://localhost:8000/console-api/api/auth/session',     okStatuses: [401] },
    ],
  },
  {
    id: 'website',
    name: 'Website',
    port: 3000,
    priority: 2,                              // P2 — 依赖 gateway
    url: 'http://localhost:3000',
    command: 'pnpm --filter @vxture/website dev',
    healthChecks: [
      { label: 'home',    url: 'http://localhost:3000',               okStatuses: [200, 307, 308] },
      { label: 'signin',  url: 'http://localhost:3000/zh-CN/signin',  okStatuses: [200, 307, 308] },
    ],
  },
  {
    id: 'console',
    name: 'Console',
    port: 3002,
    priority: 2,                              // P2 — 依赖 gateway
    url: 'http://localhost:3002',
    command: 'pnpm --filter @vxture/console dev',
    healthChecks: [
      { label: 'home',   url: 'http://localhost:3002',          okStatuses: [200, 307, 308] },
      { label: 'login',  url: 'http://localhost:3002/login',    okStatuses: [200] },
    ],
  },
];

/** 启动顺序（按优先级顺序逐级等待健康） */
const START_ORDER = ['website-bff', 'console-bff', 'gateway', 'website', 'console'];

// ─── 运行时状态 ─────────────────────────────────────────────────────────────────

const runtime = new Map(
  SERVICES.map((service) => [
    service.id,
    {
      child:     null,
      logs:      [],
      startedAt: null,   // ISO 字符串，首次 spawn 时记录
      stopping:  false,
    },
  ]),
);

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function shellForPlatform(command) {
  return process.platform === 'win32'
    ? { file: 'cmd.exe', args: ['/d', '/s', '/c', command] }
    : { file: 'sh', args: ['-lc', command] };
}

function appendLog(serviceId, line) {
  const state = runtime.get(serviceId);
  if (!state) return;

  const chunks = String(line)
    .replace(/\r/g, '')
    .split('\n')
    .map((item) => item.trimEnd())
    .filter(Boolean);

  state.logs.push(...chunks);
  if (state.logs.length > MAX_LOG_LINES) {
    state.logs.splice(0, state.logs.length - MAX_LOG_LINES);
  }
}

function findService(serviceId) {
  return SERVICES.find((item) => item.id === serviceId) ?? null;
}

function checkPort(port) {
  return new Promise((resolve) => {
    const socket  = new net.Socket();
    const finish  = (value) => { socket.destroy(); resolve(value); };

    socket.setTimeout(500);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error',   () => finish(false));
    socket.connect(port, '127.0.0.1');
  });
}

/** 格式化毫秒为 "Xh Xm Xs" 可读字符串 */
function formatUptime(ms) {
  if (ms < 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── 健康检查 ──────────────────────────────────────────────────────────────────

async function runHealthChecks(service) {
  const checks = service.healthChecks ?? [];
  return Promise.all(
    checks.map(async (check) => {
      const t0 = Date.now();
      try {
        const response = await fetch(check.url, { method: 'GET', redirect: 'manual' });
        return {
          label:      check.label,
          url:        check.url,
          status:     response.status,
          okStatuses: check.okStatuses,
          durationMs: Date.now() - t0,
          ok:         check.okStatuses.includes(response.status),
        };
      } catch {
        return {
          label:      check.label,
          url:        check.url,
          status:     null,
          okStatuses: check.okStatuses,
          durationMs: Date.now() - t0,
          ok:         false,
        };
      }
    }),
  );
}

async function getServiceSnapshot(service) {
  const state     = runtime.get(service.id);
  const listening = await checkPort(service.port);
  const running   = Boolean(state?.child && !state.child.killed);
  const health    = await runHealthChecks(service);
  const uptimeMs  = state?.startedAt ? Date.now() - new Date(state.startedAt).getTime() : null;

  return {
    id:         service.id,
    name:       service.name,
    port:       service.port,
    priority:   service.priority,
    url:        service.url,
    command:    service.command,
    running,
    listening,
    healthy:    health.every((item) => item.ok),
    health,
    pid:        state?.child?.pid ?? null,
    startedAt:  state?.startedAt ?? null,
    uptimeMs,
    uptime:     uptimeMs !== null ? formatUptime(uptimeMs) : null,
    stopping:   Boolean(state?.stopping),
    logs:       state?.logs ?? [],
  };
}

// ─── 服务生命周期 ──────────────────────────────────────────────────────────────

function startService(service) {
  const state = runtime.get(service.id);
  if (!state) throw new Error(`Unknown service: ${service.id}`);
  if (state.child && !state.child.killed) return;

  const shell = shellForPlatform(service.command);
  const child = spawn(shell.file, shell.args, {
    cwd:         ROOT_DIR,
    env:         process.env,
    windowsHide: true,
  });

  state.child     = child;
  state.logs      = [];
  state.startedAt = new Date().toISOString();
  state.stopping  = false;

  appendLog(service.id, `[panel] starting: ${service.command}`);

  child.stdout?.on('data', (chunk) => appendLog(service.id, chunk));
  child.stderr?.on('data', (chunk) => appendLog(service.id, chunk));

  child.on('exit', (code, signal) => {
    appendLog(service.id, `[panel] exited code=${code ?? 'null'} signal=${signal ?? 'null'}`);
    const current = runtime.get(service.id);
    if (current) {
      current.child    = null;
      current.stopping = false;
    }
  });
}

function stopService(service) {
  const state = runtime.get(service.id);
  if (!state?.child || state.child.killed) return;

  state.stopping = true;
  appendLog(service.id, '[panel] stopping service tree');

  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(state.child.pid), '/t', '/f'], { windowsHide: true });
    killer.on('exit', () => {
      const current = runtime.get(service.id);
      if (current) current.stopping = false;
    });
    return;
  }

  state.child.kill('SIGTERM');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealthy(serviceId, timeoutMs = START_WAIT_TIMEOUT_MS) {
  const service = findService(serviceId);
  if (!service) return false;

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const snapshot = await getServiceSnapshot(service);
    if (snapshot.listening && snapshot.healthy) return true;
    await sleep(START_WAIT_INTERVAL_MS);
  }
  return false;
}

async function startAllOrdered() {
  for (const serviceId of START_ORDER) {
    const service = findService(serviceId);
    if (!service) continue;
    startService(service);
    appendLog(service.id, '[panel] waiting for health checks');
    const ready = await waitForHealthy(service.id);
    appendLog(service.id, ready ? '[panel] service is healthy' : '[panel] health wait timed out');
  }
}

function stopAll() {
  for (const serviceId of [...START_ORDER].reverse()) {
    const service = findService(serviceId);
    if (service) stopService(service);
  }
}

// ─── HTTP 工具 ─────────────────────────────────────────────────────────────────

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

// ─── HTML 面板 ─────────────────────────────────────────────────────────────────

function pageHtml() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vxture Dev Panel</title>
  <style>
    :root {
      --bg:         #eef3f1;
      --panel:      #ffffff;
      --ink:        #10211d;
      --muted:      #5e6f69;
      --line:       #d7e2de;
      --ok:         #1b8a5a;
      --warn:       #b76c00;
      --off:        #8d3b3b;
      --brand:      #0f766e;
      --brand-soft: #dbf4ef;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: var(--ink);
      background: radial-gradient(circle at top left, #ffffff 0, #eef3f1 42%, #e4ece8 100%);
    }

    /* ── 布局 ── */
    .wrap {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 80px;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-end;
      margin-bottom: 32px;
    }
    .hero h1 { margin: 0; font-size: 34px; line-height: 1.1; letter-spacing: -0.03em; }
    .hero p  { margin: 8px 0 0; color: var(--muted); font-size: 15px; }

    .toolbar { display: flex; gap: 12px; flex-wrap: wrap; }
    button {
      border: 0; border-radius: 999px; padding: 10px 18px;
      cursor: pointer; font: inherit;
    }
    .ghost   { background: #fff; color: var(--ink); border: 1px solid var(--line); }
    .primary { background: var(--brand); color: #fff; box-shadow: 0 10px 20px rgba(15,118,110,.18); }

    /* ── 服务列表 ── */
    .list { display: flex; flex-direction: column; gap: 12px; }

    /* ── 卡片 ── */
    .card {
      background: rgba(255,255,255,.97);
      border: 1px solid rgba(215,226,222,.9);
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(16,33,29,.06);
      overflow: hidden;
      transition: box-shadow .15s;
    }
    .card:hover { box-shadow: 0 8px 28px rgba(16,33,29,.10); }

    /* ── 卡片头部：两行结构 ── */
    .card-head {
      padding: 20px 28px 18px;
      cursor: pointer;
      user-select: none;
    }
    .card-head:hover { background: rgba(15,118,110,.025); }

    /* 第一行：优先级 + 服务名 + 状态 + 箭头 */
    .head-row1 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    /* 第二行：健康检查胶囊 + 操作按钮（右对齐） */
    .head-row2 {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* 优先级徽章 */
    .priority {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .05em;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .p0 { background: #fdeaea; color: var(--off); }
    .p1 { background: #fff2df; color: var(--warn); }
    .p2 { background: var(--brand-soft); color: var(--brand); }

    /* 服务名 + 元信息（占满剩余宽度） */
    .info { flex: 1; min-width: 0; }
    .name { font-size: 17px; font-weight: 700; letter-spacing: -.015em; }
    .meta {
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 状态标签 —— 带左侧色块竖线 + 底色 */
    .status {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      border-left: 3px solid transparent;
    }
    .status::before {
      content: '';
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    /* 运行中：绿色 */
    .status.on {
      background: #e8f7ef;
      color: #1b8a5a;
      border-left-color: #1b8a5a;
    }
    .status.on::before { background: #1b8a5a; }
    /* 启动中 / 停止中：橙色 */
    .status.wait {
      background: #fff6e6;
      color: #b76c00;
      border-left-color: #f59e0b;
    }
    .status.wait::before { background: #f59e0b; animation: pulse .9s ease-in-out infinite; }
    /* 未启动：红色 */
    .status.off {
      background: #fdf2f2;
      color: #8d3b3b;
      border-left-color: #e05252;
    }
    .status.off::before { background: #e05252; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: .3; }
    }

    /* 折叠箭头 */
    .chevron {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      transition: transform .2s;
      font-size: 13px;
    }
    .card.open .chevron { transform: rotate(180deg); }

    /* 健康检查胶囊区域（占满剩余宽度） */
    .health-row {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .health-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid var(--line);
      background: #f4f8f7;
      color: var(--muted);
      white-space: nowrap;
    }
    .health-item .hi-url { font-weight: 400; opacity: .65; font-size: 11px; }
    .health-item .hi-dur { opacity: .55; font-size: 11px; }
    .health-item.ok  { background: #e8f7ef; color: var(--ok);  border-color: #b8e8cf; }
    .health-item.bad { background: #fdeaea; color: var(--off); border-color: #f4c0c0; }

    /* 操作按钮组（右侧，不参与 flex 拉伸） */
    .actions { display: flex; gap: 8px; flex-shrink: 0; }
    .actions button { border-radius: 10px; padding: 8px 14px; font-size: 13px; }
    .btn-start   { background: var(--brand); color: #fff; }
    .btn-stop    { background: #f4dfdf; color: var(--off); }
    .btn-restart { background: #e3efff; color: #1d4ed8; }
    .btn-open    { background: var(--brand-soft); color: var(--brand); }

    /* ── 展开区域（日志 + 元信息） ── */
    .card-body {
      display: none;
      padding: 0 28px 24px;
      border-top: 1px solid var(--line);
    }
    .card.open .card-body { display: block; }

    .body-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      padding: 16px 0 14px;
      font-size: 13px;
      color: var(--muted);
    }
    .body-meta span { display: flex; gap: 6px; align-items: center; }
    .body-meta b { color: var(--ink); font-weight: 600; }

    pre.log-box {
      margin: 0;
      padding: 16px 18px;
      height: 380px;
      overflow: auto;
      border-radius: 14px;
      background: #0f1715;
      color: #d7eee7;
      font: 12.5px/1.6 Consolas, "SFMono-Regular", monospace;
      white-space: pre-wrap;
      word-break: break-word;
    }

    @media (max-width: 860px) {
      .wrap { padding: 24px 32px; }
      .hero { flex-direction: column; align-items: stretch; }
      .actions button { padding: 7px 10px; font-size: 12px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <div>
        <h1>Vxture Dev Panel</h1>
        <p>本地开发服务控制台。统一启动、停止、重启并查看服务日志。</p>
      </div>
      <div class="toolbar">
        <button class="primary" onclick="bulkAction('start')">全部启动</button>
        <button class="ghost"   onclick="bulkAction('stop')">全部停止</button>
        <button class="ghost"   onclick="loadServices()">刷新状态</button>
      </div>
    </div>
    <div id="list" class="list"></div>
  </div>

  <script>
    /* ── 已展开的卡片 id 集合（刷新时保留展开状态） ── */
    const openSet = new Set();

    async function request(path, options = {}) {
      const response = await fetch(path, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
      });
      if (!response.ok) throw new Error('request failed');
      return response.json();
    }

    function statusClass(s) {
      if (s.listening && s.healthy)   return 'on';
      if (s.listening && !s.healthy)  return 'wait';
      if (s.stopping)                 return 'wait';
      if (s.running)                  return 'wait';
      return 'off';
    }

    function statusText(s) {
      if (s.listening && s.healthy)   return '健康';
      if (s.listening && !s.healthy)  return '未就绪';
      if (s.stopping)                 return '停止中';
      if (s.running)                  return '启动中';
      return '已停止';
    }

    function escapeHtml(v) {
      return String(v)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
    }

    function priorityBadge(p) {
      const cls = ['p0','p1','p2'][p] ?? 'p2';
      return \`<span class="priority \${cls}">P\${p}</span>\`;
    }

    function renderHealth(health) {
      return health.map((item) => {
        const cls = item.ok ? 'ok' : 'bad';
        const dot = item.ok ? '●' : '✕';
        const dur = item.durationMs != null ? \`<span class="hi-dur">\${item.durationMs}ms</span>\` : '';
        const exp = item.okStatuses ? \`<span class="hi-url">(\${item.okStatuses.join('/')})</span>\` : '';
        return \`<span class="health-item \${cls}" title="\${escapeHtml(item.url)}">\${dot} \${escapeHtml(item.label)}: \${item.status ?? 'down'} \${exp} \${dur}</span>\`;
      }).join('');
    }

    function renderCard(s) {
      const isOpen = openSet.has(s.id);
      return \`
        <div class="card\${isOpen ? ' open' : ''}" id="card-\${s.id}">
          <div class="card-head" onclick="toggleCard('\${s.id}')">
            <!-- 第一行：优先级徽章 + 服务名/命令 + 状态 + 箭头 -->
            <div class="head-row1">
              \${priorityBadge(s.priority)}
              <div class="info">
                <div class="name">\${escapeHtml(s.name)}</div>
                <div class="meta">:\${s.port} &nbsp;·&nbsp; \${escapeHtml(s.command)}</div>
              </div>
              <div class="status \${statusClass(s)}">\${statusText(s)}</div>
              <div class="chevron">▼</div>
            </div>
            <!-- 第二行：健康检查胶囊（左）+ 操作按钮（右） -->
            <div class="head-row2" onclick="event.stopPropagation()">
              <div class="health-row">\${renderHealth(s.health)}</div>
              <div class="actions">
                <button class="btn-start"   onclick="serviceAction('\${s.id}','start')">启动</button>
                <button class="btn-stop"    onclick="serviceAction('\${s.id}','stop')">停止</button>
                <button class="btn-restart" onclick="serviceAction('\${s.id}','restart')">重启</button>
                <button class="btn-open"    onclick="window.open('\${escapeHtml(s.url)}','_blank')">打开</button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="body-meta">
              <span>PID <b>\${s.pid ?? '-'}</b></span>
              <span>端口 <b>\${s.port}</b></span>
              <span>运行时长 <b>\${s.uptime ?? '-'}</b></span>
              <span>启动于 <b>\${s.startedAt ? new Date(s.startedAt).toLocaleTimeString('zh-CN') : '-'}</b></span>
            </div>
            <pre class="log-box" id="log-\${s.id}">\${escapeHtml(s.logs.length ? s.logs.join('\\n') : '[no logs yet]')}</pre>
          </div>
        </div>
      \`;
    }

    function render(services) {
      /* 仅更新已存在卡片的内容，保留滚动位置；不存在则整体重建 */
      const list = document.getElementById('list');
      const existing = new Set([...list.querySelectorAll('.card')].map((el) => el.id));
      const incoming = new Set(services.map((s) => \`card-\${s.id}\`));

      /* 结构发生变化时（服务新增/删除）整体重渲 */
      const sameStructure = existing.size === incoming.size && [...incoming].every((id) => existing.has(id));
      if (!sameStructure) {
        list.innerHTML = services.map(renderCard).join('');
        return;
      }

      /* 结构不变时局部更新，避免日志区滚动位置跳动 */
      for (const s of services) {
        const card = document.getElementById(\`card-\${s.id}\`);
        if (!card) continue;

        /* 更新开合状态 */
        card.classList.toggle('open', openSet.has(s.id));

        /* 更新状态标签 */
        const statusEl = card.querySelector('.status');
        if (statusEl) {
          statusEl.className = \`status \${statusClass(s)}\`;
          statusEl.textContent = statusText(s);
        }

        /* 更新健康检查胶囊 */
        const healthRow = card.querySelector('.health-row');
        if (healthRow) healthRow.innerHTML = renderHealth(s.health);

        /* 更新 body-meta */
        const meta = card.querySelector('.body-meta');
        if (meta) {
          meta.innerHTML = \`
            <span>PID <b>\${s.pid ?? '-'}</b></span>
            <span>端口 <b>\${s.port}</b></span>
            <span>运行时长 <b>\${s.uptime ?? '-'}</b></span>
            <span>启动于 <b>\${s.startedAt ? new Date(s.startedAt).toLocaleTimeString('zh-CN') : '-'}</b></span>
          \`;
        }

        /* 更新日志（仅当卡片展开时，保留滚动位置） */
        if (openSet.has(s.id)) {
          const pre = document.getElementById(\`log-\${s.id}\`);
          if (pre) {
            const atBottom = pre.scrollHeight - pre.scrollTop - pre.clientHeight < 40;
            pre.textContent = s.logs.length ? s.logs.join('\\n') : '[no logs yet]';
            if (atBottom) pre.scrollTop = pre.scrollHeight;
          }
        }
      }
    }

    function toggleCard(id) {
      if (openSet.has(id)) {
        openSet.delete(id);
      } else {
        openSet.add(id);
      }
      const card = document.getElementById(\`card-\${id}\`);
      if (card) card.classList.toggle('open', openSet.has(id));
    }

    async function loadServices() {
      try {
        const services = await request('/api/services');
        render(services);
      } catch (err) {
        /* 首次加载失败时在列表区显示错误提示，轮询失败静默等待下次 */
        const list = document.getElementById('list');
        if (list && list.childElementCount === 0) {
          list.innerHTML = \`<div style="padding:40px 28px;color:#8d3b3b;font-size:14px;">
            ⚠️ 无法加载服务列表：\${escapeHtml(String(err?.message ?? err))}
          </div>\`;
        }
      }
    }

    /* ── 按钮防抖：操作进行中禁用同一张卡片的所有按钮 ── */
    const pendingActions = new Set();

    async function serviceAction(id, action) {
      const key = id + ':' + action;
      if (pendingActions.has(key)) return;
      pendingActions.add(key);

      /* 立即锁定该卡片所有操作按钮，给用户即时反馈 */
      const card = document.getElementById('card-' + id);
      const btns = card ? Array.from(card.querySelectorAll('.actions button')) : [];
      btns.forEach(function(b) { b.disabled = true; b.style.opacity = '0.45'; });

      try {
        await request('/api/service/' + id + '/' + action, { method: 'POST' });
      } catch (err) {
        console.warn('[panel] serviceAction failed:', err);
      } finally {
        pendingActions.delete(key);
        btns.forEach(function(b) { b.disabled = false; b.style.opacity = ''; });
        /* 操作后立即刷新一次，不等下次轮询 */
        await loadServices();
      }
    }

    async function bulkAction(action) {
      try {
        await request('/api/bulk/' + action, { method: 'POST' });
      } catch (err) {
        console.warn('[panel] bulkAction failed:', err);
      }
      /* 全部启动是异步排队的，稍候再刷 */
      setTimeout(loadServices, 600);
    }

    /* ── 轮询：每 1.5s 刷新一次，后台任务，不阻塞 UI ── */
    let polling = false;
    async function poll() {
      if (polling) return;          // 上次请求还没回来，跳过本次
      polling = true;
      try {
        await loadServices();
      } finally {
        polling = false;
      }
    }

    loadServices();
    setInterval(poll, 1500);
  </script>
</body>
</html>`;
}

// ─── HTTP 路由 ─────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const method = req.method ?? 'GET';
  const url    = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(pageHtml());
    return;
  }

  if (method === 'GET' && url.pathname === '/api/services') {
    const snapshots = await Promise.all(SERVICES.map((service) => getServiceSnapshot(service)));
    sendJson(res, 200, snapshots);
    return;
  }

  const serviceActionMatch = url.pathname.match(/^\/api\/service\/([^/]+)\/(start|stop|restart)$/);
  if (method === 'POST' && serviceActionMatch) {
    const [, serviceId, action] = serviceActionMatch;
    const service = findService(serviceId);

    if (!service) {
      sendJson(res, 404, { message: 'Service not found' });
      return;
    }

    if (action === 'start') {
      startService(service);
    } else if (action === 'stop') {
      stopService(service);
    } else if (action === 'restart') {
      stopService(service);
      setTimeout(() => startService(service), 1200);
    }

    sendJson(res, 200, { status: 'ok' });
    return;
  }

  const bulkMatch = url.pathname.match(/^\/api\/bulk\/(start|stop)$/);
  if (method === 'POST' && bulkMatch) {
    const action = bulkMatch[1];

    if (action === 'start') {
      startAllOrdered().catch(() => {});
    } else {
      stopAll();
    }

    sendJson(res, 200, { status: 'ok' });
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
});

server.listen(PANEL_PORT, () => {
  console.log(`[dev-panel] listening on http://localhost:${PANEL_PORT}`);
});

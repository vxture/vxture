import http from 'node:http';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { URL } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// ─── 全局常量 ──────────────────────────────────────────────────────────────────

const ROOT_DIR        = 'D:\\MyWebSite\\vxture';
const PANEL_PORT      = Number(process.env.DEV_PANEL_PORT ?? 8090);
const MAX_LOG_LINES   = 300;
const START_WAIT_TIMEOUT_MS  = 30_000;
const START_WAIT_INTERVAL_MS = 1_000;
const ROOT_ENV        = loadRootEnv();

// ─── 服务清单 ──────────────────────────────────────────────────────────────────

/** @type {Array<{id:string,name:string,port:number,url:string,command:string,priority:number,env?:Record<string,string>,healthChecks:Array<{label:string,kind?:'http'|'tcp',url?:string,port?:number,okStatuses?:number[]}>}>} */
const SERVICES = [
  {
    id: 'ai-gateway',
    name: 'AI Gateway',
    port: 3100,
    priority: 1,                              // P1 — 模型接入、授权、配额和计量
    url: 'http://localhost:3100',
    command: 'pnpm --filter @vxture/service-ai-gateway dev',
    healthChecks: [
      { label: 'port',   kind: 'tcp', port: 3100 },
      { label: 'models', url: 'http://localhost:3100/ai/gateway/models', okStatuses: [200] },
    ],
  },
  {
    id: 'website-bff',
    name: 'Website BFF',
    port: 3001,
    priority: 1,                              // P1 — Website 后端接口
    url: 'http://localhost:3001',
    command: 'pnpm --filter @vxture/bff-website dev',
    healthChecks: [
      { label: 'healthz',  url: 'http://localhost:3001/healthz',       okStatuses: [200] },
      { label: 'auth.me',  url: 'http://localhost:3001/api/auth/me',   okStatuses: [401] },
    ],
  },
  {
    id: 'vela-server',
    name: 'Vela Server',
    port: 3011,
    priority: 1,                              // P1 — Vela 私有智能体后端，依赖 AI Gateway + 数据库
    url: 'http://localhost:3011',
    command: 'pnpm --filter vela-server dev',
    env: {
      AI_GATEWAY_URL: 'http://localhost:3100',
      VELA_SERVER_PORT: '3011',
      VELA_PLATFORM_LLM_TENANT_ID: '82cf3e39-f7f0-4597-bb55-b1303ca19d46',
      VELA_DEFAULT_MODEL_CODE: 'doubao-seed-2-0-lite-260215',
    },
    healthChecks: [
      { label: 'port', kind: 'tcp', port: 3011 },
    ],
  },
  {
    id: 'vela-bff',
    name: 'Vela BFF',
    port: 3010,
    priority: 1,                              // P1 — Vela 认证边界与 SSE 代理，依赖 Vela Server
    url: 'http://localhost:3010',
    command: 'pnpm --filter @vxture/bff-vela dev',
    env: {
      VELA_BFF_PORT: '3010',
      VELA_SERVER_INTERNAL_URL: 'http://localhost:3011',
    },
    healthChecks: [
      { label: 'health', url: 'http://localhost:3010/health', okStatuses: [200] },
    ],
  },
  {
    id: 'console-bff',
    name: 'Console BFF',
    port: 3003,
    priority: 1,                              // P1 — Console 后端接口，依赖 AI Gateway 的模型管理能力
    url: 'http://localhost:3003',
    command: 'pnpm --filter @vxture/bff-console dev',
    env: {
      AI_GATEWAY_URL: 'http://localhost:3100',
    },
    healthChecks: [
      { label: 'healthz',     url: 'http://localhost:3003/healthz',            okStatuses: [200] },
      { label: 'auth.session', url: 'http://localhost:3003/api/auth/session',   okStatuses: [401] },
    ],
  },
  {
    id: 'admin-bff',
    name: 'Admin BFF',
    port: 3005,
    priority: 1,                              // P1 — 平台运营后台接口，承载供给侧管理能力
    url: 'http://localhost:3005',
    command: 'pnpm --filter @vxture/bff-admin dev',
    env: {
      AI_GATEWAY_URL: 'http://localhost:3100',
      ADMIN_BFF_PORT: '3005',
    },
    healthChecks: [
      { label: 'healthz',      url: 'http://localhost:3005/healthz',              okStatuses: [200] },
      { label: 'auth.session', url: 'http://localhost:3005/api/auth/session',     okStatuses: [401] },
      { label: 'ai-gateway',   url: 'http://localhost:3005/api/ai-gateway/models', okStatuses: [401] },
    ],
  },
  {
    id: 'gateway',
    name: 'Gateway BFF',
    port: 8000,
    priority: 2,                              // P2 — 依赖 website-bff + console-bff + admin-bff
    url: 'http://localhost:8000',
    command: 'pnpm dev:gateway',
    env: {
      ADMIN_BFF_ORIGIN: 'http://localhost:3005',
    },
    healthChecks: [
      { label: 'healthz',      url: 'http://localhost:8000/healthz',                          okStatuses: [200] },
      { label: 'website-api',  url: 'http://localhost:8000/website-api/api/auth/me',          okStatuses: [401] },
      { label: 'console-api',  url: 'http://localhost:8000/console-api/api/auth/session',     okStatuses: [401] },
      { label: 'admin-api',    url: 'http://localhost:8000/admin-api/api/auth/session',       okStatuses: [401] },
    ],
  },
  {
    id: 'website',
    name: 'Website',
    port: 3000,
    priority: 3,                              // P3 — 依赖 gateway
    url: 'http://localhost:3000',
    command: 'pnpm --filter @vxture/website dev',
    healthChecks: [
      { label: 'port', kind: 'tcp', port: 3000 },
    ],
  },
  {
    id: 'console',
    name: 'Console',
    port: 3002,
    priority: 3,                              // P3 — 依赖 gateway
    url: 'http://localhost:3002',
    command: 'pnpm --filter @vxture/console dev',
    healthChecks: [
      { label: 'port', kind: 'tcp', port: 3002 },
    ],
  },
  {
    id: 'admin',
    name: 'Admin',
    port: 3004,
    priority: 3,                              // P3 — 平台运营前端，依赖 gateway + admin-bff
    url: 'http://localhost:3004',
    command: 'pnpm --filter @vxture/admin dev',
    healthChecks: [
      { label: 'port', kind: 'tcp', port: 3004 },
    ],
  },
  {
    id: 'vela-studio',
    name: 'Vela Studio',
    port: 3020,
    priority: 3,                              // P3 — Vela 独立前端调试入口；admin/console 内嵌版本不依赖它
    url: 'http://localhost:3020',
    command: 'pnpm --filter @vxture/agent-studio-vela dev',
    healthChecks: [
      { label: 'port', kind: 'tcp', port: 3020 },
    ],
  },
];

/** 启动顺序（按优先级顺序逐级等待健康） */
const START_ORDER = [
  'ai-gateway',
  'vela-server',
  'vela-bff',
  'website-bff',
  'console-bff',
  'admin-bff',
  'gateway',
  'website',
  'console',
  'admin',
  'vela-studio',
];

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

function loadRootEnv() {
  const envPath = path.join(ROOT_DIR, '.env.local');
  if (!existsSync(envPath)) return {};

  const env = {};
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    const value = unwrapEnvValue(line.slice(separator + 1).trim());
    if (key) env[key] = value;
  }

  return env;
}

function unwrapEnvValue(value) {
  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    return value.slice(1, -1);
  }
  return value;
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

function isChildAlive(child) {
  return Boolean(child && child.exitCode === null && child.signalCode === null && !child.killed);
}

function findService(serviceId) {
  return SERVICES.find((item) => item.id === serviceId) ?? null;
}

function runProcess(file, args, { timeoutMs = 10_000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(file, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, ...payload });
    };

    const timer = setTimeout(() => {
      child.kill();
      finish({ code: null, timedOut: true });
    }, timeoutMs);

    child.stdout?.on('data', (chunk) => { stdout += chunk; });
    child.stderr?.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => finish({ code: null, error }));
    child.on('close', (code) => finish({ code, timedOut: false }));
  });
}

function parsePidLines(text) {
  return [...new Set(
    String(text)
      .split(/\s+/)
      .map((item) => Number(item.trim()))
      .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid),
  )];
}

async function findListeningPids(port) {
  if (process.platform === 'win32') {
    const command = [
      `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue`,
      'Select-Object -ExpandProperty OwningProcess -Unique',
    ].join(' | ');
    const result = await runProcess('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      command,
    ]);
    if (result.stdout.trim()) return parsePidLines(result.stdout);

    const netstat = await runProcess('netstat.exe', ['-ano', '-p', 'tcp']);
    return [...new Set(
      netstat.stdout
        .split(/\r?\n/)
        .filter((line) => line.includes('LISTENING'))
        .map((line) => line.trim().split(/\s+/))
        .filter((cols) => cols.length >= 5 && cols[1].endsWith(`:${port}`))
        .map((cols) => Number(cols[4]))
        .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid),
    )];
  }

  const lsof = await runProcess('lsof', ['-nP', '-ti', `TCP:${port}`, '-sTCP:LISTEN'], { timeoutMs: 5_000 });
  if (lsof.stdout.trim()) return parsePidLines(lsof.stdout);

  const fuser = await runProcess('fuser', [`${port}/tcp`], { timeoutMs: 5_000 });
  return parsePidLines(`${fuser.stdout}\n${fuser.stderr}`);
}

async function waitForPortClosed(port, timeoutMs = 7_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const listening = await checkPort(port);
    if (!listening) return true;
    await sleep(300);
  }
  return !(await checkPort(port));
}

async function killProcessTree(pid) {
  if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid) return false;

  if (process.platform === 'win32') {
    const result = await runProcess('taskkill.exe', ['/pid', String(pid), '/t', '/f'], { timeoutMs: 15_000 });
    return result.code === 0;
  }

  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      return false;
    }
  }

  await sleep(900);
  try {
    process.kill(pid, 0);
    process.kill(pid, 'SIGKILL');
  } catch {
    // Process already exited.
  }
  return true;
}

function checkPort(port) {
  return new Promise((resolve) => {
    const socket  = new net.Socket();
    let settled = false;
    const finish  = (value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(500);
    socket.once('connect', () => {
      settled = true;
      socket.end();
      resolve(true);
    });
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
      if (check.kind === 'tcp') {
        const port = check.port ?? service.port;
        const ok = await checkPort(port);
        return {
          label:      check.label,
          url:        `tcp://127.0.0.1:${port}`,
          status:     ok ? 'open' : null,
          okStatuses: null,
          durationMs: Date.now() - t0,
          ok,
        };
      }

      try {
        if (!check.url || !check.okStatuses) throw new Error('Invalid HTTP health check');
        const response = await fetch(check.url, {
          method: 'GET',
          redirect: 'manual',
          cache: 'no-store',
          signal: AbortSignal.timeout(1_500),
        });
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
  const running   = isChildAlive(state?.child);
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

async function startService(service) {
  const state = runtime.get(service.id);
  if (!state) throw new Error(`Unknown service: ${service.id}`);
  if (isChildAlive(state.child)) {
    appendLog(service.id, '[panel] start skipped: already managed by panel');
    return;
  }

  if (await checkPort(service.port)) {
    appendLog(service.id, `[panel] start skipped: port ${service.port} is already listening`);
    return;
  }

  const shell = shellForPlatform(service.command);
  const child = spawn(shell.file, shell.args, {
    cwd:         ROOT_DIR,
    env:         { ...process.env, ...ROOT_ENV, ...(service.env ?? {}) },
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

async function stopService(service) {
  const state = runtime.get(service.id);
  if (!state) throw new Error(`Unknown service: ${service.id}`);
  if (state.stopping) return;

  state.stopping = true;
  appendLog(service.id, '[panel] stopping service tree');

  const pids = new Set();
  if (isChildAlive(state.child)) pids.add(state.child.pid);
  for (const pid of await findListeningPids(service.port)) pids.add(pid);

  if (pids.size === 0) {
    appendLog(service.id, `[panel] nothing to stop on port ${service.port}`);
    state.child     = null;
    state.startedAt = null;
    state.stopping  = false;
    return;
  }

  for (const pid of pids) {
    const killed = await killProcessTree(pid);
    appendLog(service.id, killed ? `[panel] stopped pid=${pid}` : `[panel] failed to stop pid=${pid}`);
  }

  const closed = await waitForPortClosed(service.port);
  appendLog(service.id, closed ? `[panel] port ${service.port} is closed` : `[panel] port ${service.port} is still listening`);

  state.child     = null;
  state.startedAt = null;
  state.stopping  = false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealthy(serviceId, timeoutMs = START_WAIT_TIMEOUT_MS, shouldCancel = () => false) {
  const service = findService(serviceId);
  if (!service) return false;

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (shouldCancel()) return false;
    const snapshot = await getServiceSnapshot(service);
    if (snapshot.listening && snapshot.healthy) return true;
    await sleep(START_WAIT_INTERVAL_MS);
  }
  return false;
}

let bulkStartPromise = null;
let bulkOperationVersion = 0;

async function startAllOrdered() {
  if (bulkStartPromise) return bulkStartPromise;

  const version = ++bulkOperationVersion;
  bulkStartPromise = (async () => {
    for (const serviceId of START_ORDER) {
      if (version !== bulkOperationVersion) break;
      const service = findService(serviceId);
      if (!service) continue;
      await startService(service);
      appendLog(service.id, '[panel] waiting for health checks');
      const ready = await waitForHealthy(service.id, START_WAIT_TIMEOUT_MS, () => version !== bulkOperationVersion);
      if (version !== bulkOperationVersion) {
        appendLog(service.id, '[panel] start queue cancelled');
        break;
      }
      appendLog(service.id, ready ? '[panel] service is healthy' : '[panel] health wait timed out');
    }
  })();

  try {
    await bulkStartPromise;
  } finally {
    bulkStartPromise = null;
  }
}

async function stopAll() {
  bulkOperationVersion += 1;

  for (const serviceId of [...START_ORDER].reverse()) {
    const service = findService(serviceId);
    if (service) await stopService(service);
  }
}

// ─── HTTP 工具 ─────────────────────────────────────────────────────────────────

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
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
      --vx-color-brand-50: #f5f8ff;
      --vx-color-brand-100: #e6edff;
      --vx-color-brand-200: #c7d6ff;
      --vx-color-brand-300: #9fb7ff;
      --vx-color-brand-400: #6f90ff;
      --vx-color-brand-500: #3f6cff;
      --vx-color-brand-600: #2f55e6;
      --vx-color-brand-700: #2443b4;
      --vx-color-brand-800: #1a3282;
      --vx-color-brand-900: #101f52;

      --vx-color-gray-50: #f9fafb;
      --vx-color-gray-100: #f3f4f6;
      --vx-color-gray-200: #e5e7eb;
      --vx-color-gray-300: #d1d5db;
      --vx-color-gray-400: #9ca3af;
      --vx-color-gray-500: #6b7280;
      --vx-color-gray-600: #4b5563;
      --vx-color-gray-700: #374151;
      --vx-color-gray-800: #1f2937;
      --vx-color-gray-900: #111827;

      --bg:         var(--vx-color-brand-50);
      --panel:      rgba(255,255,255,.94);
      --surface:    rgba(255,255,255,.82);
      --ink:        var(--vx-color-gray-900);
      --muted:      var(--vx-color-gray-500);
      --line:       #dbe5ff;
      --line-strong:#c7d6ff;
      --ok:         #168557;
      --warn:       #b76c00;
      --off:        #b4233a;
      --brand:      var(--vx-color-brand-600);
      --brand-hover:var(--vx-color-brand-700);
      --brand-deep: var(--vx-color-brand-900);
      --brand-soft: var(--vx-color-brand-100);
      --radius:     8px;
    }
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      margin: 0;
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: var(--ink);
      background-color: var(--bg);
      background-image:
        linear-gradient(rgba(63,108,255,.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(63,108,255,.055) 1px, transparent 1px);
      background-size: 36px 36px;
    }

    /* ── 布局 ── */
    .wrap {
      width: 100%;
      margin: 0 auto;
      padding: 16px 3rem;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 16px;
      padding: 16px 20px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background:
        linear-gradient(135deg, rgba(245,248,255,.98), rgba(255,255,255,.94) 58%, rgba(230,237,255,.92));
      box-shadow: 0 18px 44px rgba(16,31,82,.08);
    }
    .hero h1 { margin: 0; font-size: 26px; line-height: 1.1; letter-spacing: 0; color: var(--brand-deep); }
    .hero p  { margin: 5px 0 0; color: var(--muted); font-size: 13px; }

    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; }
    button {
      border: 1px solid transparent;
      border-radius: var(--radius);
      padding: 8px 12px;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
      transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;
    }
    button:hover:not(:disabled) { transform: translateY(-1px); }
    button:disabled { cursor: not-allowed; opacity: .48; }
    .ghost   { background: rgba(255,255,255,.76); color: var(--brand-hover); border-color: var(--line-strong); }
    .ghost:hover:not(:disabled) { background: #fff; border-color: var(--vx-color-brand-400); box-shadow: 0 10px 24px rgba(47,85,230,.12); }
    .primary {
      background: linear-gradient(135deg, var(--vx-color-brand-500), var(--vx-color-brand-700));
      color: #fff;
      box-shadow: 0 14px 28px rgba(47,85,230,.24);
    }
    .primary:hover:not(:disabled) { box-shadow: 0 18px 36px rgba(47,85,230,.28); }

    .workspace {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 0;
      gap: 0;
      align-items: start;
      --column-gap: 14px;
      transition: grid-template-columns .22s ease, gap .22s ease;
    }
    .workspace.log-open {
      grid-template-columns: minmax(520px, 64fr) minmax(340px, 36fr);
      gap: var(--column-gap);
    }

    .service-panel {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    /* ── 服务列表 ── */
    .list { display: flex; flex-direction: column; gap: 8px; }

    /* ── 卡片 ── */
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: 0 8px 22px rgba(16,31,82,.06);
      overflow: hidden;
      transition: box-shadow .15s, border-color .15s, transform .15s;
      backdrop-filter: blur(10px);
    }
    .card:hover {
      border-color: var(--line-strong);
      box-shadow: 0 12px 30px rgba(16,31,82,.09);
      transform: translateY(-1px);
    }
    .card.selected {
      border-color: var(--vx-color-brand-400);
      box-shadow: 0 12px 32px rgba(47,85,230,.13);
    }
    .card.selected .card-head {
      background: linear-gradient(135deg, rgba(245,248,255,.98), rgba(230,237,255,.72));
    }

    /* ── 卡片头部：两行列表结构 ── */
    .card-head {
      padding: 8px 12px;
      cursor: pointer;
      user-select: none;
    }
    .card-head:hover { background: rgba(63,108,255,.045); }

    /* 第一行：优先级 + 服务名 + 端口 + 状态 */
    .head-row1 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
    }

    /* 第二行：健康检查 + 运行摘要 + 操作按钮 */
    .head-row2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* 优先级徽章 */
    .priority {
      flex-shrink: 0;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0;
      padding: 3px 6px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .p0 { background: #fff1f3; color: var(--off); border: 1px solid #ffd2dc; }
    .p1 { background: #fff7e8; color: var(--warn); border: 1px solid #ffdf9f; }
    .p2 { background: var(--brand-soft); color: var(--brand-hover); border: 1px solid var(--line-strong); }

    /* 服务名 + 元信息（占满剩余宽度） */
    .info { flex: 1; min-width: 0; }
    .name {
      overflow: hidden;
      color: var(--vx-color-gray-900);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .port {
      flex-shrink: 0;
      color: var(--brand-hover);
      font-size: 12px;
      font-weight: 800;
      padding: 3px 7px;
      border: 1px solid var(--line-strong);
      border-radius: 6px;
      background: var(--brand-soft);
    }
    .meta {
      color: var(--muted);
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 状态标签 —— 带左侧色块竖线 + 底色 */
    .status {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      border-left: 3px solid transparent;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.55);
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
      background: #eaf8f1;
      color: var(--ok);
      border-left-color: var(--ok);
    }
    .status.on::before { background: var(--ok); }
    /* 启动中 / 停止中：橙色 */
    .status.wait {
      background: #fff7e8;
      color: var(--warn);
      border-left-color: #f59e0b;
    }
    .status.wait::before { background: #f59e0b; animation: pulse .9s ease-in-out infinite; }
    /* 未启动：红色 */
    .status.off {
      background: #fff1f3;
      color: var(--off);
      border-left-color: var(--off);
    }
    .status.off::before { background: var(--off); }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: .3; }
    }

    /* 健康检查胶囊区域（占满剩余宽度） */
    .health-row {
      flex: 1.1;
      min-width: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      align-items: center;
    }
    .health-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid var(--line);
      background: rgba(245,248,255,.88);
      color: var(--muted);
      white-space: nowrap;
    }
    .health-item .hi-dur { opacity: .55; font-size: 11px; }
    .health-item.ok  { background: #eaf8f1; color: var(--ok);  border-color: #b9e7d0; }
    .health-item.bad { background: #fff1f3; color: var(--off); border-color: #ffc5d0; }

    /* 操作按钮组（右侧，不参与 flex 拉伸） */
    .actions { display: flex; gap: 5px; flex-shrink: 0; }
    .actions button { border-radius: 6px; padding: 5px 8px; font-size: 12px; }
    .btn-start {
      background: var(--brand);
      color: #fff;
      box-shadow: 0 10px 20px rgba(47,85,230,.18);
    }
    .btn-start:hover:not(:disabled) { background: var(--brand-hover); }
    .btn-stop {
      background: #fff1f3;
      color: var(--off);
      border-color: #ffc5d0;
    }
    .btn-stop:hover:not(:disabled) { background: #ffe4e9; }
    .btn-restart {
      background: var(--brand-soft);
      color: var(--brand-hover);
      border-color: var(--line-strong);
    }
    .btn-restart:hover:not(:disabled) { background: var(--vx-color-brand-200); }
    .btn-open {
      background: #fff;
      color: var(--brand);
      border-color: var(--line);
    }
    .btn-open:hover:not(:disabled) { border-color: var(--vx-color-brand-400); color: var(--brand-hover); }

    .service-meta {
      display: flex;
      flex: .9;
      min-width: 0;
      flex-wrap: nowrap;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
      font-size: 11px;
      color: var(--muted);
    }
    .service-meta span {
      display: inline-flex;
      min-width: 0;
      gap: 4px;
      align-items: center;
      white-space: nowrap;
    }
    .service-meta span:last-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .service-meta b { color: var(--ink); font-weight: 700; }

    .log-panel {
      position: sticky;
      top: 16px;
      min-width: 0;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: #0b1024;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      transform: translateX(18px);
      transition: transform .22s ease, opacity .18s ease, visibility .18s ease;
    }
    .workspace.log-open .log-panel {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transform: translateX(0);
    }
    .log-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      height: 40px;
      padding: 0 8px 0 14px;
      border-bottom: 1px solid rgba(199,214,255,.22);
      background: rgba(11,16,36,.96);
    }
    .log-header h2 {
      margin: 0;
      min-width: 0;
      overflow: hidden;
      color: #d8e4ff;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .log-close {
      flex-shrink: 0;
      width: 26px;
      height: 26px;
      padding: 0;
      border: 1px solid rgba(199,214,255,.35);
      border-radius: 6px;
      background: rgba(11,16,36,.92);
      color: #d8e4ff;
      line-height: 1;
      font-size: 20px;
      font-weight: 400;
      box-shadow: none;
    }
    .log-close:hover:not(:disabled) {
      background: rgba(36,67,180,.92);
      transform: none;
    }

    pre.log-box {
      margin: 0;
      padding: 12px 14px;
      width: 100%;
      height: calc(100vh - 64px);
      min-height: 0;
      overflow: auto;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: #d8e4ff;
      font: 12.5px/1.6 Consolas, "SFMono-Regular", monospace;
      white-space: pre-wrap;
      word-break: break-word;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
    }

    @media (max-width: 860px) {
      .wrap { padding: 16px 20px; }
      .hero { flex-direction: column; align-items: stretch; }
      .workspace,
      .workspace.log-open { grid-template-columns: 1fr; gap: 16px; }
      .log-panel { position: static; display: none; }
      .workspace.log-open .log-panel { display: block; }
      pre.log-box { height: 520px; }
      .actions button { padding: 7px 10px; font-size: 12px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="workspace">
      <section class="service-panel">
        <div class="hero">
          <div>
            <h1>Vxture Dev Panel</h1>
            <p>Local Runtime · Vxture workspace</p>
          </div>
          <div class="toolbar">
            <button type="button" class="primary" onclick="bulkAction('start')">全部启动</button>
            <button type="button" class="ghost"   onclick="bulkAction('stop')">全部停止</button>
            <button type="button" class="ghost"   onclick="refreshServices()">刷新状态</button>
          </div>
        </div>
        <div id="list" class="list"></div>
      </section>
      <aside class="log-panel" id="log-panel" aria-live="polite" aria-hidden="true">
        <div class="log-header">
          <h2 id="log-title">日志</h2>
          <button type="button" class="log-close" onclick="closeLogDrawer()" aria-label="关闭日志">×</button>
        </div>
        <pre class="log-box" id="log-view">[select a service]</pre>
      </aside>
    </div>
  </div>

  <script>
    let selectedServiceId = null;
    let latestServices = [];
    let isLogDrawerOpen = false;

    async function request(path, options = {}) {
      const { timeoutMs = 4_000, ...fetchOptions } = options;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(path, {
        ...fetchOptions,
        cache: 'no-store',
        signal: fetchOptions.signal ?? controller.signal,
        headers: { 'Content-Type': 'application/json', ...(fetchOptions.headers ?? {}) },
      }).finally(() => clearTimeout(timeout));
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
        return \`<span class="health-item \${cls}" title="\${escapeHtml(item.url)}">\${dot} \${escapeHtml(item.label)} \${item.status ?? 'down'} \${dur}</span>\`;
      }).join('');
    }

    function startedAtText(s) {
      return s.startedAt ? new Date(s.startedAt).toLocaleString('zh-CN', { hour12: false }) : '-';
    }

    function serviceMetaHtml(s) {
      return \`
        <span>PID <b>\${s.pid ?? '-'}</b></span>
        <span>运行 <b>\${s.uptime ?? '-'}</b></span>
        <span>启动 <b>\${startedAtText(s)}</b></span>
      \`;
    }

    function renderLogPanel() {
      const service = latestServices.find((item) => item.id === selectedServiceId);
      const title = document.getElementById('log-title');
      const logView = document.getElementById('log-view');
      if (!logView) return;

      if (!service) {
        if (title) title.textContent = '日志';
        logView.textContent = '[select a service]';
        return;
      }

      const atBottom = logView.scrollHeight - logView.scrollTop - logView.clientHeight < 40;
      if (title) title.textContent = \`\${service.name} · :\${service.port}\`;
      logView.textContent = service.logs.length ? service.logs.join('\\n') : '[no logs yet]';
      if (atBottom) logView.scrollTop = logView.scrollHeight;
    }

    function setLogDrawerOpen(open) {
      isLogDrawerOpen = open;
      const panel = document.getElementById('log-panel');
      const workspace = document.querySelector('.workspace');
      if (!panel) return;
      panel.classList.toggle('open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (workspace) workspace.classList.toggle('log-open', open);
    }

    function closeLogDrawer() {
      selectedServiceId = null;
      setLogDrawerOpen(false);
      document.querySelectorAll('.card').forEach((card) => {
        card.classList.remove('selected');
      });
      renderLogPanel();
    }

    function renderCard(s) {
      const canStart = !s.listening && !s.running && !s.stopping;
      const canStop = s.listening || s.running || s.stopping;
      const startDisabled = canStart ? '' : ' disabled';
      const stopDisabled = canStop ? '' : ' disabled';
      const selected = selectedServiceId === s.id ? ' selected' : '';
      return \`
        <div class="card\${selected}" id="card-\${s.id}" onclick="selectService('\${s.id}')">
          <div class="card-head">
            <!-- 第一行：优先级徽章 + 服务名/命令 + 状态 -->
            <div class="head-row1">
              \${priorityBadge(s.priority)}
              <div class="info">
                <div class="name">\${escapeHtml(s.name)}</div>
              </div>
              <div class="port">:\${s.port}</div>
              <div class="status \${statusClass(s)}">\${statusText(s)}</div>
            </div>
            <!-- 第二行：健康检查胶囊（左）+ 操作按钮（右） -->
            <div class="head-row2">
              <div class="health-row">\${renderHealth(s.health)}</div>
              <div class="service-meta">\${serviceMetaHtml(s)}</div>
              <div class="actions" onclick="event.stopPropagation()">
                <button type="button" class="btn-start"   onclick="serviceAction('\${s.id}','start')"\${startDisabled}>启动</button>
                <button type="button" class="btn-stop"    onclick="serviceAction('\${s.id}','stop')"\${stopDisabled}>停止</button>
                <button type="button" class="btn-restart" onclick="serviceAction('\${s.id}','restart')"\${stopDisabled}>重启</button>
                <button type="button" class="btn-open"    onclick="window.open('\${escapeHtml(s.url)}','_blank')">打开</button>
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    function render(services) {
      latestServices = services;
      if (selectedServiceId && !services.some((s) => s.id === selectedServiceId)) {
        selectedServiceId = null;
        setLogDrawerOpen(false);
      }

      /* 仅更新已存在卡片的内容，保留滚动位置；不存在则整体重建 */
      const list = document.getElementById('list');
      const existing = new Set([...list.querySelectorAll('.card')].map((el) => el.id));
      const incoming = new Set(services.map((s) => \`card-\${s.id}\`));

      /* 结构发生变化时（服务新增/删除）整体重渲 */
      const sameStructure = existing.size === incoming.size && [...incoming].every((id) => existing.has(id));
      if (!sameStructure) {
        list.innerHTML = services.map(renderCard).join('');
        renderLogPanel();
        return;
      }

      /* 结构不变时局部更新，避免日志区滚动位置跳动 */
      for (const s of services) {
        const card = document.getElementById(\`card-\${s.id}\`);
        if (!card) continue;

        /* 更新选中状态 */
        card.classList.toggle('selected', selectedServiceId === s.id);

        /* 更新状态标签 */
        const statusEl = card.querySelector('.status');
        if (statusEl) {
          statusEl.className = \`status \${statusClass(s)}\`;
          statusEl.textContent = statusText(s);
        }

        /* 更新健康检查胶囊 */
        const healthRow = card.querySelector('.health-row');
        if (healthRow) healthRow.innerHTML = renderHealth(s.health);

        /* 更新按钮可用状态 */
        if (!card.dataset.busy) {
          const canStart = !s.listening && !s.running && !s.stopping;
          const canStop = s.listening || s.running || s.stopping;
          const startBtn = card.querySelector('.btn-start');
          const stopBtn = card.querySelector('.btn-stop');
          const restartBtn = card.querySelector('.btn-restart');
          if (startBtn) startBtn.disabled = !canStart;
          if (stopBtn) stopBtn.disabled = !canStop;
          if (restartBtn) restartBtn.disabled = !canStop;
        }

        /* 更新服务元信息 */
        const meta = card.querySelector('.service-meta');
        if (meta) meta.innerHTML = serviceMetaHtml(s);
      }
      renderLogPanel();
    }

    function selectService(id) {
      selectedServiceId = id;
      setLogDrawerOpen(true);
      document.querySelectorAll('.card').forEach((card) => {
        card.classList.toggle('selected', card.id === \`card-\${id}\`);
      });
      renderLogPanel();
    }

    async function loadServices() {
      try {
        const services = await request('/api/services?ts=' + Date.now());
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

    /* ── 按钮防抖：操作进行中只锁定生命周期按钮，保留“打开”可用 ── */
    const pendingActions = new Set();

    async function serviceAction(id, action) {
      const key = id + ':' + action;
      if (pendingActions.has(key)) return;
      pendingActions.add(key);

      /* 立即锁定该卡片的启动/停止/重启按钮，给用户即时反馈 */
      const card = document.getElementById('card-' + id);
      const btns = card ? Array.from(card.querySelectorAll('.btn-start, .btn-stop, .btn-restart')) : [];
      if (card) card.dataset.busy = '1';
      btns.forEach(function(b) { b.disabled = true; });

      try {
        await request('/api/service/' + id + '/' + action, { method: 'POST', timeoutMs: 30_000 });
      } catch (err) {
        console.warn('[panel] serviceAction failed:', err);
      } finally {
        pendingActions.delete(key);
        if (card) delete card.dataset.busy;
        /* 操作后立即刷新一次，不等下次轮询 */
        await loadServices();
      }
    }

    let pendingBulkAction = false;

    function setToolbarBusy(busy) {
      document.querySelectorAll('.toolbar button').forEach((button) => {
        button.disabled = busy;
      });
    }

    async function refreshServices() {
      if (pendingBulkAction) return;
      setToolbarBusy(true);
      try {
        await loadServices();
      } finally {
        setToolbarBusy(false);
      }
    }

    async function bulkAction(action) {
      if (pendingBulkAction) return;
      pendingBulkAction = true;
      setToolbarBusy(true);
      try {
        await request('/api/bulk/' + action, { method: 'POST', timeoutMs: action === 'stop' ? 120_000 : 10_000 });
        await loadServices();
      } catch (err) {
        console.warn('[panel] bulkAction failed:', err);
      } finally {
        pendingBulkAction = false;
        setToolbarBusy(false);
      }
      if (action === 'start') {
        /* 全部启动是异步排队的，稍候再刷 */
        setTimeout(loadServices, 600);
        setTimeout(loadServices, 1800);
      }
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
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
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

    try {
      if (action === 'start') {
        await startService(service);
      } else if (action === 'stop') {
        await stopService(service);
      } else if (action === 'restart') {
        await stopService(service);
        await startService(service);
      }
    } catch (err) {
      sendJson(res, 500, { message: String(err?.message ?? err) });
      return;
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
      try {
        await stopAll();
      } catch (err) {
        sendJson(res, 500, { message: String(err?.message ?? err) });
        return;
      }
    }

    sendJson(res, 200, { status: 'ok' });
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
});

server.listen(PANEL_PORT, () => {
  console.log(`[dev-panel] listening on http://localhost:${PANEL_PORT}`);
});

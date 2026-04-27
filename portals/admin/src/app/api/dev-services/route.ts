import { NextResponse } from 'next/server';
import type { DevServiceSnapshot } from '@/entities/console';

export const dynamic = 'force-dynamic';

const DEV_PANEL_ORIGIN = (process.env.DEV_PANEL_URL ?? process.env.NEXT_PUBLIC_DEV_PANEL_URL ?? 'http://localhost:8090').replace(/\/+$/, '');

function devToolsSnapshot(ok: boolean, status: number | string | null, durationMs: number): DevServiceSnapshot {
  return {
    id: 'dev-tools',
    name: 'Dev Tools Panel',
    port: 8090,
    priority: 0,
    url: DEV_PANEL_ORIGIN,
    command: 'tools/dev-panel/src/server.mjs',
    running: ok,
    listening: ok,
    healthy: ok,
    health: [
      {
        label: 'api.services',
        url: `${DEV_PANEL_ORIGIN}/api/services`,
        status,
        okStatuses: [200],
        durationMs,
        ok,
      },
    ],
    pid: null,
    startedAt: null,
    uptimeMs: null,
    uptime: ok ? '在线' : '不可用',
    stopping: false,
    logs: [],
    source: 'dev-tools',
  };
}

function panelServiceSnapshot(service: DevServiceSnapshot): DevServiceSnapshot {
  return {
    ...service,
    logs: [],
    source: 'dev-panel',
  };
}

export async function GET() {
  const startedAt = Date.now();

  try {
    const response = await fetch(`${DEV_PANEL_ORIGIN}/api/services`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    });
    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      return NextResponse.json([devToolsSnapshot(false, response.status, durationMs)], {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const services = (await response.json()) as DevServiceSnapshot[];
    return NextResponse.json(
      [
        devToolsSnapshot(true, response.status, durationMs),
        ...services.map(panelServiceSnapshot),
      ],
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.name : 'FetchError';
    return NextResponse.json([devToolsSnapshot(false, message, Date.now() - startedAt)], {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useConsoleTranslations } from '@/lib/console-intl';
import { AssistantPanel } from './AssistantPanel';
import { getShellLayoutMode } from './config';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const SIDEBAR_KEY = 'vx-console-sidebar-collapsed';
const ASSISTANT_KEY = 'vx-console-assistant-open';
const ASSISTANT_WIDTH_KEY = 'vx-console-assistant-width';
const ASSISTANT_MIN_WIDTH = 380;
const ASSISTANT_DEFAULT_WIDTH = 420;
const ASSISTANT_MAX_WIDTH = 720;
const SHELL_HORIZONTAL_PADDING = 32;
const SHELL_BODY_GAPS = 0;
const CONTENT_MIN_WIDTH = 360;
const SIDEBAR_EXPANDED_WIDTH = 252;
const SIDEBAR_COLLAPSED_WIDTH_REM = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getRootFontSize() {
  if (typeof window === 'undefined') {
    return 16;
  }

  const fontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(fontSize) ? fontSize : 16;
}

function getAssistantMaxWidth(sidebarCollapsed: boolean) {
  if (typeof window === 'undefined') {
    return ASSISTANT_DEFAULT_WIDTH;
  }

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH_REM * getRootFontSize() : SIDEBAR_EXPANDED_WIDTH;
  const availableWidth =
    window.innerWidth - SHELL_HORIZONTAL_PADDING - SHELL_BODY_GAPS - sidebarWidth - CONTENT_MIN_WIDTH;

  return clamp(availableWidth, ASSISTANT_MIN_WIDTH, ASSISTANT_MAX_WIDTH);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const routeLabels = useConsoleTranslations('routes');
  const layoutMode = getShellLayoutMode(pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(layoutMode.assistantDefaultOpen);
  const [assistantWidth, setAssistantWidth] = useState(ASSISTANT_DEFAULT_WIDTH);

  useEffect(() => {
    const saved = window.localStorage.getItem(SIDEBAR_KEY);
    setSidebarCollapsed(saved === 'true');
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(ASSISTANT_KEY);
    if (layoutMode.assistantEnabled) {
      setAssistantOpen(saved ? saved === 'true' : layoutMode.assistantDefaultOpen);
    } else {
      setAssistantOpen(false);
    }
  }, [layoutMode.assistantDefaultOpen, layoutMode.assistantEnabled, pathname]);

  useEffect(() => {
    const saved = window.localStorage.getItem(ASSISTANT_WIDTH_KEY);
    const parsed = saved ? Number(saved) : NaN;
    const nextWidth = Number.isFinite(parsed) ? parsed : ASSISTANT_DEFAULT_WIDTH;
    const maxWidth = getAssistantMaxWidth(sidebarCollapsed);
    setAssistantWidth(clamp(nextWidth, ASSISTANT_MIN_WIDTH, maxWidth));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = getAssistantMaxWidth(sidebarCollapsed);
      setAssistantWidth((current) => {
        const next = clamp(current, ASSISTANT_MIN_WIDTH, maxWidth);
        window.localStorage.setItem(ASSISTANT_WIDTH_KEY, String(next));
        return next;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarCollapsed]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  };

  const handleToggleAssistant = () => {
    if (!layoutMode.assistantEnabled) return;
    setAssistantOpen((current) => {
      const next = !current;
      window.localStorage.setItem(ASSISTANT_KEY, String(next));
      return next;
    });
  };

  const handleAssistantWidthChange = (width: number) => {
    const maxWidth = getAssistantMaxWidth(sidebarCollapsed);
    const next = clamp(width, ASSISTANT_MIN_WIDTH, maxWidth);
    setAssistantWidth(next);
    window.localStorage.setItem(ASSISTANT_WIDTH_KEY, String(next));
  };

  const shellStyle = {
    '--vx-shell-assistant-width': `${assistantWidth}px`,
  } as CSSProperties;

  return (
    <div
      className={`vx-shell ${
        sidebarCollapsed ? 'vx-shell--sidebar-collapsed' : ''
      } ${assistantOpen ? 'vx-shell--assistant-open' : ''}`}
      style={shellStyle}
    >
      <div className="vx-shell__header-slot">
        <Header
          assistantEnabled={layoutMode.assistantEnabled}
          assistantOpen={assistantOpen}
          onToggleAssistant={handleToggleAssistant}
        />
      </div>

      <div className="vx-shell__body">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

        <main className="vx-shell__content" aria-label="Console content">
          {children}
        </main>

        {layoutMode.assistantEnabled ? (
          <AssistantPanel
            id="vx-assistant-panel"
            routeLabel={routeLabels(pathname === '/' ? 'dashboard' : pathname.slice(1))}
            open={assistantOpen}
            maxWidth={getAssistantMaxWidth(sidebarCollapsed)}
            minWidth={ASSISTANT_MIN_WIDTH}
            onWidthChange={handleAssistantWidthChange}
            onClose={handleToggleAssistant}
          />
        ) : null}
      </div>
    </div>
  );
}

'use client';
import * as React from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

type ThemeContextValue = {
  /** Currently rendered theme — always 'light' or 'dark' */
  theme: Theme;
  /** User's chosen mode (may be 'system') */
  mode: ThemeMode;
  /** Update the chosen mode and persist */
  setMode: (mode: ThemeMode) => void;
  /** Convenience: toggle between light and dark (sets mode to explicit) */
  toggle: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'vxture-theme';

function readSavedMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export type ThemeProviderProps = {
  children: React.ReactNode;
  /** Fallback when no preference saved — defaults to 'system' */
  defaultMode?: ThemeMode;
};

/**
 * ThemeProvider — wraps the app to provide light/dark theming.
 *
 * Three layers:
 *   1. Reads from localStorage (or `defaultMode` prop) on mount
 *   2. Resolves 'system' mode against `prefers-color-scheme`
 *   3. Toggles `class="dark"` on <html>
 *
 * For Next.js SSR, also inline the script from `theme/script.ts` in
 * <head> to avoid a flash of incorrect theme on first paint.
 *
 * @example
 *   <ThemeProvider defaultMode="system">
 *     <App />
 *   </ThemeProvider>
 */
export function ThemeProvider({ children, defaultMode = 'system' }: ThemeProviderProps) {
  const [mode, setModeState] = React.useState<ThemeMode>(defaultMode);
  const [theme, setTheme] = React.useState<Theme>('light');

  /* Hydrate from localStorage after mount */
  React.useEffect(() => {
    setModeState(readSavedMode());
  }, []);

  /* Resolve mode → theme + listen for OS changes */
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const resolve = () => setTheme(resolveTheme(mode));
    resolve();
    if (mode === 'system') {
      mq.addEventListener('change', resolve);
      return () => mq.removeEventListener('change', resolve);
    }
  }, [mode]);

  /* Apply theme class to <html> */
  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setMode = React.useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode or storage disabled — ignore */
    }
  }, []);

  const toggle = React.useCallback(() => {
    setMode(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setMode]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, mode, setMode, toggle }),
    [theme, mode, setMode, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme — read and control the active theme.
 *
 * @example
 *   const { theme, mode, setMode, toggle } = useTheme();
 *   <button onClick={toggle}>{theme === 'dark' ? '☾' : '☀'}</button>
 */
export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

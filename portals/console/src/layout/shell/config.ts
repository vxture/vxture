export type ShellLayoutMode = {
  assistantEnabled: boolean;
  assistantDefaultOpen: boolean;
};

const ASSISTANT_ROUTES = new Set(['/', '/members', '/settings']);
const OPEN_ASSISTANT_ROUTES = new Set(['/', '/settings']);

export function getShellLayoutMode(pathname: string): ShellLayoutMode {
  const normalizedPath = pathname === '' ? '/' : pathname;

  return {
    assistantEnabled: ASSISTANT_ROUTES.has(normalizedPath),
    assistantDefaultOpen: OPEN_ASSISTANT_ROUTES.has(normalizedPath),
  };
}

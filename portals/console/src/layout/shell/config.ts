export type ShellLayoutMode = {
  assistantEnabled: boolean;
  assistantDefaultOpen: boolean;
};

const OPEN_ASSISTANT_ROUTES = new Set(['/', '/settings']);

export function getShellLayoutMode(pathname: string): ShellLayoutMode {
  const normalizedPath = pathname === '' ? '/' : pathname;

  return {
    assistantEnabled: true,
    assistantDefaultOpen: OPEN_ASSISTANT_ROUTES.has(normalizedPath),
  };
}

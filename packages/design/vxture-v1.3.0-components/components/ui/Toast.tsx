"use client";
import * as React from "react";
import { cn } from "../../utils/cn";

export type ToastTone = "success" | "error" | "warning" | "info" | "ai";

export type ToastInput = {
  id?: string;
  tone?: ToastTone;
  title: string;
  description?: string;
  /** Auto-dismiss after this many ms. Set 0 to require manual close. */
  duration?: number;
};

type Toast = Required<Omit<ToastInput, "description" | "duration">> & {
  description?: string;
  duration: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<ToastTone, string> = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
  ai: "✦",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id =
        input.id ?? `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const next: Toast = {
        id,
        tone: input.tone ?? "info",
        title: input.title,
        description: input.description,
        duration: input.duration ?? 4000,
      };
      setToasts((prev) => [...prev, next]);
      if (next.duration > 0) {
        window.setTimeout(() => dismiss(id), next.duration);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="vx-toast-viewport"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn("vx-toast", `vx-toast--${t.tone}`)}
            role="alert"
          >
            <span className="vx-toast__icon" aria-hidden>
              {TONE_ICON[t.tone]}
            </span>
            <div className="vx-toast__body">
              <div className="vx-toast__title">{t.title}</div>
              {t.description && (
                <div className="vx-toast__desc">{t.description}</div>
              )}
            </div>
            <button
              type="button"
              className="vx-toast__close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast — show toast notifications.
 *
 * @example
 *   const { toast } = useToast();
 *   toast({ tone: 'success', title: 'Model deployed', description: '...' });
 */
export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

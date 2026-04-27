'use client';

import { Icon } from '@vxture/design-system';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Button } from '@/components/ui/primitives';
import { sendAdminAssistantChat } from '@/api/admin-bff';
import type { AdminAssistantChatMessage } from '@/entities/console';
import { useConsoleTranslations } from '@/lib/console-intl';

const ASSISTANT_BAR_HEIGHT = 44;
const ASSISTANT_OUTPUT_MIN_HEIGHT = 180;
const ASSISTANT_INPUT_MIN_HEIGHT = 156;
const ASSISTANT_DIVIDER_HEIGHT = 10;
const ASSISTANT_DEFAULT_INPUT_HEIGHT = 216;

type DragHandle = 'bottom' | 'width' | null;

type AssistantUiMessage = AdminAssistantChatMessage & {
  id: string;
  tone?: 'default' | 'error';
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function messageId(role: string) {
  return `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AssistantPanel({
  id,
  routeLabel,
  open,
  minWidth,
  maxWidth,
  onWidthChange,
  onClose,
}: {
  id?: string;
  routeLabel: string;
  open: boolean;
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
  onClose: () => void;
}) {
  const t = useConsoleTranslations('assistant');
  const panelRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<AssistantUiMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [inputHeight, setInputHeight] = useState(ASSISTANT_DEFAULT_INPUT_HEIGHT);
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFullscreen(false);
      setDragHandle(null);
    }
  }, [open]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreen]);

  useEffect(() => {
    const inner = innerRef.current;

    if (!inner || typeof ResizeObserver === 'undefined') {
      return;
    }

    const clampHeights = () => {
      const height = inner.getBoundingClientRect().height;
      const maxInput = Math.max(
        ASSISTANT_INPUT_MIN_HEIGHT,
        height - ASSISTANT_BAR_HEIGHT - ASSISTANT_DIVIDER_HEIGHT - ASSISTANT_OUTPUT_MIN_HEIGHT,
      );
      const nextInput = clamp(inputHeight, ASSISTANT_INPUT_MIN_HEIGHT, maxInput);

      if (nextInput !== inputHeight) {
        setInputHeight(nextInput);
      }
    };

    clampHeights();

    const observer = new ResizeObserver(clampHeights);
    observer.observe(inner);

    return () => {
      observer.disconnect();
    };
  }, [inputHeight, fullscreen]);

  useEffect(() => {
    if (!dragHandle) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const inner = innerRef.current;

      if (!inner) {
        return;
      }

      const rect = inner.getBoundingClientRect();

      if (dragHandle === 'width') {
        const panel = panelRef.current;

        if (!panel) {
          return;
        }

        const panelRect = panel.getBoundingClientRect();
        const nextWidth = clamp(panelRect.right - event.clientX, minWidth, maxWidth);
        onWidthChange(nextWidth);
        return;
      }

      const maxInput = Math.max(
        ASSISTANT_INPUT_MIN_HEIGHT,
        rect.height - ASSISTANT_BAR_HEIGHT - ASSISTANT_DIVIDER_HEIGHT - ASSISTANT_OUTPUT_MIN_HEIGHT,
      );
      const nextInput = clamp(rect.bottom - event.clientY, ASSISTANT_INPUT_MIN_HEIGHT, maxInput);
      setInputHeight(nextInput);
    };

    const handlePointerUp = () => {
      document.body.style.userSelect = '';
      setDragHandle(null);
    };

    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragHandle, inputHeight, maxWidth, minWidth, onWidthChange]);

  async function submitDraft() {
    const content = draft.trim();
    if (!content || submitting) {
      return;
    }

    const userMessage: AssistantUiMessage = {
      id: messageId('user'),
      role: 'user',
      content,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    setSubmitting(true);

    try {
      const response = await sendAdminAssistantChat({
        page: routeLabel,
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      });
      setMessages((current) => [
        ...current,
        {
          id: response.id,
          role: 'assistant',
          content: response.message.content,
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('composer.error');
      setMessages((current) => [
        ...current,
        {
          id: messageId('assistant-error'),
          role: 'assistant',
          content: message,
          tone: 'error',
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  const handleDividerPointerDown =
    (handle: Exclude<DragHandle, null>) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setDragHandle(handle);
    };

  return (
    <aside
      ref={panelRef}
      id={id}
      className={`vx-assistant-panel ${fullscreen ? 'vx-assistant-panel--fullscreen' : ''}`}
      aria-label={t('title')}
    >
      {!fullscreen ? (
        <button
          type="button"
          className={`vx-assistant-panel__resize-edge ${dragHandle === 'width' ? 'vx-assistant-panel__resize-edge--active' : ''}`}
          aria-label={t('resizeWidth')}
          onPointerDown={handleDividerPointerDown('width')}
        />
      ) : null}

      <div
        ref={innerRef}
        className="vx-assistant-panel__inner"
        style={{
          gridTemplateRows: `${ASSISTANT_BAR_HEIGHT}px minmax(${ASSISTANT_OUTPUT_MIN_HEIGHT}px, 1fr) ${ASSISTANT_DIVIDER_HEIGHT}px ${inputHeight}px`,
        }}
      >
        <header className="vx-assistant-panel__bar">
          <h2>{t('title')}</h2>

          <div className="vx-assistant-panel__bar-actions">
            <button
              type="button"
              className="vx-shell-icon-button vx-shell-icon-button--toolbar"
              aria-label={fullscreen ? t('exitFullscreen') : t('enterFullscreen')}
              title={fullscreen ? t('exitFullscreen') : t('enterFullscreen')}
              onClick={() => {
                setFullscreen((current) => !current);
              }}
            >
              <Icon name={fullscreen ? 'minimize' : 'maximize'} size="sm" fallback="maximize" />
            </button>

            <button
              type="button"
              className="vx-shell-icon-button vx-shell-icon-button--toolbar"
              aria-label={t('close')}
              title={t('close')}
              onClick={onClose}
            >
              <Icon name="x" size="sm" fallback="x" />
            </button>
          </div>
        </header>

        <section className="vx-assistant-panel__output vx-assistant-panel__output--clean">
          <div className="vx-assistant-panel__output-scroll" ref={outputRef}>
            <div className="vx-assistant-panel__stack">
              {messages.length ? (
                <section className="vx-assistant-chat" aria-live="polite">
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={[
                        'vx-assistant-message',
                        `vx-assistant-message--${message.role}`,
                        message.tone === 'error' ? 'vx-assistant-message--error' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      <p>{message.content}</p>
                    </article>
                  ))}
                  {submitting ? (
                    <article className="vx-assistant-message vx-assistant-message--assistant">
                      <p>{t('composer.thinking')}</p>
                    </article>
                  ) : null}
                </section>
              ) : (
                <section className="vx-assistant-empty">
                  <h3>{t('empty.title')}</h3>
                  <p>{t('empty.description', { page: routeLabel })}</p>
                </section>
              )}
            </div>
          </div>
        </section>

        <button
          type="button"
          className={`vx-assistant-panel__divider ${dragHandle === 'bottom' ? 'vx-assistant-panel__divider--active' : ''}`}
          aria-label={t('resizeBottom')}
          onPointerDown={handleDividerPointerDown('bottom')}
        >
          <span aria-hidden="true" />
        </button>

        <section className="vx-assistant-panel__composer">
          <div className="vx-assistant-panel__composer-head">
            <span>{t('composer.title')}</span>
          </div>

          <textarea
            className="vx-assistant-panel__composer-input"
            value={draft}
            placeholder={t('composer.placeholder', { page: routeLabel })}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                void submitDraft();
              }
            }}
          />

          <div className="vx-assistant-panel__composer-actions">
            <Button className="vx-assistant-send-button" size="sm" disabled={!draft.trim() || submitting} onClick={() => void submitDraft()}>
              {submitting ? t('composer.sending') : t('composer.send')}
            </Button>
          </div>
        </section>
      </div>
    </aside>
  );
}

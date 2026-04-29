'use client';

import { Icon } from '@vxture/design-system';
import { ArrowUpIcon, MicrophoneIcon, PlusIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { sendAdminAssistantChat } from '@/api/admin-bff';
import type { AdminAssistantChatMessage } from '@/entities/console';
import { useConsoleTranslations } from '@/lib/console-intl';

const ASSISTANT_BAR_HEIGHT = 52;
const ASSISTANT_OUTPUT_MIN_HEIGHT = 180;
const ASSISTANT_INPUT_MIN_HEIGHT = 32;
const ASSISTANT_INPUT_MAX_HEIGHT = 160;
const ASSISTANT_FOCUS_DELAY_MS = 180;

type DragHandle = 'width' | null;
export type AssistantWorkMode = 'max' | 'sidebar' | 'floating';

type AssistantUiMessage = AdminAssistantChatMessage & {
  id: string;
  tone?: 'default' | 'error';
  status?: 'pending' | 'stopped';
  retryContent?: string;
};

const ASSISTANT_CONVERSATION_STORAGE_PREFIX = 'vx-admin-assistant-conversation';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function messageId(role: string) {
  return `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

function toTranscriptMessages(messages: AssistantUiMessage[]): AdminAssistantChatMessage[] {
  return messages
    .filter((message) => !message.status && message.tone !== 'error')
    .map(({ role, content }) => ({ role, content }));
}

function readStoredMessages(storageKey: string): AssistantUiMessage[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((message): message is AdminAssistantChatMessage => {
        if (typeof message !== 'object' || message === null) {
          return false;
        }

        const record = message as Record<string, unknown>;
        return (record.role === 'user' || record.role === 'assistant') && typeof record.content === 'string';
      })
      .map((message) => ({
        id: messageId(message.role),
        role: message.role,
        content: message.content,
      }));
  } catch {
    return [];
  }
}

export function AssistantPanel({
  id,
  conversationKey,
  routeLabel,
  open,
  minWidth,
  maxWidth,
  focusSignal,
  mode,
  onWidthChange,
  onModeChange,
  onResetWidth,
  onClose,
}: {
  id?: string;
  conversationKey: string;
  routeLabel: string;
  open: boolean;
  minWidth: number;
  maxWidth: number;
  focusSignal: number;
  mode: AssistantWorkMode;
  onWidthChange: (width: number) => void;
  onModeChange: (mode: AssistantWorkMode) => void;
  onResetWidth: () => void;
  onClose: () => void;
}) {
  const t = useConsoleTranslations('assistant');
  const panelRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<AssistantUiMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [submitting, setSubmitting] = useState(false);
  const [conversationHydrated, setConversationHydrated] = useState(false);
  const maximized = mode === 'max';
  const conversationStorageKey = `${ASSISTANT_CONVERSATION_STORAGE_PREFIX}:${conversationKey}`;
  const emptySuggestions = [
    t('empty.suggestions.summary', { page: routeLabel }),
    t('empty.suggestions.risks', { page: routeLabel }),
    t('empty.suggestions.exceptions', { page: routeLabel }),
    t('empty.suggestions.actions', { page: routeLabel }),
  ];

  useEffect(() => {
    if (!open) {
      setDragHandle(null);
    }
  }, [open]);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setSubmitting(false);
    setDraft('');
    setConversationHydrated(false);
    setMessages(readStoredMessages(conversationStorageKey));
    setConversationHydrated(true);
  }, [conversationStorageKey]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!conversationHydrated) {
      return;
    }

    const transcriptMessages = toTranscriptMessages(messages);

    if (!transcriptMessages.length) {
      window.localStorage.removeItem(conversationStorageKey);
      return;
    }

    window.localStorage.setItem(conversationStorageKey, JSON.stringify(transcriptMessages));
  }, [conversationHydrated, conversationStorageKey, messages]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      composerRef.current?.focus({ preventScroll: true });
    }, ASSISTANT_FOCUS_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [focusSignal, open]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, submitting]);

  useEffect(() => {
    const composer = composerRef.current;

    if (!composer) {
      return;
    }

    composer.style.height = 'auto';
    const nextHeight = clamp(composer.scrollHeight, ASSISTANT_INPUT_MIN_HEIGHT, ASSISTANT_INPUT_MAX_HEIGHT);
    composer.style.height = `${nextHeight}px`;
    composer.style.overflowY = composer.scrollHeight > ASSISTANT_INPUT_MAX_HEIGHT ? 'auto' : 'hidden';
  }, [draft, open, mode]);

  useEffect(() => {
    if (!maximized) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [maximized]);

  useEffect(() => {
    if (!maximized) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onModeChange('sidebar');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [maximized, onModeChange]);

  useEffect(() => {
    if (!dragHandle) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const panel = panelRef.current;

      if (!panel) {
        return;
      }

      const panelRect = panel.getBoundingClientRect();
      const nextWidth = clamp(panelRect.right - event.clientX, minWidth, maxWidth);
      onWidthChange(nextWidth);
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
  }, [dragHandle, maxWidth, minWidth, onWidthChange]);

  function focusComposer() {
    window.setTimeout(() => {
      composerRef.current?.focus({ preventScroll: true });
    }, 0);
  }

  function stopGeneration() {
    abortControllerRef.current?.abort();
  }

  async function submitContent(content: string, options?: { appendUserMessage?: boolean; replaceMessageId?: string }) {
    const normalizedContent = content.trim();
    const appendUserMessage = options?.appendUserMessage ?? true;
    if (!normalizedContent || submitting) {
      return;
    }

    const userMessage: AssistantUiMessage = {
      id: messageId('user'),
      role: 'user',
      content: normalizedContent,
    };
    const pendingMessage: AssistantUiMessage = {
      id: messageId('assistant-pending'),
      role: 'assistant',
      content: t('composer.thinking'),
      status: 'pending',
      retryContent: normalizedContent,
    };
    const requestMessages = [
      ...toTranscriptMessages(messages),
      ...(appendUserMessage ? [{ role: 'user' as const, content: normalizedContent }] : []),
    ];
    const nextMessages = appendUserMessage
      ? [...messages, userMessage, pendingMessage]
      : messages.map((message) => (message.id === options?.replaceMessageId ? pendingMessage : message));
    const controller = new AbortController();

    abortControllerRef.current = controller;
    setMessages(nextMessages);
    setSubmitting(true);

    try {
      const response = await sendAdminAssistantChat({
        page: routeLabel,
        messages: requestMessages,
      }, controller.signal);
      setMessages((current) => {
        const hasPendingMessage = current.some((message) => message.id === pendingMessage.id);
        if (!hasPendingMessage) {
          return current;
        }

        return current.map((message) => {
          if (message.id !== pendingMessage.id) {
            return message;
          }

          return {
            id: response.id,
            role: 'assistant' as const,
            content: response.message.content,
          };
        });
      });
    } catch (error) {
      const aborted = isAbortError(error);
      const message = aborted ? t('composer.stopped') : error instanceof Error ? error.message : t('composer.error');
      setMessages((current) => {
        const hasPendingMessage = current.some((currentMessage) => currentMessage.id === pendingMessage.id);
        if (!hasPendingMessage) {
          return current;
        }

        return current.map((currentMessage) => {
          if (currentMessage.id !== pendingMessage.id) {
            return currentMessage;
          }

          return {
            id: messageId(aborted ? 'assistant-stopped' : 'assistant-error'),
            role: 'assistant' as const,
            content: message,
            tone: aborted ? 'default' as const : 'error' as const,
            status: aborted ? 'stopped' as const : undefined,
            retryContent: normalizedContent,
          };
        });
      });
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setSubmitting(false);
      }
    }
  }

  async function submitDraft() {
    const content = draft.trim();
    if (!content || submitting) {
      return;
    }

    setDraft('');
    await submitContent(content);
  }

  function applySuggestion(suggestion: string) {
    setDraft(suggestion);
    focusComposer();
  }

  function startNewConversation() {
    stopGeneration();
    setMessages([]);
    setDraft('');
    window.localStorage.removeItem(conversationStorageKey);
    focusComposer();
  }

  function clearConversation() {
    stopGeneration();
    setMessages([]);
    window.localStorage.removeItem(conversationStorageKey);
    focusComposer();
  }

  const handleDividerPointerDown =
    () => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setDragHandle('width');
    };

  return (
    <aside
      ref={panelRef}
      id={id}
      className={[
        'vx-assistant-panel',
        `vx-assistant-panel--${mode}`,
        open ? 'vx-assistant-panel--open' : 'vx-assistant-panel--closed',
      ].filter(Boolean).join(' ')}
      aria-label={t('title')}
      aria-hidden={!open}
    >
      {!maximized ? (
        <button
          type="button"
          className={`vx-assistant-panel__resize-edge ${dragHandle === 'width' ? 'vx-assistant-panel__resize-edge--active' : ''}`}
          aria-label={t('resizeWidth')}
          onPointerDown={handleDividerPointerDown()}
        />
      ) : null}

      <div
        ref={innerRef}
        className="vx-assistant-panel__inner"
        style={{
          gridTemplateRows: `${ASSISTANT_BAR_HEIGHT}px minmax(${ASSISTANT_OUTPUT_MIN_HEIGHT}px, 1fr) auto`,
        }}
      >
        <header className="vx-assistant-panel__bar">
          <h2>{t('title')}</h2>

          <div className="vx-assistant-panel__bar-actions">
            <div className="vx-assistant-panel__mode-group" role="group" aria-label={t('workMode')}>
              <button
                type="button"
                className={`vx-shell-icon-button vx-shell-icon-button--toolbar ${mode === 'max' ? 'vx-shell-icon-button--active' : ''}`}
                aria-label={t('modes.max')}
                aria-pressed={mode === 'max'}
                title={t('modes.max')}
                onClick={() => onModeChange('max')}
              >
                <Icon name="maximize" size="sm" fallback="maximize" />
              </button>

              <button
                type="button"
                className={`vx-shell-icon-button vx-shell-icon-button--toolbar ${mode === 'sidebar' ? 'vx-shell-icon-button--active' : ''}`}
                aria-label={t('modes.sidebar')}
                aria-pressed={mode === 'sidebar'}
                title={t('modes.sidebar')}
                onClick={() => onModeChange('sidebar')}
              >
                <Icon name="list" size="sm" fallback="list" />
              </button>

              <button
                type="button"
                className={`vx-shell-icon-button vx-shell-icon-button--toolbar ${mode === 'floating' ? 'vx-shell-icon-button--active' : ''}`}
                aria-label={t('modes.floating')}
                aria-pressed={mode === 'floating'}
                title={t('modes.floating')}
                onClick={() => onModeChange('floating')}
              >
                <Icon name="corners-in" size="sm" fallback="corners-in" />
              </button>
            </div>

            <button
              type="button"
              className="vx-shell-icon-button vx-shell-icon-button--toolbar"
              aria-label={t('resetWidth')}
              title={t('resetWidth')}
              disabled={maximized}
              onClick={onResetWidth}
            >
              <Icon name="rows" size="sm" fallback="rows" />
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

        <section
          className={[
            'vx-assistant-panel__output',
            'vx-assistant-panel__output--clean',
            messages.length ? 'vx-assistant-panel__output--with-toolbar' : '',
          ].filter(Boolean).join(' ')}
        >
          {messages.length ? (
            <div className="vx-assistant-conversation-bar" aria-label={t('conversation.current')}>
              <span>{t('conversation.current')}</span>
              <div className="vx-assistant-conversation-bar__actions">
                <button type="button" onClick={startNewConversation}>
                  {t('conversation.new')}
                </button>
                <button type="button" onClick={clearConversation}>
                  {t('conversation.clear')}
                </button>
              </div>
            </div>
          ) : null}

          <div className="vx-assistant-panel__output-scroll" ref={outputRef}>
            <div className="vx-assistant-panel__stack">
              {messages.length ? (
                <section className="vx-assistant-chat" aria-live="polite" aria-busy={submitting}>
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={[
                        'vx-assistant-message',
                        `vx-assistant-message--${message.role}`,
                        message.tone === 'error' ? 'vx-assistant-message--error' : '',
                        message.status === 'pending' ? 'vx-assistant-message--pending' : '',
                        message.status === 'stopped' ? 'vx-assistant-message--stopped' : '',
                      ].filter(Boolean).join(' ')}
                      role={message.status === 'pending' ? 'status' : undefined}
                    >
                      {message.status === 'pending' ? (
                        <p className="vx-assistant-message__thinking">
                          <span className="vx-assistant-message__loader" aria-hidden="true" />
                          <span>{message.content}</span>
                        </p>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      {message.retryContent && message.status !== 'pending' ? (
                        <div className="vx-assistant-message__actions">
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => void submitContent(message.retryContent ?? '', { appendUserMessage: false, replaceMessageId: message.id })}
                          >
                            {t('composer.retry')}
                          </button>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </section>
              ) : (
                <section className="vx-assistant-empty">
                  <h3>{t('empty.title')}</h3>
                  <p>{t('empty.description', { page: routeLabel })}</p>
                  <div className="vx-assistant-empty__suggestions" aria-label={t('empty.suggestionsLabel')}>
                    {emptySuggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => applySuggestion(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </section>

        <section className="vx-assistant-panel__composer">
          <div className="vx-assistant-composer-box">
            <textarea
              ref={composerRef}
              className="vx-assistant-panel__composer-input"
              rows={1}
              value={draft}
              placeholder={t('composer.placeholder', { page: routeLabel })}
              onChange={(event) => {
                setDraft(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
                  return;
                }

                event.preventDefault();
                void submitDraft();
              }}
            />

            <div className="vx-assistant-composer-controls">
              <button type="button" className="vx-assistant-composer-button" aria-label={t('composer.addResources')}>
                <PlusIcon size={18} aria-hidden="true" />
              </button>

              <div className="vx-assistant-composer-actions">
                <button type="button" className="vx-assistant-composer-button" aria-label={t('composer.voiceInput')}>
                  <MicrophoneIcon size={18} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className={[
                    'vx-assistant-send-button',
                    draft.trim() || submitting ? 'vx-assistant-send-button--ready' : '',
                    submitting ? 'vx-assistant-send-button--stopping' : '',
                  ].filter(Boolean).join(' ')}
                  aria-label={submitting ? t('composer.stop') : t('composer.send')}
                  disabled={!submitting && !draft.trim()}
                  onClick={() => {
                    if (submitting) {
                      stopGeneration();
                      return;
                    }

                    void submitDraft();
                  }}
                >
                  {submitting ? (
                    <span className="vx-assistant-send-button__stop" aria-hidden="true" />
                  ) : (
                    <ArrowUpIcon size={18} weight="bold" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}

'use client';

import { Icon } from '@vxture/design-system';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Button, Badge } from '@/components/ui/primitives';
import { useTranslations } from 'next-intl';

const ASSISTANT_BAR_HEIGHT = 44;
const ASSISTANT_OUTPUT_MIN_HEIGHT = 180;
const ASSISTANT_INPUT_MIN_HEIGHT = 156;
const ASSISTANT_DIVIDER_HEIGHT = 10;
const ASSISTANT_DEFAULT_INPUT_HEIGHT = 216;

type DragHandle = 'bottom' | 'width' | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildPrompt(label: string, page: string) {
  return `${label}：${page}`;
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
  const t = useTranslations('assistant');
  const panelRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [inputHeight, setInputHeight] = useState(ASSISTANT_DEFAULT_INPUT_HEIGHT);
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);

  const insertPrompt = (prompt: string) => {
    setDraft((current) => (current.trim() ? `${current}\n${prompt}` : prompt));
  };

  useEffect(() => {
    if (!open) {
      setFullscreen(false);
      setDragHandle(null);
    }
  }, [open]);

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

  if (!open) {
    return null;
  }

  const summaryPrompt = buildPrompt(t('suggestions.summary'), routeLabel);
  const risksPrompt = buildPrompt(t('suggestions.risks'), routeLabel);
  const nextPrompt = buildPrompt(t('suggestions.next'), routeLabel);
  const draftOnePrompt = buildPrompt(t('drafts.one'), routeLabel);
  const draftTwoPrompt = buildPrompt(t('drafts.two'), routeLabel);

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

        <section className="vx-assistant-panel__output">
          <div className="vx-assistant-panel__output-head">
            <Badge className="vx-badge-neutral">{routeLabel}</Badge>
            <p>{t('description', { page: routeLabel })}</p>
          </div>

          <div className="vx-assistant-panel__output-scroll">
            <div className="vx-assistant-panel__stack">
              <section className="vx-assistant-block">
                <div className="vx-inline-between">
                  <h3>{t('suggestions.title')}</h3>
                </div>
                <div className="vx-assistant-actions">
                  <button type="button" className="vx-assistant-action" onClick={() => insertPrompt(summaryPrompt)}>
                    {t('suggestions.summary')}
                  </button>
                  <button type="button" className="vx-assistant-action" onClick={() => insertPrompt(risksPrompt)}>
                    {t('suggestions.risks')}
                  </button>
                  <button type="button" className="vx-assistant-action" onClick={() => insertPrompt(nextPrompt)}>
                    {t('suggestions.next')}
                  </button>
                </div>
              </section>

              <section className="vx-assistant-block">
                <h3>{t('brief.title')}</h3>
                <p>{t('brief.description')}</p>
                <ul className="vx-assistant-list">
                  <li>{t('brief.items.focus')}</li>
                  <li>{t('brief.items.owners')}</li>
                  <li>{t('brief.items.followUp')}</li>
                </ul>
              </section>

              <section className="vx-assistant-block">
                <h3>{t('drafts.title')}</h3>
                <div className="vx-assistant-drafts">
                  <button type="button" className="vx-assistant-draft" onClick={() => insertPrompt(draftOnePrompt)}>
                    {t('drafts.one')}
                  </button>
                  <button type="button" className="vx-assistant-draft" onClick={() => insertPrompt(draftTwoPrompt)}>
                    {t('drafts.two')}
                  </button>
                </div>
              </section>
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
            <Badge className="vx-badge-neutral">{routeLabel}</Badge>
          </div>

          <textarea
            className="vx-assistant-panel__composer-input"
            value={draft}
            placeholder={t('composer.placeholder', { page: routeLabel })}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
          />

          <div className="vx-assistant-panel__composer-actions">
            <span className="vx-assistant-panel__composer-hint">{t('composer.hint')}</span>
            <Button size="sm" disabled={!draft.trim()}>
              {t('composer.send')}
            </Button>
          </div>
        </section>
      </div>
    </aside>
  );
}

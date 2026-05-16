'use client';
import * as React from 'react';
import { cn } from '../../utils/cn';

export type GenerationStreamProps = {
  /** The text being streamed in (incrementally appended by parent) */
  text: string;
  /** Whether generation is still in progress (controls cursor + spark) */
  streaming?: boolean;
  /** Model that's generating */
  modelId?: string;
  /** Tokens produced so far */
  tokensProduced?: number;
  /** Tokens per second throughput */
  tokensPerSecond?: number;
  /** Optional label override */
  label?: string;
  className?: string;
};

/**
 * GenerationStream — streaming AI output surface.
 *
 * Composes a spark indicator (the only place spark color appears),
 * the live text body with a blinking cursor while streaming, and an
 * optional meta footer. Parent owns the text buffer; this component
 * is purely presentational.
 *
 * @example
 *   const [out, setOut] = useState('');
 *   const [streaming, setStreaming] = useState(true);
 *   // ... feed chunks into setOut, flip streaming false on done
 *   <GenerationStream
 *     text={out}
 *     streaming={streaming}
 *     modelId="claude-haiku-4-5"
 *     tokensProduced={1240}
 *     tokensPerSecond={32}
 *   />
 */
export function GenerationStream({
  text,
  streaming = true,
  modelId,
  tokensProduced,
  tokensPerSecond,
  label,
  className,
}: GenerationStreamProps) {
  const hasMeta = modelId || tokensProduced != null || tokensPerSecond != null;

  return (
    <div className={cn('vx-gen-stream', streaming && 'vx-gen-stream--streaming', className)}>
      <div className="vx-gen-stream__header">
        {streaming && <span className="vx-gen-stream__spark" aria-hidden />}
        <span className="vx-gen-stream__label">
          {label ?? (streaming ? 'GENERATING · STREAMING' : 'COMPLETE')}
        </span>
      </div>
      <div className="vx-gen-stream__body">
        {text}
        {streaming && <span className="vx-gen-stream__cursor" aria-hidden />}
      </div>
      {hasMeta && (
        <div className="vx-gen-stream__meta">
          {tokensProduced != null && <span>tokens: {tokensProduced.toLocaleString()}</span>}
          {tokensPerSecond != null && <span>{tokensPerSecond} tok/s</span>}
          {modelId && <span>{modelId}</span>}
        </div>
      )}
    </div>
  );
}

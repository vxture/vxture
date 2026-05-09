'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@vxture/design-system';

const TRACK_WIDTH = 300;
const HANDLE_SIZE = 34;
const MAX_SLIDER_OFFSET = TRACK_WIDTH - HANDLE_SIZE;

export function SliderCaptcha({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [offset, setOffset] = useState(0);
  const [target, setTarget] = useState(140);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const startXRef = useRef(0);

  const regenerate = useCallback(() => {
    setOffset(0);
    setStatus('idle');
    setTarget(74 + Math.round(Math.random() * 140));
  }, []);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const beginDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (status !== 'idle') {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    startXRef.current = event.clientX - offset;
    setDragging(true);
  };

  const moveDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || status !== 'idle') {
      return;
    }

    const nextOffset = Math.min(MAX_SLIDER_OFFSET, Math.max(0, event.clientX - startXRef.current));
    setOffset(nextOffset);
  };

  const finishDrag = () => {
    if (!dragging) {
      return;
    }

    setDragging(false);
    if (Math.abs(offset - target) <= 6) {
      setStatus('success');
      window.setTimeout(onSuccess, 600);
      return;
    }

    setStatus('fail');
    window.setTimeout(regenerate, 1000);
  };

  return (
    <div className='vx-captcha-backdrop' role='dialog' aria-modal='true' aria-label='安全验证'>
      <div className='vx-captcha-card'>
        <Button variant='ghost' className='vx-captcha-close' onClick={onClose} aria-label='关闭安全验证'>
          ×
        </Button>
        <h2>请完成安全验证</h2>
        <p>拖动滑块，将拼图移至缺口处</p>

        <div className='vx-captcha-canvas'>
          <div className='vx-captcha-hole' style={{ left: target }} />
          <div className='vx-captcha-piece' style={{ left: offset }} />
        </div>

        <div className={`vx-captcha-track ${status}`}>
          <div className='vx-captcha-fill' style={{ width: offset + HANDLE_SIZE / 2 }} />
          <span>{status === 'success' ? '验证成功' : status === 'fail' ? '验证失败，请重试' : '按住滑块，拖动到右侧'}</span>
          <Button
            variant='ghost'
            className='vx-captcha-handle'
            style={{ left: offset }}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            aria-label='拖动完成验证'
          >
            {status === 'success' ? '✓' : status === 'fail' ? '×' : '›'}
          </Button>
        </div>

        {status !== 'success' ? (
          <Button variant='ghost' className='vx-captcha-refresh' onClick={regenerate}>
            ↺ 刷新验证码
          </Button>
        ) : null}
      </div>
    </div>
  );
}

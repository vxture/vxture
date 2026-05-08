/**
 * ConfirmActionDialog.tsx - 执行类工具二次确认对话框
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Component
 *
 * @description
 *   当 SSE 流收到 confirm_required 事件时渲染本组件，展示操作摘要，
 *   让用户选择确认执行或取消。
 *   - 执行中：按钮禁用，显示「执行中…」
 *   - 执行成功：显示绿色成功提示，2 秒后自动关闭
 *   - 执行失败 / 网络错误：显示红色错误提示，手动关闭
 *
 * @author AI-Generated
 * @date 2026-05-02
 */

'use client';

import { useVelaConfirm } from '../hooks/useVelaConfirm';

// ============================================================================
// 组件
// ============================================================================

export function ConfirmActionDialog() {
  const { pendingConfirm, isConfirming, confirmError, confirmResult, handleConfirm, dismiss } =
    useVelaConfirm();

  if (!pendingConfirm) return null;

  // ---- 执行成功状态
  if (confirmResult && confirmResult.success !== false && !confirmResult.cancelled) {
    return (
      <div style={containerStyle('var(--vx-color-success-surface)', 'var(--vx-color-success-border)')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>✅</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--vx-color-success-foreground)' }}>执行成功</span>
          <code style={badgeStyle('var(--vx-color-success-100)', 'var(--vx-color-success-foreground)')}>{pendingConfirm.toolId}</code>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--vx-color-success-foreground)' }}>操作已完成，结果已记录。</p>
      </div>
    );
  }

  // ---- 错误状态
  if (confirmError) {
    return (
      <div style={containerStyle('var(--vx-color-error-surface)', 'var(--vx-color-error-border)')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span>❌</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--vx-color-error-foreground)' }}>执行失败</span>
          <code style={badgeStyle('var(--vx-color-error-100)', 'var(--vx-color-error-foreground)')}>{pendingConfirm.toolId}</code>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--vx-color-error-foreground)' }}>{confirmError}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={dismiss} style={btnStyle('var(--vx-color-text-muted)', 'var(--vx-color-text-inverse)')}>关闭</button>
        </div>
      </div>
    );
  }

  // ---- 待确认状态
  return (
    <div style={containerStyle('var(--vx-color-warning-surface)', 'var(--vx-color-warning-border)')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px' }}>⚠️</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--vx-color-warning-foreground)' }}>需要确认</span>
        <code style={badgeStyle('var(--vx-color-warning-border)', 'var(--vx-color-warning-900)')}>{pendingConfirm.toolId}</code>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--vx-color-warning-900)', lineHeight: '1.5' }}>
        {pendingConfirm.summary}
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => void handleConfirm(false)}
          disabled={isConfirming}
          style={btnStyle('var(--vx-color-text-muted)', 'var(--vx-color-text-inverse)', isConfirming)}
        >
          取消
        </button>
        <button
          onClick={() => void handleConfirm(true)}
          disabled={isConfirming}
          style={btnStyle('var(--vx-color-warning)', 'var(--vx-color-text-inverse)', isConfirming)}
        >
          {isConfirming ? '执行中…' : '确认执行'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 样式辅助
// ============================================================================

function containerStyle(bg: string, border: string): React.CSSProperties {
  return {
    margin:       '0 12px 8px',
    padding:      '14px 16px',
    borderRadius: '12px',
    border:       `1.5px solid ${border}`,
    background:   bg,
    flexShrink:   0,
  };
}

function badgeStyle(bg: string, color: string): React.CSSProperties {
  return {
    fontSize:     '11px',
    background:   bg,
    borderRadius: '4px',
    padding:      '1px 6px',
    color,
    marginLeft:   '2px',
  };
}

function btnStyle(bg: string, color: string, disabled = false): React.CSSProperties {
  return {
    padding:      '6px 14px',
    borderRadius: '6px',
    border:       'none',
    background:   disabled ? 'var(--vx-color-surface-muted)' : bg,
    color:        disabled ? 'var(--vx-color-text-disabled)' : color,
    fontSize:     '13px',
    fontWeight:   600,
    cursor:       disabled ? 'not-allowed' : 'pointer',
    transition:   'background 0.15s',
  };
}

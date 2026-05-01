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
      <div style={containerStyle('#f0fdf4', '#86efac')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>✅</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>执行成功</span>
          <code style={badgeStyle('#dcfce7', '#166534')}>{pendingConfirm.toolId}</code>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#15803d' }}>操作已完成，结果已记录。</p>
      </div>
    );
  }

  // ---- 错误状态
  if (confirmError) {
    return (
      <div style={containerStyle('#fef2f2', '#fca5a5')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span>❌</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>执行失败</span>
          <code style={badgeStyle('#fee2e2', '#991b1b')}>{pendingConfirm.toolId}</code>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#7f1d1d' }}>{confirmError}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={dismiss} style={btnStyle('#6b7280', '#ffffff')}>关闭</button>
        </div>
      </div>
    );
  }

  // ---- 待确认状态
  return (
    <div style={containerStyle('#fffbeb', '#fde68a')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px' }}>⚠️</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>需要确认</span>
        <code style={badgeStyle('#fde68a', '#78350f')}>{pendingConfirm.toolId}</code>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
        {pendingConfirm.summary}
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => void handleConfirm(false)}
          disabled={isConfirming}
          style={btnStyle('#6b7280', '#ffffff', isConfirming)}
        >
          取消
        </button>
        <button
          onClick={() => void handleConfirm(true)}
          disabled={isConfirming}
          style={btnStyle('#f59e0b', '#ffffff', isConfirming)}
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
    background:   disabled ? '#d1d5db' : bg,
    color:        disabled ? '#9ca3af' : color,
    fontSize:     '13px',
    fontWeight:   600,
    cursor:       disabled ? 'not-allowed' : 'pointer',
    transition:   'background 0.15s',
  };
}

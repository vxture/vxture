/**
 * ToolCallCard.tsx - 工具调用结果展示卡片
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category Component
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import type { VelaToolMessage } from '../types/vela.types';

// ============================================================================
// 子渲染：按 displayHint 选择展示形式
// ============================================================================

function renderData(data: unknown, hint?: string) {
  if (data === null || data === undefined) {
    // 工具正在运行
    return <span style={{ color: '#9ca3af', fontSize: '13px' }}>运行中…</span>;
  }

  if (hint === 'table' && Array.isArray(data)) {
    const rows = data as Record<string, unknown>[];
    if (!rows.length) return <span style={{ color: '#6b7280' }}>暂无数据</span>;
    const keys = Object.keys(rows[0]!);
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '12px', width: '100%' }}>
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k} style={{ padding: '4px 8px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', color: '#6b7280' }}>
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {keys.map((k) => (
                  <td key={k} style={{ padding: '4px 8px', borderBottom: '1px solid #f3f4f6' }}>
                    {String(row[k] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (hint === 'list' && Array.isArray(data)) {
    return (
      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px' }}>
        {(data as unknown[]).map((item, i) => (
          <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
        ))}
      </ul>
    );
  }

  if (hint === 'text' && typeof data === 'string') {
    return <p style={{ margin: 0, fontSize: '13px' }}>{data}</p>;
  }

  // 默认：JSON 原始输出
  return (
    <pre style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#374151' }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ============================================================================
// 组件
// ============================================================================

interface Props {
  message: VelaToolMessage;
}

export function ToolCallCard({ message }: Props) {
  return (
    <div
      style={{
        background:   '#f8fafc',
        border:       '1px solid #e2e8f0',
        borderRadius: '8px',
        padding:      '10px 12px',
        margin:       '4px 0',
        maxWidth:     '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          工具
        </span>
        <code style={{ fontSize: '11px', background: '#e2e8f0', borderRadius: '4px', padding: '1px 5px', color: '#334155' }}>
          {message.toolId}
        </code>
      </div>
      {renderData(message.data, message.displayHint)}
    </div>
  );
}

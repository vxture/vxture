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
    return <span className="vx-vela-tool__disabled">运行中…</span>;
  }

  if (hint === 'table' && Array.isArray(data)) {
    const rows = data as Record<string, unknown>[];
    if (!rows.length) return <span className="vx-vela-tool__muted">暂无数据</span>;
    const keys = Object.keys(rows[0]!);
    return (
      <div className="vx-vela-tool__table-wrap">
        <table className="vx-vela-tool__table">
          <thead>
            <tr>
              {keys.map((k) => (
                <th key={k}>
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {keys.map((k) => (
                  <td key={k}>
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
      <ul className="vx-vela-tool__list">
        {(data as unknown[]).map((item, i) => (
          <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
        ))}
      </ul>
    );
  }

  if (hint === 'text' && typeof data === 'string') {
    return <p className="vx-vela-tool__text">{data}</p>;
  }

  // 默认：JSON 原始输出
  return (
    <pre className="vx-vela-tool__pre">
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
    <div className="vx-vela-tool">
      <div className="vx-vela-tool__header">
        <span className="vx-vela-tool__label">
          工具
        </span>
        <code className="vx-vela-tool__code">
          {message.toolId}
        </code>
      </div>
      {renderData(message.data, message.displayHint)}
    </div>
  );
}

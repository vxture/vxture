import React from 'react';

export const metadata = { title: 'Styles Demo 2' };

type BlockProps = { title: string; children?: React.ReactNode };
const Block: React.FC<BlockProps> = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="mb-3 text-lg font-semibold">{title}</h2>
    <div className="rounded-lg border border-theme-border bg-theme-card p-4 shadow-theme">
      {children}
    </div>
  </section>
);

export default function Page() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">样式演示 · Demo 2</h1>

      <Block title="Tabs">
        <div className="tabs">
          <button className="tab tab-active">Tab A</button>
          <button className="tab">Tab B</button>
          <button className="tab">Tab C</button>
        </div>
      </Block>

      <Block title="Table">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>名称</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>条目 A</td>
                <td><span className="badge badge-success">已完成</span></td>
                <td>
                  <button className="btn btn-sm">查看</button>
                </td>
              </tr>
              <tr>
                <td>条目 B</td>
                <td><span className="badge badge-warning">进行中</span></td>
                <td>
                  <button className="btn btn-sm btn-outline">查看</button>
                </td>
              </tr>
              <tr>
                <td>条目 C</td>
                <td><span className="badge">待处理</span></td>
                <td>
                  <button className="btn btn-sm btn-danger">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Block>

      <Block title="Pagination">
        <div className="pagination">
          <button className="btn btn-sm">上一页</button>
          <span className="mx-2">1 / 10</span>
          <button className="btn btn-sm">下一页</button>
        </div>
      </Block>

      <Block title="Accordion">
        <div className="accordion">
          <details className="rounded border border-theme-border p-2">
            <summary className="cursor-pointer select-none">手风琴项 1</summary>
            <div className="mt-2 text-sm text-theme-text-secondary">内容区域 A</div>
          </details>
          <details className="mt-2 rounded border border-theme-border p-2">
            <summary className="cursor-pointer select-none">手风琴项 2</summary>
            <div className="mt-2 text-sm text-theme-text-secondary">内容区域 B</div>
          </details>
        </div>
      </Block>

      <Block title="Dropdown & Tooltip">
        <div className="flex flex-wrap items-center gap-4">
          <div className="dropdown relative">
            <button className="btn">下拉</button>
            <div className="dropdown-menu absolute left-0 mt-2 w-40 rounded border border-theme-border bg-theme-card p-2 shadow-theme">
              <a className="block rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800" href="#">菜单 A</a>
              <a className="block rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800" href="#">菜单 B</a>
            </div>
          </div>

          <div className="tooltip relative" data-tip="提示文字">
            <button className="btn">悬浮提示</button>
            <div className="tooltip-content absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg">
              提示文字
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
}

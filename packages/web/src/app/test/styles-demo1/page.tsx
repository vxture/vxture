import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Styles Demo 1',
};

type SectionProps = { title: string; className?: string; children?: React.ReactNode };
const Section: React.FC<SectionProps> = ({ title, className, children }) => (
  <section className={`mb-12 ${className ?? ''}`}>
    <h2 className="text-xl font-semibold mb-4 text-theme-text-primary">{title}</h2>
    <div className="rounded-lg border border-theme-border bg-theme-card p-4 shadow-theme">
      {children}
    </div>
  </section>
);

export default function Page() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 text-theme-text-primary">
      <h1 className="text-2xl font-bold mb-6">样式演示 · Demo 1</h1>

      {/* Buttons */}
      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <button className="btn">Primary</button>
          <button className="btn-secondary">Secondary</button>
          <button className="btn btn-sm">Small</button>
          <button className="btn btn-lg">Large</button>
          <button className="btn btn-outline">Outline</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-danger">Danger</button>
          <button className="btn btn-success">Success</button>
          <button className="btn btn-warning">Warning</button>
          <button className="btn btn-info">Info</button>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge">Default</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-warning">Warning</span>
          <span className="badge badge-danger">Danger</span>
          <span className="badge badge-info">Info</span>
          <span className="badge-sm badge">SM</span>
          <span className="badge-lg badge">LG</span>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="card-title">默认卡片</h3>
            <p className="card-body">
              这是一个基础卡片，用于展示内容区块，支持阴影与圆角，由 CSS 变量参与主题化。
            </p>
          </div>
          <div className="card card-elevated">
            <h3 className="card-title">凸起卡片</h3>
            <p className="card-body">更强的层次与突出效果。</p>
          </div>
          <div className="card card-outline">
            <h3 className="card-title">描边卡片</h3>
            <p className="card-body">使用 theme-border 与 card 背景。</p>
          </div>
        </div>
      </Section>

      {/* Form Inputs */}
      <Section title="Form Inputs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">输入框</label>
            <input className="input" placeholder="输入点什么..." />
          </div>
          <div>
            <label className="block mb-2">选择器</label>
            <select className="select">
              <option>选项 A</option>
              <option>选项 B</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-2">文本域</label>
            <textarea className="textarea" rows={4} placeholder="多行文本..." />
          </div>
        </div>
      </Section>

      {/* Colormap Utilities */}
      <Section title="Colormap Utilities">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="cm-primary-hero rounded-md p-4">
            <h3 className="font-semibold">Primary Hero</h3>
            <p className="cm-primary-text-desc">用于强调的主色区域。</p>
            <button className="cm-primary-cta mt-3 rounded px-3 py-1">主色 CTA</button>
          </div>
          <div className="cm-secondary-hero rounded-md p-4">
            <h3 className="font-semibold">Secondary Hero</h3>
            <p className="cm-secondary-text-desc">次级色系的强调区块。</p>
            <button className="cm-secondary-cta mt-3 rounded px-3 py-1">次级 CTA</button>
          </div>
          <div className="cm-success-hero rounded-md p-4">
            <h3 className="font-semibold">Success Hero</h3>
            <p className="cm-success-text-desc">成功提示区域。</p>
            <button className="cm-success-cta mt-3 rounded px-3 py-1">成功 CTA</button>
          </div>
          <div className="cm-danger-hero rounded-md p-4">
            <h3 className="font-semibold">Danger Hero</h3>
            <p className="cm-danger-text-desc">危险/警告区域。</p>
            <button className="cm-danger-cta mt-3 rounded px-3 py-1">危险 CTA</button>
          </div>
        </div>
      </Section>
    </div>
  );
}

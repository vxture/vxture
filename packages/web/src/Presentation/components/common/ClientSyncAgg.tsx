/**
 * ClientSyncAgg.tsx
 *
 * 功能：
 * - 统一聚合全局副作用组件（ThemeSync、I18nSync、AuthSync），便于集中挂载和管理
 * - 不渲染任何 UI，仅用于副作用统一挂载
 *
 * 用途：
 * - 供 src/app/layout.tsx 根组件调用，实现全局副作用统一生效
 * - 结构与 ThemeSync、I18nSync、AuthSync 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 依赖 ThemeSync、I18nSync、AuthSync 三大副作用组件
 * - 被 src/app/layout.tsx 根组件调用
 *
 * 设计规范：
 * - 只负责副作用聚合，不包含 UI 渲染和业务逻辑
 * - 命名、结构、注释与其它全局副作用组件保持一致
 *
 * @file ClientSyncAgg.tsx
 * @desc 全局副作用聚合组件，统一挂载 ThemeSync/I18nSync/AuthSync
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React
 * @see src/components/common/ThemeSync.tsx
 * @see src/components/common/I18nSync.tsx
 * @see src/components/common/AuthSync.tsx
 * @tags global-sync, component
 * @example <ClientSyncAgg />
 * @remarks 推荐在 src/app/layout.tsx 根组件中挂载，确保全局副作用统一生效。
 * @todo 支持更多副作用组件聚合
 */
'use client';
import ThemeSync from '@/Presentation/components/common/ThemeSync';
import I18nSync from '@/Presentation/components/common/I18nSync';
import AuthSync from '@/Presentation/components/common/AuthSync';
import type { ReactNode } from 'react';

export default function ClientSyncAgg(): ReactNode {
  return (
    <>
      <ThemeSync />
      <I18nSync />
      <AuthSync />
    </>
  );
}

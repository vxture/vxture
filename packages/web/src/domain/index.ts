/**
 * domain/index.ts - Domain Layer 统一导出
 *
 * 职责：
 * - 提供 Domain Layer 的统一导出接口
 * - 简化其他层对 Domain Layer 的引用
 *
 * @layer Domain
 */

// ============================================================================
// Shared - 共享领域
// ============================================================================

// 值对象
export * from './shared/valueObjects';

// 实体
export * from './shared/entities';

// 类型
export * from './shared/types';

// 异常
export * from './shared/exceptions';

// 仓储接口
export * from './shared/repositories';

// ============================================================================
// Layout - 布局领域
// ============================================================================

export * from './layout/header.model';
export * from './layout/footer.model';
export * from './layout/layout.repository';

// ============================================================================
// Homepage - 首页领域
// ============================================================================

export * from './homepage/hero.model';
export * from './homepage/features.model';
export * from './homepage/solutions.model';
export * from './homepage/cases.model';
export * from './homepage/cta.model';
export * from './homepage/homepage.aggregate';
export * from './homepage/homepage.repository';
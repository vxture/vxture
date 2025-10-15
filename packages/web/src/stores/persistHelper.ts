/**
 * persistHelper.ts
 *
 * 小型辅助函数集合，用于统一包装 zustand persist 的类型和 partialize 逻辑，
 * 提高可读性并减少重复 cast/any 的使用。
 */

import type { PersistOptions } from 'zustand/middleware';

export function makePersistOptions<TState extends object>(
  name: string,
  pick: (s: TState) => Partial<TState>
): PersistOptions<TState> {
  return {
    name,
    partialize: pick,
  } as PersistOptions<TState>;
}

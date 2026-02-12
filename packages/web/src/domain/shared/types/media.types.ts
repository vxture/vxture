/**
 * media.types.ts - 媒体相关类型定义
 *
 * Domain Layer - Shared Types
 *
 * @layer Domain
 * @category Shared - Types
 */

/**
 * 媒体类型
 */
export type MediaType = 'image' | 'video';

/**
 * 媒体对象
 */
export interface Media {
  type: MediaType;
  url?: string;
  videoUrl?: string;
  posterImage?: string;
  alt?: string;
}

/**
 * 封面图片
 */
export interface Cover {
  url: string;
  alt: string;
}

/**
 * 图标配置
 */
export interface Icon {
  name: string;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}
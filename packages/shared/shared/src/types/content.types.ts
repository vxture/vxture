/**
 * content.types.ts - Shared Content Type Definitions
 * @package @vxture/shared
 *
 * Description: Pure TypeScript types for content-related primitives.
 * Contains only base types, common component types, and utility types.
 * No page-specific, UI-layout-specific, or business content types allowed.
 *
 * @author AI-Generated
 * @date 2026-03-07
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Shared
 * @category Types
 *
 * @remarks
 * - Keep types framework-agnostic
 * - No React/Next.js dependencies
 * - No business logic
 *
 * @example
 * ```ts
 * import { ContentTheme, ButtonVariant, Link } from '@vxture/shared';
 *
 * const theme: ContentTheme = 'primary';
 * const buttonVariant: ButtonVariant = 'primary';
 * const link: Link = { label: 'Home', href: '/' };
 * ```
 */

// ============================================================================
// Base Enums & Primitive Types
// ============================================================================

/**
 * Content theme for styling
 * @description Standard theme variations used across components
 */
export type ContentTheme =
  | 'primary'
  | 'secondary'
  | 'brand'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

/**
 * Content intent for semantic meaning
 * @description Defines the purpose or intent of content
 */
export type ContentIntent =
  | 'cta'
  | 'solution'
  | 'case'
  | 'simulation'
  | 'feature';

/**
 * Content presentation variant
 * @description How content should be visually presented
 */
export type ContentVariant =
  | 'card'
  | 'grid'
  | 'list'
  | 'highlight'
  | 'default';

/**
 * Button style variant
 * @description Standard button appearance variations
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link';

/**
 * Media content type
 * @description Type of media asset
 */
export type MediaType =
  | 'image'
  | 'video';

/**
 * Icon name identifier
 * @description Generic type for icon names (specific to icon library used)
 * @remarks Was type IconName, now uses string directly for clarity
 */

// ============================================================================
// Common Component Types
// ============================================================================

/**
 * Basic link structure
 * @description Generic link with label and URL
 */
export interface Link {
  label: string;
  href: string;
}

/**
 * Action button with variant
 * @description Extends link with button styling
 */
export interface Action extends Link {
  variant: ButtonVariant;
  /** @remarks Was type IconName, now uses string directly */
  icon?: string;
}

/**
 * Call-to-action button
 * @description Simplified CTA button structure
 */
export interface CTA {
  label: string;
  href: string;
}

/**
 * Media asset
 * @description Generic media object with multiple formats
 */
export interface Media {
  type: MediaType;
  url?: string;
  videoUrl?: string;
  posterImage?: string;
  alt?: string;
}

/**
 * Cover image
 * @description Simple cover image structure
 */
export interface Cover {
  url: string;
  alt: string;
}

/**
 * Contact information item
 * @description Generic contact entry with icon
 */
export interface ContactItem {
  /** @remarks Was type IconName, now uses string directly */
  icon: string;
  value: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Generic API success response wrapper
 * @description Standard success response structure
 */
export interface SharedSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: number;
}

/**
 * Generic API error response wrapper
 * @description Standard error response structure
 */
export interface SharedErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: number;
}

/**
 * Generic API response type (success or error)
 * @description Union type for standard API responses
 */
export type SharedAPIResponse<T> = SharedSuccessResponse<T> | SharedErrorResponse;

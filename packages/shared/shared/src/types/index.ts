/**
 * Shared Type Definitions
 *
 * @module @vxture/shared/types
 * @description TypeScript types used across the Vxture platform
 */

// Auth Types
export type { UserInfo, LoginCredentials, LoginResponse, AuthState } from './auth.types';

// I18n Types
export type { LocaleType, I18nConfig, I18nResource, I18nState } from './locale.types';

// Theme Types
export type { ThemeType, ThemeConfig, ThemeState } from './theme.types';

// Content Types
export type {
  ContentTheme,
  ContentIntent,
  ContentVariant,
  ButtonVariant,
  MediaType,
  Link,
  Action,
  CTA,
  Media,
  Cover,
  ContactItem,
  SharedSuccessResponse,
  SharedErrorResponse,
  SharedAPIResponse,
} from './content.types';

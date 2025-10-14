/**
 * i18nStore.ts - 全局国际化（i18n）状态 Hook（Zustand + persist）
 *
 * 目的：提供一个轻量、类型安全且可持久化的多语言状态管理器，供 UI 组件
 * 在客户端读取/切换当前语言并获取翻译文本。
 *
 * 主要职责：
 *  - 保存当前语言标识（locale），并将该偏好持久化到浏览器存储
 *  - 将翻译数据（translations）与当前 locale 关联，支持按需替换/加载
 *  - 提供异步的 setLocale 方法以便未来替换为网络或动态 import 的加载方式
 *  - 提供同步的 t(key) 翻译工具函数，支持嵌套 key（如 'namespace.key'）且解析失败时返回原 key
 *
 * 设计要点（与项目约定保持一致）：
 *  - 类型优先：所有状态和方法均在接口中声明，便于 TS 严格模式下的维护
 *  - SSR 兼容：store 初始化不直接使用 window/localStorage；persist 中间件在客户端执行持久化
 *  - 可替换的资源加载：当前实现使用内联模拟数据，后续可将 translations 替换为动态 import 或后端 API
 *  - 最小持久化：仅持久化 locale 字段，避免将完整翻译数据写入 localStorage
 *
 * 导出：
 *  - useI18nStore: React Hook（Zustand store）
 *
 * 使用示例：
 *  const { locale, setLocale, t } = useI18nStore();
 *  await setLocale('en-US');
 *  t('common.submit'); // -> 翻译文本或原 key
 *
 * 质量与维护说明：
 *  - 若 translations 体积较大，请在 setLocale 中使用动态 import 或异步 fetch，并在加载期间
 *    提供 loading indicator（UI 层负责）。
 *  - t() 为基础实现，不包含占位符替换/复数规则；如需高级 i18n 功能，应引入 i18next 等库。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { I18N_CONFIG } from '@/constants/i18nConfig';

// ============================================================================
// 类型定义 - 明确暴露给调用方的类型契约
// ============================================================================

/**
 * 支持的语言枚举（目前项目支持的有限集合）
 * 若需要新增语言，请同时在 translations 常量和 I18N_CONFIG 中同步添加
 */
export type Locale = 'zh-CN' | 'en-US';

/**
 * 翻译文本结构的类型定义。
 * 注意：这是一个示例/子集结构，真实项目中建议将翻译按功能模块拆分并以 namespace 为单位管理。
 */
interface Translations {
  common: {
    backToHome: string;
    submit: string;
    cancel: string;
  };
  themeTest: {
    pageTitle: string;
    toggleThemeBtn: string;
  };
  // 扩展模块请在此处补充类型声明，或将此类型替换为更通用的 Record<string, any>
}

/**
 * Store 的状态与方法接口。注意：t() 的 key 类型为简单的联合与模板字面量，限定为 "namespace.key" 形式
 * 若要支持更复杂的路径或占位符系统，可将其签名放宽为 string 并在实现中增加校验。
 */
interface I18nState {
  /** 当前语言 */
  locale: Locale;

  /** 当前语言对应的翻译文本（内存缓存） */
  translations: Translations;

  /**
   * 切换语言并加载对应翻译
   * - 异步：为未来的动态加载/网络请求保留能力
   * - 成功后必须更新 locale 与 translations
   */
  setLocale: (locale: Locale) => Promise<void>;

  /**
   * 翻译函数：接收命名空间或命名空间 + 子键（例如 'common.submit'）并返回字符串
   * - 解析失败时返回原 key，帮助在运行时快速定位缺失翻译
   */
  t: (key: keyof Translations | `${keyof Translations}.${string}`) => string;
}

// ============================================================================
// 模拟翻译数据（开发/本地示例）
// - 生产：建议将这些 JSON 放到 public/locales 或通过接口按需加载
// - 为避免将大量翻译写入 localStorage，本项目只持久化 locale，translations 由内存管理
// ============================================================================
const translations: Record<Locale, Translations> = {
  'zh-CN': {
    common: {
      backToHome: '返回首页',
      submit: '提交',
      cancel: '取消',
    },
    themeTest: {
      pageTitle: '主题与多语言测试',
      toggleThemeBtn: '切换主题',
    },
  },
  'en-US': {
    common: {
      backToHome: 'Back to Home',
      submit: 'Submit',
      cancel: 'Cancel',
    },
    themeTest: {
      pageTitle: 'Theme & Language Test',
      toggleThemeBtn: 'Toggle Theme',
    },
  },
};

// ============================================================================
// Store 创建 - 使用 Zustand + persist 中间件
// - 仅持久化 locale 字段，translations 保持内存态，便于按需加载与避免大数据写入 localStorage
// ============================================================================
export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      // 初始值：使用全局配置中的默认 locale，保证与应用初始化逻辑一致
  locale: I18N_CONFIG.defaultLocale,
  translations: translations[I18N_CONFIG.defaultLocale],

      // 异步切换语言（当前实现为本地映射与延迟模拟）
      // - 建议在需要时替换为动态 import 或 fetch
      setLocale: async (locale) => {
        // 模拟网络延迟（开发时使用，生产可移除）
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 更新状态：locale 与对应 translations
        set({
          locale,
          translations: translations[locale],
        });
      },

      // 翻译工具函数：解析类似 'namespace.key.subkey' 的路径
      // - 当中间路径不存在或值不是对象时，返回原始 key，方便定位缺失翻译
      t: (key) => {
        const { translations } = get();
        const keys = key.split('.');

        // 逐层查找：使用 unknown + 类型守卫以避免使用 any
        let obj: unknown = translations as unknown;
        for (const k of keys) {
          if (typeof obj !== 'object' || obj === null) return key;
          // 将 obj 视为可用字符串索引的记录类型后访问键
          obj = (obj as Record<string, unknown>)[k];
        }

        // 最终应返回 string，否则视为未找到并返回原 key
        return typeof obj === 'string' ? obj : key;
      },
    }),
    {
      // 持久化配置：键名与项目常量对齐
      name: I18N_CONFIG.storageKey,

      // 只持久化语言偏好，避免将 translations（可能较大）写入存储
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

/**
 * I18n Store - 状态管理核心（基于 Zustand + persist）
 *
 * 说明：
 *   - 使用 persist 中间件保存用户语言偏好（只持久化 locale 字段，避免保存过多数据）。
 *   - setLocale 使用异步模拟加载流程（实际环境可换为 fetch 调用），并在加载完成后写入 translations。
 *   - t() 为简单的嵌套键解析器：支持 "namespace.key" 与更深层级结构，解析失败返回原 key（便于调试）。
 *
 * 设计与实现细节：
 *   - 持久化键名由 I18N_CONFIG.storageKey 管理，确保与项目其它部分一致。
 *   - translations 默认为 I18N_CONFIG.defaultLocale 对应的文本，方便首次渲染有可用文案。
 *   - setLocale 内部进行了延迟模拟（300ms），以便在开发时模拟网络加载感受；生产可移除该延迟。
 *
 * 性能与可维护性建议：
 *   - 若 translations 更大或需要按需加载，建议将 translations 的加载移到动态 import 或后端接口，并在 setLocale 中返回 Promise。
 *   - t() 的解析器为同步实现，若需支持占位符/复数形式等高级功能，可在此基础上扩展插件化解析器。
 */

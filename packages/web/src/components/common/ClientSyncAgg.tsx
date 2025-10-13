'use client';
/**
 * ClientSyncAgg.tsx - 客户端同步组件（聚合）
 *
 * 功能：
 *  - 在客户端统一同步全局状态到 DOM（主题、语言、认证检查等）。
 *  - 避免在 server component 中直接访问浏览器 API（window/localStorage/document）。
 *
 * 设计原则：
 *  - 该组件仅在客户端执行（'use client'），不在服务器端运行，避免 SSR 抛错。
 *  - 将多处小的同步逻辑聚合到一个组件内，减少在 layout 中重复声明 useEffect。
 *  - 对外部数据（localStorage、cookies）采用 try/catch 容错，避免页面崩溃。
 *
 * 作者：vxture team
 * 版权：Copyright (c) 2024 vxture
 * 时间：2024-06-01
 */

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useI18nStore } from '@/stores/i18nStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * ClientSyncAgg
 *  - 聚合客户端同步逻辑：theme / locale / auth
 *  - 返回 null（该组件仅执行副作用）
 */
export default function ClientSyncAgg(): null {
	// 从 zustand / store 获取需要的状态和方法（假定这些 hooks 为客户端 hooks）
	const theme = useThemeStore((s) => s.theme);
	const { locale, setLocale } = useI18nStore();
	const { token, logout } = useAuthStore();

	/**
	 * 主题同步
	 * - 目的：将当前主题写入 documentElement，供 CSS（tailwind/dark 模式）读取
	 * - 注意：
	 *   1) 该逻辑只在客户端执行（'use client'）。
	 *   2) 使用 try/catch 防止在极端环境下访问 document 报错。
	 */
	useEffect(() => {
		try {
			document.documentElement.setAttribute('data-theme', theme);
			if (theme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		} catch (e) {
			// 容错：若 document 不可用，忽略（不抛出）
		}
	}, [theme]);

	/**
	 * 语言同步
	 * - 目的：
	 *   1) 将 locale 写入 html.lang（无障碍 & SEO）。
	 *   2) 同步 meta[http-equiv="content-language"]（若存在）。
	 *   3) 如果本地 localStorage 中保存的语言与当前 store 不一致，则以 localStorage 为准并调用 setLocale。
	 * - 注意：
	 *   1) localStorage 访问包裹在 try/catch，避免 parse 错误中断页面。
	 *   2) setLocale 的调用会触发 store 更新（谨慎避免循环，store 实现应幂等）。
	 */
	useEffect(() => {
		try {
			document.documentElement.lang = locale;
			const langMeta = document.querySelector('meta[http-equiv="content-language"]');
			if (langMeta) langMeta.setAttribute('content', locale);

			const stored = localStorage.getItem('i18n-storage');
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					if (parsed.locale && parsed.locale !== locale) {
						// 以 localStorage 为准，更新 store
						setLocale(parsed.locale);
					}
				} catch {
					// ignore parse errors
				}
			}
		} catch (e) {
			// ignore DOM errors
		}
	}, [locale, setLocale]);

	/**
	 * 认证同步（令牌过期检查）
	 * - 目的：定期检查本地存储的 auth 信息（示例：timestamp）并在过期时调用 logout。
	 * - 注意：
	 *   1) 该逻辑为示例，实际项目应根据后端返回的 token 结构与过期时间实现正确校验。
	 *   2) 使用 setInterval 做周期检查，组件卸载时清理定时器。
	 */
	useEffect(() => {
		if (!token) return;
		let mounted = true;

		const checkTokenExpiry = () => {
			try {
				const storedAuth = localStorage.getItem('auth-storage');
				if (!storedAuth) return;
				const parsed = JSON.parse(storedAuth);
				const now = Date.now();
				// 示例规则：timestamp 存储 token 创建时间（或过期时间）
				if (parsed.timestamp && now - parsed.timestamp > 24 * 60 * 60 * 1000) {
					// token 过期，发起登出
					logout();
				}
			} catch {
				// ignore JSON parse 或 localStorage errors
			}
		};

		// initial
		if (mounted) checkTokenExpiry();
		const id = setInterval(checkTokenExpiry, 60 * 60 * 1000); // 每小时检查一次
		return () => {
			mounted = false;
			clearInterval(id);
		};
	}, [token, logout]);

	// 该组件仅执行副作用
	return null;
}

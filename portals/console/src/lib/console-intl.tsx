'use client';

import { createContext, useContext } from 'react';
import type { Locale } from '@vxture/shared';

type Messages = Record<string, unknown>;

type ConsoleIntlContextValue = {
  locale: Locale;
  messages: Messages;
};

const ConsoleIntlContext = createContext<ConsoleIntlContextValue | undefined>(undefined);

function getMessageValue(messages: Messages, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, messages);
}

function formatMessage(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

export function ConsoleIntlProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <ConsoleIntlContext.Provider value={{ locale, messages }}>
      {children}
    </ConsoleIntlContext.Provider>
  );
}

export function useConsoleLocale(): Locale {
  const context = useContext(ConsoleIntlContext);
  if (!context) {
    throw new Error('useConsoleLocale must be used within ConsoleIntlProvider');
  }
  return context.locale;
}

export function useConsoleTranslations(namespace?: string) {
  const context = useContext(ConsoleIntlContext);
  if (!context) {
    throw new Error('useConsoleTranslations must be used within ConsoleIntlProvider');
  }

  return (key: string, values?: Record<string, string | number>): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const value = getMessageValue(context.messages, fullKey);

    if (typeof value === 'string') {
      return formatMessage(value, values);
    }

    return fullKey;
  };
}

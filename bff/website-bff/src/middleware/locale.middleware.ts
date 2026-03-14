import { resolveLocale } from '@vxture/core-locale';
import type { LocaleRequest } from '@vxture/core-locale';

function adaptRequest(req: Request): LocaleRequest {
  return {
    headers: {
      get: (name: string) =>
        (req.headers[name.toLowerCase()] as string) ?? null,
    },
    cookies: req.cookies, // Express cookie-parser 解析后的对象
  };
}

const locale = resolveLocale(adaptRequest(req));
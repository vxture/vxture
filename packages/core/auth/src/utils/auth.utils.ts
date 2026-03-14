/**
 * auth.utils.ts - token 提取与解析工具
 * @package @vxture/core-auth
 * @description
 *   Bearer token 从 header 提取、JWT 过期时间检查等工具函数。
 */

// ============================================================================
// Bearer Token 提取
// ============================================================================

/**
 * 从 Authorization header 提取 Bearer token
 *
 * @example
 * extractBearerToken('Bearer eyJhbGci...')  // → 'eyJhbGci...'
 * extractBearerToken('invalid')             // → undefined
 * extractBearerToken(undefined)             // → undefined
 */
export function extractBearerToken(authHeader: string | null | undefined): string | undefined {
  if (!authHeader) return undefined;
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return undefined;
  return token;
}

/**
 * 从请求 headers 对象中提取 Bearer token
 * 兼容 Express req.headers 和 Web API Headers
 *
 * @example
 * extractBearerTokenFromHeaders({ authorization: 'Bearer eyJ...' })
 */
export function extractBearerTokenFromHeaders(
  headers: Record<string, string | string[] | undefined> | { get(name: string): string | null },
): string | undefined {
  let authHeader: string | null | undefined;

  if (typeof (headers as { get?: unknown }).get === 'function') {
    // Web API Headers / 标准 get() 接口
    authHeader = (headers as { get(name: string): string | null }).get('authorization');
  } else {
    // Express req.headers（对象形式）
    const raw = (headers as Record<string, string | string[] | undefined>)['authorization'];
    authHeader = Array.isArray(raw) ? raw[0] : raw;
  }

  return extractBearerToken(authHeader);
}

// ============================================================================
// Token 内容工具
// ============================================================================

/**
 * 判断 JWT 是否已过期（不验证签名，仅检查 exp 字段）
 * 用于快速过滤明显过期的 token，正式验证仍需 jwtService.verify()
 */
export function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * 获取 token 剩余有效时间（毫秒）
 * 返回负数表示已过期
 */
export function getTokenRemainingMs(token: string): number {
  try {
    const [, payload] = token.split('.');
    if (!payload) return -1;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    if (!decoded.exp) return Infinity;
    return decoded.exp * 1000 - Date.now();
  } catch {
    return -1;
  }
}

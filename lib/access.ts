/**
 * Cloudflare Access 校验
 * 推荐在 Cloudflare Access 中给 /review/* 创建应用与策略，
 * 允许名单中只有 REVIEWER_EMAILS 中的邮箱。这样 Worker 收到的
 * 请求必定带有 Cf-Access-Jwt-Assertion，由 Cloudflare 边缘网关签名。
 *
 * 这里只解析 payload 拿到 email claim（不重新校验签名——因为 Access
 * 已经在边缘层把非法请求挡掉了）。如需 Worker 内强校验：
 *   1. 缓存 https://<your-team>.cloudflareaccess.com/cdn-cgi/access/certs
 *   2. 用 jose 校验 Jwt
 */
import { env } from 'cloudflare:workers'

function readJwtEmail(jwt: string | null): string | null {
  if (!jwt) return null
  const parts = jwt.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    const json = JSON.parse(payload) as { email?: string; sub?: string }
    const email = String(json.email || '').trim().toLowerCase()
    return email || null
  } catch {
    return null
  }
}

export async function isReviewer(request: Request): Promise<boolean> {
  const expected = (((env as unknown as Record<string, string>).REVIEWER_EMAILS) || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (!expected.length) return false

  // 优先取 Access 注入的 email 头（（应用开启 "Enforce" 时边缘网关注入）
  const headerEmail = (request.headers.get('cf-access-authenticated-user-email') || '')
    .trim()
    .toLowerCase()
  if (headerEmail && expected.includes(headerEmail)) return true

  // 否则从 JWT payload 中解析
  const jwtEmail = readJwtEmail(request.headers.get('cf-access-jwt-assertion'))
  if (jwtEmail && expected.includes(jwtEmail)) return true

  // 本地开发兜底：保留对原 oai-authenticated-user-email 的兼容
  const legacyEmail = (request.headers.get('oai-authenticated-user-email') || '').trim().toLowerCase()
  if (legacyEmail && expected.includes(legacyEmail)) return true

  return false
}

export async function reviewerEmail(request: Request): Promise<string | null> {
  const headerEmail = (request.headers.get('cf-access-authenticated-user-email') || '').trim().toLowerCase()
  if (headerEmail) return headerEmail
  return readJwtEmail(request.headers.get('cf-access-jwt-assertion'))
}

export function crossSite(request: Request): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return true
  const origin = request.headers.get('origin')
  return !!origin && origin !== new URL(request.url).origin
}
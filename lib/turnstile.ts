import { env } from 'cloudflare:workers'

/**
 * Cloudflare Turnstile 服务端校验
 * 文档：https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * dev 环境若未配置 TURNSTILE_SECRET：返回 true（放行），
 * 但仍建议在 .dev.vars / wrangler secret 写入后再打开。
 */
export async function verifyTurnstile(token: string | null, ip: string | null): Promise<boolean> {
  const secret = (env as unknown as Record<string, string>).TURNSTILE_SECRET
  if (!secret) return true
  if (!token) return false
  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    return !!data.success
  } catch {
    return false
  }
}
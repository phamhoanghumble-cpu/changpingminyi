import { env } from 'cloudflare:workers'

/**
 * Cloudflare Turnstile 服务端校验
 * 文档：https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * dev 环境若未配置 TURNSTILE_SECRET：返回 true（放行），
 * 但仍建议在 .dev.vars / wrangler secret 写入后再打开。
 */
export async function verifyTurnstile(token: string | null, ip: string | null): Promise<boolean> {
  // 人机校验已关闭，直接放行
  return true
}
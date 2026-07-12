/**
 * Client IP extraction utility
 * Safely extracts client IP from request headers with fallback logic
 */

export function getClientIp(req: Request): string {
  // x-forwarded-for ヘッダーがある場合、最左端のIPを使用
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // x-real-ip ヘッダーがある場合
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // フォールバック（開発環境等）
  return '127.0.0.1'
}

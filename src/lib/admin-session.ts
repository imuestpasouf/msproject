/**
 * Admin session utilities — uses only Web Crypto API.
 * Compatible with both Edge Runtime (middleware) and Node.js (server actions).
 *
 * Token format:  <timestamp_ms>.<base64url(HMAC-SHA256(secret, timestamp_ms))>
 * Stateless: the server verifies the HMAC without any stored state.
 */

export const COOKIE_NAME = 'admin_session'
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 h

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromBase64Url(s: string): Uint8Array {
  const padded = s
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(s.length + ((4 - (s.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function importKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET env var is not set')
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Create a signed session token. */
export async function createSessionToken(): Promise<string> {
  const ts = Date.now().toString()
  const key = await importKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ts))
  return `${ts}.${toBase64Url(sig)}`
}

/**
 * Verify a session token.
 * Returns false if the signature is invalid OR the session has expired.
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dot = token.indexOf('.')
    if (dot === -1) return false

    const ts = token.slice(0, dot)
    const sigB64 = token.slice(dot + 1)

    const tsNum = parseInt(ts, 10)
    if (isNaN(tsNum) || Date.now() - tsNum > SESSION_DURATION_MS) return false

    const key = await importKey()
    const sig = fromBase64Url(sigB64).buffer as ArrayBuffer
    return await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(ts))
  } catch {
    return false
  }
}

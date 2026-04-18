'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSessionToken, COOKIE_NAME } from '@/lib/admin-session'

// ─── In-memory rate limiting ──────────────────────────────────────────────────
// Module-level → persists for the lifetime of the Node.js process.
// Acceptable for a single-server admin panel.

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 min

interface RateRecord {
  count: number
  lockedUntil: number // 0 = not locked
}

const rateMap = new Map<string, RateRecord>()

function getRecord(ip: string): RateRecord {
  const now = Date.now()
  const rec = rateMap.get(ip)
  // Auto-clear expired locks
  if (rec && rec.lockedUntil > 0 && now >= rec.lockedUntil) {
    rateMap.delete(ip)
    return { count: 0, lockedUntil: 0 }
  }
  return rec ?? { count: 0, lockedUntil: 0 }
}

function recordFailure(ip: string): RateRecord {
  const rec = getRecord(ip)
  rec.count++
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCK_DURATION_MS
  }
  rateMap.set(ip, rec)
  return rec
}

// ─── Server Action ────────────────────────────────────────────────────────────

export type LoginState = { error: string } | null

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // ── 1. Get client IP ──────────────────────────────────────────────────────
  const hdrs = await headers()
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0].trim() ??
    hdrs.get('x-real-ip') ??
    '::1'

  // ── 2. Rate limit check ───────────────────────────────────────────────────
  const existing = getRecord(ip)
  if (existing.lockedUntil > Date.now()) {
    const remainingMin = Math.ceil((existing.lockedUntil - Date.now()) / 60_000)
    return {
      error: `Trop de tentatives. Réessayez dans ${remainingMin} minute${remainingMin > 1 ? 's' : ''}.`,
    }
  }

  // ── 3. Validate password ──────────────────────────────────────────────────
  const password = (formData.get('password') as string | null)?.trim() ?? ''
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    // Env var missing — fail safely without leaking details
    return { error: 'Erreur de configuration serveur.' }
  }

  if (!password || password !== adminPassword) {
    const rec = recordFailure(ip)
    const remaining = MAX_ATTEMPTS - rec.count

    if (rec.lockedUntil > Date.now()) {
      return { error: 'Compte bloqué 15 minutes suite à trop de tentatives.' }
    }

    return {
      error:
        remaining > 0
          ? `Mot de passe incorrect — ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`
          : 'Mot de passe incorrect.',
    }
  }

  // ── 4. Success — create cookie & redirect ─────────────────────────────────
  rateMap.delete(ip)

  const token = await createSessionToken()
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // seconds
    path: '/',
  })

  // redirect() throws internally — must not be inside try/catch
  redirect('/admin/dashboard')
}

import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import type { Order, Product } from '@/lib/supabase/database.types'

export type OrderDetail = Order & { product: Product | null }

type Ctx = { params: Promise<{ id: string }> }

async function requireAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) return null
  return cookieStore
}

function makeDb(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

// ─── GET /api/admin/commandes/[id] ───────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Ctx) {
  const cookieStore = await requireAuth()
  if (!cookieStore) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const supabase = makeDb(cookieStore)

  const { data, error } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('id', id)
    .single()

  if (error || !data) return Response.json({ error: 'Commande introuvable' }, { status: 404 })

  type RawRow = Order & { products: Product | null }
  const row = data as RawRow
  const order: OrderDetail = { ...row, product: row.products ?? null, products: undefined } as OrderDetail

  return Response.json({ order })
}

// ─── PATCH /api/admin/commandes/[id] — update notes ──────────────────────────

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const cookieStore = await requireAuth()
  if (!cookieStore) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const allowed = ['notes_commercial'] as const
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: 'Aucun champ modifiable fourni' }, { status: 400 })
  }

  const supabase = makeDb(cookieStore)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from('orders').update(patch as any).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import type { Product } from '@/lib/supabase/database.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function calcPrixReduc(prix: number, reduction: number | null | undefined) {
  if (!reduction || reduction <= 0) return null
  return Math.round(prix * (1 - reduction / 100))
}

// ─── GET /api/admin/produits ──────────────────────────────────────────────────

export async function GET() {
  const cookieStore = await requireAuth()
  if (!cookieStore) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const supabase = makeDb(cookieStore)
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('ordre', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ products: (data ?? []) as Product[] })
}

// ─── POST /api/admin/produits ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const cookieStore = await requireAuth()
  if (!cookieStore) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const prix = Number(body.prix)
  const reduction = body.reduction != null ? Number(body.reduction) : null
  const prix_reduc = calcPrixReduc(prix, reduction)

  const supabase = makeDb(cookieStore)
  const { data, error } = await supabase
    .from('products')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ ...body, prix, reduction, prix_reduc } as any)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/catalogue')

  return Response.json({ product: data as Product }, { status: 201 })
}

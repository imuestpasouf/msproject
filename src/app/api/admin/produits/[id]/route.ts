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

type Ctx = { params: Promise<{ id: string }> }

// ─── GET /api/admin/produits/[id] ────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Ctx) {
  const cookieStore = await requireAuth()
  if (!cookieStore) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const supabase = makeDb(cookieStore)
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return Response.json({ error: 'Produit introuvable' }, { status: 404 })
  return Response.json({ product: data as Product })
}

// ─── PUT /api/admin/produits/[id] ─────────────────────────────────────────────

export async function PUT(request: NextRequest, { params }: Ctx) {
  const cookieStore = await requireAuth()
  if (!cookieStore) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const prix = body.prix != null ? Number(body.prix) : undefined
  const reduction = body.reduction != null ? Number(body.reduction) : null
  const prix_reduc = prix != null ? calcPrixReduc(prix, reduction) : undefined

  const patch = {
    ...body,
    ...(prix != null && { prix }),
    reduction,
    ...(prix_reduc !== undefined && { prix_reduc }),
  }

  const supabase = makeDb(cookieStore)
  const { data, error } = await supabase
    .from('products')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(patch as any)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/catalogue')

  return Response.json({ product: data as Product })
}

// ─── DELETE /api/admin/produits/[id] ─────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const cookieStore = await requireAuth()
  if (!cookieStore) return Response.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const supabase = makeDb(cookieStore)

  // Block deletion if active orders exist
  const INACTIVE_STATUTS = ['annulee', 'remboursee', 'livree']
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)
    .not('statut', 'in', `(${INACTIVE_STATUTS.join(',')})`)

  if (count && count > 0) {
    return Response.json(
      { error: `Impossible de supprimer : ${count} commande(s) active(s) liée(s) à ce produit.` },
      { status: 409 }
    )
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/catalogue')

  return Response.json({ success: true })
}

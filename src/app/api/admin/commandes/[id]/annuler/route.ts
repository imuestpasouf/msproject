import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import type { Order, Product } from '@/lib/supabase/database.types'

type Ctx = { params: Promise<{ id: string }> }

function makeDb(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

// Statuses where stock was already decremented (on valider)
const STOCK_DECREMENTED = ['validee', 'en_preparation', 'expediee']
const TERMINAL = ['livree', 'annulee', 'remboursee']

// ─── POST /api/admin/commandes/[id]/annuler ───────────────────────────────────

export async function POST(_req: NextRequest, { params }: Ctx) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const supabase = makeDb(cookieStore)

  // Fetch order
  const { data: orderRaw, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !orderRaw) {
    return Response.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  const order = orderRaw as Order

  if (TERMINAL.includes(order.statut)) {
    return Response.json(
      { error: `Impossible d'annuler : statut terminal "${order.statut}"` },
      { status: 409 }
    )
  }

  // Restore stock if it was decremented
  if (order.product_id && STOCK_DECREMENTED.includes(order.statut)) {
    const { data: prod } = await supabase
      .from('products')
      .select('stock')
      .eq('id', order.product_id)
      .single()

    if (prod) {
      const prodRow = prod as Pick<Product, 'stock'>
      await supabase
        .from('products')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ stock: prodRow.stock + 1 } as any)
        .eq('id', order.product_id)
    }
  }

  // Cancel order
  const { data: updated, error: updateErr } = await supabase
    .from('orders')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ statut: 'annulee' } as any)
    .eq('id', id)
    .select()
    .single()

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

  return Response.json({ order: updated as Order })
}

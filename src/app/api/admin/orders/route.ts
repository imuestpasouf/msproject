import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import type { Order } from '@/lib/supabase/database.types'

export type OrderWithProduct = Order & { product_nom: string | null }

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const filter = searchParams.get('filter')
  const search = searchParams.get('search')?.trim()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('orders')
    .select('*, products(nom)')
    .order('created_at', { ascending: false })

  if (filter === 'a_traiter') {
    query = query.in('statut', ['paiement_recu', 'validee'])
  } else if (filter === 'expediees') {
    query = query.eq('statut', 'expediee')
  } else if (filter === 'terminees') {
    query = query.in('statut', ['livree', 'annulee', 'remboursee'])
  }

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  type RawRow = Order & { products: { nom: string } | null }
  let orders: OrderWithProduct[] = ((data ?? []) as RawRow[]).map((o) => ({
    ...o,
    product_nom: o.products?.nom ?? null,
    products: undefined,
  }))

  if (search) {
    const s = search.toLowerCase()
    orders = orders.filter(
      (o) =>
        o.order_ref.toLowerCase().includes(s) ||
        `${o.client_prenom} ${o.client_nom}`.toLowerCase().includes(s)
    )
  }

  return Response.json({ orders })
}

import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import { sendEmail } from '@/lib/brevo'
import { buildConfirmationHtml, buildConfirmationInternalHtml } from '@/lib/emails/confirmation'
import type { Order } from '@/lib/supabase/database.types'

type Ctx = { params: Promise<{ id: string }> }

function makeDb(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

// ─── POST /api/admin/commandes/[id]/valider ───────────────────────────────────

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

  if (order.statut !== 'paiement_recu') {
    return Response.json(
      { error: `Impossible de valider : statut actuel "${order.statut}"` },
      { status: 409 }
    )
  }

  // Update order
  const { data: updated, error: updateErr } = await supabase
    .from('orders')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ statut: 'validee', traite_le: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single()

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

  // Send emails (non-blocking)
  const productNom = order.product_id
    ? (await supabase.from('products').select('nom').eq('id', order.product_id).single())
        .data?.nom ?? 'Montre D1 Milano'
    : 'Montre D1 Milano'

  const adminEmail = process.env.BREVO_SENDER_EMAIL!
  await Promise.allSettled([
    sendEmail(
      order.client_email,
      `Commande confirmée — ${order.order_ref}`,
      buildConfirmationHtml(order, productNom)
    ),
    sendEmail(
      adminEmail,
      `[D1 Milano] Commande à expédier — ${order.order_ref}`,
      buildConfirmationInternalHtml(order, productNom)
    ),
  ])

  return Response.json({ order: updated as Order })
}

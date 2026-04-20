import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import { sendEmail } from '@/lib/brevo'
import { buildExpeditionHtml } from '@/lib/emails/expedition'
import { sendWhatsAppExpedition } from '@/lib/whatsapp'
import type { Order } from '@/lib/supabase/database.types'

type Ctx = { params: Promise<{ id: string }> }

function makeDb(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

// ─── POST /api/admin/commandes/[id]/expedier ──────────────────────────────────

export async function POST(request: NextRequest, { params }: Ctx) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  let body: { suivi_numero?: string; suivi_lien?: string; service_livraison?: string } = {}
  try {
    body = await request.json()
  } catch {
    /* no body is fine */
  }

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

  const EXPEDITABLE = ['validee', 'en_preparation']
  if (!EXPEDITABLE.includes(order.statut)) {
    return Response.json(
      { error: `Impossible d'expédier : statut actuel "${order.statut}"` },
      { status: 409 }
    )
  }

  // Update order
  if (!body.suivi_numero?.trim()) {
    return Response.json({ error: 'Le numéro de suivi est obligatoire' }, { status: 400 })
  }

  const patch = {
    statut: 'expediee',
    expedie_le: new Date().toISOString(),
    suivi_numero: body.suivi_numero.trim(),
    ...(body.suivi_lien?.trim() && { suivi_lien: body.suivi_lien.trim() }),
    ...(body.service_livraison && { service_livraison: body.service_livraison }),
  }

  const { data: updated, error: updateErr } = await supabase
    .from('orders')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(patch as any)
    .eq('id', id)
    .select()
    .single()

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

  const updatedOrder = { ...order, ...patch } as Order

  // Send expedition email (non-blocking)
  const productNom = order.product_id
    ? (await supabase.from('products').select('nom').eq('id', order.product_id).single())
        .data?.nom ?? 'Montre D1 Milano'
    : 'Montre D1 Milano'

  await Promise.allSettled([
    sendEmail(
      order.client_email,
      `Votre commande est en route — ${order.order_ref}`,
      buildExpeditionHtml(updatedOrder, productNom)
    ),
    sendWhatsAppExpedition(updatedOrder),
  ])

  return Response.json({ order: updated as Order })
}

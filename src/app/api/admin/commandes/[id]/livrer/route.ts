import { cookies } from 'next/headers'
import { z } from 'zod'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import { sendEmail } from '@/lib/brevo'
import { buildLivraisonHtml } from '@/lib/emails/livraison'
import type { Order, Livraison } from '@/lib/supabase/database.types'

type Ctx = { params: Promise<{ id: string }> }

function makeDb(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

const BodySchema = z.object({
  montant_percu:    z.number().min(0),
  paiement_statut: z.enum(['percu', 'partiel', 'refuse']),
  livreur:         z.string().max(100).trim().optional(),
  notes:           z.string().max(500).trim().optional(),
})

// ─── POST /api/admin/commandes/[id]/livrer ────────────────────────────────────

export async function POST(request: NextRequest, { params }: Ctx) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await request.json())
  } catch (e) {
    const msg = e instanceof z.ZodError ? (e.issues[0]?.message ?? 'Données invalides') : 'Corps invalide'
    return Response.json({ error: msg }, { status: 400 })
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

  if (order.statut !== 'expediee') {
    return Response.json(
      { error: `Impossible de confirmer la livraison : statut actuel "${order.statut}"` },
      { status: 409 }
    )
  }

  // Update order statut
  const { data: updated, error: updateErr } = await supabase
    .from('orders')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ statut: 'livree' } as any)
    .eq('id', id)
    .select()
    .single()

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

  // Insert livraison record
  const { data: livraisonRow, error: livraisonErr } = await supabase
    .from('livraisons')
    .insert({
      order_id:        id,
      montant_percu:   body.montant_percu,
      paiement_statut: body.paiement_statut,
      livreur:         body.livreur ?? null,
      notes:           body.notes ?? null,
    })
    .select()
    .single()

  if (livraisonErr) {
    console.error('[livrer/livraison-insert]', livraisonErr.message)
  }

  // Email client (non-blocking)
  const productNom = order.product_id
    ? (await supabase.from('products').select('nom').eq('id', order.product_id).single())
        .data?.nom ?? 'Votre montre'
    : 'Votre montre'

  if (livraisonRow) {
    Promise.allSettled([
      sendEmail(
        order.client_email,
        `Commande livrée — ${order.order_ref}`,
        buildLivraisonHtml(order, livraisonRow as Livraison, productNom)
      ),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') console.error(`[livrer/notif-${i}]`, r.reason)
      })
    })
  }

  return Response.json({ order: updated as Order, livraison: livraisonRow })
}

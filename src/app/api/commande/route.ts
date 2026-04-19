import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/brevo'
import { buildReceptionHtml } from '@/lib/emails/reception'
import type { CartItem } from '@/context/CartContext'
import type { Order } from '@/lib/supabase/database.types'

type PaiementMethode = 'livraison' | 'alya'

interface AdresseForm {
  adresse: string
  ville: string
  code_postal: string
  instructions: string
}

interface OrderRequest {
  items: CartItem[]
  client: { prenom: string; nom: string; email: string; tel: string }
  livraison: AdresseForm
  facturation: AdresseForm | null
  paiement_methode: PaiementMethode
}

function generateOrderRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `D1-${code}`
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderRequest = await req.json()
    const { items, client, livraison, facturation, paiement_methode } = body

    if (!items?.length) return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    if (!client?.prenom || !client?.nom || !client?.email || !client?.tel) {
      return NextResponse.json({ error: 'Coordonnées incomplètes' }, { status: 400 })
    }
    if (!livraison?.adresse || !livraison?.ville) {
      return NextResponse.json({ error: 'Adresse de livraison incomplète' }, { status: 400 })
    }

    const order_ref = generateOrderRef()
    const supabase = createServiceClient()

    const factuNote = facturation
      ? `FACTURATION: ${facturation.adresse}, ${facturation.ville}${facturation.code_postal ? ', ' + facturation.code_postal : ''}`
      : null

    const rows = items.map((item) => ({
      order_ref,
      statut: 'en_attente_paiement' as const,
      product_id: item.product_id,
      quantite: item.quantite,
      prix_total: (item.prix_reduc ?? item.prix) * item.quantite,
      client_prenom: client.prenom,
      client_nom: client.nom,
      client_email: client.email,
      client_tel: client.tel,
      livraison_adresse: livraison.adresse,
      livraison_ville: livraison.ville,
      livraison_code_postal: livraison.code_postal || null,
      livraison_instructions: livraison.instructions || null,
      paiement_methode,
      notes_commercial: factuNote,
    }))

    const { data: inserted, error } = await supabase.from('orders').insert(rows).select().limit(1).single()
    if (error) {
      console.error('[commande/db]', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
    }

    // Decrement stock for each product
    for (const item of items) {
      const { data: prod } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single()
      if (prod) {
        await supabase
          .from('products')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update({ stock: Math.max(0, (prod as { stock: number }).stock - item.quantite) } as any)
          .eq('id', item.product_id)
      }
    }

    // Send confirmation email (non-blocking)
    const emailItems = items.map((item) => ({
      nom: item.nom,
      quantite: item.quantite,
      prix_total: (item.prix_reduc ?? item.prix) * item.quantite,
    }))

    Promise.allSettled([
      sendEmail(
        client.email,
        `Commande reçue — ${order_ref}`,
        buildReceptionHtml(inserted as Order, emailItems)
      ),
    ]).catch(() => {})

    return NextResponse.json({ order_ref })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[commande]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

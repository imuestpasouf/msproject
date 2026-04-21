import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/brevo'
import { buildReceptionHtml } from '@/lib/emails/reception'
import { sendWhatsAppReception } from '@/lib/whatsapp'
import type { Order } from '@/lib/supabase/database.types'

// ─── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory (single instance). Sufficient pour un déploiement Vercel standard.

const rateMap = new Map<string, number[]>()
const RATE_WINDOW = 60_000 // 1 minute
const RATE_MAX = 5         // 5 commandes par IP par fenêtre

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateMap.get(ip) ?? []).filter(t => now - t < RATE_WINDOW)
  if (hits.length >= RATE_MAX) return true
  rateMap.set(ip, [...hits, now])
  return false
}

// ─── Validation schema (Zod) ───────────────────────────────────────────────────

const AdresseSchema = z.object({
  adresse:      z.string().min(5).max(200).trim(),
  ville:        z.string().min(2).max(100).trim(),
  code_postal:  z.string().max(10).trim().default(''),
  instructions: z.string().max(500).trim().default(''),
})

const BodySchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantite:   z.number().int().min(1).max(10),
  })).min(1).max(10),
  client: z.object({
    prenom: z.string().min(1).max(50).trim(),
    nom:    z.string().min(1).max(50).trim(),
    email:  z.string().email().max(100).transform(s => s.toLowerCase()),
    tel:    z.string().min(8).max(20).regex(/^[\d\s()+\-.]+$/, 'Numéro de téléphone invalide'),
  }),
  livraison:        AdresseSchema,
  facturation:      AdresseSchema.nullable(),
  paiement_methode: z.enum(['livraison', 'alya']),
})

type Body = z.infer<typeof BodySchema>

// ─── Helper ────────────────────────────────────────────────────────────────────

function generateOrderRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `D1-${code}`
}

// ─── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans une minute.' },
      { status: 429 }
    )
  }

  // 2. Validation & sanitization via Zod (rejette tout ce qui ne colle pas au schéma)
  let body: Body
  try {
    body = BodySchema.parse(await req.json())
  } catch (e) {
    const msg = e instanceof z.ZodError
      ? (e.issues[0]?.message ?? 'Données invalides')
      : 'Corps de requête invalide'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { items, client, livraison, facturation, paiement_methode } = body

  try {
    const supabase = createServiceClient()

    // 3. Récupérer les produits réels depuis la DB — prix, stock, actif
    //    On n'utilise JAMAIS les prix envoyés par le client.
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, nom, ref, collection, photo_principale, prix, prix_reduc, actif, stock')
      .in('id', items.map(i => i.product_id))

    if (prodErr || !products?.length) {
      return NextResponse.json({ error: 'Produits introuvables' }, { status: 400 })
    }

    // 4. Validation métier : existence, disponibilité, stock suffisant
    for (const item of items) {
      const p = products.find(p => p.id === item.product_id)
      if (!p) {
        return NextResponse.json({ error: 'Produit introuvable' }, { status: 400 })
      }
      if (!p.actif) {
        return NextResponse.json({ error: `"${p.nom}" n'est plus disponible` }, { status: 400 })
      }
      if (p.stock < item.quantite) {
        return NextResponse.json(
          { error: `Stock insuffisant pour "${p.nom}" (disponible : ${p.stock})` },
          { status: 400 }
        )
      }
    }

    // 5. Décrémentation atomique du stock AVANT l'insert
    //    Verrou optimiste : l'UPDATE n'est exécuté que si stock >= quantite au moment du write.
    //    Si une requête concurrente a épuisé le stock entre le SELECT et l'UPDATE, on rollback.
    const decremented: Array<{ id: string; oldStock: number; qty: number }> = []

    for (const item of items) {
      const p = products.find(p => p.id === item.product_id)!
      const { data: updated } = await supabase
        .from('products')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ stock: p.stock - item.quantite } as any)
        .eq('id', item.product_id)
        .gte('stock', item.quantite) // condition atomique
        .select('id')

      if (!updated?.length) {
        // Rollback des décrémentations précédentes
        for (const d of decremented) {
          await supabase
            .from('products')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ stock: d.oldStock } as any)
            .eq('id', d.id)
        }
        return NextResponse.json(
          { error: `Stock épuisé pour "${p.nom}". Veuillez rafraîchir la page.` },
          { status: 409 }
        )
      }

      decremented.push({ id: item.product_id, oldStock: p.stock, qty: item.quantite })
    }

    // 6. Construction des lignes avec les PRIX SERVEUR (jamais ceux du client)
    const order_ref = generateOrderRef()

    const factuNote = facturation
      ? `FACTURATION: ${facturation.adresse}, ${facturation.ville}${facturation.code_postal ? ', ' + facturation.code_postal : ''}`
      : null

    const rows = items.map((item) => {
      const p = products.find(p => p.id === item.product_id)!
      return {
        order_ref,
        statut: 'en_attente_paiement' as const,
        product_id: item.product_id,
        quantite: item.quantite,
        prix_total: (p.prix_reduc ?? p.prix) * item.quantite, // ← prix DB, pas client
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
      }
    })

    const { data: inserted, error: insertErr } = await supabase
      .from('orders')
      .insert(rows)
      .select()
      .limit(1)
      .single()

    if (insertErr) {
      console.error('[commande/db]', insertErr.message)
      return NextResponse.json({ error: 'Erreur lors de la création de la commande' }, { status: 500 })
    }

    // 7. Notifications (non-bloquantes)
    const emailItems = items.map((item) => {
      const p = products.find(p => p.id === item.product_id)!
      return {
        nom: p.nom,
        quantite: item.quantite,
        prix_total: (p.prix_reduc ?? p.prix) * item.quantite,
      }
    })

    Promise.allSettled([
      sendEmail(
        client.email,
        `Commande reçue — ${order_ref}`,
        buildReceptionHtml(inserted as Order, emailItems)
      ),
      sendWhatsAppReception(
        inserted as Order,
        emailItems.reduce((s, i) => s + i.prix_total, 0)
      ),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.error(`[commande/notif-${i}]`, r.reason)
        }
      })
    })

    return NextResponse.json({ order_ref })
  } catch (e) {
    console.error('[commande]', e instanceof Error ? e.message : e)
    // Ne jamais exposer les détails internes au client
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

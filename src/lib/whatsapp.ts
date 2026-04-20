import { sendWhatsApp } from './brevo'
import type { Order } from './supabase/database.types'

// ─── Phone normalization ───────────────────────────────────────────────────────
// Brevo expects international format without "+", e.g. "212612345678"

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('212')) return digits
  if (digits.startsWith('0')) return '212' + digits.slice(1)
  return '212' + digits
}

// ─── Template IDs (set in .env.local) ─────────────────────────────────────────

function templateId(key: 'RECEPTION' | 'CONFIRMATION' | 'EXPEDITION'): number {
  const val = process.env[`BREVO_WHATSAPP_TEMPLATE_${key}`]
  return val ? parseInt(val, 10) : 0
}

// ─── Message senders ──────────────────────────────────────────────────────────

/**
 * Sent when the customer places an order.
 *
 * Template variables:
 *   {{1}} prénom
 *   {{2}} order_ref
 *   {{3}} total (MAD)
 *   {{4}} moyen de paiement
 */
export async function sendWhatsAppReception(
  order: Order,
  total: number
): Promise<void> {
  const id = templateId('RECEPTION')
  if (!id) return

  const PAIEMENT_LABELS: Record<string, string> = {
    livraison: 'Paiement à la livraison',
    alya: 'Paiement différé via Alya',
  }

  await sendWhatsApp(normalizePhone(order.client_tel), id, {
    '1': order.client_prenom,
    '2': order.order_ref,
    '3': total.toLocaleString('fr-MA'),
    '4': PAIEMENT_LABELS[order.paiement_methode ?? ''] ?? order.paiement_methode ?? '',
  })
}

/**
 * Sent when the admin validates the order.
 *
 * Template variables:
 *   {{1}} prénom
 *   {{2}} order_ref
 */
export async function sendWhatsAppConfirmation(order: Order): Promise<void> {
  const id = templateId('CONFIRMATION')
  if (!id) return

  await sendWhatsApp(normalizePhone(order.client_tel), id, {
    '1': order.client_prenom,
    '2': order.order_ref,
  })
}

/**
 * Sent when the admin ships the order.
 *
 * Template variables:
 *   {{1}} prénom
 *   {{2}} order_ref
 *   {{3}} service de livraison
 *   {{4}} numéro de suivi
 *   {{5}} lien de suivi (ou "—" si absent)
 */
export async function sendWhatsAppExpedition(order: Order): Promise<void> {
  const id = templateId('EXPEDITION')
  if (!id) return

  const orderWithExtra = order as Order & { service_livraison?: string | null }

  await sendWhatsApp(normalizePhone(order.client_tel), id, {
    '1': order.client_prenom,
    '2': order.order_ref,
    '3': orderWithExtra.service_livraison ?? '',
    '4': order.suivi_numero ?? '',
    '5': order.suivi_lien ?? '—',
  })
}

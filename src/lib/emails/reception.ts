import type { Order } from '@/lib/supabase/database.types'

function formatPrice(n: number) {
  return n.toLocaleString('fr-MA') + ' MAD'
}

const PAIEMENT_LABELS: Record<string, string> = {
  livraison: 'Paiement à la livraison',
  alya: 'Paiement différé via Alya',
}

export function buildReceptionHtml(order: Order, items: { nom: string; quantite: number; prix_total: number }[]): string {
  const total = items.reduce((s, i) => s + i.prix_total, 0)

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;font-size:13px;font-weight:300;color:#0a0a0a;border-bottom:1px solid #f0eee9;">
          ${item.nom}${item.quantite > 1 ? ` <span style="color:#9a9590;">×${item.quantite}</span>` : ''}
        </td>
        <td style="padding:10px 0;font-size:13px;font-weight:300;color:#c9956c;text-align:right;border-bottom:1px solid #f0eee9;">
          ${formatPrice(item.prix_total)}
        </td>
      </tr>`
    )
    .join('')

  const adresseLignes = [
    order.livraison_adresse,
    [order.livraison_code_postal, order.livraison_ville].filter(Boolean).join(' '),
    order.livraison_instructions,
  ]
    .filter(Boolean)
    .join('<br>')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Commande reçue — D1 Milano Maroc</title>
</head>
<body style="margin:0;padding:0;background:#f4f2ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#0a0a0a;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="background:#0a0a0a;padding:28px 36px;text-align:center;">
    <p style="font-size:20px;font-weight:300;letter-spacing:0.14em;color:#ffffff;margin:0 0 6px;">
      D<span style="color:#c9956c;">1</span> MILANO
    </p>
    <p style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(154,149,144,0.65);margin:0;">
      Maroc
    </p>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,#c9956c,#e8c4a8,#c9956c);"></div>

  <!-- Body -->
  <div style="background:#ffffff;padding:36px;">

    <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c9956c;margin:0 0 10px;">
      Commande reçue
    </p>
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.04em;margin:0 0 4px;color:#0a0a0a;">
      Merci, ${order.client_prenom}&nbsp;!
    </h1>
    <p style="font-size:12px;color:#9a9590;margin:0 0 28px;letter-spacing:0.06em;">
      N°&nbsp;${order.order_ref}
    </p>

    <p style="font-size:13px;font-weight:300;line-height:1.75;color:#3a3733;margin:0 0 28px;">
      Nous avons bien reçu votre commande et allons la traiter dans les plus brefs délais.<br>
      Notre équipe vous contactera par WhatsApp pour confirmer et organiser la livraison.
    </p>

    <!-- Items -->
    <div style="border:1px solid #e8e6e2;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9590;margin:0 0 14px;">
        Votre commande
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${itemsRows}
        <tr>
          <td style="padding:12px 0 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#9a9590;">Total TTC</td>
          <td style="padding:12px 0 0;font-size:16px;font-weight:300;color:#0a0a0a;text-align:right;">${formatPrice(total)}</td>
        </tr>
      </table>
    </div>

    <!-- Address -->
    <div style="margin-bottom:24px;">
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9590;margin:0 0 10px;">
        Adresse de livraison
      </p>
      <p style="font-size:13px;font-weight:300;line-height:1.7;color:#3a3733;margin:0;">
        ${order.client_prenom} ${order.client_nom}<br>
        ${adresseLignes}
      </p>
    </div>

    <!-- Payment -->
    ${order.paiement_methode ? `
    <div style="margin-bottom:28px;">
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9590;margin:0 0 6px;">
        Moyen de paiement
      </p>
      <p style="font-size:13px;font-weight:300;color:#3a3733;margin:0;">
        ${PAIEMENT_LABELS[order.paiement_methode] ?? order.paiement_methode}
      </p>
    </div>` : ''}

    <div style="height:1px;background:#e8e6e2;margin-bottom:24px;"></div>

    <p style="font-size:12px;font-weight:300;line-height:1.75;color:#9a9590;margin:0;">
      Pour toute question, contactez-nous sur WhatsApp ou répondez à cet email.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#0a0a0a;padding:20px 36px;text-align:center;">
    <p style="font-size:10px;color:rgba(154,149,144,0.5);margin:0;letter-spacing:0.12em;">
      D1 Milano Maroc · Casablanca
    </p>
  </div>

</div>
</body>
</html>`
}

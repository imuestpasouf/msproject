import type { Order, Livraison } from '@/lib/supabase/database.types'

function formatPrice(n: number) {
  return n.toLocaleString('fr-MA') + ' MAD'
}

const PAIEMENT_STATUT_LABELS: Record<Livraison['paiement_statut'], string> = {
  percu:   'Paiement reçu',
  partiel: 'Paiement partiel',
  refuse:  'Paiement refusé',
}

export function buildLivraisonHtml(order: Order, livraison: Livraison, productNom: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Commande livrée — ${order.order_ref}</title>
</head>
<body style="margin:0;padding:0;background:#f4f2ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#0a0a0a;">
<div style="max-width:560px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="background:#0a0a0a;padding:28px 36px;text-align:center;">
    <p style="font-size:22px;font-weight:700;letter-spacing:0.38em;text-transform:uppercase;color:#ffffff;margin:0 0 5px;font-family:'Helvetica Neue',Arial,sans-serif;">
      MS-STORE
    </p>
    <p style="font-size:8px;font-weight:300;letter-spacing:0.32em;text-transform:uppercase;color:rgba(154,149,144,0.65);margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">
      D1 Milano
    </p>
  </div>
  <div style="height:3px;background:linear-gradient(90deg,#16a34a,#4ade80,#16a34a);"></div>

  <!-- Body -->
  <div style="background:#ffffff;padding:36px;">

    <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#16a34a;margin:0 0 10px;">
      Commande livrée ✓
    </p>
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.04em;margin:0 0 4px;color:#0a0a0a;">
      Merci pour votre confiance, ${order.client_prenom}&nbsp;!
    </h1>
    <p style="font-size:12px;color:#9a9590;margin:0 0 28px;letter-spacing:0.06em;">
      N°&nbsp;${order.order_ref}
    </p>

    <p style="font-size:13px;font-weight:300;line-height:1.75;color:#3a3733;margin:0 0 28px;">
      Votre commande a bien été livrée. Nous espérons que votre montre vous satisfait pleinement.<br>
      Pour toute question, notre équipe reste disponible sur WhatsApp.
    </p>

    <!-- Order card -->
    <div style="border:1px solid #e8e6e2;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9590;margin:0 0 14px;">
        Votre commande
      </p>
      <p style="font-size:15px;font-weight:400;letter-spacing:0.04em;margin:0 0 6px;color:#0a0a0a;">
        ${productNom}
      </p>
      <p style="font-size:14px;font-weight:300;color:#c9956c;margin:0 0 12px;">
        ${formatPrice(order.prix_total)} TTC
      </p>
      <p style="font-size:12px;color:#9a9590;margin:0;">
        Paiement : ${PAIEMENT_STATUT_LABELS[livraison.paiement_statut]}
        ${livraison.paiement_statut !== 'percu' ? ` — ${formatPrice(livraison.montant_percu)} perçus` : ''}
      </p>
    </div>

    <div style="height:1px;background:#e8e6e2;margin-bottom:24px;"></div>

    <p style="font-size:12px;font-weight:300;line-height:1.75;color:#9a9590;margin:0;">
      Pour toute question ou réclamation, contactez-nous sur WhatsApp ou répondez à cet email.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#0a0a0a;padding:20px 36px;text-align:center;">
    <p style="font-size:10px;color:rgba(154,149,144,0.5);margin:0;letter-spacing:0.12em;">
      MS-Store · D1 Milano Maroc · Casablanca
    </p>
  </div>

</div>
</body>
</html>`
}

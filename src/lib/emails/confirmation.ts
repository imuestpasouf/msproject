import type { Order } from '@/lib/supabase/database.types'

function formatPrice(n: number) {
  return n.toLocaleString('fr-MA') + ' MAD'
}

export function buildConfirmationHtml(order: Order, productNom: string): string {
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
<title>Commande confirmée — D1 Milano Maroc</title>
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
      Commande confirmée
    </p>
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.04em;margin:0 0 4px;color:#0a0a0a;">
      Merci, ${order.client_prenom}&nbsp;!
    </h1>
    <p style="font-size:12px;color:#9a9590;margin:0 0 28px;letter-spacing:0.06em;">
      N°&nbsp;${order.order_ref}
    </p>

    <p style="font-size:13px;font-weight:300;line-height:1.75;color:#3a3733;margin:0 0 28px;">
      Votre commande a été validée et est en cours de préparation.<br>
      Notre équipe vous contactera sous peu par WhatsApp pour organiser la livraison.
    </p>

    <!-- Order card -->
    <div style="border:1px solid #e8e6e2;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9590;margin:0 0 14px;">
        Votre commande
      </p>
      <p style="font-size:15px;font-weight:400;letter-spacing:0.04em;margin:0 0 6px;color:#0a0a0a;">
        ${productNom}
      </p>
      <p style="font-size:14px;font-weight:300;color:#c9956c;margin:0 0 16px;">
        ${formatPrice(order.prix_total)} TTC
      </p>
      ${order.paiement_methode ? `<p style="font-size:12px;color:#9a9590;margin:0;">Paiement : ${order.paiement_methode}${order.paiement_ref ? ` — Réf. ${order.paiement_ref}` : ''}</p>` : ''}
    </div>

    <!-- Address -->
    <div style="margin-bottom:28px;">
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9590;margin:0 0 10px;">
        Adresse de livraison
      </p>
      <p style="font-size:13px;font-weight:300;line-height:1.7;color:#3a3733;margin:0;">
        ${order.client_prenom} ${order.client_nom}<br>
        ${adresseLignes}
      </p>
    </div>

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

export function buildConfirmationInternalHtml(order: Order, productNom: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Commande à expédier — ${order.order_ref}</title></head>
<body style="margin:0;padding:24px;font-family:Arial,sans-serif;background:#f4f2ef;color:#0a0a0a;">
<div style="max-width:500px;background:#fff;border:1px solid #e8e6e2;padding:28px;">
  <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c9956c;margin:0 0 8px;">
    Commande validée — à expédier
  </p>
  <h2 style="font-size:18px;font-weight:400;margin:0 0 20px;">N° ${order.order_ref}</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr><td style="padding:6px 0;color:#9a9590;width:140px;">Client</td><td>${order.client_prenom} ${order.client_nom}</td></tr>
    <tr><td style="padding:6px 0;color:#9a9590;">Email</td><td>${order.client_email}</td></tr>
    <tr><td style="padding:6px 0;color:#9a9590;">Téléphone</td><td>${order.client_tel}</td></tr>
    <tr><td style="padding:6px 0;color:#9a9590;">Produit</td><td>${productNom}</td></tr>
    <tr><td style="padding:6px 0;color:#9a9590;">Montant</td><td style="color:#c9956c;font-weight:500;">${order.prix_total.toLocaleString('fr-MA')} MAD</td></tr>
    <tr><td style="padding:6px 0;color:#9a9590;vertical-align:top;">Livraison</td><td>${order.livraison_adresse}, ${order.livraison_ville}${order.livraison_code_postal ? ' ' + order.livraison_code_postal : ''}</td></tr>
    ${order.livraison_instructions ? `<tr><td style="padding:6px 0;color:#9a9590;vertical-align:top;">Instructions</td><td>${order.livraison_instructions}</td></tr>` : ''}
  </table>
</div>
</body>
</html>`
}

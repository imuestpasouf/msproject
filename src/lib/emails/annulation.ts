import type { Order } from '@/lib/supabase/database.types'

function formatPrice(n: number) {
  return n.toLocaleString('fr-MA') + ' MAD'
}

export function buildAnnulationHtml(order: Order, productNom: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Commande annulée — D1 Milano Maroc</title>
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
  <div style="height:3px;background:linear-gradient(90deg,#ef4444,#fca5a5,#ef4444);"></div>

  <!-- Body -->
  <div style="background:#ffffff;padding:36px;">

    <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#ef4444;margin:0 0 10px;">
      Commande annulée
    </p>
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.04em;margin:0 0 4px;color:#0a0a0a;">
      Votre commande a été annulée
    </h1>
    <p style="font-size:12px;color:#9a9590;margin:0 0 28px;letter-spacing:0.06em;">
      N°&nbsp;${order.order_ref}
    </p>

    <p style="font-size:13px;font-weight:300;line-height:1.75;color:#3a3733;margin:0 0 28px;">
      Nous vous informons que votre commande a été annulée.<br>
      Si vous avez des questions, n&apos;hésitez pas à nous contacter directement.
    </p>

    <!-- Order card -->
    <div style="border:1px solid #e8e6e2;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#9a9590;margin:0 0 14px;">
        Commande annulée
      </p>
      <p style="font-size:15px;font-weight:400;letter-spacing:0.04em;margin:0 0 6px;color:#0a0a0a;">
        ${productNom}
      </p>
      <p style="font-size:14px;font-weight:300;color:#c9956c;margin:0;">
        ${formatPrice(order.prix_total)} TTC
      </p>
    </div>

    <div style="height:1px;background:#e8e6e2;margin-bottom:24px;"></div>

    <p style="font-size:12px;font-weight:300;line-height:1.75;color:#9a9590;margin:0;">
      Contactez-nous sur <a href="https://wa.me/212717706550" style="color:#9a9590;">WhatsApp</a> ou <a href="mailto:contact@ms-store.ma" style="color:#9a9590;">par mail</a>.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#0a0a0a;padding:24px 36px;text-align:center;">
    <div style="margin-bottom:12px;">
      <a href="https://wa.me/212717706550" style="display:inline-block;margin:0 10px;color:rgba(154,149,144,0.6);font-size:10px;text-decoration:none;letter-spacing:0.14em;text-transform:uppercase;">WhatsApp</a>
      <span style="color:rgba(154,149,144,0.25);">·</span>
      <a href="https://www.instagram.com/ms.store.d1milano" style="display:inline-block;margin:0 10px;color:rgba(154,149,144,0.6);font-size:10px;text-decoration:none;letter-spacing:0.14em;text-transform:uppercase;">Instagram</a>
    </div>
    <p style="font-size:10px;color:rgba(154,149,144,0.4);margin:0;letter-spacing:0.12em;">
      MS-Store · D1 Milano · Maroc
    </p>
  </div>

</div>
</body>
</html>`
}

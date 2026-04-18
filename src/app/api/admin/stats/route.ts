import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const [
    { count: total_commandes },
    { count: a_traiter },
    { count: expediees },
    { data: caData },
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('statut', ['paiement_recu', 'validee']),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('statut', 'expediee'),
    supabase
      .from('orders')
      .select('prix_total')
      .not('statut', 'in', '(en_attente_paiement,annulee,remboursee)'),
  ])

  const ca_total =
    ((caData ?? []) as { prix_total: number }[]).reduce(
      (sum, o) => sum + (o.prix_total ?? 0),
      0
    )

  return Response.json({
    total_commandes: total_commandes ?? 0,
    a_traiter: a_traiter ?? 0,
    expediees: expediees ?? 0,
    ca_total,
  })
}

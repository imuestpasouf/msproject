import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import type { SiteImage } from '@/lib/supabase/database.types'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Service-role client — bypasses RLS; no generic to avoid inference issues
  // with handwritten Database type vs GenericSchema constraints.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data, error } = await supabase.from('site_images').select('*')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const images: Record<string, string> = {}
  for (const row of (data ?? []) as SiteImage[]) {
    images[row.cle] = row.url
  }

  return Response.json({ images })
}

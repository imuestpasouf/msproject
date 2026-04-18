import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import { createServerClient } from '@supabase/ssr'
import { v2 as cloudinary } from 'cloudinary'

const VALID_KEYS = new Set(['hero', 'life1', 'life2', 'life3', 'life4'])
const MAX_SIZE = 5 * 1024 * 1024
const VALID_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Données invalides' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const cle = formData.get('cle') as string | null

  if (!file || !cle) {
    return Response.json({ error: 'Fichier et clé requis' }, { status: 400 })
  }

  if (!VALID_KEYS.has(cle)) {
    return Response.json({ error: 'Clé invalide' }, { status: 400 })
  }

  if (!VALID_TYPES.has(file.type)) {
    return Response.json({ error: 'Type non autorisé — JPG, PNG ou WebP uniquement' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'Fichier trop volumineux (max 5 MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

  let cloudResult: { secure_url: string }
  try {
    cloudResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'd1milano/site',
      public_id: `site_${cle}`,
      overwrite: true,
      resource_type: 'image',
    })
  } catch (err) {
    console.error('[upload-image] Cloudinary error:', err)
    return Response.json({ error: 'Erreur lors de l\'upload Cloudinary' }, { status: 500 })
  }

  const url = cloudResult.secure_url

  // Service-role client — no generic to avoid GenericSchema constraint issues
  // with handwritten Database type; upsert payload is cast explicitly.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { error: dbError } = await supabase
    .from('site_images')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert({ cle, url, updated_at: new Date().toISOString() } as any, { onConflict: 'cle' })

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  revalidatePath('/')

  return Response.json({ url })
}

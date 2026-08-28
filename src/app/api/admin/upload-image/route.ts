import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import { createServerClient } from '@supabase/ssr'
import { v2 as cloudinary } from 'cloudinary'

const VALID_KEYS = new Set(['hero', 'life1', 'life2', 'life3', 'life4', 'spotlight'])
const VIDEO_ALLOWED_KEYS = new Set(['hero', 'spotlight'])
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const MAX_IMAGE_SIZE = 5 * 1024 * 1024   // 5 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100 MB

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

  const isVideo = VIDEO_TYPES.has(file.type)
  const isImage = IMAGE_TYPES.has(file.type)

  if (!isImage && !isVideo) {
    return Response.json({ error: 'Type non autorisé — JPG, PNG, WebP, MP4 ou WebM uniquement' }, { status: 400 })
  }

  if (isVideo && !VIDEO_ALLOWED_KEYS.has(cle)) {
    return Response.json({ error: 'Vidéo non autorisée pour cet emplacement' }, { status: 400 })
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  if (file.size > maxSize) {
    return Response.json({ error: `Fichier trop volumineux (max ${isVideo ? '100' : '5'} MB)` }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Videos are always transcoded to H.264 MP4 on upload, regardless of the
  // source container/codec (e.g. a ProRes .mov won't play in any browser —
  // this guarantees a web-playable result without needing the source file
  // pre-processed). quality:'auto' keeps the file small enough to fully
  // buffer quickly, which matters for scroll-scrubbed playback.
  const uploadOptions = isVideo
    ? {
        folder: 'd1milano/site',
        public_id: `site_${cle}`,
        overwrite: true,
        resource_type: 'video' as const,
        format: 'mp4',
        video_codec: 'h264',
        quality: 'auto',
      }
    : { folder: 'd1milano/site', public_id: `site_${cle}`, overwrite: true, resource_type: 'auto' as const }

  let cloudResult: { secure_url: string }
  try {
    cloudResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) reject(error ?? new Error('Upload failed'))
        else resolve({ secure_url: result.secure_url })
      })
      stream.end(buffer)
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
  revalidatePath('/D1-Milano/[lang]', 'page')

  return Response.json({ url })
}

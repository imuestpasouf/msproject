import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/admin-session'
import { v2 as cloudinary } from 'cloudinary'

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
  if (!file) return Response.json({ error: 'Fichier manquant' }, { status: 400 })

  if (!VALID_TYPES.has(file.type)) {
    return Response.json({ error: 'Type non autorisé — JPG, PNG ou WebP uniquement' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'Fichier trop volumineux (max 5 MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

  let result: { secure_url: string }
  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder: 'd1milano/produits',
      resource_type: 'image',
    })
  } catch (err) {
    console.error('[upload-photo] Cloudinary error:', err)
    return Response.json({ error: "Erreur lors de l'upload Cloudinary" }, { status: 500 })
  }

  return Response.json({ url: result.secure_url })
}

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function uploadImage(
  file: string | Buffer,
  folder = 'D1Milano'
): Promise<{ url: string; publicId: string }> {
  const input = Buffer.isBuffer(file) ? `data:image/webp;base64,${file.toString('base64')}` : file

  const result = await cloudinary.uploader.upload(input, {
    folder,
    resource_type: 'image',
  })

  return { url: result.secure_url, publicId: result.public_id }
}

export { cloudinary }

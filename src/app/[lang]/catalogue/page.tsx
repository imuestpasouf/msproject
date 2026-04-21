import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import HomeCatalogueSection from '@/components/HomeCatalogueSection'
import { getDictionary, isLocale } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'
import type { Product } from '@/lib/supabase/database.types'

async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await createServiceClient()
      .from('products').select('*').eq('actif', true).order('ordre', { ascending: true })
    if (error || !data) return []
    return data as Product[]
  } catch { return [] }
}

export default async function CataloguePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const [products, dict] = await Promise.all([
    getProducts(),
    getDictionary(lang as Locale),
  ])

  const cs = dict.catalogue_section

  return (
    <div className="pt-[80px] min-h-screen">
      <div className="px-12 py-10 max-md:px-5 max-md:py-8">
        <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
          {cs.available_now}
        </p>
        <h1 className="font-display font-light leading-[1.15] text-black" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
          {cs.title_plain}{cs.title_plain ? ' ' : ''}<em className="italic text-gm">{cs.title_em}</em>
        </h1>
      </div>
      <HomeCatalogueSection products={products} />
    </div>
  )
}

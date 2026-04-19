import { createServiceClient } from '@/lib/supabase/service'
import HomeCatalogueSection from '@/components/HomeCatalogueSection'
import type { Product } from '@/lib/supabase/database.types'

export const metadata = {
  title: 'Catalogue — D1 Milano Maroc',
  description: 'Toutes les montres D1 Milano disponibles au Maroc.',
}

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('actif', true)
      .order('ordre', { ascending: true })
    if (error) { console.error('[catalogue/getProducts]', error); return [] }
    if (!data) return []
    return data as Product[]
  } catch (e) {
    console.error('[catalogue/getProducts]', e)
    return []
  }
}

export default async function CataloguePage() {
  const products = await getProducts()

  return (
    <div className="pt-[80px] min-h-screen">
      <div className="px-12 py-10 max-md:px-5 max-md:py-8">
        <p className="text-[0.66rem] tracking-[0.3em] uppercase text-rg font-normal mb-2.5">
          Disponible maintenant
        </p>
        <h1
          className="font-display font-light leading-[1.15] text-black"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
        >
          Nos <em className="italic text-gm">Montres</em>
        </h1>
      </div>
      <HomeCatalogueSection products={products} />
    </div>
  )
}

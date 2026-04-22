import { redirect } from 'next/navigation'

export default async function ProduitRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/D1-Milano/fr/produits/${id}`)
}

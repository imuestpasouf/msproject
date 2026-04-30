'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useLocale } from '@/context/LocaleContext'

function formatPrice(n: number) { return n.toLocaleString('fr-MA') + ' MAD' }

type PaiementMethode = 'livraison' | 'alya'
interface AdresseForm { adresse: string; ville: string; code_postal: string; instructions: string }
interface FormData {
  prenom: string; nom: string; email: string; tel: string
  livraison: AdresseForm; facturation_identique: boolean; facturation: AdresseForm
  paiement_methode: PaiementMethode
}
const emptyAdresse = (): AdresseForm => ({ adresse: '', ville: '', code_postal: '', instructions: '' })

const inputClass = 'w-full border border-gl bg-transparent px-4 py-3 text-[0.85rem] font-light text-black placeholder:text-gm focus:outline-none focus:border-black transition-colors'
const labelClass = 'block text-[0.62rem] tracking-[0.2em] uppercase text-gm mb-1.5'

function AdresseSection({ prefix, value, onChange, ot }: {
  prefix: string
  value: AdresseForm
  onChange: (v: AdresseForm) => void
  ot: { addr_street: string; addr_placeholder_street: string; addr_city: string; addr_placeholder_city: string; addr_postal: string; addr_placeholder_postal: string; addr_notes: string; addr_placeholder_notes: string }
}) {
  const set = (key: keyof AdresseForm) => (v: string) => onChange({ ...value, [key]: v })
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor={`${prefix}_adresse`} className={labelClass}>{ot.addr_street} *</label>
        <input id={`${prefix}_adresse`} type="text" required placeholder={ot.addr_placeholder_street} value={value.adresse} onChange={(e) => set('adresse')(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label htmlFor={`${prefix}_ville`} className={labelClass}>{ot.addr_city} *</label>
          <input id={`${prefix}_ville`} type="text" required placeholder={ot.addr_placeholder_city} value={value.ville} onChange={(e) => set('ville')(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor={`${prefix}_cp`} className={labelClass}>{ot.addr_postal}</label>
          <input id={`${prefix}_cp`} type="text" placeholder={ot.addr_placeholder_postal} value={value.code_postal} onChange={(e) => set('code_postal')(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor={`${prefix}_instructions`} className={labelClass}>{ot.addr_notes}</label>
        <textarea id={`${prefix}_instructions`} rows={2} placeholder={ot.addr_placeholder_notes} value={value.instructions} onChange={(e) => onChange({ ...value, instructions: e.target.value })} className={inputClass + ' resize-none'} />
      </div>
    </div>
  )
}

export default function CommandePage() {
  const { items, total, clearCart } = useCart()
  const { t, base } = useLocale()
  const ot = t.order

  const [form, setForm] = useState<FormData>({
    prenom: '', nom: '', email: '', tel: '',
    livraison: emptyAdresse(), facturation_identique: true,
    facturation: emptyAdresse(), paiement_methode: 'livraison',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderRef, setOrderRef] = useState<string | null>(null)

  if (items.length === 0 && !orderRef) {
    return (
      <div className="pt-[80px] min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-[1rem] font-light text-gd">{ot.empty}</p>
        <Link href={`${base}/catalogue`} className="text-[0.72rem] tracking-[0.2em] uppercase text-white bg-black px-6 py-3.5 no-underline hover:bg-rg transition-colors duration-200">
          {ot.see_catalogue}
        </Link>
      </div>
    )
  }

  if (orderRef) {
    return (
      <div className="pt-[80px] min-h-screen bg-off flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="w-14 h-14 bg-black flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="text-[0.62rem] tracking-[0.3em] uppercase text-rg mb-2">{ot.confirmed_tagline}</p>
          <h1 className="font-display font-light text-black mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
            {ot.confirmed_title}
          </h1>
          <p className="text-[0.78rem] text-gm mb-1">
            {ot.confirmed_ref} <strong className="text-black font-normal">{orderRef}</strong>
          </p>
          <p className="text-[0.78rem] text-gm">{ot.confirmed_email_sent}</p>
        </div>
        <div className="bg-white p-6 max-w-[400px] w-full">
          <p className="text-[0.68rem] text-gm leading-[1.9] text-center">
            📱 {ot.confirmed_contact}
          </p>
        </div>
        <Link href={`${base}/catalogue`} className="text-[0.68rem] tracking-[0.18em] uppercase text-gm no-underline hover:text-black transition-colors">
          {ot.back_catalogue}
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/commande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          client: { prenom: form.prenom, nom: form.nom, email: form.email, tel: form.tel },
          livraison: form.livraison,
          facturation: form.facturation_identique ? null : form.facturation,
          paiement_methode: form.paiement_methode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue')
      clearCart(); setOrderRef(data.order_ref)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const setField = (key: keyof Pick<FormData, 'prenom' | 'nom' | 'email' | 'tel'>) =>
    (v: string) => setForm((f) => ({ ...f, [key]: v }))

  const itemCount = items.reduce((s, i) => s + i.quantite, 0)

  return (
    <div className="pt-[80px] min-h-screen bg-off">
      <div className="max-w-[1100px] mx-auto px-6 py-12 max-md:py-8">
        <div className="mb-8">
          <p className="text-[0.62rem] tracking-[0.28em] uppercase text-rg mb-1.5">{ot.tagline}</p>
          <h1 className="font-display font-light text-black" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)' }}>{ot.title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-6">{ot.coords}</p>
              <div className="grid grid-cols-2 gap-4 mb-4 max-md:grid-cols-1">
                <div>
                  <label htmlFor="prenom" className={labelClass}>{ot.first_name} *</label>
                  <input id="prenom" type="text" required placeholder={ot.first_name} value={form.prenom} onChange={(e) => setField('prenom')(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="nom" className={labelClass}>{ot.last_name} *</label>
                  <input id="nom" type="text" required placeholder={ot.last_name} value={form.nom} onChange={(e) => setField('nom')(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <div>
                  <label htmlFor="email" className={labelClass}>{ot.email} *</label>
                  <input id="email" type="email" required placeholder="votre@email.com" value={form.email} onChange={(e) => setField('email')(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="tel" className={labelClass}>{ot.phone} *</label>
                  <input id="tel" type="tel" required placeholder="06 XX XX XX XX" value={form.tel} onChange={(e) => setField('tel')(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-6">{ot.delivery_address}</p>
              <AdresseSection prefix="livraison" value={form.livraison} onChange={(v) => setForm((f) => ({ ...f, livraison: v }))} ot={ot} />
            </div>

            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-5">{ot.billing_address}</p>
              <label className="flex items-center gap-3 cursor-pointer mb-5">
                <input type="checkbox" checked={form.facturation_identique} onChange={(e) => setForm((f) => ({ ...f, facturation_identique: e.target.checked }))} className="w-4 h-4 accent-black cursor-pointer" />
                <span className="text-[0.78rem] font-light text-gd">{ot.billing_same}</span>
              </label>
              {!form.facturation_identique && (
                <AdresseSection prefix="facturation" value={form.facturation} onChange={(v) => setForm((f) => ({ ...f, facturation: v }))} ot={ot} />
              )}
            </div>

            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-5">{ot.payment_method}</p>
              <div className="flex flex-col gap-3">
                {([
                  { value: 'livraison' as const, label: ot.pay_cod_label, desc: ot.pay_cod_desc },
                  { value: 'alya' as const, label: ot.pay_alya_label, desc: ot.pay_alya_desc },
                ]).map((opt) => (
                  <label key={opt.value} className={['flex items-start gap-4 p-4 border cursor-pointer transition-colors', form.paiement_methode === opt.value ? 'border-black' : 'border-gl hover:border-gm'].join(' ')}>
                    <input type="radio" name="paiement_methode" value={opt.value} checked={form.paiement_methode === opt.value} onChange={() => setForm((f) => ({ ...f, paiement_methode: opt.value }))} className="mt-0.5 accent-black cursor-pointer" />
                    <div>
                      <p className="text-[0.82rem] font-normal text-black mb-0.5">{opt.label}</p>
                      <p className="text-[0.72rem] text-gm font-light">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-5 py-4">
                <p className="text-[0.78rem] text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-6 py-4 transition-colors hover:bg-rg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none">
              {loading ? ot.submitting : ot.submit}
            </button>
          </form>

          {/* Summary */}
          <div className="flex flex-col gap-[2px] md:sticky md:top-24 self-start">
            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-5">
                {ot.summary_prefix} {itemCount} {itemCount === 1 ? t.cart.n_item.replace('{n}', '') : t.cart.n_items.replace('{n}', '').trim()}
              </p>
              <div className="flex flex-col gap-4 mb-5">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-3 items-center">
                    <div className="flex-shrink-0 bg-off overflow-hidden" style={{ width: 56, height: 56 }}>
                      {item.photo_principale ? (
                        <Image src={item.photo_principale} alt={item.nom} width={56} height={56} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full bg-gl" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.75rem] font-light text-black truncate">{item.nom}</p>
                      <p className="text-[0.62rem] text-gm">Réf. {item.ref} · ×{item.quantite}</p>
                    </div>
                    <span className="text-[0.78rem] font-light flex-shrink-0" style={{ color: item.prix_reduc ? '#c9956c' : '#0a0a0a' }}>
                      {formatPrice((item.prix_reduc ?? item.prix) * item.quantite)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-[1px] bg-gl mb-5" />
              <div className="flex justify-between items-baseline">
                <span className="text-[0.62rem] tracking-[0.2em] uppercase text-gm">{ot.total_ttc}</span>
                <span className="text-[1.2rem] font-light">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="bg-white p-4 text-center">
              <Link href={`${base}/panier`} className="text-[0.65rem] tracking-[0.14em] uppercase text-gm no-underline hover:text-black transition-colors">
                {ot.edit_cart}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

function formatPrice(n: number) { return n.toLocaleString('fr-MA') + ' MAD' }

type PaiementMethode = 'livraison' | 'alya'

interface AdresseForm {
  adresse: string
  ville: string
  code_postal: string
  instructions: string
}

interface FormData {
  prenom: string
  nom: string
  email: string
  tel: string
  livraison: AdresseForm
  facturation_identique: boolean
  facturation: AdresseForm
  paiement_methode: PaiementMethode
}

const emptyAdresse = (): AdresseForm => ({ adresse: '', ville: '', code_postal: '', instructions: '' })

const inputClass =
  'w-full border border-gl bg-transparent px-4 py-3 text-[0.85rem] font-light text-black placeholder:text-gm focus:outline-none focus:border-black transition-colors'
const labelClass = 'block text-[0.62rem] tracking-[0.2em] uppercase text-gm mb-1.5'

function Field({
  label, id, type = 'text', placeholder, value, onChange, required = false,
}: {
  label: string; id: string; type?: string; placeholder?: string
  value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}{required && ' *'}</label>
      <input
        id={id} type={type} required={required} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}
      />
    </div>
  )
}

function AdresseSection({
  prefix, value, onChange,
}: {
  prefix: string
  value: AdresseForm
  onChange: (v: AdresseForm) => void
}) {
  const set = (key: keyof AdresseForm) => (v: string) => onChange({ ...value, [key]: v })
  return (
    <div className="flex flex-col gap-4">
      <Field label="Adresse" id={`${prefix}_adresse`} required placeholder="Rue, numéro…" value={value.adresse} onChange={set('adresse')} />
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Field label="Ville" id={`${prefix}_ville`} required placeholder="Casablanca" value={value.ville} onChange={set('ville')} />
        <Field label="Code postal" id={`${prefix}_cp`} placeholder="20000" value={value.code_postal} onChange={set('code_postal')} />
      </div>
      <div>
        <label htmlFor={`${prefix}_instructions`} className={labelClass}>Instructions de livraison</label>
        <textarea
          id={`${prefix}_instructions`}
          rows={2}
          placeholder="Étage, digicode, remarques…"
          value={value.instructions}
          onChange={(e) => onChange({ ...value, instructions: e.target.value })}
          className={inputClass + ' resize-none'}
        />
      </div>
    </div>
  )
}

export default function CommandePage() {
  const { items, total, clearCart } = useCart()
  const [form, setForm] = useState<FormData>({
    prenom: '', nom: '', email: '', tel: '',
    livraison: emptyAdresse(),
    facturation_identique: true,
    facturation: emptyAdresse(),
    paiement_methode: 'livraison',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderRef, setOrderRef] = useState<string | null>(null)

  if (items.length === 0 && !orderRef) {
    return (
      <div className="pt-[80px] min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-[1rem] font-light text-gd">Votre panier est vide</p>
        <Link href="/catalogue" className="text-[0.72rem] tracking-[0.2em] uppercase text-white bg-black px-6 py-3.5 no-underline hover:bg-rg transition-colors duration-200">
          Voir le catalogue
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
          <p className="text-[0.62rem] tracking-[0.3em] uppercase text-rg mb-2">Commande confirmée</p>
          <h1 className="font-display font-light text-black mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
            Merci pour votre commande
          </h1>
          <p className="text-[0.78rem] text-gm mb-1">
            Référence : <strong className="text-black font-normal">{orderRef}</strong>
          </p>
          <p className="text-[0.78rem] text-gm">Un email de confirmation vous a été envoyé.</p>
        </div>
        <div className="bg-white p-6 max-w-[400px] w-full">
          <p className="text-[0.68rem] text-gm leading-[1.9] text-center">
            📱 Nous vous contacterons par <strong className="text-rg">email & WhatsApp</strong><br />
            pour confirmer votre commande et organiser la livraison.
          </p>
        </div>
        <Link href="/catalogue" className="text-[0.68rem] tracking-[0.18em] uppercase text-gm no-underline hover:text-black transition-colors">
          ← Retour au catalogue
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
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
      clearCart()
      setOrderRef(data.order_ref)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const setField = (key: keyof Pick<FormData, 'prenom' | 'nom' | 'email' | 'tel'>) =>
    (v: string) => setForm((f) => ({ ...f, [key]: v }))

  return (
    <div className="pt-[80px] min-h-screen bg-off">
      <div className="max-w-[1100px] mx-auto px-6 py-12 max-md:py-8">

        <div className="mb-8">
          <p className="text-[0.62rem] tracking-[0.28em] uppercase text-rg mb-1.5">Finaliser</p>
          <h1 className="font-display font-light text-black" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)' }}>
            Votre commande
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8">

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Coordonnées */}
            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-6">Vos coordonnées</p>
              <div className="grid grid-cols-2 gap-4 mb-4 max-md:grid-cols-1">
                <Field label="Prénom" id="prenom" required placeholder="Votre prénom" value={form.prenom} onChange={setField('prenom')} />
                <Field label="Nom" id="nom" required placeholder="Votre nom" value={form.nom} onChange={setField('nom')} />
              </div>
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <Field label="Email" id="email" type="email" required placeholder="votre@email.com" value={form.email} onChange={setField('email')} />
                <Field label="Téléphone" id="tel" type="tel" required placeholder="06 XX XX XX XX" value={form.tel} onChange={setField('tel')} />
              </div>
            </div>

            {/* Adresse de livraison */}
            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-6">Adresse de livraison</p>
              <AdresseSection
                prefix="livraison"
                value={form.livraison}
                onChange={(v) => setForm((f) => ({ ...f, livraison: v }))}
              />
            </div>

            {/* Adresse de facturation */}
            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-5">Adresse de facturation</p>
              <label className="flex items-center gap-3 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={form.facturation_identique}
                  onChange={(e) => setForm((f) => ({ ...f, facturation_identique: e.target.checked }))}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="text-[0.78rem] font-light text-gd">Identique à l&apos;adresse de livraison</span>
              </label>
              {!form.facturation_identique && (
                <AdresseSection
                  prefix="facturation"
                  value={form.facturation}
                  onChange={(v) => setForm((f) => ({ ...f, facturation: v }))}
                />
              )}
            </div>

            {/* Moyen de paiement */}
            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-5">Moyen de paiement</p>
              <div className="flex flex-col gap-3">
                {([
                  { value: 'livraison', label: 'Paiement à la livraison', desc: 'Vous payez au moment de la réception.' },
                  { value: 'alya', label: 'Paiement différé via Alya', desc: 'Financez votre montre en plusieurs fois.' },
                ] as const).map((opt) => (
                  <label
                    key={opt.value}
                    className={[
                      'flex items-start gap-4 p-4 border cursor-pointer transition-colors',
                      form.paiement_methode === opt.value ? 'border-black' : 'border-gl hover:border-gm',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="paiement_methode"
                      value={opt.value}
                      checked={form.paiement_methode === opt.value}
                      onChange={() => setForm((f) => ({ ...f, paiement_methode: opt.value }))}
                      className="mt-0.5 accent-black cursor-pointer"
                    />
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

            <button
              type="submit"
              disabled={loading}
              className="text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-6 py-4 transition-colors hover:bg-rg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
            >
              {loading ? 'Envoi en cours…' : '✦ Confirmer la commande ✦'}
            </button>
          </form>

          {/* Summary */}
          <div className="flex flex-col gap-[2px] md:sticky md:top-24 self-start">
            <div className="bg-white p-6">
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-gm mb-5">
                Récapitulatif · {items.reduce((s, i) => s + i.quantite, 0)} article{items.reduce((s, i) => s + i.quantite, 0) !== 1 ? 's' : ''}
              </p>

              <div className="flex flex-col gap-4 mb-5">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-3 items-center">
                    <div className="flex-shrink-0 bg-off overflow-hidden" style={{ width: 56, height: 56 }}>
                      {item.photo_principale ? (
                        <Image src={item.photo_principale} alt={item.nom} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gl" />
                      )}
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
                <span className="text-[0.62rem] tracking-[0.2em] uppercase text-gm">Total TTC</span>
                <span className="text-[1.2rem] font-light">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="bg-white p-4 text-center">
              <Link href="/panier" className="text-[0.65rem] tracking-[0.14em] uppercase text-gm no-underline hover:text-black transition-colors">
                ← Modifier le panier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

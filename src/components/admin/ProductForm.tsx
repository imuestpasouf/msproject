'use client'

import { useRef, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/supabase/database.types'

// ─── Schema ───────────────────────────────────────────────────────────────────
// Use z.coerce for numbers (keeps TypeScript happy with zodResolver).
// Optional strings stay as z.string().nullable().optional() — empty strings
// are sent as-is; the API route normalises '' → null before upsert.

const optStr = z.string().nullable().optional()

const productSchema = z
  .object({
    // Photos
    photo_principale: z.string().min(1, 'Photo principale requise'),
    photo_2: z.string().min(1, 'Photo 2 requise'),
    photo_3: optStr,
    photo_4: optStr,
    photo_5: optStr,

    // Identité
    nom: z.string().min(1, 'Requis'),
    ref: z.string().min(1, 'Requis'),
    collection: z.string().min(1, 'Requis'),
    ordre: z.coerce.number().int().min(0),
    mention: optStr,
    sku: optStr,
    actif: z.boolean(),

    // Prix
    prix: z.coerce.number().positive('Prix doit être > 0'),
    // 0 means "no reduction"; transformed to null in onSubmit
    reduction: z.coerce.number().min(0).max(100).nullable().optional(),

    // Stock
    stock: z.coerce.number().int().min(0, 'Stock ≥ 0'),

    // Caractéristiques
    boitier: z.string().min(1, 'Requis'),
    materiau: z.string().min(1, 'Requis'),
    bracelet: optStr,
    fermoir: optStr,
    lunette: optStr,
    fond: optStr,
    cadran: optStr,
    aiguilles: optStr,
    verre: optStr,
    mouvement: optStr,
    resistance: optStr,

    // Description
    description: optStr,
  })
  .superRefine((data, ctx) => {
    const photos = [data.photo_principale, data.photo_2, data.photo_3, data.photo_4, data.photo_5]
    if (photos.filter(Boolean).length < 3) {
      ctx.addIssue({
        code: 'custom',
        message: 'Au moins 3 photos requises (principale + 2)',
        path: ['photo_3'],
      })
    }
  })

type FormValues = z.infer<typeof productSchema>

// ─── Constants ────────────────────────────────────────────────────────────────

const COLLECTIONS = ['Polycarbon', 'Premium', 'Camo', 'Ultra Thin', 'Skeleton', 'Autre']

const MENTIONS = [
  { value: '', label: 'Aucune' },
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'populaire', label: 'Populaire' },
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'premium', label: 'Premium' },
  { value: 'finserie', label: 'Fin de série' },
  { value: 'limitee', label: 'Édition limitée' },
  { value: 'exclusivite', label: 'Exclusivité' },
]

type PhotoKey = 'photo_principale' | 'photo_2' | 'photo_3' | 'photo_4' | 'photo_5'

const PHOTO_SLOTS: { key: PhotoKey; label: string; required: boolean }[] = [
  { key: 'photo_principale', label: 'Principale', required: true },
  { key: 'photo_2', label: 'Photo 2', required: true },
  { key: 'photo_3', label: 'Photo 3', required: false },
  { key: 'photo_4', label: 'Photo 4', required: false },
  { key: 'photo_5', label: 'Photo 5', required: false },
]

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  'w-full bg-white/5 border border-white/10 text-white text-[0.8rem] px-3 py-2.5 focus:outline-none focus:border-rg transition-colors duration-150 placeholder-white/20'
const labelCls = 'block text-[0.65rem] tracking-[0.18em] uppercase mb-1.5'
const sectionCls = 'mb-8'
const sectionTitleCls =
  'text-[0.6rem] tracking-[0.25em] uppercase mb-4 pb-2 border-b flex items-center gap-2'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-[0.7rem] text-red-400">{msg}</p>
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductForm({
  initialData,
  mode,
}: {
  initialData?: Product
  mode: 'create' | 'edit'
}) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState('')
  const [uploadingSlots, setUploadingSlots] = useState<Set<PhotoKey>>(new Set())

  const fileRefs = useRef<Record<PhotoKey, HTMLInputElement | null>>({
    photo_principale: null,
    photo_2: null,
    photo_3: null,
    photo_4: null,
    photo_5: null,
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FormValues>({
    // z.coerce keeps 'unknown' as input type in Zod v4 — cast is required.
    // valueAsNumber: true on number inputs ensures RHF delivers numbers.
    resolver: zodResolver(productSchema) as Resolver<FormValues>,
    defaultValues: initialData
      ? {
          photo_principale: initialData.photo_principale ?? '',
          photo_2: initialData.photo_2 ?? '',
          photo_3: initialData.photo_3 ?? '',
          photo_4: initialData.photo_4 ?? '',
          photo_5: initialData.photo_5 ?? '',
          nom: initialData.nom,
          ref: initialData.ref,
          collection: initialData.collection ?? '',
          ordre: initialData.ordre ?? 0,
          mention: initialData.mention ?? '',
          sku: initialData.sku ?? '',
          actif: initialData.actif,
          prix: initialData.prix,
          reduction: initialData.reduction ?? undefined,
          stock: initialData.stock,
          boitier: initialData.boitier ?? '',
          materiau: initialData.materiau ?? '',
          bracelet: initialData.bracelet ?? '',
          fermoir: initialData.fermoir ?? '',
          lunette: initialData.lunette ?? '',
          fond: initialData.fond ?? '',
          cadran: initialData.cadran ?? '',
          aiguilles: initialData.aiguilles ?? '',
          verre: initialData.verre ?? '',
          mouvement: initialData.mouvement ?? '',
          resistance: initialData.resistance ?? '',
          description: initialData.description ?? '',
        }
      : {
          actif: true,
          stock: 0,
          ordre: 0,
          photo_principale: '',
          photo_2: '',
          photo_3: '',
          photo_4: '',
          photo_5: '',
        },
  })

  const prix = watch('prix')
  const reduction = watch('reduction')
  const prixReduc =
    reduction && Number(reduction) > 0 && prix > 0
      ? Math.round(prix * (1 - Number(reduction) / 100))
      : null

  // ── Photo upload ─────────────────────────────────────────────────────────

  async function handlePhotoFile(key: PhotoKey, file: File) {
    setUploadingSlots((prev) => new Set([...prev, key]))
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/produits/upload-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setValue(key, data.url, { shouldValidate: true })
      } else {
        setSubmitError(data.error ?? 'Erreur upload')
      }
    } catch {
      setSubmitError('Erreur de connexion')
    } finally {
      setUploadingSlots((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function onSubmit(values: FormValues) {
    setSubmitError('')
    const url =
      mode === 'create' ? '/api/admin/produits' : `/api/admin/produits/${initialData!.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Erreur serveur')
        return
      }
      router.push('/admin/produits')
    } catch {
      setSubmitError('Erreur de connexion')
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!confirm('Supprimer ce produit définitivement ? Cette action est irréversible.')) return
    setSubmitError('')
    try {
      const res = await fetch(`/api/admin/produits/${initialData!.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setSubmitError(data.error ?? 'Erreur suppression')
        return
      }
      router.push('/admin/produits')
    } catch {
      setSubmitError('Erreur de connexion')
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      {/* ── PHOTOS ─────────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <p className={sectionTitleCls} style={{ color: 'var(--color-rg)', borderColor: 'rgba(201,149,108,0.2)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Photos
        </p>

        <div className="grid grid-cols-5 gap-2 max-md:grid-cols-3">
          {PHOTO_SLOTS.map(({ key, label, required }) => {
            const url = watch(key) as string | undefined
            const isUploading = uploadingSlots.has(key)
            const error = errors[key]

            return (
              <div key={key}>
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={(el) => { fileRefs.current[key] = el }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handlePhotoFile(key, file)
                    e.target.value = ''
                  }}
                />

                {/* Slot */}
                <div
                  onClick={() => !isUploading && fileRefs.current[key]?.click()}
                  className={[
                    'relative aspect-square flex flex-col items-center justify-center cursor-pointer border transition-colors duration-150 overflow-hidden',
                    error
                      ? 'border-red-500/60 bg-red-900/10'
                      : url
                      ? 'border-white/10 bg-transparent'
                      : 'border-white/10 bg-white/5 hover:border-rg hover:bg-white/8',
                  ].join(' ')}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-rg border-t-transparent rounded-full animate-spin" />
                      <span className="text-[0.6rem] text-white/40">Envoi…</span>
                    </div>
                  ) : url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setValue(key, '', { shouldValidate: true }) }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white/80 hover:text-red-400 hover:bg-black/90 z-10 transition-colors"
                        aria-label="Supprimer"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-white/30">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span className="text-[0.55rem] tracking-wide text-center leading-tight">Cliquer<br/>pour upload</span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <p className={[
                  'mt-1 text-center text-[0.6rem] tracking-[0.12em] uppercase',
                  error ? 'text-red-400' : 'text-white/40',
                ].join(' ')}>
                  {label}{required && ' *'}
                </p>
                {error && <p className="mt-0.5 text-center text-[0.6rem] text-red-400">{error.message}</p>}
              </div>
            )
          })}
        </div>

        {errors.photo_3?.message && (
          <p className="mt-2 text-[0.7rem] text-red-400">{errors.photo_3.message}</p>
        )}
      </div>

      {/* ── INFORMATIONS PRINCIPALES ────────────────────────────────────── */}
      <div className={sectionCls}>
        <p className={sectionTitleCls} style={{ color: 'var(--color-rg)', borderColor: 'rgba(201,149,108,0.2)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Informations principales
        </p>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4 max-md:grid-cols-1">
          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>
              Nom <span className="text-rg">*</span>
            </label>
            <input className={inputCls} placeholder="Rose Gold · Black" {...register('nom')} />
            <FieldError msg={errors.nom?.message} />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>
              Référence <span className="text-rg">*</span>
            </label>
            <input className={inputCls} placeholder="PC-RG-BLK-01" {...register('ref')} />
            <FieldError msg={errors.ref?.message} />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>
              Collection <span className="text-rg">*</span>
            </label>
            <select className={inputCls} {...register('collection')}>
              <option value="">Choisir…</option>
              {COLLECTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <FieldError msg={errors.collection?.message} />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>
              Ordre d&apos;affichage <span className="text-rg">*</span>
            </label>
            <input type="number" min={0} className={inputCls} placeholder="0" {...register('ordre', { valueAsNumber: true })} />
            <FieldError msg={errors.ordre?.message} />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>Mention</label>
            <select className={inputCls} {...register('mention')}>
              {MENTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>SKU</label>
            <input className={inputCls} placeholder="Optionnel" {...register('sku')} />
          </div>

          <div className="col-span-2 max-md:col-span-1 flex items-center gap-3">
            <label className={labelCls + ' mb-0'} style={{ color: 'rgba(255,255,255,0.5)' }}>Actif</label>
            <button
              type="button"
              onClick={() => setValue('actif', !watch('actif'))}
              className={[
                'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
                watch('actif') ? 'bg-rg' : 'bg-white/15',
              ].join(' ')}
              aria-label="Actif"
            >
              <span
                className={[
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                  watch('actif') ? 'translate-x-5' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
            <span className="text-[0.7rem]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {watch('actif') ? 'Visible sur le site' : 'Masqué'}
            </span>
          </div>
        </div>
      </div>

      {/* ── PRIX ────────────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <p className={sectionTitleCls} style={{ color: 'var(--color-rg)', borderColor: 'rgba(201,149,108,0.2)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Prix
        </p>

        <div className="grid grid-cols-3 gap-x-5 gap-y-4 max-md:grid-cols-1">
          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>
              Prix TTC (MAD) <span className="text-rg">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={1}
              className={inputCls}
              placeholder="2990"
              {...register('prix', { valueAsNumber: true })}
            />
            <FieldError msg={errors.prix?.message} />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>Réduction (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              className={inputCls}
              placeholder="0"
              {...register('reduction', { valueAsNumber: true })}
            />
            <FieldError msg={errors.reduction?.message} />
          </div>

          <div>
            <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>
              Prix après réduction
            </label>
            <div
              className="w-full border border-white/5 px-3 py-2.5 text-[0.8rem]"
              style={{ background: 'rgba(255,255,255,0.02)', color: prixReduc ? 'var(--color-rgl)' : 'rgba(255,255,255,0.2)' }}
            >
              {prixReduc ? `${prixReduc.toLocaleString('fr-MA')} MAD` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* ── STOCK ───────────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <p className={sectionTitleCls} style={{ color: 'var(--color-rg)', borderColor: 'rgba(201,149,108,0.2)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          Stock
        </p>

        <div className="max-w-[200px]">
          <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>
            Quantité <span className="text-rg">*</span>
          </label>
          <input
            type="number"
            min={0}
            step={1}
            className={inputCls}
            placeholder="0"
            {...register('stock', { valueAsNumber: true })}
          />
          <FieldError msg={errors.stock?.message} />
        </div>
      </div>

      {/* ── CARACTÉRISTIQUES ────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <p className={sectionTitleCls} style={{ color: 'var(--color-rg)', borderColor: 'rgba(201,149,108,0.2)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07"/><path d="M4.93 4.93A10 10 0 0 0 19.07 19.07"/></svg>
          Caractéristiques techniques
        </p>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4 max-md:grid-cols-1">
          {[
            { key: 'boitier', label: 'Taille du boîtier', required: true, placeholder: 'ex. 40mm' },
            { key: 'materiau', label: 'Matériau du boîtier', required: true, placeholder: 'ex. Polycarbonate' },
            { key: 'bracelet', label: 'Bracelet', required: false, placeholder: 'ex. Caoutchouc' },
            { key: 'fermoir', label: 'Fermoir', required: false, placeholder: '' },
            { key: 'lunette', label: 'Lunette', required: false, placeholder: '' },
            { key: 'fond', label: 'Fond de boîtier', required: false, placeholder: '' },
            { key: 'cadran', label: 'Cadran', required: false, placeholder: 'ex. Noir mat' },
            { key: 'aiguilles', label: 'Aiguilles & index', required: false, placeholder: '' },
            { key: 'verre', label: 'Verre', required: false, placeholder: 'ex. Minéral' },
            { key: 'mouvement', label: 'Mouvement', required: false, placeholder: 'ex. Quartz' },
            { key: 'resistance', label: 'Résistance à l\'eau & poids', required: false, placeholder: 'ex. 3 ATM' },
          ].map(({ key, label, required, placeholder }) => (
            <div key={key}>
              <label className={labelCls} style={{ color: 'rgba(255,255,255,0.5)' }}>
                {label}{required && <span className="text-rg"> *</span>}
              </label>
              <input
                className={inputCls}
                placeholder={placeholder}
                {...register(key as keyof FormValues)}
              />
              {errors[key as keyof FormValues] && (
                <FieldError msg={errors[key as keyof FormValues]?.message as string} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── DESCRIPTION ─────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <p className={sectionTitleCls} style={{ color: 'var(--color-rg)', borderColor: 'rgba(201,149,108,0.2)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Description
        </p>

        <textarea
          rows={4}
          className={inputCls + ' resize-y'}
          placeholder="Description marketing du produit…"
          {...register('description')}
        />
      </div>

      {/* ── ERREUR GLOBALE ──────────────────────────────────────────────── */}
      {submitError && (
        <div className="mb-5 px-4 py-3 text-[0.75rem] text-red-300 border border-red-500/30 bg-red-900/15">
          {submitError}
        </div>
      )}

      {/* ── BOUTONS ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-[0.7rem] tracking-[0.2em] uppercase px-7 py-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-rg)', color: '#0a0a0a' }}
          >
            {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/produits')}
            className="text-[0.7rem] tracking-[0.2em] uppercase px-7 py-3 border transition-colors duration-200 hover:border-white/40"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
          >
            Annuler
          </button>
        </div>

        {mode === 'edit' && initialData && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-[0.7rem] tracking-[0.2em] uppercase px-5 py-3 border border-red-500/30 text-red-400/70 hover:border-red-500/60 hover:text-red-400 transition-colors duration-200"
          >
            Supprimer le produit
          </button>
        )}
      </div>
    </form>
  )
}

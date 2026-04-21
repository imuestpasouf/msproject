'use client'

import { useEffect, useState, useCallback, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AdminSidebar from '@/components/admin/AdminSidebar'
import type { OrderDetail } from '@/app/api/admin/commandes/[id]/route'
import type { StatutCommande } from '@/lib/supabase/database.types'

// ─── Config ───────────────────────────────────────────────────────────────────

const BADGE: Record<StatutCommande, { label: string; color: string; bg: string }> = {
  en_attente_paiement: { label: 'En attente de paiement', color: '#9a9590', bg: 'rgba(154,149,144,0.1)' },
  paiement_recu:       { label: 'Paiement reçu',          color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  validee:             { label: 'Validée',                  color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  en_preparation:      { label: 'En préparation',           color: '#eab308', bg: 'rgba(234,179,8,0.1)'  },
  expediee:            { label: 'Expédiée',                 color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  livree:              { label: 'Livrée',                   color: '#16a34a', bg: 'rgba(22,163,74,0.1)'  },
  annulee:             { label: 'Annulée',                  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  remboursee:          { label: 'Remboursée',               color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString('fr-MA') + ' MAD'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-MA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-sm" style={{ boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}>
      {title && (
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <p className="text-[0.6rem] tracking-[0.22em] uppercase font-normal" style={{ color: '#9a9590' }}>
            {title}
          </p>
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function StatusBadge({ statut }: { statut: StatutCommande }) {
  const cfg = BADGE[statut]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.12em] uppercase px-3 py-1.5 font-medium rounded-sm"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.18em] uppercase mb-1" style={{ color: '#9a9590' }}>{label}</p>
      <p className="text-[0.82rem]" style={{ color: value ? '#0a0a0a' : 'rgba(154,149,144,0.5)' }}>
        {value || '—'}
      </p>
    </div>
  )
}

// ─── Actions card ─────────────────────────────────────────────────────────────

function ActionsCard({
  order,
  onUpdated,
}: {
  order: OrderDetail
  onUpdated: (o: OrderDetail) => void
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showCancel, setShowCancel] = useState(false)
  const [showExpedier, setShowExpedier] = useState(false)
  const [showLivrer, setShowLivrer] = useState(false)
  const [serviceLivraison, setServiceLivraison] = useState('Cathedis')
  const [autreServiceLivraison, setAutreServiceLivraison] = useState('')
  const [suiviNumero, setSuiviNumero] = useState('')
  const [suiviLien, setSuiviLien] = useState('')
  const [montantPercu, setMontantPercu] = useState<string>('')
  const [paiementStatut, setPaiementStatut] = useState<'percu' | 'partiel' | 'refuse'>('percu')
  const [livreur, setLivreur] = useState('')
  const [notesLivraison, setNotesLivraison] = useState('')

  const TERMINAL = ['livree', 'annulee', 'remboursee']
  const canCancel = !TERMINAL.includes(order.statut)

  async function doAction(action: string, body?: Record<string, string>) {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/admin/commandes/${order.id}/${action}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur'); return }
      onUpdated({ ...order, ...data.order })
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(null)
    }
  }

  async function handleExpedier() {
    await doAction('expedier', {
      service_livraison: serviceLivraison === 'Autre' ? autreServiceLivraison : serviceLivraison,
      suivi_numero: suiviNumero,
      ...(suiviLien && { suivi_lien: suiviLien }),
    })
    setShowExpedier(false)
  }

  async function handleLivrer() {
    if (!montantPercu) { setError('Veuillez saisir le montant perçu'); return }
    setLoading('livrer')
    setError('')
    try {
      const res = await fetch(`/api/admin/commandes/${order.id}/livrer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant_percu: parseFloat(montantPercu),
          paiement_statut: paiementStatut,
          ...(livreur.trim() && { livreur: livreur.trim() }),
          ...(notesLivraison.trim() && { notes: notesLivraison.trim() }),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur'); return }
      onUpdated({ ...order, ...data.order })
      setShowLivrer(false)
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card title="Actions">
      {error && (
        <div className="mb-4 text-[0.72rem] text-red-500 bg-red-50 px-3 py-2 rounded-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2.5">

        {/* ── Valider ── */}
        {(order.statut === 'paiement_recu' ||
          (order.statut === 'en_attente_paiement' && order.paiement_methode === 'livraison')) && (
          <button
            type="button"
            onClick={() => doAction('valider')}
            disabled={loading === 'valider'}
            className="flex items-center justify-center gap-2 w-full text-[0.65rem] tracking-[0.18em] uppercase px-4 py-3 transition-colors duration-150 cursor-pointer border-none disabled:opacity-50"
            style={{ background: '#22c55e', color: '#fff' }}
          >
            {loading === 'valider' ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            )}
            Valider la commande
          </button>
        )}

        {/* ── Expédier ── */}
        {(order.statut === 'validee' || order.statut === 'en_preparation') && !showExpedier && (
          <button
            type="button"
            onClick={() => setShowExpedier(true)}
            className="flex items-center justify-center gap-2 w-full text-[0.65rem] tracking-[0.18em] uppercase px-4 py-3 transition-colors duration-150 cursor-pointer border-none"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Expédier la commande
          </button>
        )}

        {/* ── Expédier form ── */}
        {showExpedier && (
          <div className="border rounded-sm p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.03)' }}>
            <p className="text-[0.62rem] tracking-[0.18em] uppercase" style={{ color: '#3b82f6' }}>
              Informations d&apos;expédition
            </p>
            <div>
              <label className="block text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: '#9a9590' }}>
                Service de livraison
              </label>
              <select
                value={serviceLivraison}
                onChange={(e) => setServiceLivraison(e.target.value)}
                className="w-full text-[0.78rem] px-3 py-2 bg-white border outline-none"
                style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#0a0a0a' }}
              >
                <option value="Cathedis">Cathedis</option>
                <option value="Amana">Amana</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            {serviceLivraison === 'Autre' && (
              <div>
                <label className="block text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: '#9a9590' }}>
                  Nom du service <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={autreServiceLivraison}
                  onChange={(e) => setAutreServiceLivraison(e.target.value)}
                  placeholder="ex. Quick Livraison, Tawssil…"
                  className="w-full text-[0.78rem] px-3 py-2 bg-white border outline-none"
                  style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#0a0a0a' }}
                />
              </div>
            )}
            <div>
              <label className="block text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: '#9a9590' }}>
                Numéro de suivi <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={suiviNumero}
                onChange={(e) => setSuiviNumero(e.target.value)}
                placeholder="ex. 1Z999AA10123456784"
                className="w-full text-[0.78rem] px-3 py-2 bg-white border outline-none"
                style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#0a0a0a' }}
              />
            </div>
            <div>
              <label className="block text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: '#9a9590' }}>
                Lien de suivi <span style={{ color: 'rgba(154,149,144,0.6)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>optionnel</span>
              </label>
              <input
                type="url"
                value={suiviLien}
                onChange={(e) => setSuiviLien(e.target.value)}
                placeholder="https://..."
                className="w-full text-[0.78rem] px-3 py-2 bg-white border outline-none"
                style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#0a0a0a' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExpedier}
                disabled={loading === 'expedier'}
                className="flex-1 flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase px-4 py-2.5 cursor-pointer border-none disabled:opacity-50"
                style={{ background: '#3b82f6', color: '#fff' }}
              >
                {loading === 'expedier' ? (
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : 'Confirmer l\'expédition'}
              </button>
              <button
                type="button"
                onClick={() => setShowExpedier(false)}
                className="px-3 py-2.5 text-[0.65rem] tracking-[0.15em] uppercase cursor-pointer bg-transparent"
                style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#9a9590' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── Livrée ── */}
        {order.statut === 'expediee' && !showLivrer && (
          <button
            type="button"
            onClick={() => { setMontantPercu(String(order.prix_total)); setShowLivrer(true) }}
            className="flex items-center justify-center gap-2 w-full text-[0.65rem] tracking-[0.18em] uppercase px-4 py-3 transition-colors duration-150 cursor-pointer border-none"
            style={{ background: '#16a34a', color: '#fff' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            Confirmer la livraison
          </button>
        )}

        {/* ── Livraison form ── */}
        {order.statut === 'expediee' && showLivrer && (
          <div className="border rounded-sm p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(22,163,74,0.3)', background: 'rgba(22,163,74,0.03)' }}>
            <p className="text-[0.62rem] tracking-[0.18em] uppercase" style={{ color: '#16a34a' }}>
              Confirmer la livraison
            </p>

            <div>
              <label className="block text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: '#9a9590' }}>
                Montant perçu (MAD) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                value={montantPercu}
                onChange={(e) => setMontantPercu(e.target.value)}
                className="w-full text-[0.78rem] px-3 py-2 bg-white border outline-none"
                style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#0a0a0a' }}
              />
            </div>

            <div>
              <label className="block text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: '#9a9590' }}>
                Statut du paiement
              </label>
              <select
                value={paiementStatut}
                onChange={(e) => setPaiementStatut(e.target.value as typeof paiementStatut)}
                className="w-full text-[0.78rem] px-3 py-2 bg-white border outline-none"
                style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#0a0a0a' }}
              >
                <option value="percu">Paiement reçu en totalité</option>
                <option value="partiel">Paiement partiel</option>
                <option value="refuse">Paiement refusé</option>
              </select>
            </div>

            <div>
              <label className="block text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: '#9a9590' }}>
                Livreur <span style={{ color: 'rgba(154,149,144,0.6)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>optionnel</span>
              </label>
              <input
                type="text"
                value={livreur}
                onChange={(e) => setLivreur(e.target.value)}
                placeholder="Nom du livreur ou service"
                className="w-full text-[0.78rem] px-3 py-2 bg-white border outline-none"
                style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#0a0a0a' }}
              />
            </div>

            <div>
              <label className="block text-[0.6rem] tracking-[0.14em] uppercase mb-1" style={{ color: '#9a9590' }}>
                Notes <span style={{ color: 'rgba(154,149,144,0.6)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>optionnel</span>
              </label>
              <textarea
                value={notesLivraison}
                onChange={(e) => setNotesLivraison(e.target.value)}
                rows={2}
                placeholder="Observations sur la livraison…"
                className="w-full text-[0.78rem] px-3 py-2 bg-white border outline-none resize-none"
                style={{ borderColor: 'rgba(0,0,0,0.12)', color: '#0a0a0a' }}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLivrer}
                disabled={loading === 'livrer'}
                className="flex-1 flex items-center justify-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase px-4 py-2.5 cursor-pointer border-none disabled:opacity-50"
                style={{ background: '#16a34a', color: '#fff' }}
              >
                {loading === 'livrer' ? (
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : 'Confirmer la livraison'}
              </button>
              <button
                type="button"
                onClick={() => setShowLivrer(false)}
                className="px-3 py-2.5 text-[0.65rem] tracking-[0.15em] uppercase cursor-pointer bg-transparent"
                style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#9a9590' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── WhatsApp link ── */}
        <a
          href={`https://wa.me/${order.client_tel.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${order.client_prenom}, concernant votre commande D1 Milano n°${order.order_ref}…`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full text-[0.65rem] tracking-[0.18em] uppercase px-4 py-3 no-underline transition-colors duration-150"
          style={{ background: 'rgba(37,211,102,0.1)', color: '#16a34a', border: '1px solid rgba(37,211,102,0.2)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Contacter sur WhatsApp
        </a>

        {/* ── Annuler ── */}
        {canCancel && !showCancel && (
          <button
            type="button"
            onClick={() => setShowCancel(true)}
            className="w-full text-[0.65rem] tracking-[0.18em] uppercase px-4 py-2.5 cursor-pointer bg-transparent transition-colors duration-150"
            style={{ border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.7)' }}
          >
            Annuler la commande
          </button>
        )}

        {/* ── Confirm cancel ── */}
        {showCancel && (
          <div className="border rounded-sm p-4" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
            <p className="text-[0.75rem] font-medium mb-1" style={{ color: '#ef4444' }}>Confirmer l&apos;annulation ?</p>
            <p className="text-[0.7rem] mb-4" style={{ color: '#9a9590' }}>
              Cette action est irréversible.
              {['validee', 'en_preparation', 'expediee'].includes(order.statut) && ' Le stock sera restauré.'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { doAction('annuler'); setShowCancel(false) }}
                disabled={loading === 'annuler'}
                className="flex-1 text-[0.65rem] tracking-[0.15em] uppercase px-4 py-2.5 cursor-pointer border-none disabled:opacity-50"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {loading === 'annuler' ? '…' : 'Confirmer l\'annulation'}
              </button>
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                className="px-3 py-2.5 text-[0.65rem] tracking-[0.15em] uppercase cursor-pointer bg-transparent"
                style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#9a9590' }}
              >
                Retour
              </button>
            </div>
          </div>
        )}

      </div>
    </Card>
  )
}

// ─── Notes card ───────────────────────────────────────────────────────────────

function NotesCard({ order }: { order: OrderDetail }) {
  const [notes, setNotes] = useState(order.notes_commercial ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/admin/commandes/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes_commercial: notes }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Notes commerciales">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Ajouter des notes internes sur cette commande…"
        className="w-full text-[0.78rem] px-3 py-2.5 border outline-none resize-none transition-colors duration-150"
        style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#3a3733', background: '#fafaf9' }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#c9956c')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-2 text-[0.62rem] tracking-[0.18em] uppercase px-4 py-2 cursor-pointer border-none transition-colors duration-150 disabled:opacity-50"
        style={{ background: saved ? '#22c55e' : '#0a0a0a', color: '#fff' }}
      >
        {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer'}
      </button>
    </Card>
  )
}

// ─── Timeline card ────────────────────────────────────────────────────────────

function TimelineCard({ order }: { order: OrderDetail }) {
  const steps = [
    { label: 'Commande passée', date: order.created_at, done: true },
    { label: 'Paiement reçu', date: order.created_at, done: ['paiement_recu', 'validee', 'en_preparation', 'expediee', 'livree'].includes(order.statut) },
    { label: 'Validée', date: order.traite_le, done: !!order.traite_le },
    { label: 'Expédiée', date: order.expedie_le, done: !!order.expedie_le },
    { label: 'Livrée', date: null, done: order.statut === 'livree' },
  ]

  return (
    <Card title="Historique">
      <div className="flex flex-col gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex gap-3 items-start">
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 16 }}>
              <div
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                style={{ background: step.done ? '#22c55e' : 'rgba(0,0,0,0.1)' }}
              >
                {step.done && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 mt-1 mb-1" style={{ background: 'rgba(0,0,0,0.08)', minHeight: 16 }} />
              )}
            </div>
            <div className="pb-4">
              <p className="text-[0.75rem]" style={{ color: step.done ? '#0a0a0a' : 'rgba(0,0,0,0.3)' }}>
                {step.label}
              </p>
              {step.date && (
                <p className="text-[0.62rem] mt-0.5" style={{ color: '#9a9590' }}>
                  {new Date(step.date).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/commandes/${id}`)
      const data = await res.json()
      if (res.ok) setOrder(data.order)
      else setError(data.error ?? 'Commande introuvable')
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 min-h-screen" style={{ background: '#f4f2ef' }}>

        {/* ── Header ── */}
        <div className="px-8 py-5 border-b bg-white flex items-center justify-between gap-4" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 text-[0.62rem] tracking-[0.18em] uppercase no-underline transition-colors duration-150 hover:text-rg"
              style={{ color: 'rgba(154,149,144,0.8)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Commandes
            </Link>
            <span style={{ color: 'rgba(58,55,51,0.4)' }}>›</span>
            <nav className="flex items-center gap-2 text-[0.62rem] tracking-[0.18em] uppercase">
              <span style={{ color: 'rgba(0,0,0,0.3)' }}>Admin</span>
              <span style={{ color: 'rgba(58,55,51,0.4)' }}>›</span>
              <span style={{ color: 'rgba(0,0,0,0.3)' }}>Commandes</span>
              <span style={{ color: 'rgba(58,55,51,0.4)' }}>›</span>
              <span style={{ color: '#0a0a0a' }}>{order?.order_ref ?? '…'}</span>
            </nav>
          </div>
          {order && <StatusBadge statut={order.statut} />}
        </div>

        {/* ── Content ── */}
        <div className="px-8 py-8 max-md:px-4">

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c9956c', borderTopColor: 'transparent' }} />
            </div>
          )}

          {error && (
            <div className="py-10 text-center text-[0.8rem] text-red-500">{error}</div>
          )}

          {order && (
            <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 320px' }}>

              {/* ── Left column ── */}
              <div className="flex flex-col gap-5">

                {/* Client */}
                <Card title="Informations client">
                  <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <Field label="Prénom" value={order.client_prenom} />
                    <Field label="Nom" value={order.client_nom} />
                    <div>
                      <p className="text-[0.6rem] tracking-[0.18em] uppercase mb-1" style={{ color: '#9a9590' }}>Email</p>
                      <a href={`mailto:${order.client_email}`} className="text-[0.82rem] no-underline hover:underline" style={{ color: '#c9956c' }}>
                        {order.client_email}
                      </a>
                    </div>
                    <div>
                      <p className="text-[0.6rem] tracking-[0.18em] uppercase mb-1" style={{ color: '#9a9590' }}>Téléphone / WhatsApp</p>
                      <a href={`tel:${order.client_tel}`} className="text-[0.82rem] no-underline hover:underline" style={{ color: '#0a0a0a' }}>
                        {order.client_tel}
                      </a>
                    </div>
                  </div>
                  <div className="mt-5 pt-5 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                    <p className="text-[0.6rem] tracking-[0.18em] uppercase mb-2" style={{ color: '#9a9590' }}>Adresse de livraison</p>
                    <p className="text-[0.82rem] leading-relaxed" style={{ color: '#3a3733' }}>
                      {order.livraison_adresse}<br />
                      {[order.livraison_code_postal, order.livraison_ville].filter(Boolean).join(' ')}
                    </p>
                    {order.livraison_instructions && (
                      <p className="text-[0.75rem] mt-2 italic" style={{ color: '#9a9590' }}>
                        {order.livraison_instructions}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Order detail */}
                <Card title="Détail de la commande">
                  <div className="flex gap-5 items-start">
                    {/* Product photo */}
                    <div className="flex-shrink-0 w-20 h-20 bg-off overflow-hidden">
                      {order.product?.photo_principale ? (
                        <Image
                          src={order.product.photo_principale}
                          alt={order.product.nom}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gl flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'rgba(0,0,0,0.2)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                      )}
                    </div>
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.6rem] tracking-[0.2em] uppercase mb-0.5" style={{ color: '#c9956c' }}>
                        {order.product?.collection ?? '—'}
                      </p>
                      <p className="text-[0.9rem] font-light mb-0.5" style={{ color: '#0a0a0a' }}>
                        {order.product?.nom ?? '—'}
                      </p>
                      <p className="text-[0.7rem]" style={{ color: '#9a9590' }}>
                        Réf. {order.product?.ref ?? '—'}
                      </p>
                    </div>
                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-[1.1rem] font-light" style={{ color: '#c9956c' }}>
                        {formatPrice(order.prix_total)}
                      </p>
                      <p className="text-[0.62rem] mt-0.5" style={{ color: '#9a9590' }}>TTC</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t grid grid-cols-2 gap-5 max-sm:grid-cols-1" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                    <div>
                      <p className="text-[0.6rem] tracking-[0.18em] uppercase mb-1" style={{ color: '#9a9590' }}>Date de commande</p>
                      <p className="text-[0.78rem]" style={{ color: '#3a3733' }}>{formatDate(order.created_at)}</p>
                    </div>
                    <Field label="Méthode de paiement" value={order.paiement_methode} />
                    <Field label="Référence paiement" value={order.paiement_ref} />
                    <Field label="Quantité" value={String(order.quantite)} />
                  </div>

                  {/* Tracking info if available */}
                  {(order.suivi_numero || order.suivi_lien) && (
                    <div className="mt-5 pt-5 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                      <p className="text-[0.6rem] tracking-[0.18em] uppercase mb-3" style={{ color: '#9a9590' }}>Suivi</p>
                      <div className="grid grid-cols-2 gap-5">
                        <Field label="Numéro de suivi" value={order.suivi_numero} />
                        {order.suivi_lien && (
                          <div>
                            <p className="text-[0.6rem] tracking-[0.18em] uppercase mb-1" style={{ color: '#9a9590' }}>Lien de suivi</p>
                            <a href={order.suivi_lien} target="_blank" rel="noopener noreferrer" className="text-[0.8rem] no-underline hover:underline" style={{ color: '#c9956c' }}>
                              Voir le suivi →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>

              </div>

              {/* ── Right column ── */}
              <div className="flex flex-col gap-5">
                <ActionsCard order={order} onUpdated={setOrder} />
                <TimelineCard order={order} />
                <NotesCard order={order} />
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  )
}

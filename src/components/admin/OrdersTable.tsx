'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { OrderWithProduct } from '@/app/api/admin/orders/route'
import type { StatutCommande } from '@/lib/supabase/database.types'

// ─── Config ───────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'tous', label: 'Tous' },
  { key: 'a_traiter', label: 'À traiter' },
  { key: 'expediees', label: 'Expédiées' },
  { key: 'terminees', label: 'Terminées' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

const BADGE: Record<StatutCommande, { label: string; color: string; bg: string }> = {
  en_attente_paiement: { label: 'En attente', color: '#9a9590', bg: 'rgba(154,149,144,0.12)' },
  paiement_recu:       { label: 'Paiement reçu', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  validee:             { label: 'Validée', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  en_preparation:      { label: 'En préparation', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  expediee:            { label: 'Expédiée', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  livree:              { label: 'Livrée', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  annulee:             { label: 'Annulée', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  remboursee:          { label: 'Remboursée', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatPrice(n: number) {
  return n.toLocaleString('fr-MA') + ' MAD'
}

// Adds N business days (Mon–Fri) to a date. If the start date falls on a
// weekend it is first pushed to the following Monday before counting.
function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) added++
  }
  return d
}

function getDeadline(order: OrderWithProduct): { date: Date; isLate: boolean } | null {
  const created = new Date(order.created_at)
  if (order.statut === 'paiement_recu') {
    const d = addBusinessDays(created, 1)
    return { date: d, isLate: Date.now() > d.getTime() }
  }
  if (order.statut === 'validee') {
    const d = addBusinessDays(created, 2)
    return { date: d, isLate: Date.now() > d.getTime() }
  }
  return null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ statut }: { statut: StatutCommande }) {
  const cfg = BADGE[statut] ?? { label: statut, color: '#9a9590', bg: 'rgba(154,149,144,0.12)' }
  return (
    <span
      className="inline-block text-[0.6rem] tracking-[0.12em] uppercase px-2 py-0.5 rounded-sm font-medium"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}

function DeadlineCell({ order }: { order: OrderWithProduct }) {
  const dl = getDeadline(order)
  if (!dl) return <span style={{ color: 'rgba(154,149,144,0.4)' }}>—</span>

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: dl.isLate ? '#ef4444' : '#22c55e' }}
      />
      <span
        className="text-[0.65rem]"
        style={{ color: dl.isLate ? '#ef4444' : 'rgba(154,149,144,0.7)' }}
      >
        {dl.date.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
        {' '}
        {formatDate(dl.date.toISOString())}
      </span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrdersTable() {
  const [filter, setFilter] = useState<FilterKey>('tous')
  const [search, setSearch] = useState('')
  const [orders, setOrders] = useState<OrderWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filter !== 'tous') params.set('filter', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (res.ok) setOrders(data.orders ?? [])
      else setError(data.error ?? 'Erreur chargement')
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  return (
    <div>
      {/* ── Filters + search ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 bg-white rounded-sm p-1" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="text-[0.6rem] tracking-[0.15em] uppercase px-3 py-1.5 rounded-sm transition-colors duration-150 cursor-pointer"
              style={
                filter === f.key
                  ? { background: '#0a0a0a', color: '#f4f2ef' }
                  : { color: '#9a9590' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] max-w-xs relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: '#9a9590' }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou N° commande…"
            className="w-full bg-white pl-8 pr-4 py-2 text-[0.75rem] rounded-sm outline-none transition-shadow duration-150 focus:ring-1"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              color: '#0a0a0a',
            }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c9956c', borderTopColor: 'transparent' }} />
        </div>
      ) : error ? (
        <div className="py-10 text-center text-[0.8rem] text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-[0.75rem] tracking-[0.15em] uppercase" style={{ color: '#9a9590' }}>
          Aucune commande trouvée
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-sm" style={{ boxShadow: '0 1px 10px rgba(0,0,0,0.07)' }}>
          <table className="w-full border-collapse" style={{ minWidth: '960px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['N° commande', 'Client', 'Produit', 'Prix', 'Statut', 'Date', 'Deadline', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[0.58rem] tracking-[0.2em] uppercase px-4 py-3 font-normal"
                    style={{ color: '#9a9590' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="transition-colors duration-100 hover:bg-black/[0.02]"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                >
                  <td className="px-4 py-3">
                    <span className="text-[0.7rem] font-medium" style={{ color: '#0a0a0a' }}>
                      {o.order_ref}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[0.75rem]" style={{ color: '#0a0a0a' }}>
                      {o.client_prenom} {o.client_nom}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[0.7rem]" style={{ color: 'rgba(10,10,10,0.65)' }}>
                      {o.product_nom ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[0.75rem] font-light" style={{ color: '#c9956c' }}>
                      {formatPrice(o.prix_total)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge statut={o.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[0.7rem]" style={{ color: 'rgba(10,10,10,0.5)' }}>
                      {formatDate(o.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DeadlineCell order={o} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/commandes/${o.id}`}
                      className="text-[0.6rem] tracking-[0.15em] uppercase px-3 py-1.5 border no-underline transition-colors duration-150 hover:border-rg hover:text-rg whitespace-nowrap"
                      style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'rgba(10,10,10,0.45)' }}
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

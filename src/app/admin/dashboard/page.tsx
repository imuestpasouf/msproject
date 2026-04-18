'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/AdminSidebar'
import StatsCard from '@/components/admin/StatsCard'
import OrdersTable from '@/components/admin/OrdersTable'

// ─── Stat icons ───────────────────────────────────────────────────────────────

const IconOrders = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)
const IconPending = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconShipped = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const IconCA = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" />
  </svg>
)

// ─── Types ────────────────────────────────────────────────────────────────────

type Stats = {
  total_commandes: number
  a_traiter: number
  expediees: number
  ca_total: number
}

function formatCA(n: number) {
  return n.toLocaleString('fr-MA') + ' MAD'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setStatsError(d.error)
        else setStats(d)
      })
      .catch(() => setStatsError('Erreur de connexion'))
  }, [])

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 min-h-screen" style={{ background: '#f4f2ef' }}>
        {/* Header */}
        <div
          className="px-8 py-5 border-b bg-white flex items-center justify-between"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          <div>
            <h1 className="font-display font-light leading-none mb-1" style={{ fontSize: '1.6rem', color: '#0a0a0a' }}>
              Tableau de bord
            </h1>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: '#9a9590' }}>
              {new Date().toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link
            href="/admin/commandes/nouveau"
            className="flex items-center gap-2 text-[0.6rem] tracking-[0.18em] uppercase px-4 py-2 no-underline transition-colors duration-200"
            style={{ background: '#0a0a0a', color: '#f4f2ef' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle commande
          </Link>
        </div>

        <div className="px-8 py-8 max-md:px-4">
          {/* Stats grid */}
          {statsError ? (
            <div className="mb-8 text-[0.75rem] text-red-500">{statsError}</div>
          ) : (
            <div className="grid grid-cols-4 gap-4 mb-10 max-lg:grid-cols-2 max-sm:grid-cols-1">
              <StatsCard icon={IconOrders} value={stats?.total_commandes ?? '—'} label="Total commandes" />
              <StatsCard icon={IconPending} value={stats?.a_traiter ?? '—'} label="À traiter" accent={Boolean(stats && stats.a_traiter > 0)} />
              <StatsCard icon={IconShipped} value={stats?.expediees ?? '—'} label="Expédiées" />
              <StatsCard icon={IconCA} value={stats ? formatCA(stats.ca_total) : '—'} label="CA total généré" accent />
            </div>
          )}

          {/* Orders section */}
          <div className="mb-4">
            <h2 className="text-[0.65rem] tracking-[0.2em] uppercase font-normal" style={{ color: '#9a9590' }}>
              Commandes récentes
            </h2>
          </div>
          <OrdersTable />
        </div>
      </main>
    </div>
  )
}

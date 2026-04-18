'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/admin/dashboard',
    label: 'Tableau de bord',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/admin/produits',
    label: 'Produits',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" />
        <line x1="12" y1="3" x2="12" y2="9" /><line x1="12" y1="15" x2="12" y2="21" />
        <line x1="3" y1="12" x2="9" y2="12" /><line x1="15" y1="12" x2="21" y2="12" />
      </svg>
    ),
  },
  {
    href: '/admin/site',
    label: 'Images du site',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    href: '/admin/commandes',
    label: 'Commandes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  const isActive = (href: string) =>
    href === '/admin/commandes'
      ? pathname.startsWith('/admin/commandes')
      : pathname === href

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col sticky top-0 h-screen"
      style={{ background: '#0a0a0a', borderRight: '1px solid rgba(58,55,51,0.4)' }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(58,55,51,0.4)' }}>
        <Link href="/admin/dashboard" className="no-underline block">
          <p className="font-display font-semibold tracking-[0.14em] text-white leading-none" style={{ fontSize: '1.2rem' }}>
            D<span style={{ color: '#c9956c' }}>1</span> MILANO
          </p>
          <p className="text-[0.55rem] tracking-[0.3em] uppercase mt-1" style={{ color: 'rgba(154,149,144,0.6)' }}>
            Administration
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm no-underline transition-colors duration-150 text-[0.7rem] tracking-[0.1em]"
              style={active
                ? { background: 'rgba(201,149,108,0.12)', color: '#c9956c' }
                : { color: 'rgba(154,149,144,0.7)' }}
            >
              <span style={{ color: active ? '#c9956c' : 'rgba(154,149,144,0.5)' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t" style={{ borderColor: 'rgba(58,55,51,0.4)' }}>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-[0.65rem] tracking-[0.15em] uppercase transition-colors duration-150 cursor-pointer bg-transparent border-none p-0"
          style={{ color: 'rgba(154,149,144,0.5)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(154,149,144,0.5)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

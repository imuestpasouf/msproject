// Placeholder — remplacer par le vrai dashboard admin
export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p
          className="font-display font-semibold tracking-[0.14em] mb-3 text-white"
          style={{ fontSize: '1.9rem' }}
        >
          D<span className="text-rg">1</span> MILANO
        </p>
        <p className="text-[0.7rem] tracking-[0.25em] uppercase text-gm mb-8">
          Tableau de bord
        </p>
        <p className="text-[0.8rem] text-gm">Dashboard à venir…</p>
        <form
          action={async () => {
            'use server'
            const { cookies } = await import('next/headers')
            const { redirect } = await import('next/navigation')
            const { COOKIE_NAME } = await import('@/lib/admin-session')
            const jar = await cookies()
            jar.delete(COOKIE_NAME)
            redirect('/admin/login')
          }}
          className="mt-10"
        >
          <button
            type="submit"
            className="text-[0.65rem] tracking-[0.2em] uppercase text-gm border border-gd px-5 py-2.5 hover:border-rg hover:text-rg transition-colors duration-200 cursor-pointer bg-transparent"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}

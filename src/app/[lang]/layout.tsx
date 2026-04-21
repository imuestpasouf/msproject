import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MarqueeBanner from '@/components/ui/MarqueeBanner'
import CartDrawer from '@/components/ui/CartDrawer'
import { LocaleProvider } from '@/context/LocaleContext'
import { getDictionary, isLocale } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export function generateStaticParams() {
  return [{ lang: 'fr' }, { lang: 'en' }, { lang: 'ar' }]
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!isLocale(lang)) notFound()

  const dict = await getDictionary(lang as Locale)

  return (
    <LocaleProvider lang={lang as Locale} dict={dict}>
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <Navbar />
        <MarqueeBanner text={dict.banner} />
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />

      {/* Social floats */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col gap-3 items-center">
        <a
          href="https://www.instagram.com/mamontre.ma.officiel?igsh=cnQ2ZWF1Z25kNGJ2"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-[50px] h-[50px] rounded-full text-white no-underline transition-transform duration-200 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
            boxShadow: '0 4px 20px rgba(220,39,67,0.4)',
          }}
          aria-label="Instagram"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <a
          href="https://wa.me/212717706550"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-[50px] h-[50px] rounded-full text-white text-[1.4rem] no-underline transition-transform duration-200 hover:scale-110"
          style={{
            background: '#25D366',
            boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          }}
          aria-label="WhatsApp"
        >
          💬
        </a>
      </div>
    </LocaleProvider>
  )
}

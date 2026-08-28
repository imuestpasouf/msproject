import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MarqueeBanner from '@/components/ui/MarqueeBanner'
import CartDrawer from '@/components/ui/CartDrawer'
import SmoothScroll from '@/components/motion/SmoothScroll'
import CustomCursor from '@/components/motion/CustomCursor'
import Preloader from '@/components/motion/Preloader'
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
      <Preloader loadingLabel={dict.preloader.loading} />
      <div className="grain-overlay" aria-hidden="true" />
      <CustomCursor />
      <header className="fixed top-0 left-0 right-0 z-[100]">
        <Navbar />
        <MarqueeBanner text={dict.banner} />
      </header>
      <SmoothScroll>
        <main className="flex-1">{children}</main>
        <Footer />
      </SmoothScroll>
      <CartDrawer />

      {/* Social floats */}
      <div className="fixed bottom-6 right-6 z-[150] flex flex-col gap-3 items-center">
        <a
          href="https://www.instagram.com/ms.store.d1milano"
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.02L7.55 18.85L4.43 19.65L5.25 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.1 16.56 13.98C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.48 13.06 14.31 13.31C14.15 13.56 13.67 14.1 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.75 14.22 11.94 13.96 10.98 13.1C10.24 12.44 9.73 11.63 9.58 11.38C9.44 11.13 9.57 11 9.69 10.88C9.8 10.77 9.94 10.59 10.06 10.44C10.18 10.3 10.22 10.19 10.3 10.03C10.38 9.86 10.34 9.72 10.28 9.6C10.22 9.5 9.73 8.26 9.53 7.79C9.34 7.34 9.14 7.4 8.98 7.39C8.82 7.38 8.67 7.33 8.53 7.33Z"/>
            </svg>
        </a>
      </div>
    </LocaleProvider>
  )
}

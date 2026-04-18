import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MarqueeBanner from '@/components/ui/MarqueeBanner'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'D1 Milano Maroc — Montres italiennes au Maroc',
  description:
    'Distributeur officiel D1 Milano au Maroc. Montres au design octogonal épuré, nées à Milan. Disponibles en exclusivité au Maroc.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${jost.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        {/* Single fixed header — Navbar + MarqueeBanner stack naturally,
            no hardcoded pixel offsets between them */}
        <header className="fixed top-0 left-0 right-0 z-[100]">
          <Navbar />
          <MarqueeBanner />
        </header>
        <main className="flex-1">{children}</main>
        <Footer />

        {/* WhatsApp float — external URL, <a> not <Link> */}
        <a
          href="https://wa.me/212600000000"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[150] flex items-center justify-center w-[50px] h-[50px] rounded-full text-white text-[1.4rem] no-underline transition-transform duration-200 hover:scale-110"
          style={{
            background: '#25D366',
            boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          }}
          aria-label="Contacter sur WhatsApp"
        >
          💬
        </a>
      </body>
    </html>
  )
}

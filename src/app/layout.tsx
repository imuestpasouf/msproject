import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { cookies } from 'next/headers'

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
  title: 'MS-Store × D1 Milano Maroc',
  description:
    'Votre destination premium au Maroc. Distributeur officiel D1 Milano — montres au design octogonal épuré, nées à Milan.',
  icons: {
    icon: '/ms-icon.svg',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'fr'
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cormorant.variable} ${jost.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}

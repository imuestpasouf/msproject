'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useCart } from '@/context/CartContext'
import { useLocale } from '@/context/LocaleContext'
import { ScrollTrigger } from '@/lib/motion/gsap'
import type { Locale } from '@/lib/i18n'

const LOCALES: Locale[] = ['fr', 'en', 'ar']
const SCROLL_THRESHOLD = 80

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { count, openDrawer } = useCart()
  const { lang, t, base } = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const isHome = pathname === base || pathname === `${base}/`
  const [scrolled, setScrolled] = useState(!isHome)
  const solid = !isHome || scrolled

  useEffect(() => {
    if (!isHome) return
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: `top top-=${SCROLL_THRESHOLD}`,
      onToggle: (self) => setScrolled(self.isActive),
    })
    return () => trigger.kill()
  }, [isHome])

  function switchLang(newLang: Locale) {
    // Path: /D1-Milano/{lang}/{...rest} — lang is at index 2
    const segments = pathname.split('/')
    segments[2] = newLang
    document.cookie = `locale=${newLang};path=/;max-age=31536000;samesite=lax`
    router.push(segments.join('/'))
  }

  const easeTransition = { transitionTimingFunction: 'var(--ease-luxe)' }

  return (
    <>
      {/* Desktop nav */}
      <nav
        className={clsx(
          'flex items-center justify-between border-b max-md:px-5',
          solid ? 'px-12 py-[18px] backdrop-blur-[12px] border-gl' : 'px-12 py-[30px] border-transparent',
        )}
        style={{
          background: solid ? 'rgba(250,250,250,0.94)' : 'transparent',
          transitionProperty: 'padding, background-color, border-color',
          transitionDuration: '500ms',
          ...easeTransition,
        }}
      >
        <Link href={base} className="no-underline flex flex-col leading-none">
          <span
            className={clsx('font-body font-semibold text-[1.15rem] tracking-[0.38em] uppercase transition-colors duration-500', solid ? 'text-black' : 'text-white')}
            style={easeTransition}
          >
            MS-STORE
          </span>
          <span
            className={clsx('font-body font-light text-[0.52rem] tracking-[0.32em] uppercase mt-[3px] transition-colors duration-500', solid ? 'text-gm' : 'text-white/60')}
            style={easeTransition}
          >
            D1 Milano
          </span>
        </Link>

        <ul className="hidden md:flex gap-8 list-none">
          <li>
            <Link
              href={`${base}/#collections`}
              data-cursor={t.cursor.view}
              className={clsx('font-light text-[0.75rem] tracking-[0.18em] uppercase no-underline transition-colors duration-500 hover:text-rg', solid ? 'text-gd' : 'text-white')}
              style={easeTransition}
            >
              {t.nav.collections}
            </Link>
          </li>
          <li>
            <Link
              href={`${base}/catalogue`}
              data-cursor={t.cursor.view}
              className={clsx('font-light text-[0.75rem] tracking-[0.18em] uppercase no-underline transition-colors duration-500 hover:text-rg', solid ? 'text-gd' : 'text-white')}
              style={easeTransition}
            >
              {t.nav.catalogue}
            </Link>
          </li>
          <li>
            <Link
              href={`${base}/#process`}
              data-cursor={t.cursor.view}
              className={clsx('font-light text-[0.75rem] tracking-[0.18em] uppercase no-underline transition-colors duration-500 hover:text-rg', solid ? 'text-gd' : 'text-white')}
              style={easeTransition}
            >
              {t.nav.order}
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-4">
          {/* Language switcher */}
          <div className="flex items-center gap-1">
            {LOCALES.map((l, i) => (
              <span key={l} className="flex items-center">
                {i > 0 && <span className={clsx('text-[0.55rem] mx-0.5', solid ? 'text-gm' : 'text-white/40')}>|</span>}
                <button
                  type="button"
                  onClick={() => switchLang(l)}
                  className={clsx(
                    'text-[0.6rem] tracking-[0.12em] uppercase cursor-pointer bg-transparent border-none transition-colors duration-500 px-0.5',
                    solid
                      ? lang === l ? 'text-black font-medium' : 'text-gm hover:text-black'
                      : lang === l ? 'text-white font-medium' : 'text-white/50 hover:text-white',
                  )}
                  style={easeTransition}
                >
                  {l.toUpperCase()}
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={openDrawer}
            className={clsx('relative w-9 h-9 flex items-center justify-center cursor-pointer bg-transparent border-none transition-colors duration-500', solid ? 'text-gd hover:text-black' : 'text-white hover:text-rgl')}
            style={easeTransition}
            aria-label={t.nav.cart_aria}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rg text-white flex items-center justify-center text-[0.55rem] font-normal leading-none">
                {count}
              </span>
            )}
          </button>
          <Link
            href={`${base}/catalogue`}
            data-cursor={t.cursor.view}
            className={clsx(
              'text-[0.7rem] tracking-[0.16em] uppercase font-normal no-underline px-[22px] py-[10px] transition-colors duration-500 hover:bg-rg',
              solid ? 'text-white bg-black' : 'text-black bg-white',
            )}
            style={easeTransition}
          >
            {t.nav.shop_watches}
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="flex md:hidden flex-col gap-[5px] cursor-pointer bg-transparent border-none p-1"
          onClick={() => setMobileOpen(true)}
          aria-label={t.nav.menu_open}
        >
          <span className={clsx('block w-6 h-[1.5px] transition-colors duration-500', solid ? 'bg-black' : 'bg-white')} style={easeTransition} />
          <span className={clsx('block w-6 h-[1.5px] transition-colors duration-500', solid ? 'bg-black' : 'bg-white')} style={easeTransition} />
          <span className={clsx('block w-6 h-[1.5px] transition-colors duration-500', solid ? 'bg-black' : 'bg-white')} style={easeTransition} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8 bg-white">
          <button
            className="absolute top-6 right-8 text-[1.6rem] cursor-pointer bg-transparent border-none text-gd"
            onClick={() => setMobileOpen(false)}
            aria-label={t.nav.menu_close}
          >
            ✕
          </button>
          <Link href={base} className="font-display text-[2rem] font-light text-black no-underline tracking-[0.08em] hover:text-rg"
            onClick={() => setMobileOpen(false)}>
            {t.nav.home}
          </Link>
          <Link href={`${base}/catalogue`} className="font-display text-[2rem] font-light text-black no-underline tracking-[0.08em] hover:text-rg"
            onClick={() => setMobileOpen(false)}>
            {t.nav.catalogue}
          </Link>
          <Link href={`${base}/#process`} className="font-display text-[2rem] font-light text-black no-underline tracking-[0.08em] hover:text-rg"
            onClick={() => setMobileOpen(false)}>
            {t.nav.order}
          </Link>

          {/* Mobile lang switcher */}
          <div className="flex items-center gap-4 mt-2">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { switchLang(l); setMobileOpen(false) }}
                className={[
                  'text-[0.75rem] tracking-[0.14em] uppercase cursor-pointer bg-transparent border-none',
                  lang === l ? 'text-black font-medium' : 'text-gm',
                ].join(' ')}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

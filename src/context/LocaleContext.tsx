'use client'

import { createContext, useContext } from 'react'
import type { Dict, Locale } from '@/lib/i18n'

const BRAND_BASE = '/D1-Milano'

interface LocaleContextValue {
  lang: Locale
  t: Dict
  base: string // e.g. '/D1-Milano/fr'
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  lang,
  dict,
  children,
}: {
  lang: Locale
  dict: Dict
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={{ lang, t: dict, base: `${BRAND_BASE}/${lang}` }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}

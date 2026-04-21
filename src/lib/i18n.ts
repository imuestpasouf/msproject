import 'server-only'

import type frDict from '@/dictionaries/fr.json'

export type Dict = typeof frDict
export type Locale = 'fr' | 'en' | 'ar'

export const LOCALES: Locale[] = ['fr', 'en', 'ar']
export const DEFAULT_LOCALE: Locale = 'fr'

export function isLocale(v: string): v is Locale {
  return LOCALES.includes(v as Locale)
}

const dictionaries: Record<Locale, () => Promise<Dict>> = {
  fr: () => import('@/dictionaries/fr.json').then((m) => m.default),
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
  ar: () => import('@/dictionaries/ar.json').then((m) => m.default),
}

export async function getDictionary(locale: Locale): Promise<Dict> {
  return dictionaries[locale]()
}

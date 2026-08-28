'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { ScrollTrigger } from '@/lib/motion/gsap'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export type Chapter = { id: string; label: string }

export default function ChapterNav({ chapters }: { chapters: Chapter[] }) {
  const isDesktop = useIsDesktop()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [active, setActive] = useState(chapters[0]?.id ?? '')

  useEffect(() => {
    if (!isDesktop) return
    const triggers = chapters
      .map((chapter) => {
        const el = document.getElementById(chapter.id)
        if (!el) return null
        return ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (self.isActive) setActive(chapter.id)
          },
        })
      })
      .filter(Boolean)

    return () => {
      triggers.forEach((trigger) => trigger?.kill())
    }
  }, [isDesktop, chapters])

  function handleClick(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  if (!isDesktop) return null

  // Portaled to document.body: SmoothScroll applies a transform to its content
  // wrapper, which would otherwise turn this fixed-position nav into a
  // scroll-following element (a transformed ancestor becomes the containing
  // block for `position: fixed` descendants).
  return createPortal(
    <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-[400] flex flex-col gap-5 items-end" aria-label="Chapitres">
      {chapters.map((chapter) => (
        <button
          key={chapter.id}
          type="button"
          onClick={() => handleClick(chapter.id)}
          className="group flex items-center gap-3 cursor-pointer bg-transparent border-none p-0"
          aria-label={chapter.label}
          aria-current={active === chapter.id ? 'true' : undefined}
        >
          <span
            className={clsx(
              'text-[0.6rem] tracking-[0.14em] uppercase whitespace-nowrap opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0',
              active === chapter.id ? 'text-rg opacity-100 translate-x-0' : 'text-gm',
            )}
          >
            {chapter.label}
          </span>
          <span
            className={clsx(
              'w-[5px] h-[5px] rounded-full transition-all duration-300',
              active === chapter.id ? 'bg-rg scale-[1.8]' : 'bg-gm',
            )}
          />
        </button>
      ))}
    </nav>,
    document.body,
  )
}

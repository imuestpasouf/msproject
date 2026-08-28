'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import MagneticLink from './MagneticLink'
import type { Dict } from '@/lib/i18n'

export default function HeroIntro({ base, t }: { base: string; t: Dict }) {
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const eyebrow = eyebrowRef.current
    const line1 = line1Ref.current
    const line2 = line2Ref.current
    const sub = subRef.current
    const cta = ctaRef.current
    if (!eyebrow || !line1 || !line2 || !sub || !cta) return

    gsap.set([eyebrow, line1, line2, sub], { yPercent: 110 })
    gsap.set(cta, { opacity: 0 })

    const tl = gsap.timeline({ delay: 0.2 })
    tl.to(eyebrow, { yPercent: 0, duration: 1, ease: 'expo.out' })
      .to([line1, line2], { yPercent: 0, duration: 1.3, stagger: 0.15, ease: 'expo.out' }, '-=0.6')
      .to(sub, { yPercent: 0, duration: 1.1, ease: 'expo.out' }, '-=0.9')
      .to(cta, { opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.7')

    return () => {
      tl.kill()
    }
  }, [prefersReducedMotion])

  return (
    <div className="relative z-10 px-12 pb-16 max-w-[640px] max-md:px-5 max-md:pb-12">
      <div className="overflow-hidden mb-3.5">
        <span
          ref={eyebrowRef}
          className="block text-[0.68rem] tracking-[0.3em] uppercase font-light"
          style={{ color: 'var(--color-rgl)' }}
        >
          {t.hero.tagline}
        </span>
      </div>
      <h1 className="font-display font-light leading-[1.05] text-white mb-[18px]" style={{ fontSize: 'clamp(2.8rem, 6vw, 5.2rem)' }}>
        <span className="block overflow-hidden">
          <span ref={line1Ref} className="block">{t.hero.h1_1}</span>
        </span>
        <span className="block overflow-hidden">
          <em ref={line2Ref} className="italic block" style={{ color: 'var(--color-rgl)' }}>
            {t.hero.h1_em}
          </em>
        </span>
      </h1>
      <div className="overflow-hidden max-w-[400px] mb-8">
        <p
          ref={subRef}
          className="text-[0.83rem] font-light tracking-[0.05em] leading-[1.7]"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {t.hero.desc}
        </p>
      </div>
      <div ref={ctaRef} className="flex gap-3.5 items-center flex-wrap">
        <MagneticLink
          href={`${base}#catalogue`}
          dataCursor={t.cursor.view}
          className="inline-block text-[0.72rem] tracking-[0.2em] uppercase font-normal text-white bg-black px-[30px] py-[14px] no-underline transition-colors duration-200 hover:bg-rg"
        >
          {t.hero.cta_discover}
        </MagneticLink>
        <MagneticLink
          href={`${base}#process`}
          dataCursor={t.cursor.view}
          className="text-[0.72rem] tracking-[0.2em] uppercase font-light text-white no-underline pb-[2px] transition-colors duration-200 hover:text-rgl"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}
        >
          {t.hero.cta_how}
        </MagneticLink>
      </div>
    </div>
  )
}

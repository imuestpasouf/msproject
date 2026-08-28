'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { Dict } from '@/lib/i18n'

export default function StatsStrip({ stats }: { stats: Dict['stats'] }) {
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return

    const tweens = stats.map((stat, i) => {
      const el = numberRefs.current[i]
      if (!el) return null
      const counter = { value: 0 }
      return gsap.to(counter, {
        value: stat.value,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = Math.round(counter.value) + stat.suffix
        },
      })
    })

    return () => {
      tweens.forEach((tween) => {
        tween?.scrollTrigger?.kill()
        tween?.kill()
      })
    }
  }, [prefersReducedMotion, stats])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gl">
      {stats.map((stat, i) => (
        <div key={i} className="text-center px-6 py-9 border-r border-gl max-md:even:border-r-0 md:last:border-r-0">
          <span
            ref={(el) => {
              numberRefs.current[i] = el
            }}
            className="font-display block text-[2.1rem] font-light mb-2.5"
            style={{ color: 'var(--color-rg)' }}
          >
            {prefersReducedMotion ? `${stat.value}${stat.suffix}` : `0${stat.suffix}`}
          </span>
          <p className="text-[0.66rem] tracking-[0.1em] uppercase text-gm leading-[1.6]">
            {stat.line1}
            <br />
            {stat.line2}
          </p>
        </div>
      ))}
    </div>
  )
}

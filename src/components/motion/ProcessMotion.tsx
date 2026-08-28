'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import Reveal from './Reveal'
import type { Dict } from '@/lib/i18n'

export default function ProcessMotion({ steps }: { steps: Dict['process']['steps'] }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const section = sectionRef.current
    const fill = fillRef.current
    if (!section || !fill) return

    gsap.set(fill, { scaleX: 0 })
    const tween = gsap.to(fill, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 75%', end: 'bottom 70%', scrub: 1 },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  return (
    <div ref={sectionRef}>
      <div className="h-px w-full max-w-[520px] mx-auto mb-13 bg-gl relative overflow-hidden">
        <div ref={fillRef} className="absolute inset-0 origin-left bg-rg" style={prefersReducedMotion ? undefined : { transform: 'scaleX(0)' }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
        {steps.map((step, i) => (
          <Reveal key={i} delay={i * 0.15} y={28} duration={0.8} start="top 92%">
            <div className="relative bg-white px-7 py-9 h-full">
              <div className="absolute top-[18px] right-[18px] w-[7px] h-[7px] rounded-full bg-rg" />
              <div className="font-display text-[3.5rem] font-light leading-none mb-4 text-gl">0{i + 1}</div>
              <div className="text-[1.5rem] mb-3.5">{['🔍', '📝', '📦'][i]}</div>
              <div className="font-display text-[1.2rem] font-normal mb-2">{step.title}</div>
              <p className="text-[0.78rem] font-light leading-[1.7] text-gd">{step.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function Preloader({ loadingLabel }: { loadingLabel: string }) {
  const [done, setDone] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const overlayRef = useRef<HTMLDivElement>(null)
  const barFillRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) return
    const overlay = overlayRef.current
    const barFill = barFillRef.current
    const pct = pctRef.current
    if (!overlay) return

    const counter = { v: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.inOut',
          onComplete: () => setDone(true),
        })
      },
    })
    tl.to(counter, {
      v: 100,
      duration: 1,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (pct) pct.textContent = String(Math.round(counter.v))
        if (barFill) gsap.set(barFill, { scaleX: counter.v / 100 })
      },
    })

    return () => {
      tl.kill()
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion || done) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 bg-white"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center leading-none gap-1.5">
        <span className="font-body font-semibold text-[1.3rem] tracking-[0.38em] uppercase text-black">MS-STORE</span>
        <span className="font-body font-light text-[0.58rem] tracking-[0.32em] uppercase text-gm">D1 Milano</span>
      </div>
      <div className="w-[140px] h-px bg-gl relative overflow-hidden">
        <div ref={barFillRef} className="absolute inset-0 origin-left bg-rg" style={{ transform: 'scaleX(0)' }} />
      </div>
      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-gm">
        {loadingLabel} · <span ref={pctRef}>0</span>%
      </div>
    </div>
  )
}

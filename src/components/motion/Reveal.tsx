'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function Reveal({
  children,
  className,
  style,
  y = 40,
  duration = 1,
  delay = 0,
  start = 'top 88%',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  y?: number
  duration?: number
  delay?: number
  start?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return

    gsap.set(el, { opacity: 0, y })
    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start, once: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion, y, duration, delay, start])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}

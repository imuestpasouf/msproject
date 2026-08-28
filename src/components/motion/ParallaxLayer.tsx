'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function ParallaxLayer({
  speed,
  children,
  className,
}: {
  speed: number
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return

    gsap.set(el, { scale: 1.2 })
    const tween = gsap.to(el, {
      yPercent: -14 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement ?? el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion, speed])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function MagneticLink({
  href,
  className,
  style,
  dataCursor,
  strength = 0.35,
  children,
}: {
  href: string
  className?: string
  style?: CSSProperties
  dataCursor?: string
  strength?: number
  children: ReactNode
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return

    const moveX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const moveY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      moveX((e.clientX - rect.left - rect.width / 2) * strength)
      moveY((e.clientY - rect.top - rect.height / 2) * strength)
    }
    function onLeave() {
      moveX(0)
      moveY(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.killTweensOf(el)
    }
  }, [prefersReducedMotion, strength])

  return (
    <Link ref={ref} href={href} data-cursor={dataCursor} className={className} style={style}>
      {children}
    </Link>
  )
}

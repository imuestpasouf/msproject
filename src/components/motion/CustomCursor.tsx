'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const isDesktop = useIsDesktop()
  const prefersReducedMotion = usePrefersReducedMotion()
  const active = isDesktop && !prefersReducedMotion

  useEffect(() => {
    if (!active) return
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring || !label) return

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 })

    const moveDotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const moveDotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

    function onMove(e: MouseEvent) {
      moveDotX(e.clientX)
      moveDotY(e.clientY)
      moveRingX(e.clientX)
      moveRingY(e.clientY)
    }

    function onOver(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]')
      if (!target) return
      label!.textContent = target.dataset.cursor ?? ''
      ring!.classList.add('cc-show', 'cc-big')
      gsap.to(dot!, { scale: 0, duration: 0.2 })
    }

    function onOut(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]')
      if (!target) return
      ring!.classList.remove('cc-show', 'cc-big')
      gsap.to(dot!, { scale: 1, duration: 0.2 })
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      gsap.killTweensOf([dot, ring])
    }
  }, [active])

  if (!active) return null

  return (
    <>
      <div ref={dotRef} className="cc-dot" aria-hidden="true" />
      <div ref={ringRef} className="cc-ring" aria-hidden="true">
        <span ref={labelRef} className="cc-label" />
      </div>
    </>
  )
}

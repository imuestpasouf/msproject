'use client'

import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '@/lib/motion/gsap'
import { scrollState } from '@/lib/motion/scrollState'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const LERP = 0.085

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()
  const prefersReducedMotion = usePrefersReducedMotion()
  const active = isDesktop && !prefersReducedMotion

  useEffect(() => {
    if (!active) return
    const content = contentRef.current
    if (!content) return

    scrollState.current = window.scrollY
    scrollState.target = window.scrollY
    scrollState.active = true

    let rafId = 0

    function setHeight() {
      document.body.style.height = `${content!.getBoundingClientRect().height}px`
    }

    function raf() {
      scrollState.target = window.scrollY
      scrollState.current += (scrollState.target - scrollState.current) * LERP
      if (Math.abs(scrollState.target - scrollState.current) < 0.05) scrollState.current = scrollState.target
      content!.style.transform = `translate3d(0, ${-scrollState.current}px, 0)`
      ScrollTrigger.update()
      rafId = requestAnimationFrame(raf)
    }

    setHeight()
    ScrollTrigger.addEventListener('refresh', setHeight)
    window.addEventListener('resize', setHeight)
    rafId = requestAnimationFrame(raf)
    ScrollTrigger.refresh()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', setHeight)
      ScrollTrigger.removeEventListener('refresh', setHeight)
      scrollState.active = false
      document.body.style.height = ''
      content.style.transform = ''
      ScrollTrigger.refresh()
    }
  }, [active])

  if (!active) return <>{children}</>

  return (
    <div ref={wrapperRef} className="fixed inset-0 overflow-hidden">
      <div ref={contentRef} className="absolute top-0 left-0 w-full will-change-transform">
        {children}
      </div>
    </div>
  )
}

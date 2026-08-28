'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/motion/gsap'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

function getVideoType(url: string): string {
  if (/\.webm(\?.*)?$/i.test(url)) return 'video/webm'
  if (/\.mov(\?.*)?$/i.test(url)) return 'video/quicktime'
  return 'video/mp4'
}

export default function HeroVideo({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.volume = 0
    video.play().catch(() => {})
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    gsap.set(video, { scale: 1.15 })
    const tween = gsap.to(video, {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        src={src}
      >
        <source src={src} type={getVideoType(src)} />
      </video>
    </div>
  )
}

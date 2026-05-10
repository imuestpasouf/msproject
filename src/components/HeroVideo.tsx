'use client'

import { useEffect, useRef } from 'react'

function getVideoType(url: string): string {
  if (/\.webm(\?.*)?$/i.test(url)) return 'video/webm'
  if (/\.mov(\?.*)?$/i.test(url)) return 'video/quicktime'
  return 'video/mp4'
}

export default function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    video.volume = 0
    video.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover anim-hero-bg"
      autoPlay
      muted
      loop
      playsInline
      src={src}
    >
      <source src={src} type={getVideoType(src)} />
    </video>
  )
}

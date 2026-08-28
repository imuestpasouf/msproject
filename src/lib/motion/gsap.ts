'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from './scrollState'

// Registered and proxied once, at module load — before any component effect
// can run. Every ScrollTrigger created anywhere in the app (regardless of
// mount order) resolves scroll position through this single proxy on
// document.body: when SmoothScroll is active it reads the lerped position,
// otherwise it passes straight through to native window scrolling. Setting
// this up lazily inside SmoothScroll's own effect caused a race — React
// fires child effects before parent effects, so a scroll-triggered child
// mounted deeper in the tree (e.g. a pinned section) could create its
// ScrollTrigger before the proxy existed, binding it to raw native scroll
// instead of the smoothed one and fighting it every frame.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)

  scrollState.current = window.scrollY
  scrollState.target = window.scrollY

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (scrollState.active) {
        if (arguments.length) scrollState.target = value as number
        return scrollState.current
      }
      if (arguments.length) window.scrollTo(0, value as number)
      return window.scrollY
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
    },
    // Only meaningful while SmoothScroll is active, at which point the
    // content wrapper is always transform-driven (never native scroll) —
    // see SmoothScroll.tsx. No pin is ever created while inactive.
    pinType: 'transform',
  })
  ScrollTrigger.defaults({ scroller: document.body })
}

export { gsap, ScrollTrigger }

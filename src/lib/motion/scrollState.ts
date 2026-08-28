// Shared mutable bridge between the SmoothScroll rAF loop and the global
// ScrollTrigger proxy (see gsap.ts). Kept as plain mutable state — not React
// state — because it's written every animation frame.
export const scrollState = {
  current: 0,
  target: 0,
  active: false,
}

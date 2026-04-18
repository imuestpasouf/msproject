// Server component — styles are self-contained via <style> tag.

const TEXT  = 'Votre référence de montres haut de gamme au Maroc'
const SEP   = '\u00A0\u00A0•\u00A0\u00A0' // non-breaking spaces around bullet
const GAP   = '\u2003\u2003\u2003' // em-space × 3 — ajuste le nombre pour plus/moins d'espace
const UNIT  = Array(10).fill(TEXT + GAP + SEP + GAP).join('')

export default function MarqueeBanner() {
  return (
    <>
      {/*
       * Self-contained styles:
       *  - keyframe defined here so it is guaranteed to load
       *  - w-max on the track → width = content width (NOT viewport width)
       *    so translateX(-50%) = exactly one copy width → seamless loop
       *  - hover pause via CSS only, no JS needed
       */}
      <style>{`
        @keyframes d1-marquee {
          from { transform: translateX(-15%); }
          to   { transform: translateX(0); }
        }
        .d1-marquee-track {
          animation: d1-marquee 35s linear infinite;
        }
        .d1-marquee-wrap:hover .d1-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="d1-marquee-wrap overflow-hidden select-none"
        style={{ background: '#0a0a0a' }}
        aria-hidden="true"
      >
        {/*
         * w-max  → intrinsic width = sum of both spans  (NOT stretched to parent)
         * Two identical spans back-to-back.
         * Animation: translateX(0 → -50%) scrolls exactly the first span off-screen,
         * at which point CSS resets to 0 and the loop is invisible.
         */}
        <div className="d1-marquee-track flex w-max py-2 will-change-transform">
          <span
            className="inline-block whitespace-nowrap text-white font-light uppercase"
            style={{
              fontFamily: 'var(--font-jost), system-ui, sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.32em',
            }}
          >
            {UNIT}
          </span>
          <span
            className="inline-block whitespace-nowrap text-white font-light uppercase"
            style={{
              fontFamily: 'var(--font-jost), system-ui, sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
            }}
          >
            {UNIT}
          </span>
        </div>
      </div>

      {/* Accessible version (hidden visually, readable by screen readers) */}
      <p className="sr-only">{TEXT}</p>
    </>
  )
}

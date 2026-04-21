// Server component — accepts translated text as prop.

const SEP = '\u00A0\u00A0•\u00A0\u00A0'
const GAP = '\u2003\u2003\u2003'

export default function MarqueeBanner({ text }: { text: string }) {
  const UNIT = Array(10).fill(text + GAP + SEP + GAP).join('')

  return (
    <>
      <style>{`
        @keyframes d1-marquee {
          from { transform: translateX(-15%); }
          to   { transform: translateX(0); }
        }
        .d1-marquee-track { animation: d1-marquee 35s linear infinite; }
        .d1-marquee-wrap:hover .d1-marquee-track { animation-play-state: paused; }
      `}</style>
      <div className="d1-marquee-wrap overflow-hidden select-none" style={{ background: '#0a0a0a' }} aria-hidden="true">
        <div className="d1-marquee-track flex w-max py-2 will-change-transform">
          {[0, 1].map((i) => (
            <span key={i} className="inline-block whitespace-nowrap text-white font-light uppercase"
              style={{ fontFamily: 'var(--font-jost), system-ui, sans-serif', fontSize: '0.65rem', letterSpacing: i === 0 ? '0.32em' : '0.2em' }}>
              {UNIT}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">{text}</p>
    </>
  )
}

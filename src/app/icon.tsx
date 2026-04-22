import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
        }}
      >
        {/* Minimal watch icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {/* Top strap lug */}
          <div style={{ width: 7, height: 4, background: 'rgba(255,255,255,0.55)', borderRadius: 2 }} />
          {/* Watch face — octagonal feel with rounded corners */}
          <div
            style={{
              width: 22,
              height: 22,
              border: '2px solid white',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Hour hand — 10 o'clock */}
            <div
              style={{
                position: 'absolute',
                width: 2,
                height: 6,
                background: 'white',
                borderRadius: 1,
                bottom: '50%',
                left: '50%',
                transformOrigin: 'bottom center',
                transform: 'translateX(-50%) rotate(-50deg)',
              }}
            />
            {/* Minute hand — 2 o'clock */}
            <div
              style={{
                position: 'absolute',
                width: 1.5,
                height: 7,
                background: 'white',
                borderRadius: 1,
                bottom: '50%',
                left: '50%',
                transformOrigin: 'bottom center',
                transform: 'translateX(-50%) rotate(60deg)',
              }}
            />
            {/* Center dot */}
            <div style={{ width: 2, height: 2, background: 'white', borderRadius: 2 }} />
          </div>
          {/* Bottom strap lug */}
          <div style={{ width: 7, height: 4, background: 'rgba(255,255,255,0.55)', borderRadius: 2 }} />
        </div>

        {/* MS3 text */}
        <span
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          MS3
        </span>
      </div>
    ),
    { ...size }
  )
}

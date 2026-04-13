'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  name: string
}

export default function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)

  return (
    <div
      className="bg-off flex flex-col p-8 gap-4 max-md:relative max-md:top-0 max-md:h-[420px]"
      style={{ position: 'sticky', top: '80px', height: 'calc(100vh - 80px)' }}
    >
      {/* Main image */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {images.length > 0 ? (
          <Image
            key={active}
            src={images[active]}
            alt={name}
            width={480}
            height={480}
            className="max-w-full max-h-full object-contain transition-opacity duration-300"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gl flex items-center justify-center">
            <span className="text-gm text-[0.75rem] tracking-[0.2em] uppercase">
              Photo bientôt disponible
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails — only shown when there are multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2.5 justify-center">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={[
                'w-16 h-16 overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-transparent p-0',
                active === i ? 'border-rg opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:border-rg',
              ].join(' ')}
              aria-label={`Photo ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${name} ${i + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

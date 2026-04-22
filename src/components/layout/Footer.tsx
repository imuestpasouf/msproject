'use client'

import { useLocale } from '@/context/LocaleContext'

export default function Footer() {
  const { t } = useLocale()
  const ft = t.footer

  return (
    <footer className="bg-black px-12 pt-14 pb-7" style={{ color: 'rgba(255,255,255,0.55)' }}>
      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
        {/* Brand */}
        <div>
          <span className="flex flex-col leading-none mb-3">
            <span className="font-body font-semibold text-[1.1rem] tracking-[0.38em] uppercase text-white">MS-STORE</span>
            <span className="font-body font-light text-[0.5rem] tracking-[0.3em] uppercase mt-[4px]" style={{ color: 'rgba(154,149,144,0.65)' }}>D1 Milano</span>
          </span>
          <p className="text-[0.76rem] font-light leading-[1.7] max-w-[260px]">{ft.brand_desc}</p>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-[0.65rem] tracking-[0.25em] uppercase text-white font-normal mb-3.5">{ft.collections}</h4>
          <ul className="list-none space-y-[9px]">
            {['Polycarbon', 'Ultra Thin', 'Skeleton', 'Tahoe'].map((item) => (
              <li key={item} className="text-[0.76rem] font-light cursor-pointer transition-colors duration-200 hover:text-rgl">{item}</li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-[0.65rem] tracking-[0.25em] uppercase text-white font-normal mb-3.5">{ft.info}</h4>
          <ul className="list-none space-y-[9px]">
            {ft.info_items.map((item) => (
              <li key={item} className="text-[0.76rem] font-light cursor-pointer transition-colors duration-200 hover:text-rgl">{item}</li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[0.65rem] tracking-[0.25em] uppercase text-white font-normal mb-3.5">{ft.contact}</h4>
          <ul className="list-none space-y-[9px]">
            <li className="text-[0.76rem] font-light transition-colors duration-200 hover:text-rgl">
              <a href="https://wa.me/212717706550" target="_blank" rel="noopener noreferrer" className="no-underline text-inherit">WhatsApp</a>
            </li>
            <li className="text-[0.76rem] font-light transition-colors duration-200 hover:text-rgl">
              <a href="https://www.instagram.com/mamontre.ma.officiel?igsh=cnQ2ZWF1Z25kNGJ2" target="_blank" rel="noopener noreferrer" className="no-underline text-inherit">Instagram</a>
            </li>
            <li className="text-[0.76rem] font-light" style={{ color: 'rgba(255,255,255,0.55)' }}>Maroc</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 pt-5 flex justify-between flex-wrap gap-2 text-[0.68rem] font-light">
        <span>{ft.copyright}</span>
        <div className="flex items-center gap-4">
          <a href="https://wa.me/212717706550" target="_blank" rel="noopener noreferrer" className="no-underline text-inherit hover:text-rgl transition-colors">WhatsApp</a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <a href="https://www.instagram.com/mamontre.ma.officiel?igsh=cnQ2ZWF1Z25kNGJ2" target="_blank" rel="noopener noreferrer" className="no-underline text-inherit hover:text-rgl transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  )
}

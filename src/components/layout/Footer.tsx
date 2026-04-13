export default function Footer() {
  return (
    <footer className="bg-black px-12 pt-14 pb-7" style={{ color: 'rgba(255,255,255,0.55)' }}>
      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
        {/* Brand */}
        <div>
          <span className="font-display text-[1.3rem] font-semibold tracking-[0.12em] text-white mb-3 block">
            D<span className="text-rg">1</span> MILANO
          </span>
          <p className="text-[0.76rem] font-light leading-[1.7] max-w-[260px]">
            Distributeur officiel D1 Milano au Maroc. Design milanais, disponible à Casablanca.
          </p>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-[0.65rem] tracking-[0.25em] uppercase text-white font-normal mb-3.5">
            Collections
          </h4>
          <ul className="list-none space-y-[9px]">
            {['Polycarbon', 'Ultra Thin', 'Skeleton', 'Tahoe'].map((item) => (
              <li key={item}
                  className="text-[0.76rem] font-light cursor-pointer transition-colors duration-200 hover:text-rgl">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-[0.65rem] tracking-[0.25em] uppercase text-white font-normal mb-3.5">
            Info
          </h4>
          <ul className="list-none space-y-[9px]">
            {['Comment commander', 'Retrait boutique', 'Garantie & SAV'].map((item) => (
              <li key={item}
                  className="text-[0.76rem] font-light cursor-pointer transition-colors duration-200 hover:text-rgl">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[0.65rem] tracking-[0.25em] uppercase text-white font-normal mb-3.5">
            Contact
          </h4>
          <ul className="list-none space-y-[9px]">
            {['WhatsApp', 'Instagram', 'Casablanca, Maroc'].map((item) => (
              <li key={item}
                  className="text-[0.76rem] font-light cursor-pointer transition-colors duration-200 hover:text-rgl">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 pt-5 flex justify-between flex-wrap gap-2 text-[0.68rem] font-light">
        <span>© 2025 D1 Milano Maroc — mamontre.ma</span>
        <span>Designed with ♥ in Casablanca</span>
      </div>
    </footer>
  )
}

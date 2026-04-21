export default function Footer() {
  return (
    <footer className="bg-black px-12 pt-14 pb-7" style={{ color: 'rgba(255,255,255,0.55)' }}>
      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
        {/* Brand */}
        <div>
          <span className="flex flex-col leading-none mb-3">
            <span className="font-body font-semibold text-[1.1rem] tracking-[0.38em] uppercase text-white">
              MS-STORE
            </span>
            <span className="font-body font-light text-[0.5rem] tracking-[0.3em] uppercase mt-[4px]"
                  style={{ color: 'rgba(154,149,144,0.65)' }}>
              D1 Milano
            </span>
          </span>
          <p className="text-[0.76rem] font-light leading-[1.7] max-w-[260px]">
            Votre destination premium au Maroc. Distributeur officiel D1 Milano, et bien plus encore.
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
        <span>© 2025 MS-Store · D1 Milano Maroc</span>
        <span>Designed with ♥</span>
      </div>
    </footer>
  )
}

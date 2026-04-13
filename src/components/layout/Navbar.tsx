'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-12 py-[18px] bg-white/[0.94] backdrop-blur-[12px] border-b border-gl"
           style={{ background: 'rgba(250,250,250,0.94)' }}>
        <Link href="/" className="font-display text-[1.4rem] font-semibold tracking-[0.12em] text-black no-underline">
          D<span className="text-rg">1</span> MILANO
        </Link>

        <ul className="hidden md:flex gap-8 list-none">
          <li>
            <Link href="/#collections"
                  className="font-light text-[0.75rem] tracking-[0.18em] uppercase text-gd no-underline hover:text-rg transition-colors duration-200">
              Collections
            </Link>
          </li>
          <li>
            <Link href="/catalogue"
                  className="font-light text-[0.75rem] tracking-[0.18em] uppercase text-gd no-underline hover:text-rg transition-colors duration-200">
              Catalogue
            </Link>
          </li>
          <li>
            <Link href="/#process"
                  className="font-light text-[0.75rem] tracking-[0.18em] uppercase text-gd no-underline hover:text-rg transition-colors duration-200">
              Commander
            </Link>
          </li>
        </ul>

        <Link href="/catalogue"
              className="hidden md:block text-[0.7rem] tracking-[0.16em] uppercase font-normal text-white bg-black px-[22px] py-[10px] no-underline hover:bg-rg transition-colors duration-200">
          Voir les montres
        </Link>

        {/* Hamburger */}
        <button
          className="flex md:hidden flex-col gap-[5px] cursor-pointer bg-transparent border-none p-1"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <span className="block w-6 h-[1.5px] bg-black" />
          <span className="block w-6 h-[1.5px] bg-black" />
          <span className="block w-6 h-[1.5px] bg-black" />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8 bg-white">
          <button
            className="absolute top-6 right-8 text-[1.6rem] cursor-pointer bg-transparent border-none text-gd"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
          <Link href="/" className="font-display text-[2rem] font-light text-black no-underline tracking-[0.08em] hover:text-rg"
                onClick={() => setMobileOpen(false)}>
            Accueil
          </Link>
          <Link href="/catalogue" className="font-display text-[2rem] font-light text-black no-underline tracking-[0.08em] hover:text-rg"
                onClick={() => setMobileOpen(false)}>
            Catalogue
          </Link>
          <Link href="/#process" className="font-display text-[2rem] font-light text-black no-underline tracking-[0.08em] hover:text-rg"
                onClick={() => setMobileOpen(false)}>
            Commander
          </Link>
        </div>
      )}
    </>
  )
}

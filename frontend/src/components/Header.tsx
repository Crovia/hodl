'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DiamondIcon from './DiamondIcon';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/presale', label: 'Pre-Sale' },
  { href: '/rules', label: 'Rules' },
  { href: '/holders', label: 'Holders' },
  { href: '/airdrops', label: 'Airdrops' },
  { href: '/tiers', label: 'Tiers' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-[60] overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-400/5 rounded-full blur-[120px]" />

      <nav className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <DiamondIcon size={36} className="animate-float" id="nav" />
          <span className="text-xl font-bold diamond-text">DiamondHands</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                pathname === item.href
                  ? 'text-gold-400'
                  : 'text-gray-400 hover:text-gold-400'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:block px-5 py-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold text-sm hover:from-gold-400 hover:to-gold-500 transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]">
            Buy $HODL
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <span className={`w-6 h-0.5 bg-gray-300 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-0.5 bg-gray-300 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-gray-300 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden relative border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm">
          <div className="px-6 py-4 flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium py-2 transition-colors ${
                  pathname === item.href
                    ? 'text-gold-400'
                    : 'text-gray-400 hover:text-gold-400'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button className="mt-2 w-full px-5 py-2.5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold text-sm">
              Buy $HODL
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
'use client';

import DiamondIcon from './DiamondIcon';

export default function Footer() {
  const toggleImages = () => {
    window.dispatchEvent(new CustomEvent('toggleFloatingImages'));
  };

  return (
    <footer className="relative z-20 py-16 px-6 border-t border-white/5 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <DiamondIcon size={48} className="mb-4" />
          <h3 className="text-xl font-bold diamond-text mb-2">DiamondHands</h3>
          <p className="text-gray-500 text-sm max-w-md mb-2">
            The strongest survive. The chain doesn&apos;t lie.
          </p>
          <p className="text-gray-400 text-xs mb-8">Launched by Awerghx</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="https://x.com/Awerghx" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">X</a>
            <a href="https://discord.gg/cronoslegends" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">Discord</a>
            <a href="https://dexscreener.com/cronos/0xb4c50913f70b870f68e6143126163ba0e9186ad7" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">DexScreener</a>
            <a href="https://cro.trade/0xf12d9cbd36738344b5d2281b21c323c8f1a07b1a" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">Buy $HODL</a>
          </div>
          <button
            onClick={toggleImages}
            className="mt-6 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gold-400 border border-gray-700 hover:border-gold-400/30 bg-white/5 hover:bg-gold-400/5 transition-all"
          >
            Toggle Meme Images
          </button>
          <div className="mt-4 text-xs text-gray-500">
            &copy; 2026 DiamondHands. Not financial advice. DYOR.
          </div>
        </div>
      </div>
    </footer>
  );
}

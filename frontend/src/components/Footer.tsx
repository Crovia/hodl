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
          <p className="text-gray-600 text-xs mb-8">Launched by Awerghx</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="https://x.com/Awerghx" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">X</a>
            <a href="https://discord.gg/cronoslegends" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors">Discord</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Telegram</a>
            <a href="#" className="hover:text-gold-400 transition-colors">DEXScreener</a>
          </div>
          <button
            onClick={toggleImages}
            className="mt-6 px-4 py-2 rounded-lg text-xs text-gray-600 hover:text-gray-400 border border-white/5 hover:border-white/10 transition-colors"
          >
            Toggle Meme Images
          </button>
          <div className="mt-4 text-xs text-gray-700">
            &copy; 2026 DiamondHands. Not financial advice. DYOR.
          </div>
        </div>
      </div>
    </footer>
  );
}

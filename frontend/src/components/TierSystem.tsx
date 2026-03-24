'use client';

import { useState, useEffect } from 'react';

interface Seller {
  address: string;
  percentage: number;
  holdingDays: number;
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const shameImages = [
  '/cry33.png', '/cry19.png', '/cry20.png', '/cry17.png', '/cry22.png',
  '/cry18.png', '/cry23.png', '/cry25.png',
];

export default function TierSystem() {
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    fetch('/data/holders.json')
      .then(res => res.json())
      .then(data => {
        if (data.holders) {
          const sold = data.holders
            .filter((h: { hasSold: boolean }) => h.hasSold)
            .map((h: { address: string; percentage: number; holdingDays: number }) => ({
              address: h.address,
              percentage: h.percentage,
              holdingDays: h.holdingDays,
            }));
          setSellers(sold);
        }
      })
      .catch(() => {});
  }, []);
  const tiers = [
    {
      name: 'Diamond Hands',
      image: '/Dhand.png',
      threshold: '1.8%+ of supply',
      poolShare: '55%',
      description: 'The elite. The unshakeable. Maximum rewards for maximum commitment.',
      gradient: 'from-diamond-400 via-purple-400 to-diamond-400',
      borderColor: 'border-diamond-400/30',
      bgColor: 'bg-diamond-400/5',
      accentColor: 'text-diamond-400',
      ringColor: 'ring-diamond-400/20',
    },
    {
      name: 'Gold Hands',
      image: '/Ghand.png',
      threshold: '1%+ of supply',
      poolShare: '30%',
      description: 'Strong conviction. You believe in the mission and it shows.',
      gradient: 'from-gold-400 via-gold-300 to-gold-500',
      borderColor: 'border-gold-400/30',
      bgColor: 'bg-gold-400/5',
      accentColor: 'text-gold-400',
      ringColor: 'ring-gold-400/20',
    },
    {
      name: 'Silver Hands',
      image: '/Shand.png',
      threshold: '0.5%+ of supply',
      poolShare: '15%',
      description: 'You\'re in the game. Hold strong and climb the ranks.',
      gradient: 'from-gray-300 via-gray-200 to-gray-400',
      borderColor: 'border-gray-400/30',
      bgColor: 'bg-gray-400/5',
      accentColor: 'text-gray-300',
      ringColor: 'ring-gray-400/20',
    },
    {
      name: 'Jeeter',
      image: '/jeeter.png',
      threshold: 'Sold or transferred',
      poolShare: '0%',
      description: 'You sold. You\'re out. Permanently disqualified from all airdrops. No second chances.',
      gradient: 'from-red-500 via-red-400 to-red-600',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/5',
      accentColor: 'text-red-400',
      ringColor: 'ring-red-500/20',
    },
  ];

  return (
    <section id="tiers" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="diamond-text">Tier System</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            The pool splits equally between tiers. Within each tier, rewards scale by your holdings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`glass-card rounded-2xl overflow-hidden ${tier.borderColor} hover:ring-2 ${tier.ringColor} transition-all duration-300 group`}
            >
              {/* Top accent line */}
              <div className={`h-1 bg-gradient-to-r ${tier.gradient}`} />

              <div className="p-8">
                {/* Header with image */}
                <div className="flex items-center gap-5 mb-6">
                  <div className={`relative flex-shrink-0 w-24 h-24 rounded-2xl ${tier.bgColor} flex items-center justify-center overflow-hidden`}>
                    <img src={tier.image} alt={tier.name} className="w-20 h-20 object-contain" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                      {tier.name}
                    </h3>
                    <div className={`text-sm font-medium ${tier.accentColor} mt-0.5`}>{tier.threshold}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{tier.description}</p>

                {/* Pool share */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pool Share</span>
                  <span className={`text-3xl font-black bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
                    {tier.poolShare}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boost timeline */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            <span className="diamond-text">Loyalty Boost Timeline</span>
          </h3>
          <div className="glass-card rounded-2xl p-8">
            {/* Connecting line behind dots */}
            <div className="relative">
              <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-gradient-to-r from-gray-700 via-gold-400/50 to-purple-400/50 rounded-full" />
              <div className="relative flex justify-between items-start">
                {[
                  { day: '10d', boost: '+3%', color: 'text-gray-400', dot: 'bg-gray-400', ring: 'ring-gray-400/30' },
                  { day: '20d', boost: '+6%', color: 'text-gold-400', dot: 'bg-gold-400', ring: 'ring-gold-400/30' },
                  { day: '30d', boost: '+9%', color: 'text-gold-300', dot: 'bg-gold-300', ring: 'ring-gold-300/30' },
                  { day: '40d', boost: '+12%', color: 'text-diamond-400', dot: 'bg-diamond-400', ring: 'ring-diamond-400/30' },
                  { day: '50d', boost: '+15%', color: 'text-purple-400', dot: 'bg-purple-400', ring: 'ring-purple-400/30' },
                  { day: '60d+', boost: '+18%+', color: 'text-pink-400', dot: 'bg-pink-400', ring: 'ring-pink-400/30' },
                ].map((milestone, i) => (
                  <div key={milestone.day} className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${milestone.dot} ring-4 ${milestone.ring} ${i > 0 ? 'animate-sparkle' : ''}`}
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                    <div className={`text-lg font-bold ${milestone.color} mt-3`}>{milestone.boost}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{milestone.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hall of Shame — live from blockchain */}
        <div className="mt-16">
          <div className="flex justify-center mb-4">
            <img src="https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyb3Z5OHgydDRrbTB0anl4YXFuNXVvdXQxc2sxZHJ4MjFiYnUzMnFvdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/vX9WcCiWwUF7G/source.gif" alt="Crying" className="w-32 h-32 rounded-full object-cover" />
          </div>
          <h3 className="text-2xl font-bold text-center mb-3">
            <span className="text-red-400">Hall of Shame</span>
          </h3>
          <p className="text-center text-sm text-gray-500 mb-8">
            These wallets sold or transferred tokens. Permanently disqualified. The chain sees everything.
          </p>

          {sellers.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sellers.map((seller, i) => (
                <div
                  key={seller.address}
                  className="glass-card rounded-xl p-5 border border-red-500/20 bg-red-500/5 hover:border-red-500/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={shameImages[i % shameImages.length]}
                      alt="Jeeter"
                      className="w-14 h-14 rounded-full object-cover bg-black/30 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 uppercase">
                          Jeeter
                        </span>
                        <span className="text-xs text-gray-600">
                          Held {seller.holdingDays}d before selling
                        </span>
                      </div>
                      <a
                        href={`https://cronoscan.com/address/${seller.address}#tokentxns`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-gray-400 hover:text-red-400 transition-colors"
                      >
                        {truncateAddress(seller.address)}
                      </a>
                      <div className="text-xs text-gray-500 mt-1">
                        Was holding <span className="text-white font-medium">{seller.percentage}%</span> of supply
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-2 rounded-lg bg-black/30 text-center">
                    <span className="text-xs text-red-400 font-bold">Forfeited all future airdrops</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 border border-red-500/10 text-center">
              <img src="/jeeter.png" alt="Jeeter" className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500 text-sm">No jeeters yet.</p>
              <p className="text-gray-600 text-xs mt-1">Sellers will appear here automatically.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

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

const NAME_MAP: Record<string, string> = {
  '0xaf87e4df58d735ec2971d2d8db663b02ca60175d': 'Cronos Legends',
  '0x185d93b0f57a22e6cab7d9f0d4eb657341ff90b3': 'Obsidian Finance',
  '0x7e3e91b6912042f8fc446385299785ac2f12c0d0': 'haten.cro',
  '0x52076d4f01440225e5a8babb77b3eb1391c617e6': 'TBK',
  '0x32df940edbf734971af4707fe35f3ade91660358': 'Liberty',
  '0xc3f1087176485ec5518cbc88169205ff26f75702': 'Boula',
  '0x36d21fd7eafa01abc35578ea940c545dce8ac10c': 'Zerokrypto',
  '0x4e730ac6a1a9d53aef0239331d90e0da4642fbb5': 'AarzyK',
  '0x8ad01ed7fc839e9523447ae7d00fba695ef9875f': 'Snapmaster',
  '0x5148e8932a8f9e7bedb04303a12187e56446956c': 'Baas343',
  '0x5034e11bd0e61f2811396324b685cd58d2f6c206': 'Steve',
  '0x2270cbad5072b7685357ec83ddc959ffde535b27': 'Tohmee',
  '0x1d9b981b7aba1a747883833fb8a1b5072eac5d8f': 'Exterminate',
  '0x3b428943ef1c49bf81ddb00f9a11e55811fc7b3c': 'Rdeepanraj',
  '0x499e30aea1540fda665412c779f00c6dd8a6d27d': 'Awerghx',
  '0xd45b551473f1819ef9fc9efa2c654b98eab21850': 'JePu',
  '0x3868150e5ff9ec5b052a36f2d8a5d8bc348b4967': 'Naddy',
  '0xf085359db5df9dfa01ef31a269d5cdf99685bd4a': 'El presidentee',
  '0xece1b63218a249708b521e22bbaa7bac35f6f20f': 'Nicholoco',
  '0x172b4e1e7c0772c4dbe152914cef9e9f427c7585': 'CroSsoulL',
  '0x87664c30cfba8fe860439bbf94e3521686dec0de': 'Kikodog',
  '0xe375805d3fb202d028939bb39d2ba9385ffffde6': 'kajebara',
  '0x5237454dac7d259dd88b34ceb17e195dca0a3f4d': 'Seevin',
  '0x0e4eacc2887a58d157a4a9f036f7499ffcc68831': 'Chiefboss',
  '0x89c132e654699c953c6ddb4e27e7cbcd19b13e8a': 'ArdentVRory',
  '0x3283b4937d1bbfda4b24d9f110c5731ce209244e': 'Nosnah84',
  '0x782bdee22753ea3e5a4c16cbf8887a098d13b432': 'Paysagiste00',
  '0x584b5505de4a4e7393e915b2e44593934d528d63': 'Willys',
  '0xfb28a731959997bf41e57397209bab78cd2a0406': 'sebastiaan',
  '0x212246c1bb44c4d70ecc1f6fe64c1fe68638624f': 'Gmbino',
  '0xdfb2e6486507a90c820a634f59483470e621ac4b': 'CryptoCharlesManson',
  '0x08c2ceeca0e01066b4e46081acc621a34e8e21f1': 'Memeseason',
  '0x38eb9a99ea4d612f7c516368242fb7dabffd1a75': 'Dougie',
};

export default function TierSystem() {
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    fetch('/holders-live.json')
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
            <img src="https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyb3Z5OHgydDRrbTB0anl4YXFuNXVvdXQxc2sxZHJ4MjFiYnUzMnFvdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/vX9WcCiWwUF7G/source.gif" alt="Crying" className="w-48 h-48 object-contain" />
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
                        {NAME_MAP[seller.address.toLowerCase()] || truncateAddress(seller.address)}
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

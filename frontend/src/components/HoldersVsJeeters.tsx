'use client';

import { useState, useEffect } from 'react';

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
  '0xf8ed3a12832b106b0edc947b007c64439ad74402': 'Hodler',
};

interface HolderData {
  address: string;
  percentage: number;
  tier: string;
  holdingDays: number;
  hasSold: boolean;
}

function truncAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function getName(addr: string) {
  return NAME_MAP[addr.toLowerCase()] || truncAddr(addr);
}

const tierConfig: Record<string, { label: string; css: string; emoji: string }> = {
  diamond: { label: 'Diamond', css: 'tier-diamond', emoji: '💎' },
  gold: { label: 'Gold', css: 'tier-gold', emoji: '🥇' },
  silver: { label: 'Silver', css: 'tier-silver', emoji: '🥈' },
  bronze: { label: 'Bronze', css: 'tier-bronze', emoji: '🥉' },
  jeeter: { label: 'Jeeter', css: 'tier-jeeter', emoji: '💀' },
};

const cryImages = [
  '/cry33.png', '/cry19.png', '/cry20.png', '/cry17.png', '/cry22.png',
];

export default function HoldersVsJeeters() {
  const [holders, setHolders] = useState<HolderData[]>([]);

  useEffect(() => {
    const load = () => {
      fetch(`/holders-live.json?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.holders) setHolders(data.holders);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  if (holders.length === 0) return null;

  // Tier counts
  const counts = { diamond: 0, gold: 0, silver: 0, bronze: 0, jeeter: 0 };
  for (const h of holders) {
    const tier = h.hasSold ? 'jeeter' : h.tier;
    if (tier in counts) counts[tier as keyof typeof counts]++;
  }
  const totalHodlers = counts.diamond + counts.gold + counts.silver + counts.bronze;

  // Latest 5 holders (sorted by fewest holdingDays = newest, non-sellers)
  const latestHolders = [...holders]
    .filter(h => !h.hasSold && h.tier !== 'jeeter')
    .sort((a, b) => a.holdingDays - b.holdingDays)
    .slice(0, 5);

  // Latest 5 jeeters
  const latestJeeters = holders
    .filter(h => h.hasSold || h.tier === 'jeeter')
    .slice(0, 5);

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Tier counts */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-2">
            <span className="diamond-text">Community Strength</span>
          </h2>
          <p className="text-gray-400 mb-8">
            <span className="text-white font-bold text-2xl">{totalHodlers}</span> hodlers vs{' '}
            <span className="text-red-400 font-bold text-2xl">{counts.jeeter}</span> jeeters
          </p>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-4">
            {(['diamond', 'gold', 'silver', 'bronze', 'jeeter'] as const).map(tier => {
              const cfg = tierConfig[tier];
              const count = counts[tier];
              return (
                <div
                  key={tier}
                  className={`glass-card rounded-xl px-5 py-3 border ${
                    tier === 'jeeter' ? 'border-red-500/20' : 'border-white/10'
                  }`}
                >
                  <div className="text-2xl mb-1">{cfg.emoji}</div>
                  <div className="text-2xl font-black text-white">{count}</div>
                  <div className={`text-xs font-bold uppercase tracking-wider ${
                    tier === 'diamond' ? 'text-diamond-400' :
                    tier === 'gold' ? 'text-gold-400' :
                    tier === 'silver' ? 'text-gray-300' :
                    tier === 'bronze' ? 'text-amber-600' :
                    'text-red-400'
                  }`}>{cfg.label}</div>
                </div>
              );
            })}
          </div>

          {/* Hodler ratio bar */}
          <div className="max-w-lg mx-auto mt-6">
            <div className="h-4 rounded-full overflow-hidden bg-black/40 border border-white/10 flex">
              {totalHodlers > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-1000"
                  style={{ width: `${(totalHodlers / (totalHodlers + counts.jeeter)) * 100}%` }}
                />
              )}
              {counts.jeeter > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-700 transition-all duration-1000"
                  style={{ width: `${(counts.jeeter / (totalHodlers + counts.jeeter)) * 100}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gold-400 font-bold">Hodlers {Math.round((totalHodlers / (totalHodlers + counts.jeeter)) * 100)}%</span>
              <span className="text-red-400 font-bold">Jeeters {Math.round((counts.jeeter / (totalHodlers + counts.jeeter)) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Holders vs Jeeters battle */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Newest Holders */}
          <div className="glass-card rounded-2xl overflow-hidden border border-gold-400/20">
            <div className="p-4 bg-gradient-to-r from-gold-400/10 to-transparent border-b border-gold-400/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💎</span>
                <div>
                  <h3 className="text-lg font-black text-gold-400">Newest Hodlers</h3>
                  <p className="text-xs text-gray-500">Latest warriors to join the ranks</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {latestHolders.map((h, i) => {
                const cfg = tierConfig[h.tier] || tierConfig.bronze;
                return (
                  <div key={h.address} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                    <div className="text-lg w-8 text-center">{cfg.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{getName(h.address)}</div>
                      <div className="text-xs text-gray-500">{h.holdingDays}d holding &middot; {h.percentage}%</div>
                    </div>
                    <span className={`${cfg.css} px-2 py-0.5 rounded-full text-[10px] font-bold text-white`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
              {latestHolders.length === 0 && (
                <div className="p-6 text-center text-gray-500 text-sm">No holders yet</div>
              )}
            </div>
          </div>

          {/* Latest Jeeters */}
          <div className="glass-card rounded-2xl overflow-hidden border border-red-500/20">
            <div className="p-4 bg-gradient-to-r from-red-500/10 to-transparent border-b border-red-500/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💀</span>
                <div>
                  <h3 className="text-lg font-black text-red-400">Recent Jeeters</h3>
                  <p className="text-xs text-gray-500">Paper hands who couldn&apos;t take the heat</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {latestJeeters.map((h, i) => (
                <div key={h.address} className="flex items-center gap-3 px-4 py-3 hover:bg-red-500/5 transition-colors">
                  <img
                    src={cryImages[i % cryImages.length]}
                    alt="Jeeter"
                    className="w-8 h-8 rounded-full object-cover bg-black/30 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-400 truncate">{getName(h.address)}</div>
                    <div className="text-xs text-gray-600">Held {h.holdingDays}d &middot; Was {h.percentage}%</div>
                  </div>
                  <span className="tier-jeeter px-2 py-0.5 rounded-full text-[10px] font-bold text-white">
                    Jeeter
                  </span>
                </div>
              ))}
              {latestJeeters.length === 0 && (
                <div className="p-6 text-center text-gray-500 text-sm">
                  <img src="/jeeter.png" alt="" className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  No jeeters yet. Everyone&apos;s holding strong!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
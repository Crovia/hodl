'use client';

import { useState, useEffect, useMemo } from 'react';
import { NAME_MAP } from '@/lib/nameMap';
import { useCronosIds } from '@/hooks/useCronosIds';

interface HolderData {
  address: string;
  percentage: number;
  holdingDays: number;
  hasSold: boolean;
  tier: string;
  balance: string;
  airdropAmount: number;
  boostPercentage: number;
  totalWithBoost: number;
}

const cryImages = [
  '/cry33.png', '/cry19.png', '/cry20.png', '/cry17.png', '/cry22.png',
  '/cry18.png', '/cry23.png', '/cry25.png',
];

const TRADER_THRESHOLD = 0.1; // >0.1% = trader, <=0.1% = jeeter

export default function TradersJeetersPage() {
  const [allHolders, setAllHolders] = useState<HolderData[]>([]);
  const [hodlUsd, setHodlUsd] = useState(0);
  const [tab, setTab] = useState<'traders' | 'jeeters'>('traders');

  useEffect(() => {
    const load = () => {
      fetch(`/holders-live.json?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.holders) setAllHolders(data.holders);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('https://api.dexscreener.com/latest/dex/pairs/cronos/0xb4c50913f70b870f68e6143126163ba0e9186ad7')
      .then(res => res.json())
      .then(data => { if (data.pair?.priceUsd) setHodlUsd(parseFloat(data.pair.priceUsd)); })
      .catch(() => {});
  }, []);

  const sold = useMemo(
    () => allHolders.filter(h => h.hasSold || h.tier === 'jeeter'),
    [allHolders]
  );

  const traders = useMemo(
    () => sold.filter(h => h.percentage > TRADER_THRESHOLD).sort((a, b) => b.percentage - a.percentage),
    [sold]
  );

  const jeeters = useMemo(
    () => sold.filter(h => h.percentage <= TRADER_THRESHOLD).sort((a, b) => b.percentage - a.percentage),
    [sold]
  );

  const current = tab === 'traders' ? traders : jeeters;

  const allAddresses = useMemo(() => sold.map(j => j.address), [sold]);
  const { cronosIds } = useCronosIds(allAddresses);

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img
              src="https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyb3Z5OHgydDRrbTB0anl4YXFuNXVvdXQxc2sxZHJ4MjFiYnUzMnFvdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/vX9WcCiWwUF7G/source.gif"
              alt="Shame"
              className="w-72 h-72 object-contain rounded-xl"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-amber-400">Traders</span>
            <span className="text-gray-600 mx-3">&amp;</span>
            <span className="text-red-400">Jeeters</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-2">
            These wallets sold or transferred $HODL tokens. Disqualified from airdrops.
          </p>
          <p className="text-gray-600 text-sm">
            Traders still hold &gt;0.1% of supply. Jeeters dumped almost everything.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setTab('traders')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'traders'
                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'
            }`}
          >
            Traders ({traders.length})
          </button>
          <button
            onClick={() => setTab('jeeters')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'jeeters'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'
            }`}
          >
            Jeeters ({jeeters.length})
          </button>
        </div>

        {/* Stats bar */}
        <div className={`glass-card rounded-xl p-4 mb-8 border text-center ${
          tab === 'traders' ? 'border-amber-400/20 bg-amber-400/5' : 'border-red-500/20 bg-red-500/5'
        }`}>
          <span className={`font-black text-3xl ${tab === 'traders' ? 'text-amber-400' : 'text-red-400'}`}>
            {current.length}
          </span>
          <span className="text-gray-500 text-sm ml-2">
            {tab === 'traders'
              ? `${current.length === 1 ? 'wallet' : 'wallets'} sold but still holding >0.1%`
              : `${current.length === 1 ? 'wallet has' : 'wallets have'} been fully disqualified`
            }
          </span>
        </div>

        {current.length > 0 ? (
          <div className="space-y-4">
            {current.map((h, i) => {
              const hardcodedName = NAME_MAP[h.address.toLowerCase()];
              const cronosId = cronosIds[h.address.toLowerCase()];
              const isTrader = h.percentage > TRADER_THRESHOLD;
              const balanceNum = parseFloat(h.balance);
              const holdingUsd = balanceNum * hodlUsd;

              return (
                <div
                  key={h.address}
                  className={`glass-card rounded-xl overflow-hidden border transition-all ${
                    isTrader
                      ? 'border-amber-400/20 hover:border-amber-400/40'
                      : 'border-red-500/20 hover:border-red-500/40'
                  }`}
                >
                  <div className={`h-0.5 bg-gradient-to-r ${
                    isTrader ? 'from-amber-400 to-amber-600' : 'from-red-500 to-red-700'
                  }`} />
                  <div className="p-5 flex items-center gap-4">
                    <img
                      src={cryImages[i % cryImages.length]}
                      alt={isTrader ? 'Trader' : 'Jeeter'}
                      className="w-14 h-14 rounded-full object-cover bg-black/30 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${
                          isTrader ? 'bg-amber-500/40' : 'tier-jeeter'
                        }`}>
                          {isTrader ? 'Trader' : 'Jeeter'}
                        </span>
                        {hardcodedName && (
                          <span className="text-white font-bold text-sm">{hardcodedName}</span>
                        )}
                        {!hardcodedName && cronosId && (
                          <span className="text-purple-400 font-bold text-sm">{cronosId}</span>
                        )}
                        <span className="text-xs text-gray-600">
                          Held {h.holdingDays}d before selling
                        </span>
                      </div>
                      <a
                        href={`https://cronoscan.com/address/${h.address}#tokentxns`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-gray-500 hover:text-amber-400 transition-colors"
                      >
                        {h.address}
                      </a>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span>Holding <span className="text-white font-medium">{h.percentage}%</span> of supply</span>
                        {balanceNum > 0 && (
                          <span>
                            <span className="text-gray-400 font-medium">{balanceNum.toLocaleString()}</span> tokens
                          </span>
                        )}
                        {isTrader && hodlUsd > 0 && balanceNum > 0 && (
                          <span>
                            Worth <span className="text-amber-400 font-bold">
                              {holdingUsd >= 1000 ? `$${(holdingUsd/1000).toFixed(1)}K` : `$${holdingUsd.toFixed(2)}`}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Value column for traders */}
                    {isTrader && hodlUsd > 0 && balanceNum > 0 && (
                      <div className="hidden md:flex flex-col items-end flex-shrink-0">
                        <div className="text-amber-400 font-black text-lg">
                          {holdingUsd >= 1000 ? `$${(holdingUsd/1000).toFixed(1)}K` : `$${holdingUsd.toFixed(2)}`}
                        </div>
                        <div className="text-gray-600 text-[10px] uppercase">Position Value</div>
                      </div>
                    )}
                  </div>
                  <div className={`px-5 py-2 border-t text-center ${
                    isTrader
                      ? 'bg-amber-400/5 border-amber-400/10'
                      : 'bg-red-500/5 border-red-500/10'
                  }`}>
                    <span className={`text-xs font-bold ${isTrader ? 'text-amber-400' : 'text-red-400'}`}>
                      {isTrader ? 'Sold tokens — disqualified from airdrops' : 'Forfeited all future airdrops permanently'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
            <div className="text-xl font-bold text-gray-400 mb-2">
              {tab === 'traders' ? 'No traders yet' : 'No jeeters yet'}
            </div>
            <div className="text-sm text-gray-600">
              {tab === 'traders'
                ? 'No one has sold while holding >0.1%. Good.'
                : 'No full dumpers yet. Everyone still has skin in the game.'
              }
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

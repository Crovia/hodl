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
  totalReceived?: string;
  airdropAmount: number;
  boostPercentage: number;
  totalWithBoost: number;
}

const cryImages = [
  '/cry33.png', '/cry19.png', '/cry20.png', '/cry17.png', '/cry22.png',
  '/cry18.png', '/cry23.png', '/cry25.png',
];

const TRADER_THRESHOLD = 0.2; // >0.2% = trader, <=0.2% = jeeter

const OG_ADDRESSES = new Set([
  '0xaf87e4df58d735ec2971d2d8db663b02ca60175d', '0x185d93b0f57a22e6cab7d9f0d4eb657341ff90b3',
  '0x7e3e91b6912042f8fc446385299785ac2f12c0d0', '0x52076d4f01440225e5a8babb77b3eb1391c617e6',
  '0x32df940edbf734971af4707fe35f3ade91660358', '0xc3f1087176485ec5518cbc88169205ff26f75702',
  '0x36d21fd7eafa01abc35578ea940c545dce8ac10c', '0x4e730ac6a1a9d53aef0239331d90e0da4642fbb5',
  '0x8ad01ed7fc839e9523447ae7d00fba695ef9875f', '0x5148e8932a8f9e7bedb04303a12187e56446956c',
  '0x5034e11bd0e61f2811396324b685cd58d2f6c206', '0x2270cbad5072b7685357ec83ddc959ffde535b27',
  '0x1d9b981b7aba1a747883833fb8a1b5072eac5d8f', '0x3b428943ef1c49bf81ddb00f9a11e55811fc7b3c',
  '0x499e30aea1540fda665412c779f00c6dd8a6d27d', '0xd45b551473f1819ef9fc9efa2c654b98eab21850',
  '0x3868150e5ff9ec5b052a36f2d8a5d8bc348b4967', '0xf085359db5df9dfa01ef31a269d5cdf99685bd4a',
  '0xece1b63218a249708b521e22bbaa7bac35f6f20f', '0x172b4e1e7c0772c4dbe152914cef9e9f427c7585',
  '0x87664c30cfba8fe860439bbf94e3521686dec0de', '0xe375805d3fb202d028939bb39d2ba9385ffffde6',
  '0x5237454dac7d259dd88b34ceb17e195dca0a3f4d', '0x0e4eacc2887a58d157a4a9f036f7499ffcc68831',
  '0x89c132e654699c953c6ddb4e27e7cbcd19b13e8a', '0x3283b4937d1bbfda4b24d9f110c5731ce209244e',
  '0x782bdee22753ea3e5a4c16cbf8887a098d13b432', '0x584b5505de4a4e7393e915b2e44593934d528d63',
  '0xfb28a731959997bf41e57397209bab78cd2a0406', '0x212246c1bb44c4d70ecc1f6fe64c1fe68638624f',
  '0xdfb2e6486507a90c820a634f59483470e621ac4b', '0x08c2ceeca0e01066b4e46081acc621a34e8e21f1',
  '0x38eb9a99ea4d612f7c516368242fb7dabffd1a75',
]);

export default function TradersJeetersPage() {
  const [allHolders, setAllHolders] = useState<HolderData[]>([]);
  const [hodlUsd, setHodlUsd] = useState(0);
  const [tab, setTab] = useState<'traders' | 'jeeters'>('traders');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      fetch('/api/holders')
        .then(res => res.json())
        .then(data => {
          if (data.holders) setAllHolders(data.holders);
          if (data.timestamp) setLastUpdated(data.timestamp);
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
            Traders still hold &gt;0.2% of supply. Jeeters dumped almost everything.
          </p>
          {lastUpdated && (
            <p className="text-gray-600 text-xs mt-3">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
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
              ? `${current.length === 1 ? 'wallet' : 'wallets'} sold but still holding >0.2%`
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
              const isOg = OG_ADDRESSES.has(h.address.toLowerCase());
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
                        {isOg && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-400/15 text-gold-400 border border-gold-400/30">OG</span>
                        )}
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
                      {/* Dump progress bar */}
                      {h.totalReceived && parseFloat(h.totalReceived) > 0 && (() => {
                        const received = parseFloat(h.totalReceived!);
                        const remaining = balanceNum;
                        const soldAmount = received - remaining;
                        const soldPct = Math.min(100, Math.max(0, (soldAmount / received) * 100));
                        const remainPct = 100 - soldPct;
                        const fmt = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : Math.round(n).toLocaleString();
                        return (
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                              <span>Received: <span className="text-gray-400">{fmt(received)}</span></span>
                              <span>Sold: <span className="text-red-400">{fmt(soldAmount > 0 ? soldAmount : 0)}</span> ({soldPct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden bg-black/40 border border-white/5">
                              <div className="h-full flex">
                                <div className="bg-red-500/60 transition-all" style={{ width: `${soldPct}%` }} />
                                <div className="bg-green-500/40 transition-all" style={{ width: `${remainPct}%` }} />
                              </div>
                            </div>
                            <div className="text-[10px] text-gray-600 mt-0.5">
                              Still holding <span className="text-green-400">{fmt(remaining)}</span> ({remainPct.toFixed(0)}%)
                            </div>
                          </div>
                        );
                      })()}
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
                ? 'No one has sold while holding >0.2%. Good.'
                : 'No full dumpers yet. Everyone still has skin in the game.'
              }
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

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
  firstBuyTime?: string;
  lastSellTime?: string;
  airdropAmount: number;
  boostPercentage: number;
  totalWithBoost: number;
}

const cryImages = [
  '/cry33.png', '/cry19.png', '/cry20.png', '/cry17.png', '/cry22.png',
  '/cry18.png', '/cry23.png', '/cry25.png',
];

const TRADER_THRESHOLD = 0.2; // >0.2% = trader, <=0.2% = jeeter

const CONTRACT_ADDRESSES = new Set([
  '0x1189331089b6ca8bea989c1f2ffd0efadcd33a69',
  '0xec68090566397dcc37e54b30cc264b2d68cf0489',
]);

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'holdings' | 'latest' | 'biggest'>('holdings');
  const [filterNotable, setFilterNotable] = useState(false);

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
    () => allHolders
      .filter(h => h.hasSold || h.tier === 'jeeter')
      .sort((a, b) => {
        if (sortBy === 'latest') {
          if (a.lastSellTime && b.lastSellTime) return new Date(b.lastSellTime).getTime() - new Date(a.lastSellTime).getTime();
          if (a.lastSellTime) return -1;
          if (b.lastSellTime) return 1;
        }
        if (sortBy === 'biggest') {
          const soldA = parseFloat(a.totalReceived || '0') - parseFloat(a.balance || '0');
          const soldB = parseFloat(b.totalReceived || '0') - parseFloat(b.balance || '0');
          return soldB - soldA;
        }
        return b.percentage - a.percentage;
      }),
    [allHolders, sortBy]
  );

  const traders = useMemo(() => sold.filter(h => h.percentage >= TRADER_THRESHOLD), [sold]);
  const jeeters = useMemo(() => sold.filter(h => h.percentage < TRADER_THRESHOLD), [sold]);

  const allAddresses = useMemo(() => sold.map(j => j.address), [sold]);
  const { cronosIds } = useCronosIds(allAddresses);

  const displayList = useMemo(() => {
    if (!filterNotable) return sold;
    return sold.filter(h => {
      const lower = h.address.toLowerCase();
      return OG_ADDRESSES.has(lower) || !!cronosIds[lower];
    });
  }, [sold, filterNotable, cronosIds]);

  return (
    <section className="py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyb3Z5OHgydDRrbTB0anl4YXFuNXVvdXQxc2sxZHJ4MjFiYnUzMnFvdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/vX9WcCiWwUF7G/source.gif"
              alt="Shame"
              className="w-[36rem] h-auto object-contain rounded-xl"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-amber-400">Traders</span>
            <span className="text-gray-400 mx-3">&amp;</span>
            <span className="text-red-400">Jeeters</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-2">
            These wallets sold or transferred $HODL tokens. Disqualified from airdrops.
          </p>
          <p className="text-gray-400 text-sm">
            Traders still hold &gt;0.2% of supply. Jeeters dumped almost everything.
          </p>
          {lastUpdated && (
            <p className="text-gray-400 text-xs mt-3">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <div className="glass-card rounded-xl px-6 py-3 border border-amber-400/20 bg-amber-400/5 text-center">
            <span className="font-black text-2xl text-amber-400">{traders.length}</span>
            <span className="text-gray-500 text-sm ml-2">Traders — still holding ≥0.2%</span>
          </div>
          <div className="glass-card rounded-xl px-6 py-3 border border-red-500/20 bg-red-500/5 text-center">
            <span className="font-black text-2xl text-red-400">{jeeters.length}</span>
            <span className="text-gray-500 text-sm ml-2">Jeeters — fully dumped</span>
          </div>
        </div>

        {/* Sort + filter buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSortBy('holdings')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === 'holdings' ? 'bg-white/20 text-white border border-white/30' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'}`}
          >
            By Holdings
          </button>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === 'latest' ? 'bg-red-500/30 text-red-300 border border-red-500/50' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'}`}
          >
            Latest Jeeters
          </button>
          <button
            onClick={() => setSortBy('biggest')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === 'biggest' ? 'bg-red-500/30 text-red-300 border border-red-500/50' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'}`}
          >
            Biggest Dump
          </button>
          <button
            onClick={() => setFilterNotable(f => !f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterNotable ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'}`}
          >
            CronosID + OG Only
          </button>
        </div>

        {sold.length > 0 ? (
          <div className="space-y-2">
            {displayList.map((h, i) => {
              const hardcodedName = NAME_MAP[h.address.toLowerCase()];
              const cronosId = cronosIds[h.address.toLowerCase()];
              const isTrader = h.percentage > TRADER_THRESHOLD;
              const isContract = CONTRACT_ADDRESSES.has(h.address.toLowerCase());
              const isOg = OG_ADDRESSES.has(h.address.toLowerCase());
              const balanceNum = parseFloat(h.balance);
              const holdingUsd = balanceNum * hodlUsd;

              return (
                <div
                  key={h.address}
                  className={`glass-card rounded-lg overflow-hidden border transition-all ${
                    isContract
                      ? 'border-gray-500/20 hover:border-gray-500/40'
                      : isTrader
                      ? 'border-amber-400/20 hover:border-amber-400/40'
                      : 'border-red-500/20 hover:border-red-500/40'
                  }`}
                >
                  <div className={`h-0.5 bg-gradient-to-r ${
                    isContract ? 'from-gray-500 to-gray-600' : isTrader ? 'from-amber-400 to-amber-600' : 'from-red-500 to-red-700'
                  }`} />
                  <div className="px-4 py-2.5 flex items-center gap-3">
                    {!isContract && (
                      <img
                        src={cryImages[i % cryImages.length]}
                        alt={isTrader ? 'Trader' : 'Jeeter'}
                        className="w-9 h-9 rounded-full object-cover bg-black/30 flex-shrink-0"
                      />
                    )}
                    {isContract && (
                      <div className="w-9 h-9 rounded-full bg-gray-500/20 border border-gray-500/30 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs font-bold">SC</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!isContract && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase ${
                            isTrader ? 'bg-amber-500/40' : 'tier-jeeter'
                          }`}>
                            {isTrader ? 'Trader' : 'Jeeter'}
                          </span>
                        )}
                        {isContract && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-300 uppercase bg-gray-500/30">Contract</span>
                        )}
                        {isOg && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-400/15 text-gold-400 border border-gold-400/30">OG</span>
                        )}
                        {hardcodedName && (
                          <span className="text-white font-bold text-xs">{hardcodedName}</span>
                        )}
                        {!hardcodedName && cronosId && (
                          <span className="text-purple-400 font-bold text-xs">{cronosId}</span>
                        )}
                        <a
                          href={`https://cronoscan.com/address/${h.address}#tokentxns`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-gray-500 hover:text-amber-400 transition-colors"
                        >
                          {h.address.slice(0, 6)}…{h.address.slice(-4)}
                        </a>
                        {!isContract && (
                          <span className="text-[10px] text-gray-500 ml-auto">
                            {h.lastSellTime ? `sold ${timeAgo(h.lastSellTime)}` : `held ${h.holdingDays}d`}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-gray-500">
                        <span>Holding <span className="text-white font-medium">{h.percentage}%</span></span>
                        {balanceNum > 0 && (
                          <span><span className="text-gray-400 font-medium">{balanceNum >= 1e6 ? `${(balanceNum/1e6).toFixed(1)}M` : balanceNum >= 1e3 ? `${(balanceNum/1e3).toFixed(0)}K` : Math.round(balanceNum).toLocaleString()}</span> tokens</span>
                        )}
                        {isTrader && hodlUsd > 0 && balanceNum > 0 && (
                          <span>Worth <span className="text-amber-400 font-bold">
                            {holdingUsd >= 1000 ? `$${(holdingUsd/1000).toFixed(1)}K` : `$${holdingUsd.toFixed(2)}`}
                          </span></span>
                        )}
                      </div>
                      {/* Dump progress bar — hidden for contracts */}
                      {!isContract && h.totalReceived && parseFloat(h.totalReceived) > 0 && (() => {
                        const received = parseFloat(h.totalReceived!);
                        const remaining = balanceNum;
                        const soldAmount = received - remaining;
                        const soldPct = Math.min(100, Math.max(0, (soldAmount / received) * 100));
                        const remainPct = 100 - soldPct;
                        const fmt = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : Math.round(n).toLocaleString();
                        return (
                          <div className="mt-1.5">
                            <div className="h-1.5 rounded-full overflow-hidden bg-black/40 border border-white/5">
                              <div className="h-full flex">
                                <div className="bg-green-500/60 transition-all" style={{ width: `${remainPct}%` }} />
                                <div className="bg-red-500/60 transition-all" style={{ width: `${soldPct}%` }} />
                              </div>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Sold <span className="text-red-400">{fmt(soldAmount > 0 ? soldAmount : 0)}</span> ({soldPct.toFixed(0)}%) · Left <span className="text-green-400">{fmt(remaining)}</span> ({remainPct.toFixed(0)}%)
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Value column for traders */}
                    {isTrader && hodlUsd > 0 && balanceNum > 0 && (
                      <div className="hidden md:flex flex-col items-end flex-shrink-0">
                        <div className="text-amber-400 font-black text-base">
                          {holdingUsd >= 1000 ? `$${(holdingUsd/1000).toFixed(1)}K` : `$${holdingUsd.toFixed(2)}`}
                        </div>
                        <div className="text-gray-400 text-[10px] uppercase">Position Value</div>
                      </div>
                    )}
                  </div>
                  <div className={`px-4 py-1 border-t text-center ${
                    isContract
                      ? 'bg-gray-500/5 border-gray-500/10'
                      : isTrader
                      ? 'bg-amber-400/5 border-amber-400/10'
                      : 'bg-red-500/5 border-red-500/10'
                  }`}>
                    <span className={`text-[10px] font-bold ${isContract ? 'text-gray-400' : isTrader ? 'text-amber-400' : 'text-red-400'}`}>
                      {isContract ? 'Contract address — not a personal wallet' : isTrader ? 'Sold tokens — disqualified from airdrops' : 'Forfeited all future airdrops permanently'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
            <div className="text-xl font-bold text-gray-400 mb-2">No sellers yet</div>
            <div className="text-sm text-gray-400">Everyone still has skin in the game.</div>
          </div>
        )}
      </div>
    </section>
  );
}

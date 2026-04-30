'use client';

import { useState, useEffect, useMemo } from 'react';
import { NAME_MAP } from '@/lib/nameMap';
import { useCronosIds } from '@/hooks/useCronosIds';
import { PAST_AIRDROPS } from '@/lib/mockData';

interface HolderRecord {
  address: string;
  balance: string;
  percentage: number;
  tier: string;
  holdingDays: number;
  hasSold: boolean;
  boostPercentage: number;
  totalReceived?: string;
  firstBuyTime?: string;
  lastSellTime?: string;
  isWinner: boolean;
}

const PRESALE_ADDRESSES = new Set([
  '0xaf87e4df58d735ec2971d2d8db663b02ca60175d',
  '0x185d93b0f57a22e6cab7d9f0d4eb657341ff90b3',
  '0x7e3e91b6912042f8fc446385299785ac2f12c0d0',
  '0x52076d4f01440225e5a8babb77b3eb1391c617e6',
  '0x32df940edbf734971af4707fe35f3ade91660358',
  '0xc3f1087176485ec5518cbc88169205ff26f75702',
  '0x36d21fd7eafa01abc35578ea940c545dce8ac10c',
  '0x4e730ac6a1a9d53aef0239331d90e0da4642fbb5',
  '0x8ad01ed7fc839e9523447ae7d00fba695ef9875f',
  '0x5148e8932a8f9e7bedb04303a12187e56446956c',
  '0x5034e11bd0e61f2811396324b685cd58d2f6c206',
  '0x2270cbad5072b7685357ec83ddc959ffde535b27',
  '0x1d9b981b7aba1a747883833fb8a1b5072eac5d8f',
  '0x3b428943ef1c49bf81ddb00f9a11e55811fc7b3c',
  '0x499e30aea1540fda665412c779f00c6dd8a6d27d',
  '0xd45b551473f1819ef9fc9efa2c654b98eab21850',
  '0x3868150e5ff9ec5b052a36f2d8a5d8bc348b4967',
  '0xf085359db5df9dfa01ef31a269d5cdf99685bd4a',
  '0xece1b63218a249708b521e22bbaa7bac35f6f20f',
  '0x172b4e1e7c0772c4dbe152914cef9e9f427c7585',
  '0x87664c30cfba8fe860439bbf94e3521686dec0de',
  '0xe375805d3fb202d028939bb39d2ba9385ffffde6',
  '0x5237454dac7d259dd88b34ceb17e195dca0a3f4d',
  '0x0e4eacc2887a58d157a4a9f036f7499ffcc68831',
  '0x89c132e654699c953c6ddb4e27e7cbcd19b13e8a',
  '0x3283b4937d1bbfda4b24d9f110c5731ce209244e',
  '0x782bdee22753ea3e5a4c16cbf8887a098d13b432',
  '0x584b5505de4a4e7393e915b2e44593934d528d63',
  '0xfb28a731959997bf41e57397209bab78cd2a0406',
  '0x212246c1bb44c4d70ecc1f6fe64c1fe68638624f',
  '0xdfb2e6486507a90c820a634f59483470e621ac4b',
  '0x08c2ceeca0e01066b4e46081acc621a34e8e21f1',
  '0x38eb9a99ea4d612f7c516368242fb7dabffd1a75',
]);

const TIER_ORDER: Record<string, number> = { diamond: 0, gold: 1, silver: 2, bronze: 3, jeeter: 4 };

const TIER_COLORS: Record<string, string> = {
  diamond: 'text-sky-300',
  gold: 'text-gold-400',
  silver: 'text-gray-300',
  bronze: 'text-orange-700',
  jeeter: 'text-red-400',
};

const TIER_BORDER: Record<string, string> = {
  diamond: 'border-sky-400/40',
  gold: 'border-gold-400/40',
  silver: 'border-gray-400/30',
  bronze: 'border-orange-900/30',
  jeeter: 'border-red-500/20',
};

export default function HoldersPage() {
  const [holders, setHolders] = useState<HolderRecord[]>([]);
  const [snapshotDate, setSnapshotDate] = useState('');
  const [showJeeters, setShowJeeters] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getPastEarnings = (address: string) => {
    const lower = address.toLowerCase();
    return PAST_AIRDROPS
      .map(drop => ({ date: drop.date, ...drop.recipients[lower] }))
      .filter(e => e.hodl !== undefined);
  };

  useEffect(() => {
    fetch('/api/holders')
      .then(r => r.json())
      .then(data => {
        if (data.holders) setHolders(data.holders);
        if (data.timestamp) setSnapshotDate(new Date(data.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
      })
      .catch(() => {});
  }, []);

  const winners = useMemo(
    () => holders.filter(h => h.isWinner).sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || b.percentage - a.percentage),
    [holders]
  );
  const jeeters = useMemo(
    () => holders.filter(h => !h.isWinner && (h.hasSold || h.tier === 'jeeter')).sort((a, b) => b.percentage - a.percentage),
    [holders]
  );

  const allAddresses = useMemo(() => holders.map(h => h.address), [holders]);
  const { cronosIds } = useCronosIds(allAddresses);

  const displayName = (address: string) =>
    NAME_MAP[address.toLowerCase()] || cronosIds[address.toLowerCase()] || null;

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Sunset hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm mb-6">
            <span>💾</span>
            <span>Snapshot: {snapshotDate || 'April 29, 2026'} · Final</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            <span className="diamond-text">Diamond Hands</span><br />
            <span className="text-white">Hall of Legends</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed">
            The experiment is over. These wallets held{' '}
            <span className="text-gold-400 font-bold">$HODL</span> to the very end — through every dip,
            every doubt, every jeeter. The chain doesn&apos;t forget.
          </p>

          <div className="glass-card rounded-2xl p-6 border border-gold-400/20 bg-gradient-to-br from-gold-400/5 to-transparent max-w-2xl mx-auto mb-8">
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              This page is frozen at the final snapshot. No more airdrops, no more live updates —
              just a permanent record of who had{' '}
              <span className="text-gold-400 font-semibold">true diamond hands</span>.
              If there are opportunities in the future, these wallets will be remembered first.
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="glass-card rounded-xl px-6 py-4 border border-sky-400/20 bg-sky-400/5 text-center">
              <div className="text-3xl font-black text-sky-300">{winners.length}</div>
              <div className="text-gray-400 text-sm mt-1">Legends — held to the end</div>
            </div>
            <div className="glass-card rounded-xl px-6 py-4 border border-gold-400/20 bg-gold-400/5 text-center">
              <div className="text-3xl font-black text-gold-400">{winners.filter(h => h.tier === 'diamond').length}</div>
              <div className="text-gray-400 text-sm mt-1">Diamond tier</div>
            </div>
            <div className="glass-card rounded-xl px-6 py-4 border border-red-500/20 bg-red-500/5 text-center">
              <div className="text-3xl font-black text-red-400">{jeeters.length}</div>
              <div className="text-gray-400 text-sm mt-1">Jeeters — sold</div>
            </div>
          </div>
        </div>

        {/* Winners list */}
        <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <span className="diamond-text">The Legends</span>
          <span className="text-gray-500 text-base font-normal ml-1">({winners.length} wallets)</span>
        </h2>

        <div className="space-y-2 mb-12">
          {winners.map((h, i) => {
            const name = displayName(h.address);
            const isOg = PRESALE_ADDRESSES.has(h.address.toLowerCase());
            const balanceNum = parseFloat(h.balance);
            const isExpanded = expandedRow === h.address;
            const pastEarnings = getPastEarnings(h.address);
            return (
              <div
                key={h.address}
                className={`glass-card rounded-xl overflow-hidden border ${TIER_BORDER[h.tier]} transition-all`}
              >
                <div className={`h-0.5 ${
                  h.tier === 'diamond' ? 'bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300' :
                  h.tier === 'gold'    ? 'bg-gradient-to-r from-gold-400 to-yellow-500' :
                                        'bg-gradient-to-r from-gray-400 to-gray-500'
                }`} />
                <div
                  className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5' : ''}`}
                  onClick={() => setExpandedRow(isExpanded ? null : h.address)}
                >
                  {/* Rank */}
                  <div className="text-gray-500 font-mono text-sm w-6 flex-shrink-0 text-right">{i + 1}</div>

                  {/* Winner crown or tier icon */}
                  <div className="text-xl flex-shrink-0">
                    {h.tier === 'diamond' ? '💎' : h.tier === 'gold' ? '🏆' : '🥈'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Tier badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        h.tier === 'diamond' ? 'tier-diamond' :
                        h.tier === 'gold'    ? 'tier-gold' :
                                              'tier-silver'
                      }`}>
                        {h.tier}
                      </span>

                      {/* LEGEND badge */}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        LEGEND
                      </span>

                      {isOg && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-400/15 text-gold-400 border border-gold-400/30">OG</span>
                      )}

                      {name ? (
                        <span className="font-bold text-white text-sm">{name}</span>
                      ) : null}
                      <a
                        href={`https://cronoscan.com/address/${h.address}#tokentxns`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-gray-500 hover:text-gold-400 transition-colors"
                      >
                        {h.address.slice(0, 6)}…{h.address.slice(-4)}
                      </a>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-gray-500">
                      <span>
                        <span className={`font-bold ${TIER_COLORS[h.tier]}`}>{h.percentage}%</span>
                        {' '}of supply
                      </span>
                      <span>
                        <span className="text-gray-300 font-medium">
                          {balanceNum >= 1e6 ? `${(balanceNum / 1e6).toFixed(1)}M` : balanceNum >= 1e3 ? `${(balanceNum / 1e3).toFixed(0)}K` : Math.round(balanceNum).toLocaleString()}
                        </span>
                        {' '}$HODL
                      </span>
                      <span>Held <span className="text-gold-400 font-medium">{h.holdingDays} days</span></span>
                      {h.boostPercentage > 0 && (
                        <span className="text-emerald-400 font-medium">+{h.boostPercentage}% boost</span>
                      )}
                    </div>
                  </div>

                  {/* Big % on the right */}
                  <div className={`hidden sm:block text-right flex-shrink-0 font-black text-lg ${TIER_COLORS[h.tier]}`}>
                    {h.percentage}%
                  </div>
                </div>

                {/* Past earnings panel */}
                {isExpanded && pastEarnings.length > 0 && (
                  <div className="px-4 pb-3 pt-1 border-t border-white/10 bg-black/20">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Airdrops received</div>
                    <div className="flex flex-col gap-1.5">
                      {pastEarnings.map(e => (
                        <div key={e.date} className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="text-gray-600 font-mono w-24 flex-shrink-0">
                            {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {e.bone && e.bone > 0 && (
                            <span className="bg-orange-500/10 border border-orange-500/30 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                              {e.bone.toFixed(4)} $BONE
                            </span>
                          )}
                          {e.hodl > 0 && (
                            <span className="bg-gold-400/10 border border-gold-400/30 text-gold-400 px-2 py-0.5 rounded-full font-bold">
                              {e.hodl.toLocaleString()} $HODL
                            </span>
                          )}
                          {e.clg > 0 && (
                            <span className="bg-sky-400/10 border border-sky-400/30 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                              {e.clg.toFixed(5)} $CLG
                            </span>
                          )}
                          {e.dusd && e.dusd > 0 && (
                            <span className="bg-purple-400/10 border border-purple-400/30 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                              {e.dusd.toLocaleString()} $DUSDCro
                            </span>
                          )}
                          {e.obs > 0 && (
                            <span className="bg-white/5 border border-white/20 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                              {e.obs.toLocaleString()} $OBS
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isExpanded && pastEarnings.length === 0 && (
                  <div className="px-4 pb-3 pt-1 border-t border-white/10 bg-black/20">
                    <div className="text-[11px] text-gray-600">No airdrop history recorded.</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Jeeters — collapsed by default */}
        <div className="border-t border-white/10 pt-8">
          <button
            onClick={() => setShowJeeters(v => !v)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-4 text-sm font-medium"
          >
            <span className={`transition-transform ${showJeeters ? 'rotate-90' : ''}`}>▶</span>
            {showJeeters ? 'Hide' : 'Show'} jeeters ({jeeters.length} wallets that sold)
          </button>

          {showJeeters && (
            <div className="space-y-1.5">
              {jeeters.map((h, i) => {
                const name = displayName(h.address);
                const balanceNum = parseFloat(h.balance);
                const received = parseFloat(h.totalReceived || '0');
                const soldAmt = Math.max(0, received - balanceNum);
                const soldPct = received > 0 ? Math.min(100, (soldAmt / received) * 100) : 100;
                return (
                  <div key={h.address} className="glass-card rounded-lg overflow-hidden border border-red-500/15">
                    <div className="h-0.5 bg-gradient-to-r from-red-700 to-red-900" />
                    <div className="px-4 py-2.5 flex items-center gap-3">
                      <div className="text-gray-600 font-mono text-xs w-5 flex-shrink-0 text-right">{i + 1}</div>
                      <div className="text-lg flex-shrink-0">😭</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tier-jeeter">jeeter</span>
                          {name && <span className="font-bold text-gray-400 text-xs">{name}</span>}
                          <a
                            href={`https://cronoscan.com/address/${h.address}#tokentxns`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[10px] text-gray-600 hover:text-red-400 transition-colors"
                          >
                            {h.address.slice(0, 6)}…{h.address.slice(-4)}
                          </a>
                          {h.lastSellTime && (
                            <span className="text-[10px] text-gray-600 ml-auto">
                              sold {new Date(h.lastSellTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        {received > 0 && (
                          <div className="mt-1.5">
                            <div className="h-1 rounded-full overflow-hidden bg-black/40">
                              <div className="h-full flex">
                                <div className="bg-green-700/50" style={{ width: `${100 - soldPct}%` }} />
                                <div className="bg-red-700/60" style={{ width: `${soldPct}%` }} />
                              </div>
                            </div>
                            <div className="text-[10px] text-gray-600 mt-0.5">
                              Sold <span className="text-red-500">{soldPct.toFixed(0)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-gray-600 text-xs">
          <p>Snapshot block {' '}
            <span className="font-mono text-gray-500">68,217,653</span>
            {' '}· April 29, 2026 · Cronos chain
          </p>
          <p className="mt-1">This page is a permanent record. Data will not change.</p>
        </div>
      </div>
    </div>
  );
}

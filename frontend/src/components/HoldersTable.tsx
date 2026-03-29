'use client';

import { useState, useEffect } from 'react';
import { Holder, getTierLabel, getTierShare } from '@/lib/types';

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 4)}..${addr.slice(-4)}`;
}

function TierBadge({ tier }: { tier: Holder['tier'] }) {
  const styles: Record<string, string> = {
    diamond: 'tier-diamond',
    gold: 'tier-gold',
    silver: 'tier-silver',
    bronze: 'tier-bronze',
    jeeter: 'tier-jeeter',
  };
  return (
    <span className={`${styles[tier]} px-3 py-1.5 rounded-full text-xs font-bold text-white whitespace-nowrap inline-block`}>
      {getTierLabel(tier)}
    </span>
  );
}

function TierBadgeSmall({ tier }: { tier: Holder['tier'] }) {
  const styles: Record<string, string> = {
    diamond: 'tier-diamond',
    gold: 'tier-gold',
    silver: 'tier-silver',
    bronze: 'tier-bronze',
    jeeter: 'tier-jeeter',
  };
  return (
    <span className={`${styles[tier]} px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white whitespace-nowrap`}>
      {getTierLabel(tier)}
    </span>
  );
}

function BoostTimeline({ holdingDays }: { holdingDays: number }) {
  const milestones = [10, 20, 30, 40, 50];
  return (
    <div className="flex items-center gap-1">
      {milestones.map((day) => {
        const reached = holdingDays >= day;
        const boost = (day / 10) * 3;
        return (
          <div key={day} className="flex items-center">
            <div
              className={`relative group cursor-default ${
                reached ? 'text-gold-400' : 'text-gray-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                    reached
                      ? 'border-gold-400 bg-gold-400/20 text-gold-400'
                      : 'border-gray-700 bg-gray-800 text-gray-400'
                  }`}
                >
                  {day}d
                </div>
                <div className={`text-[8px] mt-0.5 font-bold ${reached ? 'text-green-400' : 'text-gray-400'}`}>+{boost}%</div>
              </div>
            </div>
            {day < 50 && (
              <div className={`w-3 h-0.5 mb-3 ${holdingDays >= day + 10 ? 'bg-gold-400' : 'bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HoldersTable({ holders, ogAddresses = [], nameMap = {}, treasuryCro = 0, treasuryHodl = 0, treasuryClg = 0, lastUpdated = null }: { holders: Holder[]; ogAddresses?: string[]; nameMap?: Record<string, string>; treasuryCro?: number; treasuryHodl?: number; treasuryClg?: number; lastUpdated?: string | null }) {
  const ogSet = new Set(ogAddresses.map(a => a.toLowerCase()));
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [croUsd, setCroUsd] = useState(0);
  const [hodlUsd, setHodlUsd] = useState(0);
  const [clgUsd, setClgUsd] = useState(0);

  // Calculate airdrop per person from live treasury data (not backend airdropAmount)
  const totalTreasuryUsd = (treasuryCro * croUsd) + (treasuryHodl * hodlUsd) + (treasuryClg * clgUsd);
  const airdropPoolUsd = totalTreasuryUsd * 0.2; // 20% distributed
  const getAirdropPerPerson = (tier: string): number => {
    const tierPct = tier === 'diamond' ? 0.55 : tier === 'gold' ? 0.30 : tier === 'silver' ? 0.15 : 0;
    if (tierPct === 0) return 0;
    const eligibleInTier = holders.filter(h => h.tier === tier && h.eligible).length;
    if (eligibleInTier === 0) return 0;
    return (airdropPoolUsd * tierPct) / eligibleInTier;
  };

  useEffect(() => {
    fetch('https://api.dexscreener.com/latest/dex/pairs/cronos/0xe61db569e231b3f5530168aa2c9d50246525b6d6')
      .then(res => res.json())
      .then(data => { if (data.pair?.priceUsd) setCroUsd(parseFloat(data.pair.priceUsd)); })
      .catch(() => {});
    fetch('https://api.dexscreener.com/latest/dex/pairs/cronos/0xb4c50913f70b870f68e6143126163ba0e9186ad7')
      .then(res => res.json())
      .then(data => { if (data.pair?.priceUsd) setHodlUsd(parseFloat(data.pair.priceUsd)); })
      .catch(() => {});
    fetch('https://api.dexscreener.com/latest/dex/pairs/cronos/0xa40764b6878e6eb86fac5de4f1f1a80aa6fc67fe')
      .then(res => res.json())
      .then(data => { if (data.pairs?.[0]?.priceUsd) setClgUsd(parseFloat(data.pairs[0].priceUsd)); })
      .catch(() => {});
  }, []);

  return (
    <section id="holders" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="diamond-text">Live Holders Board</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Every wallet. Every position. Transparent. The chain doesn&apos;t lie.
          </p>
          {lastUpdated && (
            <p className="text-gray-400 text-sm mt-3">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          )}
        </div>

        <div className="glass-card rounded-xl p-5 mb-6 border-2 border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <h4 className="text-red-400 font-bold text-lg mb-1">Page Under Development</h4>
              <p className="text-gray-400 text-sm">
                This page is being updated and currently may show incorrect values. Join{' '}
                <a href="https://discord.com/invite/cronoslegends" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 font-bold underline">Cronos Legends Discord</a>
                {' '}to stay up-to-date and ask any questions.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[2rem_10rem_7.5rem_4rem_3rem_5rem_3.5rem_5.5rem_12rem] gap-4 p-4 bg-black/40 border-b border-gold-400/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div>#</div>
            <div>Wallet</div>
            <div>Tier</div>
            <div className="text-right">Holdings</div>
            <div className="text-right">Days Held</div>
            <div className="text-right">Next Airdrop</div>
            <div className="text-right">Boost</div>
            <div className="text-right">If You HODL</div>
            <div className="text-center">Boost Progress</div>
          </div>
          {/* Mobile header */}
          <div className="md:hidden grid grid-cols-[1.5rem_1fr_auto_2.5rem] gap-2 p-3 bg-black/40 border-b border-gold-400/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <div>#</div>
            <div>Wallet</div>
            <div>Tier</div>
            <div className="text-right">%</div>
          </div>

          {/* Table rows */}
          {holders.map((holder, i) => {
            const isOg = ogSet.has(holder.address.toLowerCase());
            const name = nameMap[holder.address.toLowerCase()];
            const isExpanded = expandedRow === i;
            return (
              <div key={holder.address}>
                {/* Desktop row */}
                <div
                  className={`hidden md:grid grid-cols-[2rem_10rem_7.5rem_4rem_3rem_5rem_3.5rem_5.5rem_12rem] gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors ${
                    holder.hasSold ? 'opacity-40 line-through' : ''
                  } ${!holder.eligible && !holder.hasSold ? 'opacity-60' : ''}`}
                >
                  <div className="text-gray-500 font-mono text-sm">{i + 1}</div>
                  <div className="flex items-center gap-2 min-w-0">
                    {name
                      ? <span className="text-sm font-medium text-white truncate" title={holder.address}>{name}</span>
                      : <span className="font-mono text-sm text-gray-400">{truncateAddress(holder.address)}</span>
                    }
                    <button
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(holder.address); }}
                      className="p-0.5 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-gold-400 flex-shrink-0"
                      title="Copy address"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>
                    {isOg && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-400/15 text-gold-400 border border-gold-400/30 flex-shrink-0">OG</span>}
                    {holder.hasSold && <span className="text-xs text-red-400 font-bold flex-shrink-0">SOLD</span>}
                  </div>
                  <div><TierBadge tier={holder.tier} /></div>
                  <div className="text-right"><div className="text-sm font-bold text-white">{holder.percentage}%</div></div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${holder.holdingDays >= 10 ? 'text-gold-400' : 'text-gray-500'}`}>
                      {holder.holdingDays}d {holder.holdingDays >= 10 ? '✓' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    {holder.eligible && holder.airdropAmount > 0 ? (() => {
                      const usdPerCycle = getAirdropPerPerson(holder.tier);
                      if (usdPerCycle > 0) {
                        return <div className="text-sm font-bold text-gold-400">{usdPerCycle >= 1000 ? `$${(usdPerCycle/1000).toFixed(1)}K` : `$${usdPerCycle.toFixed(2)}`}</div>;
                      }
                      return <div className="text-sm font-bold text-gold-400">{holder.airdropAmount.toFixed(1)} CRO</div>;
                    })() : <div className="text-sm font-bold text-gold-400">-</div>}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${holder.boostPercentage > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {holder.boostPercentage > 0 ? `+${holder.boostPercentage}%` : '0%'}
                    </div>
                  </div>
                  <div className="text-right">
                    {holder.eligible && holder.airdropAmount > 0 ? (() => {
                      const usdPerCycle = getAirdropPerPerson(holder.tier);
                      if (usdPerCycle > 0) {
                        let total = 0;
                        for (let cycle = 0; cycle < 6; cycle++) total += usdPerCycle * (1 + Math.min(cycle, 5) * 0.03);
                        return <div className="text-sm font-bold text-green-400">{total >= 1000 ? `$${(total/1000).toFixed(1)}K` : `$${total.toFixed(2)}`}</div>;
                      }
                      let totalCro = 0;
                      for (let cycle = 0; cycle < 6; cycle++) totalCro += holder.airdropAmount * (1 + Math.min(cycle, 5) * 0.03);
                      return <div className="text-sm font-bold text-green-400">{totalCro.toFixed(1)} CRO</div>;
                    })() : <div className="text-sm font-bold text-green-400">-</div>}
                  </div>
                  <div className="flex justify-center">
                    <BoostTimeline holdingDays={holder.holdingDays} />
                  </div>
                </div>

                {/* Mobile row - tap to expand */}
                <div
                  className={`md:hidden grid grid-cols-[1.5rem_1fr_auto_2.5rem] gap-2 py-2.5 px-3 items-center border-b border-white/5 active:bg-white/10 cursor-pointer ${
                    holder.hasSold ? 'opacity-40' : ''
                  }`}
                  onClick={() => setExpandedRow(isExpanded ? null : i)}
                >
                  <div className="text-gray-400 font-mono text-[10px]">{i + 1}</div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    {name ? <span className="text-[11px] font-medium text-white truncate">{name}</span> : <span className="font-mono text-[11px] text-gray-300">{truncateAddress(holder.address)}</span>}
                    {isOg && <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-gold-400/15 text-gold-400 border border-gold-400/30">OG</span>}
                    {holder.hasSold && <span className="text-[8px] text-red-400 font-bold">SOLD</span>}
                  </div>
                  <div><TierBadgeSmall tier={holder.tier} /></div>
                  <div className="text-right text-[11px] font-bold text-white">{holder.percentage}%</div>
                </div>

                {/* Mobile expanded */}
                {isExpanded && (
                  <div className="md:hidden px-3 py-2 bg-white/5 border-b border-white/5">
                    <div className="grid grid-cols-4 gap-2 text-[10px] mb-2">
                      <div>
                        <div className="text-gray-500 uppercase mb-0.5">Days</div>
                        <div className={holder.holdingDays >= 10 ? 'text-gold-400 font-bold' : 'text-gray-400'}>{holder.holdingDays}d</div>
                      </div>
                      <div>
                        <div className="text-gray-500 uppercase mb-0.5">Airdrop</div>
                        <div className="font-bold text-gold-400">{holder.eligible && holder.airdropAmount > 0 ? (() => {
                          const usd = getAirdropPerPerson(holder.tier);
                          return usd > 0 ? `$${usd.toFixed(2)}` : `${holder.airdropAmount.toFixed(1)} CRO`;
                        })() : '-'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 uppercase mb-0.5">Boost</div>
                        <div className={holder.boostPercentage > 0 ? 'text-green-400 font-bold' : 'text-gray-400'}>{holder.boostPercentage > 0 ? `+${holder.boostPercentage}%` : '0%'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 uppercase mb-0.5">60d Total</div>
                        <div className="font-bold text-green-400">{holder.eligible && holder.airdropAmount > 0 ? (() => {
                          const pp = getAirdropPerPerson(holder.tier);
                          if (pp > 0) { let t = 0; for (let c = 0; c < 6; c++) t += pp * (1 + Math.min(c, 5) * 0.03); return `$${t.toFixed(2)}`; }
                          let totalCro = 0; for (let c = 0; c < 6; c++) totalCro += holder.airdropAmount * (1 + Math.min(c, 5) * 0.03);
                          return `${totalCro.toFixed(1)} CRO`;
                        })() : '-'}</div>
                      </div>
                    </div>
                    <div className="flex justify-center py-1">
                      <BoostTimeline holdingDays={holder.holdingDays} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 md:gap-6 justify-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full tier-diamond" /> Diamond (1.8%+)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full tier-gold" /> Gold (1%+)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full tier-silver" /> Silver (0.5%+)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full tier-bronze" /> Bronze (&lt;0.5%)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full tier-jeeter" /> Jeeter (Sold/Transferred)
          </div>
        </div>
<div className="mt-4 glass-card rounded-xl p-4 border border-gold-400/10">          <p className="text-xs text-gray-500 text-center">            Airdrop amounts are <span className="text-gold-400 font-bold">estimates</span> based on current tax treasury balance (20% distributed per cycle). Actual amounts may vary. Pool split: Diamond 55% / Gold 30% / Silver 15%.          </p>        </div>
      </div>
    </section>
  );
}
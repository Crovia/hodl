'use client';

import { useState, useEffect } from 'react';
import { Holder, getTierLabel } from '@/lib/types';
import { PAST_AIRDROPS } from '@/lib/mockData';

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

type WalletBalance = { id: string; croBalance: string; tokenBalance: string; clgBalance: string };

export default function HoldersTable({ holders, ogAddresses = [], nameMap = {}, wallets = [], lastUpdated = null }: { holders: Holder[]; ogAddresses?: string[]; nameMap?: Record<string, string>; wallets?: WalletBalance[]; lastUpdated?: string | null }) {
  const ogSet = new Set(ogAddresses.map(a => a.toLowerCase()));
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [croUsd, setCroUsd] = useState(0);
  const [hodlUsd, setHodlUsd] = useState(0);
  const [clgUsd, setClgUsd] = useState(0);

  // Compute total USD value for each named wallet
  const walletUsd = (id: string) => {
    const w = wallets.find(x => x.id === id);
    if (!w) return 0;
    return parseFloat(w.croBalance || '0') * croUsd
      + parseFloat(w.tokenBalance || '0') * hodlUsd
      + parseFloat(w.clgBalance || '0') * clgUsd;
  };

  // Per-person airdrop per wallet source: 8% of that wallet's total USD, split by tier
  const getAirdropPerPerson = (tier: string): { dhand: number; clg: number; rotating: number; totalUsd: number } => {
    const tierPct = tier === 'diamond' ? 0.55 : tier === 'gold' ? 0.30 : tier === 'silver' ? 0.15 : 0;
    if (tierPct === 0) return { dhand: 0, clg: 0, rotating: 0, totalUsd: 0 };
    const eligible = holders.filter(h => h.tier === tier && h.eligible).length;
    if (eligible === 0) return { dhand: 0, clg: 0, rotating: 0, totalUsd: 0 };
    const dhand = (walletUsd('DHAND') * 0.08 * tierPct) / eligible;
    const clg = (walletUsd('CLG') * 0.08 * tierPct) / eligible;
    const rotating = (walletUsd('ROTATING') * 0.08 * tierPct) / eligible;
    // Fallback: if no wallet data, use sum of all wallet balances via token totals
    const totalUsd = dhand + clg + rotating;
    return { dhand, clg, rotating, totalUsd };
  };

  const getPastEarnings = (address: string) => {
    const addr = address.toLowerCase();
    const results: { date: string; hodl: number; clg: number; obs: number; dusd?: number; usd: number }[] = [];
    for (const drop of PAST_AIRDROPS) {
      const r = drop.recipients[addr];
      if (r) results.push({ date: drop.date, ...r });
    }
    return results;
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

        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[2rem_10rem_7.5rem_4rem_3rem_5rem_3.5rem_12rem] gap-4 p-4 bg-black/40 border-b border-gold-400/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div>#</div>
            <div>Wallet</div>
            <div>Tier</div>
            <div className="text-right">Holdings</div>
            <div className="text-right">Days Held</div>
            <div className="text-right">Next Airdrop</div>
            <div className="text-right">Boost</div>
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
                  className={`hidden md:grid grid-cols-[2rem_10rem_7.5rem_4rem_3rem_5rem_3.5rem_12rem] gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                    holder.hasSold ? 'opacity-40 line-through' : ''
                  } ${!holder.eligible && !holder.hasSold ? 'opacity-60' : ''} ${isExpanded ? 'bg-white/5 border-gold-400/20' : ''}`}
                  onClick={() => setExpandedRow(isExpanded ? null : i)}
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
                    {holder.eligible ? (() => {
                      const { totalUsd } = getAirdropPerPerson(holder.tier);
                      return totalUsd > 0
                        ? <div className="text-sm font-bold text-gold-400">${totalUsd.toFixed(2)}</div>
                        : <div className="text-sm font-bold text-gray-500">-</div>;
                    })() : <div className="text-sm font-bold text-gray-500">-</div>}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${holder.boostPercentage > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {holder.boostPercentage > 0 ? `+${holder.boostPercentage}%` : '0%'}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <BoostTimeline holdingDays={holder.holdingDays} />
                  </div>
                </div>

                {/* Desktop expanded panel */}
                {isExpanded && (() => {
                  const { dhand, clg: clgAmt, rotating, totalUsd } = getAirdropPerPerson(holder.tier);
                  const tierPct = holder.tier === 'diamond' ? 55 : holder.tier === 'gold' ? 30 : holder.tier === 'silver' ? 15 : 0;
                  const eligibleInTier = holders.filter(h => h.tier === holder.tier && h.eligible).length;
                  const pastEarnings = getPastEarnings(holder.address);
                  const totalEarned = pastEarnings.reduce((s, e) => s + e.usd, 0);
                  return (
                    <div className="hidden md:block border-b border-gold-400/20 bg-gold-400/5 px-6 py-4">
                      {/* Past earnings bar */}
                      {pastEarnings.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-white/10">
                          <div className="text-xs text-gray-500 uppercase font-bold mb-2">Total Earned from Past Airdrops</div>
                          <div className="flex items-center gap-6 flex-wrap">
                            <div>
                              <div className="text-2xl font-black text-green-400">${totalEarned.toFixed(2)}</div>
                              <div className="text-[10px] text-gray-500">{pastEarnings.length} airdrop{pastEarnings.length > 1 ? 's' : ''} received</div>
                            </div>
                            {pastEarnings.map((e) => (
                              <div key={e.date} className="flex gap-3 flex-wrap">
                                {e.hodl > 0 && (
                                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5">
                                    <span className="text-[10px] text-gray-400">{e.hodl.toLocaleString()} $HODL</span>
                                  </div>
                                )}
                                {e.clg > 0 && (
                                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5">
                                    <span className="text-[10px] text-gray-400">{e.clg.toFixed(5)} $CLG</span>
                                  </div>
                                )}
                                {e.obs > 0 && (
                                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5">
                                    <span className="text-[10px] text-gray-400">{e.obs.toLocaleString()} $OBS</span>
                                  </div>
                                )}
                                {e.dusd !== undefined && e.dusd > 0 && (
                                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5">
                                    <span className="text-[10px] text-gray-400">{e.dusd.toLocaleString()} $DUSDCro</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-8">
                        {/* Airdrop summary */}
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 uppercase font-bold mb-3">Airdrop Breakdown</div>
                          <div className="flex gap-6 flex-wrap">
                            <div>
                              <div className="text-[10px] text-gray-500 mb-0.5">Next airdrop (total)</div>
                              <div className="text-xl font-black text-gold-400">{totalUsd > 0 ? `$${totalUsd.toFixed(2)}` : '-'}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 mb-0.5">Current boost</div>
                              <div className={`text-xl font-black ${holder.boostPercentage > 0 ? 'text-green-400' : 'text-gray-400'}`}>{holder.boostPercentage > 0 ? `+${holder.boostPercentage}%` : 'None yet'}</div>
                              <div className="text-[10px] text-gray-500">Hold 10d+ to unlock</div>
                            </div>
                            {tierPct > 0 && (
                              <div>
                                <div className="text-[10px] text-gray-500 mb-0.5">Tier pool share</div>
                                <div className="text-xl font-black text-white">{tierPct}%</div>
                                <div className="text-[10px] text-gray-500">Split {eligibleInTier > 0 ? `÷ ${eligibleInTier} ${holder.tier} holders` : 'evenly'}</div>
                              </div>
                            )}
                          </div>
                          {/* Per-wallet source breakdown */}
                          {totalUsd > 0 && (
                            <div className="mt-4 border-t border-white/10 pt-3">
                              <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Per-wallet sources (8% of each wallet&apos;s total value)</div>
                              <div className="flex gap-4 flex-wrap">
                                {dhand > 0 && (
                                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5">
                                    <span className="text-[10px] text-gray-400">$HODL airdrop</span>
                                    <span className="text-xs font-bold text-gold-400">${dhand.toFixed(2)}</span>
                                  </div>
                                )}
                                {clgAmt > 0 && (
                                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5">
                                    <span className="text-[10px] text-gray-400">$CLG airdrop</span>
                                    <span className="text-xs font-bold text-gold-400">${clgAmt.toFixed(2)}</span>
                                  </div>
                                )}
                                {rotating > 0 && (
                                  <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5">
                                    <span className="text-[10px] text-gray-400">Voted airdrop</span>
                                    <span className="text-xs font-bold text-gold-400">${rotating.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {!holder.eligible && (
                        <div className="mt-3 text-xs text-red-400 font-medium">
                          {holder.hasSold ? '⚠ Disqualified — this wallet sold $HODL tokens.' : '⚠ Not eligible for airdrops (insufficient tier or excluded address).'}
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                {isExpanded && (() => {
                  const { dhand, clg: clgAmt, rotating, totalUsd } = getAirdropPerPerson(holder.tier);
                  const pastEarningsMobile = getPastEarnings(holder.address);
                  const totalEarnedMobile = pastEarningsMobile.reduce((s, e) => s + e.usd, 0);
                  return (
                    <div className="md:hidden px-3 py-3 bg-gold-400/5 border-b border-gold-400/20">
                      {/* Past earnings */}
                      {pastEarningsMobile.length > 0 && (
                        <div className="mb-3 pb-3 border-b border-white/10 text-center">
                          <div className="text-[9px] text-gray-500 uppercase mb-1">Total Earned from Airdrops</div>
                          <div className="text-lg font-black text-green-400">${totalEarnedMobile.toFixed(2)}</div>
                          <div className="text-[8px] text-gray-500 mt-0.5">{pastEarningsMobile.length} airdrop{pastEarningsMobile.length > 1 ? 's' : ''} received</div>
                        </div>
                      )}
                      {/* Main airdrop number */}
                      <div className="mb-3">
                        <div className="bg-black/30 rounded-lg p-2.5 text-center">
                          <div className="text-[9px] text-gray-500 uppercase mb-1">Next Airdrop</div>
                          <div className="text-base font-black text-gold-400">{holder.eligible && totalUsd > 0 ? `$${totalUsd.toFixed(2)}` : '-'}</div>
                        </div>
                      </div>
                      {/* Per-wallet breakdown */}
                      {holder.eligible && totalUsd > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {dhand > 0 && (
                            <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-1">
                              <span className="text-[9px] text-gray-400">$HODL airdrop</span>
                              <span className="text-[10px] font-bold text-gold-400">${dhand.toFixed(2)}</span>
                            </div>
                          )}
                          {clgAmt > 0 && (
                            <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-1">
                              <span className="text-[9px] text-gray-400">$CLG airdrop</span>
                              <span className="text-[10px] font-bold text-gold-400">${clgAmt.toFixed(2)}</span>
                            </div>
                          )}
                          {rotating > 0 && (
                            <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-1">
                              <span className="text-[9px] text-gray-400">Voted airdrop</span>
                              <span className="text-[10px] font-bold text-gold-400">${rotating.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {/* Secondary stats */}
                      <div className="grid grid-cols-3 gap-2 text-[10px] mb-3">
                        <div className="text-center">
                          <div className="text-gray-500 uppercase mb-0.5">Days held</div>
                          <div className={holder.holdingDays >= 10 ? 'text-gold-400 font-bold' : 'text-gray-400'}>{holder.holdingDays}d</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 uppercase mb-0.5">Boost</div>
                          <div className={holder.boostPercentage > 0 ? 'text-green-400 font-bold' : 'text-gray-400'}>{holder.boostPercentage > 0 ? `+${holder.boostPercentage}%` : 'None yet'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 uppercase mb-0.5">Tier</div>
                          <div className="font-bold text-white">{holder.tier.charAt(0).toUpperCase() + holder.tier.slice(1)}</div>
                        </div>
                      </div>
                      <div className="flex justify-center py-1">
                        <BoostTimeline holdingDays={holder.holdingDays} />
                      </div>
                      {!holder.eligible && (
                        <div className="mt-2 text-[10px] text-red-400 font-medium text-center">
                          {holder.hasSold ? '⚠ Disqualified — sold $HODL tokens.' : '⚠ Not eligible for airdrops.'}
                        </div>
                      )}
                    </div>
                  );
                })()}
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
<div className="mt-4 glass-card rounded-xl p-4 border border-gold-400/10">          <p className="text-xs text-gray-500 text-center">            Airdrop amounts are <span className="text-gold-400 font-bold">estimates</span> based on current tax treasury balance (8% distributed per cycle). Actual amounts may vary. Pool split: Diamond 55% / Gold 30% / Silver 15%.          </p>        </div>
      </div>
    </section>
  );
}
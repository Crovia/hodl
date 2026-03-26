'use client';

import { useState, useEffect, useMemo } from 'react';
import { NAME_MAP } from '@/lib/nameMap';
import { useCronosIds } from '@/hooks/useCronosIds';


interface HolderData {
  address: string;
  percentage: number;
  balance: string;
  totalReceived?: string;
  firstBuyTime?: string;
  tier: string;
  holdingDays: number;
  hasSold: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function fmtTokens(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return Math.round(n).toLocaleString();
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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      fetch('/api/holders')
        .then(res => res.json())
        .then(data => {
          if (data.holders) setHolders(data.holders);
          if (data.timestamp) setLastUpdated(data.timestamp);
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
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black mb-2">
            <span className="diamond-text">Community Strength</span>
          </h2>
          <p className="text-gray-400">
            <span className="text-white font-bold text-2xl">{totalHodlers}</span> hodlers vs{' '}
            <span className="text-red-400 font-bold text-2xl">{counts.jeeter}</span> jeeters
          </p>
          {lastUpdated && (
            <p className="text-gray-600 text-sm mt-2">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          )}
        </div>

        {/* Holders vs Jeeters panels first */}
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
                      <div className="text-xs text-gray-500">
                        {h.firstBuyTime ? `Bought ${timeAgo(h.firstBuyTime)}` : `${h.holdingDays}d holding`}
                        {h.totalReceived && parseFloat(h.totalReceived) > 0 && (
                          <span className="text-gold-400"> &middot; {fmtTokens(parseFloat(h.totalReceived))} tokens</span>
                        )}
                        <span> &middot; {h.percentage}%</span>
                      </div>
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
                    <div className="text-xs text-gray-600">
                      {h.firstBuyTime ? `Bought ${timeAgo(h.firstBuyTime)}` : `Held ${h.holdingDays}d`}
                      {h.totalReceived && parseFloat(h.totalReceived) > 0 && (() => {
                        const received = parseFloat(h.totalReceived!);
                        const remaining = parseFloat(h.balance || '0');
                        const sold = received - remaining;
                        return (
                          <>
                            <span className="text-gray-500"> &middot; Bought {fmtTokens(received)}</span>
                            <span className="text-red-400"> &middot; Sold {fmtTokens(sold > 0 ? sold : 0)}</span>
                            {remaining > 0 && <span className="text-green-400"> &middot; Left {fmtTokens(remaining)}</span>}
                          </>
                        );
                      })()}
                      {!h.totalReceived && h.balance && parseFloat(h.balance) > 0 && (
                        <span className="text-gray-500"> &middot; Holds {fmtTokens(parseFloat(h.balance))}</span>
                      )}
                    </div>
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

        {/* Tier counts + ratio bar */}
        <div className="mt-10">
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
          <div className="max-w-lg mx-auto mt-4">
            <div className="h-4 rounded-full overflow-hidden bg-black/40 border border-white/10 flex">
              {totalHodlers > 0 && (
                <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-1000" style={{ width: `${(totalHodlers / (totalHodlers + counts.jeeter)) * 100}%` }} />
              )}
              {counts.jeeter > 0 && (
                <div className="h-full bg-gradient-to-r from-red-500 to-red-700 transition-all duration-1000" style={{ width: `${(counts.jeeter / (totalHodlers + counts.jeeter)) * 100}%` }} />
              )}
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gold-400 font-bold">Hodlers {Math.round((totalHodlers / (totalHodlers + counts.jeeter)) * 100)}%</span>
              <span className="text-red-400 font-bold">Jeeters {Math.round((counts.jeeter / (totalHodlers + counts.jeeter)) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
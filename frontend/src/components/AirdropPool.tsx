'use client';

import { useState, useEffect } from 'react';
import { PoolInfo, AirdropSnapshot } from '@/lib/types';

interface WalletData {
  id: string;
  token: string;
  address: string;
  allocation: number;
  croBalance: string;
  tokenBalance: string;
  clgBalance?: string;
}

interface WalletsResponse {
  timestamp?: string;
  wallets: WalletData[];
  totals: {
    totalCro: string;
    totalToken: string;
    airdropCro: string;
    airdropToken: string;
    distributionPct: number;
  };
}

function truncateAddress(addr: string): string {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatCro(value: number): string {
  if (value >= 1000) return Math.round(value).toLocaleString();
  if (value >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function AirdropPool({
  pool,
  snapshots,
}: {
  pool: PoolInfo;
  snapshots: AirdropSnapshot[];
}) {
  const [walletData, setWalletData] = useState<WalletsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [croUsd, setCroUsd] = useState(0);
  const [hodlUsd, setHodlUsd] = useState(0);
  const [clgUsd, setClgUsd] = useState(0);
  const [holderStats, setHolderStats] = useState<{ diamond: number; gold: number; silver: number } | null>(null);

  useEffect(() => {
    const loadWallets = () => {
      fetch('/api/wallets')
        .then(res => res.json())
        .then(d => { setWalletData(d); setLoading(false); })
        .catch(() => setLoading(false));
    };
    const loadHolders = () => {
      fetch('/api/holders')
        .then(res => res.json())
        .then(data => {
          if (!data.holders) return;
          const EXCLUDED = new Set([
            '0xb4c50913f70b870f68e6143126163ba0e9186ad7',
            '0x185d93b0f57a22e6cab7d9f0d4eb657341ff90b3',
          ]);
          const eligible = data.holders.filter((h: any) =>
            !h.hasSold && h.tier !== 'jeeter' && h.tier !== 'bronze' && !EXCLUDED.has(h.address?.toLowerCase())
          );
          setHolderStats({
            diamond: eligible.filter((h: any) => h.tier === 'diamond').length,
            gold: eligible.filter((h: any) => h.tier === 'gold').length,
            silver: eligible.filter((h: any) => h.tier === 'silver').length,
          });
        })
        .catch(() => {});
    };
    const loadPrices = () => {
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=crypto-com-chain&vs_currencies=usd')
        .then(res => res.json())
        .then(data => { if (data['crypto-com-chain']?.usd) setCroUsd(data['crypto-com-chain'].usd); })
        .catch(() => {});
      fetch('https://api.dexscreener.com/latest/dex/pairs/cronos/0xb4c50913f70b870f68e6143126163ba0e9186ad7')
        .then(res => res.json())
        .then(data => { if (data.pair?.priceUsd) setHodlUsd(parseFloat(data.pair.priceUsd)); })
        .catch(() => {});
      fetch('https://api.dexscreener.com/latest/dex/pairs/cronos/0xa40764b6878e6eb86fac5de4f1f1a80aa6fc67fe')
        .then(res => res.json())
        .then(data => { if (data.pairs?.[0]?.priceUsd) setClgUsd(parseFloat(data.pairs[0].priceUsd)); })
        .catch(() => {});
    };
    loadWallets();
    loadHolders();
    loadPrices();
    const walletInterval = setInterval(loadWallets, 60000);
    const holdersInterval = setInterval(loadHolders, 60000);
    const priceInterval = setInterval(loadPrices, 120000);
    return () => { clearInterval(walletInterval); clearInterval(holdersInterval); clearInterval(priceInterval); };
  }, []);

  const totalCro = Number(walletData?.totals?.totalCro || 0);
  const airdropCro = Number(walletData?.totals?.airdropCro || 0);
  const distributionPct = walletData?.totals?.distributionPct || 20;
  const wallets = walletData?.wallets || [];

  // Total $HODL across all wallets
  const totalHodl = Number(walletData?.totals?.totalToken || 0);
  const totalHodlUsd = totalHodl * hodlUsd;
  const totalClg = wallets.reduce((s, w) => s + Number(w.clgBalance || 0), 0);
  const totalClgUsd = totalClg * clgUsd;

  // Total treasury in USD = CRO + $HODL + $CLG
  const totalUsd = (totalCro * croUsd) + totalHodlUsd + totalClgUsd;
  const airdropUsd = (totalUsd * distributionPct) / 100;
  const pricesReady = croUsd > 0;

  const walletStyles: Record<string, { label: string; gradient: string; border: string; bg: string; icon: string }> = {
    DHAND: { label: '$HODL Buyback', gradient: 'from-gold-400 to-gold-600', border: 'border-gold-400/30', bg: 'bg-gold-400/5', icon: '/Dhand.png' },
    CLG: { label: '$CLG Buyback', gradient: 'from-diamond-400 to-diamond-600', border: 'border-diamond-400/30', bg: 'bg-diamond-400/5', icon: '/Ghand.png' },
    ROTATING: { label: 'Rotating Token', gradient: 'from-pink-400 to-pink-600', border: 'border-pink-400/30', bg: 'bg-pink-400/5', icon: '/Shand.png' },
  };

  return (
    <section id="airdrops" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Disclaimer */}
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

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="diamond-text">Airdrop Pool</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Every ~10 days, buybacks are executed and equal amounts airdropped to holders
            depending on their tier (Diamond, Gold, Silver). No funds are burned — you receive them back.
          </p>
          <div className="mt-4 inline-block px-4 py-2 rounded-xl bg-gold-400/5 border border-gold-400/20">
            <p className="text-sm text-gray-400">
              <span className="text-gold-400 font-bold">Next estimated airdrop:</span>{' '}
              <span className="text-white font-bold">April 3, 2026</span>
              <span className="text-gray-500 ml-1">(~10 days from launch)</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Exact timing may vary — airdrops are processed manually and there can be some delay.
            </p>
          </div>
          {walletData?.timestamp && (
            <p className="text-gray-400 text-sm mt-3">Last updated: {new Date(walletData.timestamp).toLocaleString()}</p>
          )}
        </div>

        {/* Treasury overview */}
        <div className="glass-card rounded-2xl overflow-hidden mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            <div className="p-6 text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Treasury Total</div>
              <div className="text-2xl md:text-3xl font-black diamond-text">
                {loading ? '...' : pricesReady && totalUsd > 0 ? `$${formatCro(totalUsd)}` : 'TBA'}
              </div>
              {pricesReady && totalCro > 0 && (
                <div className="text-xs text-gray-400 mt-1">{formatCro(totalCro)} CRO + {formatCro(totalHodl)} $HODL{totalClg > 0 && ` + ${formatCro(totalClg)} $CLG`}</div>
              )}
            </div>
            <div className="p-6 text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Next Airdrop ({distributionPct}%)</div>
              <div className="text-2xl md:text-3xl font-black text-gold-400">
                {loading ? '...' : pricesReady && airdropUsd > 0 ? `$${formatCro(airdropUsd)}` : 'TBA'}
              </div>
              {pricesReady && airdropUsd > 0 && (
                <div className="text-xs text-gray-400 mt-1">CRO + $HODL buybacks</div>
              )}
            </div>
            <div className="p-6 text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Next Airdrop (est.)</div>
              <div className="text-2xl md:text-3xl font-black text-white">Apr 3</div>
              <div className="text-xs text-gray-500 mt-1">May be delayed</div>
            </div>
            <div className="p-6 text-center">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">Airdrops Completed</div>
              <div className="text-2xl md:text-3xl font-black text-diamond-400">{snapshots.filter(s => s.distributed).length}</div>
              <div className="text-xs text-gray-500 mt-1">
                {snapshots.length === 0 ? 'None yet — launching soon' : `${snapshots.length} total`}
              </div>
            </div>
          </div>
        </div>

        {/* Buyback wallets — unified 3-column grid */}
        {!loading && wallets.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-2">
              <span className="diamond-text">Buyback Wallets</span>
            </h3>
            <p className="text-center text-sm text-gray-500 mb-8">
              Tax revenue is split into 3 wallets. Each buys back different tokens for airdrops.
            </p>

            {/* Buyback split bar */}
            <div className="glass-card rounded-2xl p-6 mb-6">
              <div className="flex rounded-xl overflow-hidden h-10 mb-3">
                <div className="bg-gradient-to-r from-gold-400 to-gold-500 flex items-center justify-center text-sm font-bold text-black" style={{ width: '35%' }}>
                  $HODL 35%
                </div>
                <div className="bg-gradient-to-r from-diamond-400 to-diamond-500 flex items-center justify-center text-sm font-bold text-black" style={{ width: '33%' }}>
                  $CLG 33%
                </div>
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center text-sm font-bold text-black" style={{ width: '32%' }}>
                  Rotating 32%
                </div>
              </div>
              <p className="text-center text-xs text-gray-500">
                All tax revenue goes to buybacks and airdrops. Nothing is burned or kept.
              </p>
            </div>

            {/* Wallet cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {wallets.map((wallet) => {
                const style = walletStyles[wallet.id] || walletStyles.ROTATING;
                const croBalance = Number(wallet.croBalance);
                const tokenBalance = Number(wallet.tokenBalance);
                const clgBalance = Number(wallet.clgBalance || 0);
                const isRotating = wallet.id === 'ROTATING';
                const isDhand = wallet.id === 'DHAND';

                // Total wallet value in USD (CRO + $HODL + $CLG)
                const croValueUsd = croBalance * croUsd;
                const hodlValueUsd = tokenBalance * hodlUsd;
                const clgValueUsd = clgBalance * clgUsd;
                const walletTotalUsd = croValueUsd + hodlValueUsd + clgValueUsd;
                const walletAirdropUsd = walletTotalUsd * (distributionPct / 100);

                return (
                  <div key={wallet.id} className={`glass-card rounded-2xl overflow-hidden ${style.border} hover:ring-1 hover:ring-white/10 transition-all`}>
                    <div className={`h-1 bg-gradient-to-r ${style.gradient}`} />
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center overflow-hidden`}>
                            <img src={style.icon} alt={style.label} className="w-8 h-8 object-contain" />
                          </div>
                          <div>
                            <div className={`font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
                              {style.label}
                            </div>
                            <a
                              href={`https://cronoscan.com/address/${wallet.address}#tokentxns`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[10px] text-gray-400 hover:text-white transition-colors"
                            >
                              {truncateAddress(wallet.address)}
                            </a>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${style.gradient} text-black`}>
                          {wallet.allocation}%
                        </span>
                      </div>

                      {/* Wallet total in USD */}
                      {pricesReady && walletTotalUsd > 0 && (
                        <div className="p-3 rounded-lg bg-black/40 mb-3 text-center">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Wallet Value</div>
                          <div className="text-2xl font-black text-white">${formatCro(walletTotalUsd)}</div>
                        </div>
                      )}

                      {/* Balances */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-black/40">
                          <span className="text-xs text-gray-500 uppercase">CRO</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">{formatCro(croBalance)}</div>
                            {croUsd > 0 && <div className="text-[10px] text-gray-400">${formatCro(croValueUsd)}</div>}
                          </div>
                        </div>
                        {tokenBalance > 0 && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-black/40">
                            <span className="text-xs text-gray-500 uppercase">$HODL</span>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gold-400">{formatCro(tokenBalance)}</div>
                              {hodlUsd > 0 && <div className="text-[10px] text-gray-400">${formatCro(hodlValueUsd)}</div>}
                            </div>
                          </div>
                        )}
                        {clgBalance > 0 && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-black/40">
                            <span className="text-xs text-gray-500 uppercase">$CLG</span>
                            <div className="text-right">
                              <div className="text-sm font-bold text-diamond-400">{formatCro(clgBalance)}</div>
                              {clgUsd > 0 && <div className="text-[10px] text-gray-400">${formatCro(clgValueUsd)}</div>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Airdrop amount */}
                      <div className="mt-3 p-3 rounded-lg bg-gold-400/5 border border-gold-400/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 uppercase">Next Airdrop</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gold-400">
                              {pricesReady && walletAirdropUsd > 0 ? `$${formatCro(walletAirdropUsd)}` : 'TBA'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rotating note */}
                      {isRotating && (
                        <div className="mt-3 text-center">
                          <span className="text-xs text-pink-400 font-bold">Token decided by community vote</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tier distribution */}
        <div className="glass-card rounded-2xl p-8 mb-12">
          <h3 className="text-lg font-bold text-white mb-6 text-center">Airdrop Distribution ({distributionPct}% of Treasury)</h3>
          <div className="flex rounded-xl overflow-hidden h-12 mb-6">
            <div className="tier-diamond flex items-center justify-center text-sm font-bold text-white" style={{ width: '55%' }}>
              Diamond 55%
            </div>
            <div className="tier-gold flex items-center justify-center text-sm font-bold text-black" style={{ width: '30%' }}>
              Gold 30%
            </div>
            <div className="tier-silver flex items-center justify-center text-sm font-bold text-white" style={{ width: '15%' }}>
              Silver 15%
            </div>
          </div>

          {/* Per-tier stats */}
          {(() => {
            // Total airdrop USD = sum of 20% of each wallet's total USD value
            const totalAirdropUsd = wallets.reduce((sum, w) => {
              const wUsd = Number(w.croBalance) * croUsd
                + Number(w.tokenBalance) * hodlUsd
                + Number(w.clgBalance || 0) * clgUsd;
              return sum + wUsd * (distributionPct / 100);
            }, 0);
            const hasData = pricesReady && totalAirdropUsd > 0;

            const tiers = [
              { key: 'diamond', label: 'Diamond', pct: 0.55, colorClass: 'tier-diamond', textClass: 'text-diamond-400', borderClass: 'border-diamond-400/30', bgClass: 'bg-diamond-400/5' },
              { key: 'gold',    label: 'Gold',    pct: 0.30, colorClass: 'tier-gold',    textClass: 'text-gold-400',    borderClass: 'border-gold-400/30',    bgClass: 'bg-gold-400/5'    },
              { key: 'silver',  label: 'Silver',  pct: 0.15, colorClass: 'tier-silver',  textClass: 'text-gray-300',    borderClass: 'border-gray-400/30',    bgClass: 'bg-gray-400/5'    },
            ] as const;
            return (
              <div className="grid md:grid-cols-3 gap-4">
                {tiers.map(tier => {
                  const count = holderStats?.[tier.key] ?? null;
                  const poolUsd = totalAirdropUsd * tier.pct;
                  const perPersonUsd = count && count > 0 ? poolUsd / count : null;
                  return (
                    <div key={tier.key} className={`rounded-xl p-5 border ${tier.borderClass} ${tier.bgClass}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-3 h-3 rounded-full ${tier.colorClass}`} />
                        <span className={`font-bold text-sm ${tier.textClass}`}>{tier.label}</span>
                        <span className="text-gray-500 text-xs ml-auto">{Math.round(tier.pct * 100)}% of pool</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Eligible holders</span>
                          <span className="font-bold text-white">{count !== null ? count : '...'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Pool share</span>
                          <span className="font-bold text-white">{hasData ? `$${formatCro(poolUsd)}` : '...'}</span>
                        </div>
                        <div className={`flex justify-between text-xs pt-2 border-t ${tier.borderClass}`}>
                          <span className="text-gray-400 font-medium">Per person (next)</span>
                          <div className="text-right">
                            <span className={`font-black text-sm ${tier.textClass}`}>
                              {perPersonUsd !== null ? `$${perPersonUsd.toFixed(2)}` : hasData ? '—' : '...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="text-center mt-4 text-xs text-gray-500">
            Jeeters &amp; Bronze: Not eligible for airdrops · Per-person amounts shown without boost
          </div>
        </div>

        {/* Past airdrops */}
        <h3 className="text-2xl font-bold text-center mb-6">
          <span className="diamond-text">Past Airdrops</span>
        </h3>
        {snapshots.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">&#128142;</div>
            <div className="text-xl font-bold text-gray-400 mb-2">No airdrops yet</div>
            <div className="text-sm text-gray-500">The first airdrop will happen after launch. Stay tuned.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {snapshots.map((snap) => (
              <div key={snap.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Epoch #{snap.id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    snap.distributed
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gold-400/20 text-gold-400'
                  }`}>
                    {snap.distributed ? 'Distributed' : 'Pending'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-1">Treasury at snapshot</div>
                <div className="text-xl font-bold text-gray-300 mb-2">
                  ${snap.treasuryTotal.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mb-1">Airdropped ({distributionPct}%)</div>
                <div className="text-2xl font-black text-gold-400 mb-3">
                  ${snap.airdropDistributed.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  {new Date(snap.snapshotDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-sm text-gray-400">
                  {snap.holders.length} eligible holders
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

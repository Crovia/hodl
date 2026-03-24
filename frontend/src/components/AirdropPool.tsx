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
}

interface WalletsResponse {
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
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
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

  useEffect(() => {
    fetch('/api/holders')
      .then(res => res.json())
      .then(setWalletData)
      .catch(err => console.error('Failed to fetch wallets:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalCro = Number(walletData?.totals?.totalCro || 0);
  const airdropCro = Number(walletData?.totals?.airdropCro || 0);
  const distributionPct = walletData?.totals?.distributionPct || 20;
  const wallets = walletData?.wallets || [];
  return (
    <section id="airdrops" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="diamond-text">Airdrop Pool</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Every ~10 days, buybacks are executed and equal amounts airdropped to holders
            depending on their tier (Diamond, Gold, Silver). No funds are burned — you receive them back.
          </p>
        </div>

        {/* Pool stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="glass-card rounded-2xl p-6 text-center animate-glow">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Treasury Total</div>
            <div className="text-3xl font-black diamond-text">
              {loading ? '...' : totalCro > 0 ? `${formatCro(totalCro)} CRO` : 'TBA'}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center border-gold-400/20">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Next Airdrop ({distributionPct}%)</div>
            <div className="text-3xl font-black text-gold-400">
              {loading ? '...' : airdropCro > 0 ? `${formatCro(airdropCro)} CRO` : 'TBA'}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Next Airdrop In</div>
            <div className="text-3xl font-black text-gray-400">TBA</div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">Airdrops Completed</div>
            <div className="text-4xl font-black text-diamond-400">{snapshots.filter(s => s.distributed).length}</div>
            <div className="text-sm text-gray-500 mt-1">
              {snapshots.length === 0 ? 'None yet — launching soon' : `${snapshots.length} total`}
            </div>
          </div>
        </div>

        {/* Live Wallet Balances */}
        {!loading && wallets.length > 0 && (
          <div className="glass-card rounded-2xl p-8 mb-12">
            <h3 className="text-lg font-bold text-white mb-6 text-center">Live Wallet Balances</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {wallets.filter(w => w.token === '$HODL' || w.token === '$CLG').map((wallet) => {
                const colors: Record<string, { gradient: string; border: string }> = {
                  '$HODL': { gradient: 'from-gold-400 to-gold-600', border: 'border-gold-400/30' },
                  '$CLG': { gradient: 'from-diamond-400 to-diamond-600', border: 'border-diamond-400/30' },
                };
                const c = colors[wallet.token] || { gradient: 'from-pink-400 to-pink-600', border: 'border-pink-400/30' };
                const croBalance = Number(wallet.croBalance);
                const tokenBalance = Number(wallet.tokenBalance);
                const airdropAmount = croBalance * (distributionPct / 100);

                return (
                  <div key={wallet.id} className={`rounded-xl p-5 bg-black/30 border ${c.border}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-lg font-black bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
                        {wallet.token}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${c.gradient} text-black`}>
                        {wallet.allocation}%
                      </span>
                    </div>
                    <a
                      href={`https://cronoscan.com/address/${wallet.address}#tokentxns`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-gray-500 hover:text-white transition-colors block mb-3"
                    >
                      {truncateAddress(wallet.address)}
                    </a>
                    <div className="p-3 rounded-lg bg-black/40 mb-2">
                      <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">CRO Balance</div>
                      <div className="text-xl font-bold text-white">{formatCro(croBalance)} CRO</div>
                    </div>
                    {tokenBalance > 0 && (
                      <div className="p-3 rounded-lg bg-black/40 mb-2">
                        <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">{wallet.token} Balance</div>
                        <div className={`text-xl font-bold bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
                          {formatCro(tokenBalance)}
                        </div>
                      </div>
                    )}
                    <div className="p-3 rounded-lg bg-black/40 border border-gold-400/10">
                      <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Next Airdrop ({distributionPct}%)</div>
                      <div className="text-lg font-bold text-gold-400">{formatCro(airdropAmount)} CRO</div>
                    </div>
                  </div>
                );
              })}
              {/* Rotating token placeholder */}
              <div className="rounded-xl p-5 bg-black/30 border border-pink-400/30 border-dashed">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-black bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                    Rotating 32%
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-400 to-pink-600 text-black">
                    32%
                  </span>
                </div>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-3xl mb-2">&#128499;</div>
                    <div className="text-sm font-bold text-pink-400">To be voted</div>
                    <div className="text-xs text-gray-500 mt-1">Community decides the next token</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-black/40 text-center">
                <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Total Across All Wallets</div>
                <div className="text-2xl font-black diamond-text">{formatCro(totalCro)} CRO</div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 text-center border border-gold-400/10">
                <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Total Next Airdrop ({distributionPct}%)</div>
                <div className="text-2xl font-black text-gold-400">{formatCro(airdropCro)} CRO</div>
              </div>
            </div>
          </div>
        )}

        {/* Pool distribution visual */}
        <div className="glass-card rounded-2xl p-8 mb-12">
          <h3 className="text-lg font-bold text-white mb-6 text-center">Airdrop Distribution (20% of Treasury)</h3>
          <div className="flex rounded-xl overflow-hidden h-12">
            <div className="tier-diamond flex items-center justify-center text-sm font-bold text-white" style={{ width: '50%' }}>
              Diamond 50%
            </div>
            <div className="tier-gold flex items-center justify-center text-sm font-bold text-black" style={{ width: '30%' }}>
              Gold 30%
            </div>
            <div className="tier-silver flex items-center justify-center text-sm font-bold text-white" style={{ width: '20%' }}>
              Silver 20%
            </div>
          </div>
          <div className="text-center mt-4 text-sm text-gray-500">
            Jeeters: Sold or transferred tokens — permanently disqualified
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
                  <span className="text-sm text-gray-500">
                    Epoch #{snap.id}
                  </span>
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
                <div className="text-sm text-gray-500 mb-1">Airdropped (20%)</div>
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

'use client';

import { useState, useEffect } from 'react';

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
  wallets: WalletData[];
  timestamp?: string;
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
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function fmtUsd(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return '$0';
}

function CopyButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
      title="Copy address"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

const CLG_TOKEN = '0x08d9cb5100C306C2909B63415d7ff05268633b41';

export default function TaxAllocation() {
  const [data, setData] = useState<WalletsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [croUsd, setCroUsd] = useState(0);
  const [hodlUsd, setHodlUsd] = useState(0);
  const [clgUsd, setClgUsd] = useState(0);

  useEffect(() => {
    const loadWallets = () => {
      fetch('/api/wallets')
        .then(res => res.json())
        .then(d => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    };
    const loadPrices = () => {
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=crypto-com-chain&vs_currencies=usd')
        .then(res => res.json())
        .then(d => { if (d['crypto-com-chain']?.usd) setCroUsd(d['crypto-com-chain'].usd); })
        .catch(() => {});
      fetch('https://api.dexscreener.com/latest/dex/pairs/cronos/0xb4c50913f70b870f68e6143126163ba0e9186ad7')
        .then(res => res.json())
        .then(d => { if (d.pair?.priceUsd) setHodlUsd(parseFloat(d.pair.priceUsd)); })
        .catch(() => {});
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${CLG_TOKEN}`)
        .then(res => res.json())
        .then(d => { if (d.pairs?.[0]?.priceUsd) setClgUsd(parseFloat(d.pairs[0].priceUsd)); })
        .catch(() => {});
    };
    loadWallets();
    loadPrices();
    const walletInterval = setInterval(loadWallets, 60000);
    const priceInterval = setInterval(loadPrices, 120000);
    return () => { clearInterval(walletInterval); clearInterval(priceInterval); };
  }, []);

  const wallets = data?.wallets || [];
  const totalCro = Number(data?.totals?.totalCro || 0);
  const totalHodl = Number(data?.totals?.totalToken || 0);
  const totalUsd = (totalCro * croUsd) + (totalHodl * hodlUsd);

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="diamond-text">Tax Allocation & Treasury</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            All taxes are used to buyback tokens and airdrop them to holders.
            Diamond Hands get 55%, Gold Hands get 30%, Silver Hands get 15% of the airdrop pool.
          </p>
          {data?.timestamp && (
            <p className="text-gray-600 text-sm mt-3">
              Last updated: {new Date(data.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Total treasury summary */}
        {croUsd > 0 && totalUsd > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl p-6 border border-gold-400/20 bg-gold-400/5 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Total Treasury Value</div>
              <div className="text-3xl font-black diamond-text">{fmtUsd(totalUsd)}</div>
              <div className="text-sm text-gray-400 mt-1">{formatCro(totalCro)} CRO + {formatCro(totalHodl)} $HODL</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-green-500/20 bg-green-500/5 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Next Airdrop (20%)</div>
              <div className="text-3xl font-black text-green-400">{fmtUsd(totalUsd * 0.2)}</div>
              <div className="text-sm text-green-300 mt-1">{formatCro(totalCro * 0.2)} CRO + {formatCro(totalHodl * 0.2)} $HODL</div>
            </div>
          </div>
        )}

        {/* Distribution bar */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Buyback Split</h3>
          <div className="flex rounded-xl overflow-hidden h-14 mb-4">
            <div className="bg-gold-400 flex items-center justify-center font-bold text-black text-sm transition-all hover:brightness-110" style={{ width: '35%' }}>
              $HODL 35%
            </div>
            <div className="bg-diamond-400 flex items-center justify-center font-bold text-black text-sm transition-all hover:brightness-110" style={{ width: '33%' }}>
              $CLG 33%
            </div>
            <div className="bg-pink-400 flex items-center justify-center font-bold text-black text-sm transition-all hover:brightness-110" style={{ width: '32%' }}>
              Rotating 32%
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">32% goes to rotating tokens — rotates every phase</p>
        </div>

        {/* Wallet Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="md:col-span-3 text-center py-12 text-gray-500">Loading wallet balances...</div>
          ) : wallets.map((wallet) => {
            const colors: Record<string, { gradient: string; bg: string; border: string; glow: string }> = {
              '$HODL': {
                gradient: 'from-gold-400 to-gold-600',
                bg: 'bg-gold-400/5',
                border: 'border-gold-400/30',
                glow: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]',
              },
              '$CLG': {
                gradient: 'from-diamond-400 to-diamond-600',
                bg: 'bg-diamond-400/5',
                border: 'border-diamond-400/30',
                glow: 'hover:shadow-[0_0_30px_rgba(54,191,250,0.15)]',
              },
              'Rotating': {
                gradient: 'from-pink-400 to-pink-600',
                bg: 'bg-pink-400/5',
                border: 'border-pink-400/30',
                glow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]',
              },
            };
            const c = colors[wallet.token] || colors['Rotating'];
            const croBalance = Number(wallet.croBalance);
            const hodlBalance = Number(wallet.tokenBalance || 0);
            const clgBalance = Number(wallet.clgBalance || 0);
            const walletUsd = (croBalance * croUsd) + (hodlBalance * hodlUsd) + (clgBalance * clgUsd);

            return (
              <div
                key={wallet.token}
                className={`glass-card rounded-2xl p-6 ${c.bg} ${c.border} ${c.glow} transition-all duration-300`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-2xl font-black bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
                    {wallet.token}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${c.gradient} text-black`}>
                    {wallet.allocation}%
                  </span>
                </div>

                {/* Wallet address */}
                <div className="mb-4">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Wallet</div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://cronoscan.com/address/${wallet.address}#tokentxns`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-white hover:text-gold-400 transition-colors underline decoration-gray-500 hover:decoration-gold-400"
                      title="View on Cronoscan"
                    >
                      {truncateAddress(wallet.address)}
                    </a>
                    <CopyButton address={wallet.address} />
                  </div>
                </div>

                {/* USD total */}
                {croUsd > 0 && walletUsd > 0 && (
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 mb-3 text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Total Value</div>
                    <div className="text-2xl font-black text-green-400">{fmtUsd(walletUsd)}</div>
                  </div>
                )}

                {/* CRO Balance */}
                <div className="p-4 rounded-xl bg-black/30 mb-3">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">CRO Balance</div>
                  <div className="text-2xl font-black text-white">{formatCro(croBalance)}</div>
                  {croUsd > 0 && <div className="text-xs text-gray-500">{fmtUsd(croBalance * croUsd)}</div>}
                </div>

                {/* $HODL Balance (for DHAND wallet) */}
                {hodlBalance > 0 && (
                  <div className="p-4 rounded-xl bg-gold-400/5 border border-gold-400/20 mb-3">
                    <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">$HODL Balance</div>
                    <div className="text-xl font-bold text-gold-400">{formatCro(hodlBalance)}</div>
                    {hodlUsd > 0 && <div className="text-xs text-gray-500">{fmtUsd(hodlBalance * hodlUsd)}</div>}
                  </div>
                )}

                {/* $CLG Balance (for CLG wallet) */}
                {clgBalance > 0 && (
                  <div className="p-4 rounded-xl bg-diamond-400/5 border border-diamond-400/20 mb-3">
                    <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">$CLG Balance</div>
                    <div className="text-xl font-bold text-diamond-400">{formatCro(clgBalance)}</div>
                    {clgUsd > 0 && <div className="text-xs text-gray-500">{fmtUsd(clgBalance * clgUsd)}</div>}
                  </div>
                )}

                {/* Airdrop amount (20%) */}
                <div className="p-4 rounded-xl bg-black/30 border border-gold-400/10">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Next Airdrop (20%)</div>
                  <div className="text-xl font-bold text-gold-400">
                    {fmtUsd(walletUsd * 0.2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Remaining 80% stays &amp; accumulates
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

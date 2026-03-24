'use client';

import { useState, useEffect } from 'react';

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

export default function TaxAllocation() {
  const [data, setData] = useState<WalletsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/holders.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to fetch wallets:', err))
      .finally(() => setLoading(false));
  }, []);

  const wallets = data?.wallets || [];
  const totalCro = Number(data?.totals?.totalCro || 0);
  const airdropCro = Number(data?.totals?.airdropCro || 0);

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
            Exception: Dexscreener is paid with taxes, and any other possible costs are agreed with the Diamond holders first.
          </p>
        </div>

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

        {/* 3 Wallet Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="md:col-span-3 text-center py-12 text-gray-500">Loading wallet balances...</div>
          ) : wallets.filter(w => w.token !== 'Rotating').map((wallet) => {
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
            };
            const c = colors[wallet.token] || colors['$HODL'];
            const croBalance = Number(wallet.croBalance);
            const airdropAmount = croBalance * 0.20;

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

                {/* CRO Balance */}
                <div className="p-4 rounded-xl bg-black/30 mb-3">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">CRO Balance</div>
                  <div className="text-2xl font-black text-white">
                    {formatCro(croBalance)} CRO
                  </div>
                </div>

                {/* Airdrop amount (20%) */}
                <div className="p-4 rounded-xl bg-black/30 border border-gold-400/10">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Next Airdrop (20%)</div>
                  <div className="text-xl font-bold text-gold-400">
                    {formatCro(airdropAmount)} CRO
                  </div>
                  <div className="text-xs text-gray-500">
                    Remaining 80% stays &amp; accumulates
                  </div>
                </div>
              </div>
            );
          })}
          {/* Rotating community-voted token card */}
          {(() => {
            const rotatingWallet = wallets.find(w => w.token === 'Rotating');
            const croBalance = rotatingWallet ? Number(rotatingWallet.croBalance) : 0;
            const airdropAmount = croBalance * 0.20;
            return (
              <div className="glass-card rounded-2xl p-6 bg-pink-400/5 border-pink-400/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
                    Rotating
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-400 to-pink-600 text-black">
                    32%
                  </span>
                </div>

                {rotatingWallet && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Wallet</div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://cronoscan.com/address/${rotatingWallet.address}#tokentxns`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-white hover:text-gold-400 transition-colors underline decoration-gray-500 hover:decoration-gold-400"
                        title="View on Cronoscan"
                      >
                        {truncateAddress(rotatingWallet.address)}
                      </a>
                      <CopyButton address={rotatingWallet.address} />
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-black/30 mb-3">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">CRO Balance</div>
                  <div className="text-2xl font-black text-white">
                    {rotatingWallet ? `${formatCro(croBalance)} CRO` : 'TBA'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-gold-400/10 mb-3">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">Next Airdrop (20%)</div>
                  <div className="text-xl font-bold text-gold-400">
                    {rotatingWallet ? `${formatCro(airdropAmount)} CRO` : 'TBA'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Remaining 80% stays &amp; accumulates
                  </div>
                </div>

                <div className="text-center text-sm text-pink-400 font-medium">
                  Token decided by community vote
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}

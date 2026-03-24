'use client';

import { useState, useEffect } from 'react';
import DiamondIcon from './DiamondIcon';

const LAUNCH_TIME = new Date('2026-03-24T19:00:00Z').getTime();

function useCountdown() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  if (!mounted) return { hours: 0, minutes: 0, seconds: 0, launched: false, ready: false };
  const diff = Math.max(0, LAUNCH_TIME - now);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds, launched: diff === 0, ready: true };
}

const cryImages = [
  { src: '/cry1.png', size: 140, top: '5%', left: '8%', delay: '0s', duration: '6s' },
  { src: '/cry2.png', size: 120, top: '10%', right: '6%', delay: '1s', duration: '7s' },
  { src: '/cry3.png', size: 130, bottom: '15%', left: '3%', delay: '0.5s', duration: '8s' },
  { src: '/cry4.png', size: 110, bottom: '8%', right: '10%', delay: '2s', duration: '6.5s' },
  { src: '/cry5.png', size: 120, top: '38%', left: '1%', delay: '1.5s', duration: '7.5s' },
  { src: '/cry7.png', size: 130, top: '25%', right: '2%', delay: '0.8s', duration: '8.5s' },
  { src: '/cry8.png', size: 100, bottom: '30%', left: '12%', delay: '2.5s', duration: '6s' },
  { src: '/cry9.png', size: 115, top: '8%', left: '30%', delay: '1.2s', duration: '7s' },
  { src: '/cry10.png', size: 125, bottom: '5%', left: '25%', delay: '0.3s', duration: '8s' },
  { src: '/cry11.png', size: 110, top: '20%', right: '20%', delay: '1.8s', duration: '6.5s' },
  { src: '/cry12.png', size: 120, bottom: '25%', right: '5%', delay: '0.7s', duration: '7.5s' },
  { src: '/cry13.png', size: 105, top: '45%', right: '15%', delay: '2.2s', duration: '8s' },
  { src: '/cry14.png', size: 130, bottom: '12%', left: '35%', delay: '0.9s', duration: '7s' },
  { src: '/cry15.png', size: 115, top: '12%', right: '28%', delay: '1.6s', duration: '6.5s' },
  { src: '/cry16.png', size: 120, bottom: '18%', right: '25%', delay: '2.0s', duration: '8.5s' },
];

function LaunchCountdown() {
  const { hours, minutes, seconds, launched, ready } = useCountdown();

  if (!ready) {
    return <div className="mb-12 h-[168px]" />;
  }

  if (launched) {
    return (
      <div className="flex justify-center mb-12">
        <button className="group px-8 py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-black font-bold text-lg hover:from-gold-400 hover:to-gold-500 transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:scale-105">
          Buy $HODL
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </button>
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="mb-12">
      <div className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
        <span className="text-green-400 text-sm font-bold uppercase tracking-wider animate-pulse">Launching Soon</span>
      </div>
      <div className="text-lg text-white font-bold mb-1">March 24, 2026 — 19:00-19:30 UTC</div>
      <div className="text-sm text-gray-400 mb-6">$HODL goes live on Cronos</div>
      <div className="flex justify-center gap-3 md:gap-5">
        {[
          { value: pad(hours), label: 'Hours' },
          { value: pad(minutes), label: 'Min' },
          { value: pad(seconds), label: 'Sec' },
        ].map((unit) => (
          <div key={unit.label} className="rounded-xl p-4 w-24 md:w-28 text-center bg-gradient-to-b from-green-500/10 to-green-500/5 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <div className="text-4xl md:text-5xl font-black text-green-400 tabular-nums">{unit.value}</div>
            <div className="text-[10px] text-green-400/60 uppercase tracking-wider mt-1 font-bold">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface WalletBalance {
  id: string;
  token: string;
  address: string;
  allocation: number;
  croBalance: string;
  tokenBalance: string;
}

const WALLET_DEFAULTS = [
  { label: '$HODL Buyback', pct: '35%', address: '0x36148b668edc1d380671467579ee851a72b9455c', color: 'text-gold-400' },
  { label: '$CLG', pct: '33%', address: '0x04407f3cc344df8c271b56bd42f9a169659266fc', color: 'text-diamond-400' },
  { label: 'Rotating', pct: '32%', address: '0xf8de57e772b1a29b704dae1f9174087ff568d2bc', color: 'text-pink-400' },
];

function formatBalance(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export default function Hero() {
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);

  useEffect(() => {
    fetch('/api/wallets')
      .then(res => res.json())
      .then(data => {
        if (data.wallets) setWalletBalances(data.wallets);
        else if (Array.isArray(data)) setWalletBalances(data);
      })
      .catch(() => {});
  }, []);
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
      {/* Intense radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-sky-400/15 rounded-full blur-[200px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-diamond-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-purple-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-400/8 rounded-full blur-[150px]" />
      </div>

      {/* Cry images removed — handled by FloatingCryImages globally */}

      <div className="relative text-center px-6 max-w-4xl">
        {/* Diamond center piece */}
        <div className="flex justify-center items-center mb-10">
          <div className="relative z-10">
            {/* Background mega glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-300/20 rounded-full blur-[80px] animate-glow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/15 rounded-full blur-[60px]">
              <div className="w-full h-full animate-sparkle" />
            </div>

            {/* The diamond — 280px */}
            <DiamondIcon size={280} className="animate-float relative z-10" id="hero" />

            {/* Pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 rounded-full border-2 border-sky-300/30 pulse-ring" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 rounded-full border border-white/20 pulse-ring" style={{ animationDelay: '0.7s' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 rounded-full border border-gold-400/20 pulse-ring" style={{ animationDelay: '1.4s' }} />
            </div>

          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="diamond-text">Who&apos;s The Strongest?</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
          Who resists selling first? Will you crumble to the{' '}
          <span className="text-red-400 font-semibold">Jeeter</span> category?
        </p>

        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          The chain doesn&apos;t lie.{' '}
          <span className="text-gold-400 font-medium">Diamond Hands</span>{' '}
          drink the golden juice that is squeezed from jeeters.
        </p>

        <p className="text-sm text-gray-500 mb-8">Launched by <a href="https://x.com/Awerghx" target="_blank" rel="noopener noreferrer" className="text-gold-400 font-semibold hover:text-gold-300 transition-colors">Awerghx</a></p>

        <LaunchCountdown />

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {[
            { label: 'Buy Tax', value: '10%', sub: '100% airdropped to holders' },
            { label: 'Sell Tax', value: '10%', sub: '100% airdropped to holders' },
            { label: 'Transfer Tax', value: '10%', sub: 'Sender = OUT. Receiver = safe.' },
            { label: 'Burned', value: 'ZERO', sub: 'Never. Ever.' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-2xl font-black diamond-text">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Contract info */}
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">Ticker:</span>
            <span className="text-gold-400 font-bold">$HODL</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">Creator:</span>
            <a
              href="https://cronoscan.com/address/0xAF87e4Df58D735ec2971d2D8Db663B02cA60175D"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-gray-400 hover:text-gold-400 transition-colors pointer-events-auto break-all"
            >
              0xAF87e4Df58D735ec2971d2D8Db663B02cA60175D
            </a>
          </div>

          {/* Tax collection wallets */}
          <div className="mt-10">
            <h3 className="text-2xl font-black diamond-text mb-2">Tax Treasury</h3>
            <p className="text-sm text-gray-500 mb-6">100% of taxes collected are used for buybacks and airdrops to holders.</p>

            {/* Total collected */}
            {walletBalances.length > 0 && (
              <div className="glass-card rounded-xl p-5 mb-5 border border-gold-400/20 max-w-3xl mx-auto">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Tax Collected</div>
                <div className="text-3xl md:text-4xl font-black diamond-text">
                  {formatBalance(walletBalances.reduce((s, w) => s + parseFloat(w.croBalance || '0'), 0).toString())} CRO
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {WALLET_DEFAULTS.map((w) => {
                const live = walletBalances.find(b => b.address.toLowerCase() === w.address.toLowerCase());
                return (
                  <div key={w.label} className="glass-card rounded-xl p-5 text-center pointer-events-auto border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className={`text-sm font-bold ${w.color}`}>{w.label}</span>
                      <span className="text-sm text-gray-500">({w.pct})</span>
                    </div>
                    {live ? (
                      <div className="mb-3 space-y-1">
                        <div className="text-2xl font-black text-white">{formatBalance(live.croBalance)} <span className="text-sm text-gray-400">CRO</span></div>
                        {parseFloat(live.tokenBalance) > 0 && (
                          <div className={`text-lg font-bold ${w.color}`}>{formatBalance(live.tokenBalance)} <span className="text-xs text-gray-500">tokens</span></div>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl font-black text-gray-600 mb-3">—</div>
                    )}
                    <div className="flex items-center justify-center gap-1.5">
                      <a
                        href={`https://cronoscan.com/address/${w.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-gray-500 hover:text-gold-400 transition-colors"
                      >
                        {w.address.slice(0, 6)}...{w.address.slice(-4)}
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(w.address)}
                        className="text-gray-600 hover:text-gold-400 transition-colors"
                        title="Copy address"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

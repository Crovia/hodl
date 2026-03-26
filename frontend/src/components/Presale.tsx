'use client';

import { useState } from 'react';

interface Participant {
  name: string;
  address: string;
  allocation: number;
  twitter?: string;
}

const participants: Participant[] = [
  { name: 'Cronos Legends Participation', address: '0xAF87e4Df58D735ec2971d2D8Db663B02cA60175D', allocation: 1500 },
  { name: 'Obsidian Finance', address: '0x185D93b0F57A22e6cAb7d9F0D4EB657341fF90B3', allocation: 3000 },
  { name: 'haten.cro', address: '0x7E3e91b6912042f8FC446385299785Ac2F12C0d0', allocation: 1500 },
  { name: 'TBK', address: '0x52076D4f01440225e5A8baBB77B3eB1391C617e6', allocation: 1500 },
  { name: 'Liberty', address: '0x32dF940EdbF734971aF4707fE35f3ADe91660358', allocation: 1500 },
  { name: 'Boula', address: '0xC3F1087176485Ec5518cbC88169205fF26f75702', allocation: 1500 },
  { name: 'Zerokrypto', address: '0x36D21fD7EAfa01abC35578Ea940c545DCe8AC10C', allocation: 1500 },
  { name: 'AarzyK', address: '0x4E730ac6A1A9D53aeF0239331d90E0da4642FBb5', allocation: 1500 },
  { name: 'Snapmaster', address: '0x8aD01eD7fC839e9523447AE7d00fbA695EF9875f', allocation: 1500 },
  { name: 'Baas343', address: '0x5148E8932a8f9E7bedb04303a12187e56446956c', allocation: 1500 },
  { name: 'Steve', address: '0x5034E11bd0e61f2811396324B685cd58d2f6c206', allocation: 1500 },
  { name: 'Tohmee', address: '0x2270cBad5072b7685357EC83dDC959FFDE535b27', allocation: 1500 },
  { name: 'Exterminate', address: '0x1D9B981b7ABa1a747883833fB8a1B5072Eac5d8f', allocation: 1500 },
  { name: 'Rdeepanraj', address: '0x3b428943Ef1C49bf81Ddb00f9A11e55811Fc7b3c', allocation: 1500 },
  { name: 'Awerghx', address: '0x499E30AEa1540FdA665412C779f00c6Dd8A6D27D', allocation: 1500, twitter: 'Awerghx' },
  { name: 'JePu', address: '0xD45b551473f1819Ef9fc9EFa2C654b98eAb21850', allocation: 1500 },
  { name: 'Naddy', address: '0x3868150e5fF9EC5B052A36F2d8a5D8Bc348b4967', allocation: 1500 },
  { name: 'El presidentee', address: '0xF085359DB5Df9dfa01ef31a269D5cDf99685bd4a', allocation: 1500 },
  { name: 'CroSsoulL', address: '0x172B4E1E7c0772c4dBE152914CeF9e9F427c7585', allocation: 1000 },
  { name: 'Kikodog', address: '0x87664C30CFba8FE860439bBF94e3521686Dec0de', allocation: 1000 },
  { name: 'kajebara', address: '0xE375805D3FB202d028939bB39D2ba9385FFFFde6', allocation: 1000 },
  { name: 'Seevin', address: '0x5237454DAC7D259Dd88B34cEb17E195Dca0A3F4d', allocation: 1000 },
  { name: 'Nicholoco', address: '0xEce1b63218A249708B521E22BbAA7bAC35F6f20f', allocation: 1500 },
  { name: 'Chiefboss', address: '0x0e4eaCc2887A58D157a4A9f036F7499fFcC68831', allocation: 1000 },
  { name: 'ArdentVRory', address: '0x89c132E654699C953C6Ddb4e27e7Cbcd19B13E8a', allocation: 1000 },
  { name: 'Nosnah84', address: '0x3283b4937D1BBfDa4b24D9f110C5731CE209244e', allocation: 1000 },
  { name: 'Paysagiste00', address: '0x782Bdee22753EA3e5A4C16cBF8887a098D13b432', allocation: 1000 },
  { name: 'Willys', address: '0x584B5505DE4A4e7393e915b2e44593934D528d63', allocation: 1000 },
  { name: 'sebastiaan', address: '0xFB28A731959997bf41E57397209BAB78Cd2A0406', allocation: 1000 },
  { name: 'Gmbino', address: '0x212246c1bB44C4d70ecC1F6fE64C1Fe68638624F', allocation: 1000 },
  { name: 'CryptoCharlesManson', address: '0xDFB2E6486507A90c820a634F59483470e621Ac4B', allocation: 1000 },
  { name: 'Memeseason', address: '0x08C2ceEcA0E01066B4e46081AcC621a34E8e21F1', allocation: 1000 },
  { name: 'Dougie', address: '0x38eB9a99EA4D612F7C516368242FB7DABfFD1A75', allocation: 1000 },
];

type Tier = 'diamond' | 'gold' | 'silver';

function getTier(allocation: number): Tier {
  const supplyPct = (allocation / totalAllocation) * TOTAL_PRESALE_SUPPLY_PCT;
  if (supplyPct >= 1.8) return 'diamond';
  if (supplyPct >= 1) return 'gold';
  return 'silver';
}

const tierConfig = {
  diamond: { label: 'Diamond', color: 'text-cyan-300', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', glow: 'shadow-cyan-400/20' },
  gold: { label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', glow: 'shadow-yellow-400/20' },
  silver: { label: 'Silver', color: 'text-gray-300', bg: 'bg-gray-400/10', border: 'border-gray-400/30', glow: 'shadow-gray-400/20' },
};

function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M2.5 9.5L12 3l9.5 6.5L12 21 2.5 9.5z" />
      <path d="M2.5 9.5h19M12 3l-4 6.5L12 21l4-11.5L12 3z" strokeOpacity={0.5} />
    </svg>
  );
}

function GoldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2l2.9 5.9L21 9l-4.5 4.4L17.8 20 12 16.9 6.2 20l1.3-6.6L3 9l6.1-1.1L12 2z" />
    </svg>
  );
}

function SilverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v4l3 2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity={0.3} />
    </svg>
  );
}

function TierIcon({ tier, className }: { tier: Tier; className?: string }) {
  switch (tier) {
    case 'diamond': return <DiamondIcon className={className} />;
    case 'gold': return <GoldIcon className={className} />;
    case 'silver': return <SilverIcon className={className} />;
  }
}

const totalAllocation = participants.reduce((sum, p) => sum + p.allocation, 0);
const TOTAL_CRO_RAISED = 45000; // actual total raised

// From bonding curve calculator: 43,000 CRO = 63% of supply (~637M tokens)
const TOTAL_PRESALE_SUPPLY_PCT = 63;
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion
const PRESALE_TOKENS = 637_037_037; // exact from bonding curve

const TRANSFER_TAX = 0.10; // 10% tax on transfer

function getParticipantShare(allocation: number) {
  const preTaxPct = (allocation / TOTAL_CRO_RAISED) * TOTAL_PRESALE_SUPPLY_PCT;
  const preTaxTokens = Math.round((allocation / TOTAL_CRO_RAISED) * PRESALE_TOKENS);
  const sharePct = preTaxPct * (1 - TRANSFER_TAX);
  const tokens = Math.round(preTaxTokens * (1 - TRANSFER_TAX));
  return { sharePct, tokens };
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 4)}..${addr.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 text-gray-500 hover:text-gold-400 transition-colors"
      title="Copy address"
    >
      {copied ? (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

const floatingMemes = [
  '/cry17.png', '/cry18.png', '/cry19.png', '/cry20.png', '/cry21.png',
  '/cry22.png', '/cry23.png', '/cry24.png', '/cry25.png',
];

export default function Presale() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  return (
    <div className="relative py-24 px-6">
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="diamond-text">Pre-Sale</span>
          </h1>
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
            <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Pre-Sale Closed</span>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Early supporters who believed from the start. Pre-sale is now closed. Thank you to all {participants.length} participants.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Participants</div>
            <div className="text-3xl font-black diamond-text">{participants.length}</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Raised</div>
            <div className="text-3xl font-black diamond-text">{totalAllocation.toLocaleString()} CRO</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Est. Supply Share</div>
            <div className="text-3xl font-black text-gold-400">~{TOTAL_PRESALE_SUPPLY_PCT}%</div>
            <div className="text-xs text-gray-500 mt-1">of total token supply</div>
          </div>
        </div>

        {/* Participants table */}
        <div className="glass-card rounded-2xl overflow-hidden mb-16">
          <div className="p-6 border-b border-gold-400/10">
            <h2 className="text-2xl font-bold diamond-text">Participants</h2>
          </div>

          {/* Table header - desktop */}
          <div className="hidden md:grid grid-cols-[2rem_2rem_1fr_1fr_4rem_4rem_5rem] gap-4 p-4 bg-black/40 border-b border-gold-400/10 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div>#</div>
            <div>Tier</div>
            <div>Name</div>
            <div>Wallet</div>
            <div className="text-right">CRO</div>
            <div className="text-right">% Supply</div>
            <div className="text-right">Est. Tokens</div>
          </div>
          {/* Table header - mobile */}
          <div className="md:hidden grid grid-cols-[1.5rem_1.5rem_1fr_3.5rem] gap-2 p-3 bg-black/40 border-b border-gold-400/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <div>#</div>
            <div></div>
            <div>Name</div>
            <div className="text-right">CRO</div>
          </div>

          {/* Rows */}
          {participants.map((p, i) => {
            const { sharePct, tokens } = getParticipantShare(p.allocation);
            const tier = getTier(p.allocation);
            const config = tierConfig[tier];
            const isExpanded = expandedRow === i;
            return (
              <div key={p.address} style={{ animation: `fadeSlideIn 0.4s ease-out ${i * 0.06}s both` }}>
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-[2rem_2rem_1fr_1fr_4rem_4rem_5rem] gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-all duration-300 group">
                  <div className="text-gray-500 font-mono text-sm">{i + 1}</div>
                  <div className="flex items-center" title={config.label}>
                    <TierIcon tier={tier} className={`w-5 h-5 ${config.color} transition-transform duration-300 group-hover:scale-125 ${tier === 'diamond' ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {p.twitter ? (
                      <a href={`https://x.com/${p.twitter}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-white hover:text-gold-400 transition-colors">{p.name}</a>
                    ) : (
                      <span className="text-sm font-medium text-white">{p.name}</span>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>{config.label}</span>
                  </div>
                  <div className="flex items-center">
                    <a href={`https://cronoscan.com/address/${p.address}#tokentxns`} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-gray-300 hover:text-gold-400 transition-colors" title="View on Cronoscan">{truncateAddress(p.address)}</a>
                    <CopyButton text={p.address} />
                  </div>
                  <div className="text-right text-sm font-bold text-gold-400">{p.allocation.toLocaleString()}</div>
                  <div className="text-right text-sm font-bold text-diamond-400">~{sharePct.toFixed(2)}%</div>
                  <div className="text-right text-sm text-gray-300">~{formatTokens(tokens)}</div>
                </div>

                {/* Mobile row - tap to expand */}
                <div
                  className="md:hidden grid grid-cols-[1.5rem_1.5rem_1fr_3.5rem] gap-2 p-3 items-center border-b border-white/5 active:bg-white/5 cursor-pointer"
                  onClick={() => setExpandedRow(isExpanded ? null : i)}
                >
                  <div className="text-gray-500 font-mono text-[11px]">{i + 1}</div>
                  <TierIcon tier={tier} className={`w-4 h-4 ${config.color}`} />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-medium text-white truncate">{p.name}</span>
                    <span className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded ${config.bg} ${config.color} border ${config.border} flex-shrink-0`}>{config.label}</span>
                  </div>
                  <div className="text-right text-[11px] font-bold text-gold-400">{p.allocation.toLocaleString()}</div>
                </div>

                {/* Mobile expanded details */}
                {isExpanded && (
                  <div className="md:hidden px-3 py-2 bg-white/5 border-b border-white/5 grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <div className="text-gray-500 uppercase mb-0.5">Wallet</div>
                      <a href={`https://cronoscan.com/address/${p.address}#tokentxns`} target="_blank" rel="noopener noreferrer" className="font-mono text-gray-300 hover:text-gold-400">{truncateAddress(p.address)}</a>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 uppercase mb-0.5">% Supply</div>
                      <div className="font-bold text-diamond-400">~{sharePct.toFixed(2)}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 uppercase mb-0.5">Est. Tokens</div>
                      <div className="text-gray-300">~{formatTokens(tokens)}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Total row - desktop */}
          <div className="hidden md:grid grid-cols-[2rem_2rem_1fr_1fr_4rem_4rem_5rem] gap-4 p-4 items-center bg-gold-400/5 border-t border-gold-400/20">
            <div />
            <div />
            <div />
            <div className="text-sm font-bold text-gray-400 uppercase">Total</div>
            <div className="text-right text-lg font-black diamond-text">{totalAllocation.toLocaleString()}</div>
            <div className="text-right text-lg font-black text-diamond-400">~{TOTAL_PRESALE_SUPPLY_PCT}%</div>
            <div className="text-right text-sm font-bold text-gray-300">~{formatTokens(PRESALE_TOKENS)}</div>
          </div>
          {/* Total row - mobile */}
          <div className="md:hidden flex justify-between p-3 bg-gold-400/5 border-t border-gold-400/20">
            <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
            <span className="text-sm font-black diamond-text">{totalAllocation.toLocaleString()} CRO</span>
          </div>
        </div>

        {/* Missing address notice */}
        <div className="glass-card rounded-xl p-4 mb-4 border border-diamond-400/20 bg-diamond-400/5">
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-diamond-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            <p className="text-gray-400">
              <span className="text-diamond-400 font-bold">Your address missing?</span> Contact <a href="https://x.com/Awerghx" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300">Awerghx</a> in Cronos Legends Discord by creating a ticket.
            </p>
          </div>
        </div>

        {/* Estimation note */}
        <div className="glass-card rounded-xl p-4 mb-16 border border-gold-400/10">
          <div className="flex items-center gap-3 text-sm">
            <div className="text-xl">&#9888;&#65039;</div>
            <p className="text-gray-400">
              <span className="text-gold-400 font-bold">Estimates only.</span> Token amounts and % of supply shown after 10% transfer tax. Actual amounts may vary at launch depending on final liquidity pool parameters.
            </p>
          </div>
        </div>

        {/* Tokenomics */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gold-400/10">
            <h2 className="text-2xl font-bold diamond-text">Tokenomics</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Distribution */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Tax Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-gold-400/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gold-400" />
                      <span className="text-sm text-gray-300">Launch Tax</span>
                    </div>
                    <span className="text-sm font-bold text-gold-400">10%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-gold-400/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-diamond-400" />
                      <span className="text-sm text-gray-300">Tax Reduction</span>
                    </div>
                    <span className="text-sm font-bold text-diamond-400">-1% every 10 days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-gold-400/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-sm text-gray-300">Minimum Tax</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">5%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-gold-400/10">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-white" />
                      <span className="text-sm text-gray-300">Burned</span>
                    </div>
                    <span className="text-sm font-bold text-white">ZERO</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-6 mb-4">Buyback Split</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-gold-400/10">
                    <span className="text-sm text-gray-300">$HODL buyback</span>
                    <span className="text-sm font-bold text-gold-400">35%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-diamond-400/20">
                    <span className="text-sm text-gray-300">$CLG</span>
                    <span className="text-sm font-bold text-diamond-400">33%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-pink-400/20">
                    <span className="text-sm text-gray-300">Rotating tokens</span>
                    <span className="text-sm font-bold text-pink-400">32%</span>
                  </div>
                </div>
              </div>

              {/* Right: How it works */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-gold-400/10">
                    <div className="text-gold-400 font-bold text-sm mb-1">100% Airdropped</div>
                    <p className="text-sm text-gray-400">All taxes are used to buy tokens and airdrop them to holders. No funds are burned — you will receive them back. Exception: Dexscreener is paid with taxes, and any other possible costs are agreed with the Diamond holders first. If you just hold? Simple.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-gold-400/10">
                    <div className="text-gold-400 font-bold text-sm mb-1">~10 Day Cycles</div>
                    <p className="text-sm text-gray-400">Every ~10 days, buybacks are executed and tokens airdropped. Equal amounts distributed to holders based on their tier (Diamond, Gold, Silver).</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-diamond-400/10">
                    <div className="text-diamond-400 font-bold text-sm mb-1">Diamond Path</div>
                    <p className="text-sm text-gray-400">$HODL holders get a +3% boost every 10 days they hold. 10d = +3%, 20d = +6%, 30d = +9%, and so on.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-pink-400/10">
                    <div className="text-pink-400 font-bold text-sm mb-1">Rotating 32%</div>
                    <p className="text-sm text-gray-400">32% of buybacks go to rotating tokens. Each phase is voted by the community — one suggestion per person, no repeats from previous phases.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-red-400/10">
                    <div className="text-red-400 font-bold text-sm mb-1">Sell = Permanent Ban</div>
                    <p className="text-sm text-gray-400">If you sell or transfer any tokens, you are permanently disqualified from all future airdrops. The chain sees everything.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

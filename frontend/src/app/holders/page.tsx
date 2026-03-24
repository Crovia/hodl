'use client';

import { useState, useEffect } from 'react';
import HoldersTable from '@/components/HoldersTable';
import { Holder, getTier } from '@/lib/types';

const presaleParticipants = [
  { address: '0x32dF940EdbF734971aF4707fE35f3ADe91660358', allocation: 1500 },
  { address: '0xC3F1087176485Ec5518cbC88169205fF26f75702', allocation: 1500 },
  { address: '0x36D21fD7EAfa01abC35578Ea940c545DCe8AC10C', allocation: 1500 },
  { address: '0x4E730ac6A1A9D53aeF0239331d90E0da4642FBb5', allocation: 1500 },
  { address: '0x8aD01eD7fC839e9523447AE7d00fbA695EF9875f', allocation: 1500 },
  { address: '0x5148E8932a8f9E7bedb04303a12187e56446956c', allocation: 1500 },
  { address: '0x5034E11bd0e61f2811396324B685cd58d2f6c206', allocation: 1500 },
  { address: '0x2270cBad5072b7685357EC83dDC959FFDE535b27', allocation: 1500 },
  { address: '0x1D9B981b7ABa1a747883833fB8a1B5072Eac5d8f', allocation: 1500 },
  { address: '0x3b428943Ef1C49bf81Ddb00f9A11e55811Fc7b3c', allocation: 1500 },
  { address: '0x499E30AEa1540FdA665412C779f00c6Dd8A6D27D', allocation: 1500 },
  { address: '0xD45b551473f1819Ef9fc9EFa2C654b98eAb21850', allocation: 1500 },
  { address: '0x3868150e5fF9EC5B052A36F2d8a5D8Bc348b4967', allocation: 1500 },
  { address: '0xF085359DB5Df9dfa01ef31a269D5cDf99685bd4a', allocation: 1500 },
  { address: '0x172B4E1E7c0772c4dBE152914CeF9e9F427c7585', allocation: 1000 },
  { address: '0x87664C30CFba8FE860439bBF94e3521686Dec0de', allocation: 1000 },
  { address: '0xE375805D3FB202d028939bB39D2ba9385FFFFde6', allocation: 1000 },
  { address: '0x5237454DAC7D259Dd88B34cEb17E195Dca0A3F4d', allocation: 1000 },
  { address: '0xEce1b63218A249708B521E22BbAA7bAC35F6f20f', allocation: 1000 },
  { address: '0x0e4eaCc2887A58D157a4A9f036F7499fFcC68831', allocation: 1000 },
  { address: '0x89c132E654699C953C6Ddb4e27e7Cbcd19B13E8a', allocation: 1000 },
  { address: '0x3283b4937D1BBfDa4b24D9f110C5731CE209244e', allocation: 1000 },
  { address: '0x782Bdee22753EA3e5A4C16cBF8887a098D13b432', allocation: 1000 },
  { address: '0x584B5505DE4A4e7393e915b2e44593934D528d63', allocation: 1000 },
  { address: '0xFB28A731959997bf41E57397209BAB78Cd2A0406', allocation: 1000 },
  { address: '0x212246c1bB44C4d70ecC1F6fE64C1Fe68638624F', allocation: 1000 },
  { address: '0xDFB2E6486507A90c820a634F59483470e621Ac4B', allocation: 1000 },
  { address: '0x08C2ceEcA0E01066B4e46081AcC621a34E8e21F1', allocation: 1000 },
  { address: '0x38eB9a99EA4D612F7C516368242FB7DABfFD1A75', allocation: 500 },
];

const OG_ADDRESSES = presaleParticipants.map(p => p.address);
const TOTAL_PRESALE_CRO = 37000;
const PRESALE_SUPPLY_PCT = 71.2;

function buildPresaleHolders(): Holder[] {
  return presaleParticipants
    .map(p => {
      const pct = Math.round((p.allocation / TOTAL_PRESALE_CRO) * PRESALE_SUPPLY_PCT * 100) / 100;
      const tier = getTier(pct);
      return {
        address: p.address,
        balance: p.allocation,
        percentage: pct,
        tier,
        firstBuyBlock: 0,
        firstBuyTimestamp: 0,
        holdingDays: 0,
        airdropAmount: 0,
        boostPercentage: 0,
        totalWithBoost: 0,
        eligible: true,
        hasSold: false,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
}

export default function HoldersPage() {
  const [holders, setHolders] = useState<Holder[]>(buildPresaleHolders());
  const [totalCro, setTotalCro] = useState(0);

  useEffect(() => {
    fetch('http://localhost:3025/api/wallets')
      .then(res => res.json())
      .then(data => {
        const total = Number(data.totals?.totalCro || 0);
        setTotalCro(total);

        if (total > 0 && data.holders?.length > 0) {
          const airdropPool = total * 0.20;
          const diamondPool = airdropPool * 0.55;
          const goldPool = airdropPool * 0.30;
          const silverPool = airdropPool * 0.15;

          const eligible = data.holders.filter((h: Holder) => !h.hasSold && h.tier !== 'jeeter');
          const diamondHolders = eligible.filter((h: Holder) => h.tier === 'diamond');
          const goldHolders = eligible.filter((h: Holder) => h.tier === 'gold');
          const silverHolders = eligible.filter((h: Holder) => h.tier === 'silver');

          const diamondTotal = diamondHolders.reduce((s: number, h: Holder) => s + h.percentage, 0);
          const goldTotal = goldHolders.reduce((s: number, h: Holder) => s + h.percentage, 0);
          const silverTotal = silverHolders.reduce((s: number, h: Holder) => s + h.percentage, 0);

          const updated = data.holders.map((h: Holder) => {
            if (h.hasSold || h.tier === 'jeeter') return h;

            let airdrop = 0;
            if (h.tier === 'diamond' && diamondTotal > 0) {
              airdrop = (h.percentage / diamondTotal) * diamondPool;
            } else if (h.tier === 'gold' && goldTotal > 0) {
              airdrop = (h.percentage / goldTotal) * goldPool;
            } else if (h.tier === 'silver' && silverTotal > 0) {
              airdrop = (h.percentage / silverTotal) * silverPool;
            }

            return {
              ...h,
              airdropAmount: Math.round(airdrop * 100) / 100,
              totalWithBoost: Math.round(airdrop * (1 + h.boostPercentage / 100) * 100) / 100,
            };
          });

          setHolders(updated);
        }
      })
      .catch(() => {
        // Keep presale data on error
      });
  }, []);

  return (
    <div>
      <HoldersTable holders={holders} ogAddresses={OG_ADDRESSES} />
      {totalCro > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="glass-card rounded-xl p-4 border border-gold-400/10">
            <div className="flex items-center gap-3 text-sm">
              <div className="text-xl">&#128640;</div>
              <p className="text-gray-400">
                <span className="text-gold-400 font-bold">Live Treasury: </span>
                Airdrop amounts calculated from {totalCro.toFixed(2)} CRO across all wallets.
                Next airdrop distributes {(totalCro * 0.20).toFixed(2)} CRO (20%) as token buybacks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

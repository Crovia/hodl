'use client';

import { useState, useEffect, useMemo } from 'react';
import HoldersTable from '@/components/HoldersTable';
import { Holder, getTier } from '@/lib/types';
import { NAME_MAP } from '@/lib/nameMap';
import { useCronosIds } from '@/hooks/useCronosIds';

const presaleParticipants = [
  { address: '0xAF87e4Df58D735ec2971d2D8Db663B02cA60175D', allocation: 1500 },
  { address: '0x185D93b0F57A22e6cAb7d9F0D4EB657341fF90B3', allocation: 3000 },
  { address: '0x7E3e91b6912042f8FC446385299785Ac2F12C0d0', allocation: 1500 },
  { address: '0x52076D4f01440225e5A8baBB77B3eB1391C617e6', allocation: 1500 },
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
  { address: '0xEce1b63218A249708B521E22BbAA7bAC35F6f20f', allocation: 1500 },
  { address: '0x172B4E1E7c0772c4dBE152914CeF9e9F427c7585', allocation: 1000 },
  { address: '0x87664C30CFba8FE860439bBF94e3521686Dec0de', allocation: 1000 },
  { address: '0xE375805D3FB202d028939bB39D2ba9385FFFFde6', allocation: 1000 },
  { address: '0x5237454DAC7D259Dd88B34cEb17E195Dca0A3F4d', allocation: 1000 },
  { address: '0x0e4eaCc2887A58D157a4A9f036F7499fFcC68831', allocation: 1000 },
  { address: '0x89c132E654699C953C6Ddb4e27e7Cbcd19B13E8a', allocation: 1000 },
  { address: '0x3283b4937D1BBfDa4b24D9f110C5731CE209244e', allocation: 1000 },
  { address: '0x782Bdee22753EA3e5A4C16cBF8887a098D13b432', allocation: 1000 },
  { address: '0x584B5505DE4A4e7393e915b2e44593934D528d63', allocation: 1000 },
  { address: '0xFB28A731959997bf41E57397209BAB78Cd2A0406', allocation: 1000 },
  { address: '0x212246c1bB44C4d70ecC1F6fE64C1Fe68638624F', allocation: 1000 },
  { address: '0xDFB2E6486507A90c820a634F59483470e621Ac4B', allocation: 1000 },
  { address: '0x08C2ceEcA0E01066B4e46081AcC621a34E8e21F1', allocation: 1000 },
  { address: '0x38eB9a99EA4D612F7C516368242FB7DABfFD1A75', allocation: 1000 },
];

const OG_ADDRESSES = presaleParticipants.map(p => p.address);
const TOTAL_PRESALE_CRO = 45000;
const PRESALE_SUPPLY_PCT = 63;

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
  const [treasuryCro, setTreasuryCro] = useState(0);
  const [treasuryHodl, setTreasuryHodl] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      fetch('/api/holders')
        .then(res => res.json())
        .then(data => {
          if (data.holders?.length > 0) {
            const EXCLUDED_FROM_AIRDROP = new Set([
              '0xb4c50913f70b870f68e6143126163ba0e9186ad7', // Liquidity Pool
              '0x185d93b0f57a22e6cab7d9f0d4eb657341ff90b3', // Obsidian Finance
            ]);
            const liveHolders: Holder[] = data.holders.map((h: Holder) => ({
              ...h,
              eligible: !h.hasSold && h.tier !== 'jeeter' && h.tier !== 'bronze' && !EXCLUDED_FROM_AIRDROP.has(h.address.toLowerCase()),
            }));
            setHolders(liveHolders);
          }
          if (data.totals?.totalCro) {
            setTotalCro(Number(data.totals.totalCro));
          }
          if (data.timestamp) setLastUpdated(data.timestamp);
        })
        .catch(() => {});
    };
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/wallets')
      .then(res => res.json())
      .then(data => {
        if (data.wallets) {
          setTreasuryCro(data.wallets.reduce((s: number, w: { croBalance?: string }) => s + parseFloat(w.croBalance || '0'), 0));
          setTreasuryHodl(data.wallets.reduce((s: number, w: { tokenBalance?: string }) => s + parseFloat(w.tokenBalance || '0'), 0));
        }
      })
      .catch(() => {});
  }, []);

  // Filter out sellers — they go on the Jeeters page
  const activeHolders = useMemo(() => holders.filter(h => !h.hasSold && h.tier !== 'jeeter'), [holders]);

  // Resolve Cronos IDs for all holder addresses
  const holderAddresses = useMemo(() => activeHolders.map(h => h.address), [activeHolders]);
  const { cronosIds } = useCronosIds(holderAddresses);

  // Merge: hardcoded name > Cronos ID > nothing (table truncates address itself)
  const mergedNameMap = useMemo(() => {
    const map: Record<string, string> = { ...NAME_MAP };
    for (const [addr, cid] of Object.entries(cronosIds)) {
      if (cid && !map[addr]) {
        map[addr] = cid;
      }
    }
    return map;
  }, [cronosIds]);

  return (
    <div>
      <HoldersTable holders={activeHolders} ogAddresses={OG_ADDRESSES} nameMap={mergedNameMap} treasuryCro={treasuryCro} treasuryHodl={treasuryHodl} lastUpdated={lastUpdated} />
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

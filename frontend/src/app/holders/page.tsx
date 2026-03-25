'use client';

import { useState, useEffect } from 'react';
import HoldersTable from '@/components/HoldersTable';
import { Holder, getTier } from '@/lib/types';

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

// Name map for known addresses
const ADDRESS_NAMES: Record<string, string> = {
  '0xaf87e4df58d735ec2971d2d8db663b02ca60175d': 'Cronos Legends',
  '0x185d93b0f57a22e6cab7d9f0d4eb657341ff90b3': 'Obsidian Finance',
  '0x7e3e91b6912042f8fc446385299785ac2f12c0d0': 'haten.cro',
  '0x52076d4f01440225e5a8babb77b3eb1391c617e6': 'TBK',
  '0x32df940edbf734971af4707fe35f3ade91660358': 'Liberty',
  '0xc3f1087176485ec5518cbc88169205ff26f75702': 'Boula',
  '0x36d21fd7eafa01abc35578ea940c545dce8ac10c': 'Zerokrypto',
  '0x4e730ac6a1a9d53aef0239331d90e0da4642fbb5': 'AarzyK',
  '0x8ad01ed7fc839e9523447ae7d00fba695ef9875f': 'Snapmaster',
  '0x5148e8932a8f9e7bedb04303a12187e56446956c': 'Baas343',
  '0x5034e11bd0e61f2811396324b685cd58d2f6c206': 'Steve',
  '0x2270cbad5072b7685357ec83ddc959ffde535b27': 'Tohmee',
  '0x1d9b981b7aba1a747883833fb8a1b5072eac5d8f': 'Exterminate',
  '0x3b428943ef1c49bf81ddb00f9a11e55811fc7b3c': 'Rdeepanraj',
  '0x499e30aea1540fda665412c779f00c6dd8a6d27d': 'Awerghx',
  '0xd45b551473f1819ef9fc9efa2c654b98eab21850': 'JePu',
  '0x3868150e5ff9ec5b052a36f2d8a5d8bc348b4967': 'Naddy',
  '0xf085359db5df9dfa01ef31a269d5cdf99685bd4a': 'El presidentee',
  '0xece1b63218a249708b521e22bbaa7bac35f6f20f': 'Nicholoco',
  '0x172b4e1e7c0772c4dbe152914cef9e9f427c7585': 'CroSsoulL',
  '0x87664c30cfba8fe860439bbf94e3521686dec0de': 'Kikodog',
  '0xe375805d3fb202d028939bb39d2ba9385ffffde6': 'kajebara',
  '0x5237454dac7d259dd88b34ceb17e195dca0a3f4d': 'Seevin',
  '0x0e4eacc2887a58d157a4a9f036f7499ffcc68831': 'Chiefboss',
  '0x89c132e654699c953c6ddb4e27e7cbcd19b13e8a': 'ArdentVRory',
  '0x3283b4937d1bbfda4b24d9f110c5731ce209244e': 'Nosnah84',
  '0x782bdee22753ea3e5a4c16cbf8887a098d13b432': 'Paysagiste00',
  '0x584b5505de4a4e7393e915b2e44593934d528d63': 'Willys',
  '0xfb28a731959997bf41e57397209bab78cd2a0406': 'sebastiaan',
  '0x212246c1bb44c4d70ecc1f6fe64c1fe68638624f': 'Gmbino',
  '0xdfb2e6486507a90c820a634f59483470e621ac4b': 'CryptoCharlesManson',
  '0x08c2ceeca0e01066b4e46081acc621a34e8e21f1': 'Memeseason',
  '0x38eb9a99ea4d612f7c516368242fb7dabffd1a75': 'Dougie',
};

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

  useEffect(() => {
    const loadData = () => {
      fetch(`/holders-live.json?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.holders?.length > 0) {
            const liveHolders: Holder[] = data.holders.map((h: Holder) => ({
              ...h,
              eligible: !h.hasSold && h.tier !== 'jeeter',
            }));
            setHolders(liveHolders);
          }
          if (data.totals?.totalCro) {
            setTotalCro(Number(data.totals.totalCro));
          }
        })
        .catch(() => {});
    };
    loadData();
    const interval = setInterval(loadData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Fetch wallet totals for USD calculation
  const [treasuryCro, setTreasuryCro] = useState(0);
  const [treasuryHodl, setTreasuryHodl] = useState(0);

  useEffect(() => {
    fetch(`/wallets-live.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.wallets) {
          setTreasuryCro(data.wallets.reduce((s: number, w: { croBalance?: string }) => s + parseFloat(w.croBalance || '0'), 0));
          setTreasuryHodl(data.wallets.reduce((s: number, w: { tokenBalance?: string }) => s + parseFloat(w.tokenBalance || '0'), 0));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <HoldersTable holders={holders} ogAddresses={OG_ADDRESSES} nameMap={ADDRESS_NAMES} treasuryCro={treasuryCro} treasuryHodl={treasuryHodl} />
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

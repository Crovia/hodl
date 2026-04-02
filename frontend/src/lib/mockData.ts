import { Holder, AirdropSnapshot, PoolInfo, getTier, getBoostPercentage } from './types';

function randomAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

function generateHolders(): Holder[] {
  const now = Date.now();
  // hasSold = true means they sold/transferred — permanently jeeter regardless of holdings
  const holders: { pct: number; days: number; hasSold?: boolean }[] = [
    // Diamond tier (1.8%+)
    { pct: 4.2, days: 10 },
    { pct: 3.1, days: 8 },
    { pct: 2.8, days: 7 },
    { pct: 2.5, days: 6 },
    { pct: 2.0, days: 5 },
    // Gold tier (1%+)
    { pct: 1.8, days: 5 },
    { pct: 1.5, days: 4 },
    // Silver tier (0.5%+)
    { pct: 1.3, days: 4 },
    { pct: 1.1, days: 3 },
    { pct: 1.0, days: 3 },
    { pct: 0.9, days: 2 },
    { pct: 0.8, days: 2 },
    { pct: 0.7, days: 1 },
    { pct: 0.6, days: 1 },
    { pct: 0.5, days: 1 },
    // Jeeters (<0.5%) — too small
    { pct: 0.4, days: 1 },
    { pct: 0.3, days: 1 },
    // Sellers — permanently jeeter even with big holdings
    { pct: 3.0, days: 9, hasSold: true },
    { pct: 1.2, days: 5, hasSold: true },
    { pct: 0.8, days: 3, hasSold: true },
  ];

  // No airdrops yet, so airdrop amounts are estimates based on future treasury
  const airdropPool = 48000;
  const diamondPool = airdropPool * 0.55;
  const goldPool = airdropPool * 0.30;
  const silverPool = airdropPool * 0.15;

  // Filter only eligible holders for tier calculations
  const eligible = holders.filter(h => !h.hasSold);
  const diamondHolders = eligible.filter(h => h.pct >= 1.8);
  const goldHolders = eligible.filter(h => h.pct >= 1 && h.pct < 1.8);
  const silverHolders = eligible.filter(h => h.pct >= 0.5 && h.pct < 1);

  return holders.map(h => {
    const hasSold = h.hasSold || false;
    // If sold/transferred, tier is always jeeter
    const tier = hasSold ? 'jeeter' : getTier(h.pct);
    const boost = hasSold ? 0 : getBoostPercentage(h.days);

    let baseAirdrop = 0;
    if (!hasSold) {
      if (tier === 'diamond') {
        const tierTotal = diamondHolders.reduce((s, dh) => s + dh.pct, 0);
        baseAirdrop = (h.pct / tierTotal) * diamondPool;
      } else if (tier === 'gold') {
        const tierTotal = goldHolders.reduce((s, gh) => s + gh.pct, 0);
        baseAirdrop = (h.pct / tierTotal) * goldPool;
      } else if (tier === 'silver') {
        const tierTotal = silverHolders.reduce((s, sh) => s + sh.pct, 0);
        baseAirdrop = (h.pct / tierTotal) * silverPool;
      }
    }

    const totalWithBoost = baseAirdrop * (1 + boost / 100);

    return {
      address: randomAddress(),
      balance: h.pct * 10000000,
      percentage: h.pct,
      tier,
      firstBuyBlock: 1000000 - h.days * 172800,
      firstBuyTimestamp: now - h.days * 86400000,
      holdingDays: h.days,
      airdropAmount: Math.round(baseAirdrop * 100) / 100,
      boostPercentage: boost,
      totalWithBoost: Math.round(totalWithBoost * 100) / 100,
      eligible: !hasSold && tier !== 'jeeter',
      hasSold,
    };
  });
}

export const mockHolders = generateHolders();

export const mockPool: PoolInfo = {
  totalTreasury: 0,
  totalTreasuryUsd: 0,
  airdropAmount: 0,
  airdropAmountUsd: 0,
  distributionPct: 20,
  nextAirdropDate: 'TBA',
  daysUntilAirdrop: 0,
  currentEpoch: 1,
};

// Airdrop #1 — April 2, 2026
// Diamond: 306,350 HODL + 0.0217305 CLG + 211,971.8 OBS each (22 wallets)
// Gold:    371,333 HODL + 0.02634 CLG   + 256,390.08 OBS each (9 wallets)
// Silver:  208,875 HODL + 0.01317 CLG   + 128,195.04 OBS each (9 wallets)
// Prices at snapshot: HODL $0.00002047, CLG $378.37, OBS $0.00003656
const AIRDROP1_HODL_PRICE = 0.00002047;
const AIRDROP1_CLG_PRICE  = 378.37;
const AIRDROP1_OBS_PRICE  = 0.00003656;

function airdrop1Usd(tier: 'diamond' | 'gold' | 'silver'): number {
  const amounts = {
    diamond: { hodl: 306350, clg: 0.0217305, obs: 211971.8 },
    gold:    { hodl: 371333, clg: 0.02634,   obs: 256390.08 },
    silver:  { hodl: 208875, clg: 0.01317,   obs: 128195.04 },
  };
  const a = amounts[tier];
  return a.hodl * AIRDROP1_HODL_PRICE + a.clg * AIRDROP1_CLG_PRICE + a.obs * AIRDROP1_OBS_PRICE;
}

export const PAST_AIRDROPS: {
  date: string;
  recipients: Record<string, { hodl: number; clg: number; obs: number; usd: number }>;
}[] = [
  {
    date: '2026-04-02',
    recipients: {
      // Diamond (22 wallets)
      '0x1d9b981b7aba1a747883833fb8a1b5072eac5d8f': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x5034e11bd0e61f2811396324b685cd58d2f6c206': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x5a96370944c2869b07156e079baf947d8cebb986': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x7614a361217fcfe9a7f5cb8d950b40514d7b45aa': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0xd3ef72e596664443f9368eabc28bea282fc49dfc': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0xc3f1087176485ec5518cbc88169205ff26f75702': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x32df940edbf734971af4707fe35f3ade91660358': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x8ad01ed7fc839e9523447ae7d00fba695ef9875f': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x36d21fd7eafa01abc35578ea940c545dce8ac10c': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x499e30aea1540fda665412c779f00c6dd8a6d27d': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x2270cbad5072b7685357ec83ddc959ffde535b27': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x08c2ceeca0e01066b4e46081acc621a34e8e21f1': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x4e730ac6a1a9d53aef0239331d90e0da4642fbb5': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x5148e8932a8f9e7bedb04303a12187e56446956c': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x3b428943ef1c49bf81ddb00f9a11e55811fc7b3c': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0xd45b551473f1819ef9fc9efa2c654b98eab21850': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0xece1b63218a249708b521e22bbaa7bac35f6f20f': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x3868150e5ff9ec5b052a36f2d8a5d8bc348b4967': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0xf085359db5df9dfa01ef31a269d5cdf99685bd4a': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      '0x7e3e91b6912042f8fc446385299785ac2f12c0d0': { hodl: 306350, clg: 0.0217305, obs: 211971.8, usd: airdrop1Usd('diamond') },
      // Note: rows 1 (Exterminate at pos 2) and 3 are mapped above — Excel had rank 2 & 4 listed but all same amounts
      // Two extra diamond wallets not in NAME_MAP included above (5a963..., d3ef72...)
      // Gold (9 wallets)
      '0x5237454dac7d259dd88b34ceb17e195dca0a3f4d': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      '0x364711325767c86c78169519ca7eb4157edfda33': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      '0x89c132e654699c953c6ddb4e27e7cbcd19b13e8a': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      '0x3283b4937d1bbfda4b24d9f110c5731ce209244e': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      '0x45d7032650c6a87804dbc7d226bb6c208393657e': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      '0xcf9af9549e9428607f8b499692b71586c8795654': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      '0x343ad5e2d2e252ab6fd2aa11bf912db3f68b69aa': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      '0x1577c2f0269eda2780e6bab008400780c0fe3dd2': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      '0x38eb9a99ea4d612f7c516368242fb7dabffd1a75': { hodl: 371333, clg: 0.02634, obs: 256390.08, usd: airdrop1Usd('gold') },
      // Silver (9 wallets — note: 0x4c766... was in original list but replaced by 0x100e831... in final)
      '0x4331a800cb0b8a6c8838458b692d263bf2c62271': { hodl: 208875, clg: 0.01317, obs: 128195.04, usd: airdrop1Usd('silver') },
      '0x9a62ddf4d3860780182ec79e0c97eb62a98a94f1': { hodl: 208875, clg: 0.01317, obs: 128195.04, usd: airdrop1Usd('silver') },
      '0x8871bbe99c1aace0d3fe1752b032e3b6057ac5a2': { hodl: 208875, clg: 0.01317, obs: 128195.04, usd: airdrop1Usd('silver') },
      '0x5fbd4a9de7b99a69a1d331a9e6a35aadab897e23': { hodl: 208875, clg: 0.01317, obs: 128195.04, usd: airdrop1Usd('silver') },
      '0x19610fd5779a1661d1f6d63d5095fb115aa4da20': { hodl: 208875, clg: 0.01317, obs: 128195.04, usd: airdrop1Usd('silver') },
      '0x100e831b2d5fdcbea4b7b0851281931414c15c47': { hodl: 208875, clg: 0.01317, obs: 128195.04, usd: airdrop1Usd('silver') },
      '0x385f3a38f4962327a1356600e61a1e1e7be3fdbe': { hodl: 208875, clg: 0.01317, obs: 128195.04, usd: airdrop1Usd('silver') },
      '0xf8ed3a12832b106b0edc947b007c64439ad74402': { hodl: 208875, clg: 0.01317, obs: 128195.04, usd: airdrop1Usd('silver') },
    },
  },
];

export const mockSnapshots: AirdropSnapshot[] = [
  {
    id: 1,
    snapshotDate: '2026-04-02T18:32:50.000Z',
    treasuryTotal: 0,
    airdropDistributed: 0,
    holders: [],
    distributed: true,
  },
];

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
    // Diamond tier (2%+)
    { pct: 4.2, days: 10 },
    { pct: 3.1, days: 8 },
    { pct: 2.8, days: 7 },
    { pct: 2.5, days: 6 },
    { pct: 2.0, days: 5 },
    // Gold tier (1.5%+)
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
  const diamondPool = airdropPool * 0.50;
  const goldPool = airdropPool * 0.30;
  const silverPool = airdropPool * 0.20;

  // Filter only eligible holders for tier calculations
  const eligible = holders.filter(h => !h.hasSold);
  const diamondHolders = eligible.filter(h => h.pct >= 2.12);
  const goldHolders = eligible.filter(h => h.pct >= 1.5 && h.pct < 2.12);
  const silverHolders = eligible.filter(h => h.pct >= 0.5 && h.pct < 1.5);

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

export const mockSnapshots: AirdropSnapshot[] = [];

export interface Holder {
  address: string;
  balance: number;
  percentage: number;
  tier: 'diamond' | 'gold' | 'silver' | 'jeeter';
  firstBuyBlock: number;
  firstBuyTimestamp: number;
  holdingDays: number;
  airdropAmount: number;
  boostPercentage: number;
  totalWithBoost: number;
  eligible: boolean;
  hasSold: boolean;
}

export interface AirdropSnapshot {
  id: number;
  snapshotDate: string;
  treasuryTotal: number;
  airdropDistributed: number; // 20% that was sent
  holders: Holder[];
  distributed: boolean;
}

export interface PoolInfo {
  totalTreasury: number;
  totalTreasuryUsd: number;
  airdropAmount: number;     // 20% of treasury
  airdropAmountUsd: number;
  distributionPct: number;   // 20
  nextAirdropDate: string;
  daysUntilAirdrop: number;
  currentEpoch: number;
}

export function getTier(percentage: number): Holder['tier'] {
  if (percentage >= 2) return 'diamond';
  if (percentage >= 1.5) return 'gold';
  // Jeeter is not a tier — it's assigned only when a wallet sells/transfers
  return 'silver';
}

export function getTierLabel(tier: Holder['tier']): string {
  switch (tier) {
    case 'diamond': return 'Diamond Hands';
    case 'gold': return 'Gold Hands';
    case 'silver': return 'Silver Hands';
    case 'jeeter': return 'Jeeter';
  }
}

export function getBoostPercentage(holdingDays: number): number {
  // +3% boost for every 10 days held, starting at day 10
  const periods = Math.floor(holdingDays / 10);
  if (periods < 1) return 0;
  return periods * 3;
}

export function getTierShare(tier: Holder['tier']): number {
  switch (tier) {
    case 'diamond': return 50;
    case 'gold': return 30;
    case 'silver': return 20;
    case 'jeeter': return 0;
  }
}

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { CONFIG } from './config';

const ERC20_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

interface WalletBalance {
  id: string;
  token: string;
  address: string;
  allocation: number;
  croBalance: string;
  tokenBalance: string;
}

interface HolderRecord {
  address: string;
  balance: string;
  percentage: number;
  tier: 'diamond' | 'gold' | 'silver' | 'jeeter';
  firstSeen: number; // block number
  holdingDays: number;
  hasSold: boolean;
  airdropAmount: number;
  boostPercentage: number;
  totalWithBoost: number;
}

interface Snapshot {
  epoch: number;
  timestamp: string;
  blockNumber: number;
  totalSupply: string;
  taxPoolBalance: string;
  walletBalances: WalletBalance[];
  totalWalletsCro: string;
  totalWalletsToken: string;
  airdropAmountCro: string;   // 20% of total
  airdropAmountToken: string; // 20% of total
  distributionPct: number;
  holders: HolderRecord[];
}

function ensureDataDir() {
  const dir = path.resolve(CONFIG.DATA_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const snapshotsDir = path.join(dir, 'snapshots');
  if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir, { recursive: true });
  return { dir, snapshotsDir };
}

function loadSellers(): Set<string> {
  const { dir } = ensureDataDir();
  const sellersFile = path.join(dir, 'sellers.json');
  if (fs.existsSync(sellersFile)) {
    return new Set(JSON.parse(fs.readFileSync(sellersFile, 'utf-8')));
  }
  return new Set();
}

function saveSellers(sellers: Set<string>) {
  const { dir } = ensureDataDir();
  fs.writeFileSync(path.join(dir, 'sellers.json'), JSON.stringify([...sellers], null, 2));
}

function getTier(percentage: number): HolderRecord['tier'] {
  if (percentage >= CONFIG.TIERS.DIAMOND) return 'diamond';
  if (percentage >= CONFIG.TIERS.GOLD) return 'gold';
  if (percentage >= CONFIG.TIERS.SILVER) return 'silver';
  return 'jeeter';
}

function getBoost(holdingDays: number): number {
  const periods = Math.floor(holdingDays / CONFIG.BOOST_PERIOD_DAYS);
  if (periods < 2) return 0;
  return (periods - 1) * CONFIG.BOOST_PER_PERIOD;
}

function getEpoch(): number {
  const { snapshotsDir } = ensureDataDir();
  const files = fs.readdirSync(snapshotsDir).filter(f => f.endsWith('.json'));
  return files.length + 1;
}

async function getProviderWithFallback(): Promise<ethers.JsonRpcProvider> {
  const primary = new ethers.JsonRpcProvider(CONFIG.RPC_PRIMARY);
  try {
    await primary.getBlockNumber(); // test connectivity
    return primary;
  } catch (err) {
    console.warn(`Primary RPC failed (${CONFIG.RPC_PRIMARY}), falling back to ${CONFIG.RPC_FALLBACK}`);
    return new ethers.JsonRpcProvider(CONFIG.RPC_FALLBACK);
  }
}

export async function takeSnapshot() {
  console.log('Taking snapshot...');
  const provider = await getProviderWithFallback();
  const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ERC20_ABI, provider);

  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  const totalSupplyNum = Number(ethers.formatUnits(totalSupply, decimals));

  // Get tax pool balance
  const taxBalance = await token.balanceOf(CONFIG.TAX_WALLET);

  // Fetch balances of all 3 buyback wallets
  console.log('Fetching buyback wallet balances...');
  const walletBalances: WalletBalance[] = [];

  for (const [key, wallet] of Object.entries(CONFIG.BUYBACK_WALLETS)) {
    const croBalance = await provider.getBalance(wallet.address);
    const tokenBal = await token.balanceOf(wallet.address);

    walletBalances.push({
      id: key,
      token: wallet.token,
      address: wallet.address,
      allocation: wallet.allocation,
      croBalance: ethers.formatEther(croBalance),
      tokenBalance: ethers.formatUnits(tokenBal, decimals),
    });
  }

  const totalWalletsCro = walletBalances.reduce((s, w) => s + Number(w.croBalance), 0);
  const totalWalletsToken = walletBalances.reduce((s, w) => s + Number(w.tokenBalance), 0);
  const distPct = CONFIG.AIRDROP_DISTRIBUTION_PCT / 100; // 0.20

  // 20% of wallet totals = airdrop amount this epoch
  const airdropCro = totalWalletsCro * distPct;
  const airdropToken = totalWalletsToken * distPct;

  // Scan Transfer events to find all holders
  console.log('Scanning transfer events...');
  const filter = token.filters.Transfer();
  const holders = new Map<string, { balance: bigint; firstSeen: number }>();
  const sellers = loadSellers();

  // Exclude buyback wallet addresses from seller tracking
  const buybackAddresses = new Set(
    Object.values(CONFIG.BUYBACK_WALLETS).map(w => w.address.toLowerCase())
  );

  // Scan in chunks of 2000 blocks (Cronos limit)
  const CHUNK_SIZE = 2000;
  const lookbackBlock = blockNumber - 172800 * 60; // ~60 days of blocks at 0.5s
  const START_BLOCK = Math.max(CONFIG.DEPLOY_BLOCK, lookbackBlock);

  for (let from = Math.max(0, START_BLOCK); from <= blockNumber; from += CHUNK_SIZE) {
    const to = Math.min(from + CHUNK_SIZE - 1, blockNumber);
    try {
      const events = await token.queryFilter(filter, from, to);
      for (const event of events) {
        const log = event as ethers.EventLog;
        const [fromAddr, toAddr] = log.args;
        const fromLower = fromAddr.toLowerCase();
        const toLower = toAddr.toLowerCase();

        // Track sellers — exclude zero address, tax wallet, and buyback wallets
        if (
          fromAddr !== ethers.ZeroAddress &&
          fromLower !== CONFIG.TAX_WALLET.toLowerCase() &&
          !buybackAddresses.has(fromLower)
        ) {
          sellers.add(fromLower);
        }

        // Track first seen
        if (!holders.has(toLower)) {
          holders.set(toLower, { balance: 0n, firstSeen: log.blockNumber });
        }
        if (!holders.has(fromLower)) {
          holders.set(fromLower, { balance: 0n, firstSeen: log.blockNumber });
        }
      }
    } catch (err) {
      console.error(`Error scanning blocks ${from}-${to}:`, err);
    }
  }

  // Get current balances for all holders
  console.log(`Fetching balances for ${holders.size} addresses...`);
  const holderRecords: HolderRecord[] = [];

  // Addresses to exclude from holder list
  const excludeAddresses = new Set([
    ethers.ZeroAddress,
    CONFIG.TAX_WALLET.toLowerCase(),
    ...buybackAddresses,
  ]);

  for (const [address, info] of holders) {
    if (excludeAddresses.has(address)) continue;

    try {
      const balance = await token.balanceOf(address);
      if (balance === 0n) continue;

      const balanceNum = Number(ethers.formatUnits(balance, decimals));
      const percentage = (balanceNum / totalSupplyNum) * 100;
      const tier = getTier(percentage);

      const blocksDiff = blockNumber - info.firstSeen;
      const holdingDays = Math.floor(blocksDiff / 172800);

      const hasSold = sellers.has(address);
      const boost = hasSold ? 0 : getBoost(holdingDays);

      holderRecords.push({
        address,
        balance: ethers.formatUnits(balance, decimals),
        percentage: Math.round(percentage * 10000) / 10000,
        tier,
        firstSeen: info.firstSeen,
        holdingDays,
        hasSold,
        airdropAmount: 0,
        boostPercentage: boost,
        totalWithBoost: 0,
      });
    } catch {
      // Skip failed balance checks
    }
  }

  // Calculate airdrop amounts based on 20% of wallet totals
  // Diamond 55%, Gold 30%, Silver 15%
  const diamondPool = airdropCro * 0.55;
  const goldPool = airdropCro * 0.30;
  const silverPool = airdropCro * 0.15;

  const tierPools: Record<string, number> = { diamond: diamondPool, gold: goldPool, silver: silverPool };

  const tiers: Record<string, HolderRecord[]> = {
    diamond: holderRecords.filter(h => h.tier === 'diamond' && !h.hasSold),
    gold: holderRecords.filter(h => h.tier === 'gold' && !h.hasSold),
    silver: holderRecords.filter(h => h.tier === 'silver' && !h.hasSold),
  };

  for (const [tierName, tierHolders] of Object.entries(tiers)) {
    const totalPct = tierHolders.reduce((s, h) => s + h.percentage, 0);
    if (totalPct === 0) continue;
    const pool = tierPools[tierName] || 0;

    for (const holder of tierHolders) {
      holder.airdropAmount = Math.round(((holder.percentage / totalPct) * pool) * 100) / 100;
      holder.totalWithBoost = Math.round(holder.airdropAmount * (1 + holder.boostPercentage / 100) * 100) / 100;
    }
  }

  // Sort by percentage desc
  holderRecords.sort((a, b) => b.percentage - a.percentage);

  const snapshot: Snapshot = {
    epoch: getEpoch(),
    timestamp: new Date().toISOString(),
    blockNumber,
    totalSupply: ethers.formatUnits(totalSupply, decimals),
    taxPoolBalance: ethers.formatUnits(taxBalance, decimals),
    walletBalances,
    totalWalletsCro: totalWalletsCro.toFixed(4),
    totalWalletsToken: totalWalletsToken.toFixed(4),
    airdropAmountCro: airdropCro.toFixed(4),
    airdropAmountToken: airdropToken.toFixed(4),
    distributionPct: CONFIG.AIRDROP_DISTRIBUTION_PCT,
    holders: holderRecords,
  };

  // Save
  const { snapshotsDir } = ensureDataDir();
  const filename = `epoch-${snapshot.epoch}-${block?.timestamp || Date.now()}.json`;
  fs.writeFileSync(path.join(snapshotsDir, filename), JSON.stringify(snapshot, null, 2));
  saveSellers(sellers);

  console.log(`\nSnapshot #${snapshot.epoch} saved:`);
  console.log(`  Block: ${blockNumber}`);
  console.log(`  Holders: ${holderRecords.length}`);
  console.log(`  Tax pool: ${ethers.formatUnits(taxBalance, decimals)} $HODL`);
  console.log(`  Wallet totals: ${totalWalletsCro.toFixed(2)} CRO / ${totalWalletsToken.toFixed(2)} $HODL`);
  console.log(`  Airdrop (20%): ${airdropCro.toFixed(2)} CRO / ${airdropToken.toFixed(2)} $HODL`);
  console.log(`  Diamond: ${tiers.diamond.length}, Gold: ${tiers.gold.length}, Silver: ${tiers.silver.length}`);
  console.log(`  Disqualified (sold): ${holderRecords.filter(h => h.hasSold).length}`);

  return snapshot;
}

// Run directly
if (require.main === module) {
  takeSnapshot().catch(console.error);
}

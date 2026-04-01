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
  tier: 'diamond' | 'gold' | 'silver' | 'bronze' | 'jeeter';
  firstSeen: number; // block number
  firstBuyTime: string; // ISO timestamp
  lastSellTime?: string; // ISO timestamp
  holdingDays: number;
  hasSold: boolean;
  airdropAmount: number;
  boostPercentage: number;
  totalWithBoost: number;
  totalReceived: string;
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
  // Below silver threshold — bronze hands. "jeeter" is only assigned based on hasSold, not holding amount
  return 'bronze';
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
  const holders = new Map<string, { balance: bigint; firstSeen: number; totalReceived: bigint; lastSellBlock: number }>();
  const sellers = loadSellers();

  // Exclude buyback wallet addresses and DEX pair from seller tracking
  const buybackAddresses = new Set(
    Object.values(CONFIG.BUYBACK_WALLETS).map(w => w.address.toLowerCase())
  );
  const excludeFromSellers = new Set([
    ...buybackAddresses,
    CONFIG.DEX_PAIR.toLowerCase(),
    CONFIG.TOKEN_ADDRESS.toLowerCase(),
    CONFIG.CREATOR_WALLET.toLowerCase(),
  ]);

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
        const [fromAddr, toAddr, value] = log.args;
        const amount = BigInt(value || 0n);
        const fromLower = fromAddr.toLowerCase();
        const toLower = toAddr.toLowerCase();

        // Track sellers — only count as sell if transferring TO the DEX pair (actual DEX sell).
        // Tax deductions, p2p transfers, and contract-internal moves are NOT counted as sells.
        if (
          fromAddr !== ethers.ZeroAddress &&
          !excludeFromSellers.has(fromLower) &&
          toLower === CONFIG.DEX_PAIR.toLowerCase()
        ) {
          sellers.add(fromLower);
          // Track last sell block
          const fromInfo = holders.get(fromLower);
          if (fromInfo) {
            fromInfo.lastSellBlock = log.blockNumber;
          }
        }

        // Track first seen
        if (!holders.has(toLower)) {
          holders.set(toLower, { balance: 0n, firstSeen: log.blockNumber, totalReceived: 0n, lastSellBlock: 0 });
        }
        if (!holders.has(fromLower)) {
          holders.set(fromLower, { balance: 0n, firstSeen: log.blockNumber, totalReceived: 0n, lastSellBlock: 0 });
        }
        // Accumulate total received — only count real transfers (not tax/contract internal)
        if (
          fromAddr !== ethers.ZeroAddress &&
          fromLower !== CONFIG.TOKEN_ADDRESS.toLowerCase() &&
          fromLower !== CONFIG.TAX_WALLET.toLowerCase()
        ) {
          const toInfo = holders.get(toLower)!;
          toInfo.totalReceived += amount;
        }
      }
    } catch (err) {
      console.error(`Error scanning blocks ${from}-${to}:`, err);
    }
  }

  // Load previous snapshot for fallback data
  const prevDir = ensureDataDir().snapshotsDir;
  const prevFiles = fs.readdirSync(prevDir).filter(f => f.endsWith('.json')).sort((a, b) => {
    const ea = parseInt(a.match(/epoch-(\d+)-/)?.[1] || '0');
    const eb = parseInt(b.match(/epoch-(\d+)-/)?.[1] || '0');
    return eb - ea;
  });
  const prevHolders = new Map<string, HolderRecord>();
  if (prevFiles.length > 0) {
    try {
      const prev = JSON.parse(fs.readFileSync(path.join(prevDir, prevFiles[0]), 'utf-8'));
      for (const h of prev.holders || []) {
        prevHolders.set(h.address.toLowerCase(), h);
      }
    } catch {}
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
      // Retry balance fetch up to 3 times
      let balance = 0n;
      let fetchSuccess = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          balance = await token.balanceOf(address);
          fetchSuccess = true;
          break;
        } catch {
          if (attempt < 2) await new Promise(r => setTimeout(r, 500));
        }
      }
      if (!fetchSuccess) {
        // Use previous snapshot data if available
        const prev = prevHolders.get(address);
        if (prev) {
          holderRecords.push(prev);
        }
        continue;
      }
      const isSeller = sellers.has(address);
      if (balance === 0n && !isSeller) continue;

      const balanceNum = Number(ethers.formatUnits(balance, decimals));
      const percentage = (balanceNum / totalSupplyNum) * 100;
      const tier = getTier(percentage);

      const blocksDiff = blockNumber - info.firstSeen;
      const holdingDays = Math.floor(blocksDiff / 172800);
      const secondsDiff = blocksDiff * 0.5;
      const firstBuyTimestamp = (block?.timestamp || Math.floor(Date.now() / 1000)) - secondsDiff;
      const firstBuyTime = new Date(firstBuyTimestamp * 1000).toISOString();

      const hasSold = sellers.has(address);
      const boost = hasSold ? 0 : getBoost(holdingDays);
      const finalTier = hasSold ? 'jeeter' as const : tier;

      let lastSellTime: string | undefined;
      if (hasSold && info.lastSellBlock > 0) {
        const sellSecondsDiff = (blockNumber - info.lastSellBlock) * 0.5;
        const sellTimestamp = (block?.timestamp || Math.floor(Date.now() / 1000)) - sellSecondsDiff;
        lastSellTime = new Date(sellTimestamp * 1000).toISOString();
      }

      holderRecords.push({
        address,
        balance: ethers.formatUnits(balance, decimals),
        percentage: Math.round(percentage * 10000) / 10000,
        tier: finalTier,
        firstSeen: info.firstSeen,
        firstBuyTime,
        lastSellTime,
        holdingDays,
        hasSold,
        airdropAmount: 0,
        boostPercentage: boost,
        totalWithBoost: 0,
        totalReceived: ethers.formatUnits(info.totalReceived, decimals),
      });
    } catch {
      // Fall back to previous snapshot data
      const prev = prevHolders.get(address);
      if (prev) {
        holderRecords.push(prev);
      }
    }
  }

  // Calculate airdrop amounts based on 20% of wallet totals
  // Diamond 55%, Gold 30%, Silver 15% — Bronze is visual only (no pool)
  const diamondPool = airdropCro * 0.55;
  const goldPool = airdropCro * 0.30;
  const silverPool = airdropCro * 0.15;

  const tierPools: Record<string, number> = { diamond: diamondPool, gold: goldPool, silver: silverPool };

  const excludeFromRewards = new Set(CONFIG.EXCLUDE_FROM_REWARDS.map(a => a.toLowerCase()));

  const tiers: Record<string, HolderRecord[]> = {
    diamond: holderRecords.filter(h => h.tier === 'diamond' && !h.hasSold && !excludeFromRewards.has(h.address)),
    gold: holderRecords.filter(h => h.tier === 'gold' && !h.hasSold && !excludeFromRewards.has(h.address)),
    silver: holderRecords.filter(h => h.tier === 'silver' && !h.hasSold && !excludeFromRewards.has(h.address)),
  };

  for (const [tierName, tierHolders] of Object.entries(tiers)) {
    if (tierHolders.length === 0) continue;
    const pool = tierPools[tierName] || 0;
    // Equal split within tier — everyone in the tier gets the same amount
    const perPerson = Math.round((pool / tierHolders.length) * 100) / 100;

    for (const holder of tierHolders) {
      holder.airdropAmount = perPerson;
      holder.totalWithBoost = Math.round(perPerson * (1 + holder.boostPercentage / 100) * 100) / 100;
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

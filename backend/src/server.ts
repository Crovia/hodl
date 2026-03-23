import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as fs from 'fs';
import * as path from 'path';
import { ethers } from 'ethers';
import { CONFIG } from './config';

const app = Fastify({ logger: true });

app.register(cors, { origin: true });

const DATA_DIR = path.resolve(CONFIG.DATA_DIR);
const SNAPSHOTS_DIR = path.join(DATA_DIR, 'snapshots');

// Ensure dirs exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// GET /api/config — public config info
app.get('/api/config', async () => {
  return {
    tokenAddress: CONFIG.TOKEN_ADDRESS,
    taxWallet: CONFIG.TAX_WALLET,
    airdropCycleDays: CONFIG.AIRDROP_CYCLE_DAYS,
    airdropDistributionPct: CONFIG.AIRDROP_DISTRIBUTION_PCT,
    tiers: CONFIG.TIERS,
    buybackWallets: Object.entries(CONFIG.BUYBACK_WALLETS).map(([key, w]) => ({
      id: key,
      token: w.token,
      address: w.address,
      allocation: w.allocation,
    })),
    boostPerPeriod: CONFIG.BOOST_PER_PERIOD,
    boostPeriodDays: CONFIG.BOOST_PERIOD_DAYS,
  };
});

// GET /api/wallets — live balances of the 3 buyback wallets
app.get('/api/wallets', async () => {
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  const wallets = [];

  for (const [key, wallet] of Object.entries(CONFIG.BUYBACK_WALLETS)) {
    try {
      // Get native CRO balance
      const croBalance = await provider.getBalance(wallet.address);
      const croFormatted = ethers.formatEther(croBalance);

      // Get JUICE token balance if token address is set
      let tokenBalance = '0';
      if (CONFIG.TOKEN_ADDRESS !== '0x0000000000000000000000000000000000000000') {
        const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ERC20_ABI, provider);
        const decimals = await token.decimals();
        const bal = await token.balanceOf(wallet.address);
        tokenBalance = ethers.formatUnits(bal, decimals);
      }

      wallets.push({
        id: key,
        token: wallet.token,
        address: wallet.address,
        allocation: wallet.allocation,
        croBalance: croFormatted,
        tokenBalance,
      });
    } catch (err) {
      wallets.push({
        id: key,
        token: wallet.token,
        address: wallet.address,
        allocation: wallet.allocation,
        croBalance: '0',
        tokenBalance: '0',
        error: 'Failed to fetch balance',
      });
    }
  }

  // Calculate total across wallets and 20% airdrop amount
  const totalCro = wallets.reduce((s, w) => s + Number(w.croBalance), 0);
  const totalToken = wallets.reduce((s, w) => s + Number(w.tokenBalance), 0);
  const airdropPct = CONFIG.AIRDROP_DISTRIBUTION_PCT / 100;

  return {
    wallets,
    totals: {
      totalCro: totalCro.toFixed(4),
      totalToken: totalToken.toFixed(4),
      airdropCro: (totalCro * airdropPct).toFixed(4),
      airdropToken: (totalToken * airdropPct).toFixed(4),
      distributionPct: CONFIG.AIRDROP_DISTRIBUTION_PCT,
    },
  };
});

// GET /api/snapshots — list all snapshots
app.get('/api/snapshots', async () => {
  const files = fs.readdirSync(SNAPSHOTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, f), 'utf-8'));
    return {
      epoch: data.epoch,
      timestamp: data.timestamp,
      blockNumber: data.blockNumber,
      holderCount: data.holders?.length || 0,
      taxPool: data.taxPoolBalance,
      walletBalances: data.walletBalances || null,
      filename: f,
    };
  });
});

// GET /api/snapshots/:epoch — get specific snapshot
app.get<{ Params: { epoch: string } }>('/api/snapshots/:epoch', async (req, reply) => {
  const epoch = parseInt(req.params.epoch);
  const files = fs.readdirSync(SNAPSHOTS_DIR).filter(f => f.startsWith(`epoch-${epoch}-`));

  if (files.length === 0) {
    reply.status(404);
    return { error: 'Snapshot not found' };
  }

  return JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, files[0]), 'utf-8'));
});

// GET /api/holders — get latest holder list
app.get('/api/holders', async () => {
  const files = fs.readdirSync(SNAPSHOTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    return { holders: [], message: 'No snapshots yet' };
  }

  const latest = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, files[0]), 'utf-8'));
  return {
    epoch: latest.epoch,
    timestamp: latest.timestamp,
    holders: latest.holders,
  };
});

// GET /api/holder/:address — get specific holder info
app.get<{ Params: { address: string } }>('/api/holder/:address', async (req, reply) => {
  const address = req.params.address.toLowerCase();
  const files = fs.readdirSync(SNAPSHOTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    reply.status(404);
    return { error: 'No snapshots yet' };
  }

  const latest = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, files[0]), 'utf-8'));
  const holder = latest.holders?.find((h: any) => h.address.toLowerCase() === address);

  if (!holder) {
    reply.status(404);
    return { error: 'Holder not found' };
  }

  // Get history across all snapshots
  const history = files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, f), 'utf-8'));
    const h = data.holders?.find((h: any) => h.address.toLowerCase() === address);
    return h ? { epoch: data.epoch, timestamp: data.timestamp, ...h } : null;
  }).filter(Boolean);

  return { current: holder, history };
});

// GET /api/sellers — list of wallets that have sold
app.get('/api/sellers', async () => {
  const sellersFile = path.join(DATA_DIR, 'sellers.json');
  if (fs.existsSync(sellersFile)) {
    return JSON.parse(fs.readFileSync(sellersFile, 'utf-8'));
  }
  return [];
});

// GET /api/pool — current pool info with wallet breakdown
app.get('/api/pool', async () => {
  const files = fs.readdirSync(SNAPSHOTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  const currentEpoch = files.length + 1;
  const lastSnapshot = files.length > 0
    ? JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, files[0]), 'utf-8'))
    : null;

  const lastDate = lastSnapshot ? new Date(lastSnapshot.timestamp) : new Date();
  const nextAirdrop = new Date(lastDate.getTime() + CONFIG.AIRDROP_CYCLE_DAYS * 86400000);
  const daysUntil = Math.max(0, Math.ceil((nextAirdrop.getTime() - Date.now()) / 86400000));

  return {
    currentEpoch,
    nextAirdropDate: nextAirdrop.toISOString(),
    daysUntilAirdrop: daysUntil,
    distributionPct: CONFIG.AIRDROP_DISTRIBUTION_PCT,
    lastSnapshot: lastSnapshot ? {
      epoch: lastSnapshot.epoch,
      timestamp: lastSnapshot.timestamp,
      taxPool: lastSnapshot.taxPoolBalance,
      holderCount: lastSnapshot.holders?.length || 0,
      walletBalances: lastSnapshot.walletBalances || null,
    } : null,
    buybackWallets: Object.entries(CONFIG.BUYBACK_WALLETS).map(([key, w]) => ({
      id: key,
      token: w.token,
      address: w.address,
      allocation: w.allocation,
    })),
  };
});

async function start() {
  try {
    await app.listen({ port: CONFIG.PORT, host: '0.0.0.0' });
    console.log(`DiamondHands API running on port ${CONFIG.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

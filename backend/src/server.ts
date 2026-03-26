import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as fs from 'fs';
import * as path from 'path';
import { ethers } from 'ethers';
import { CONFIG } from './config';
import { takeSnapshot } from './snapshot';

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
  const provider = await getProviderWithFallback();
  const wallets = [];

  for (const [key, wallet] of Object.entries(CONFIG.BUYBACK_WALLETS)) {
    try {
      // Get native CRO balance
      const croBalance = await provider.getBalance(wallet.address);
      const croFormatted = ethers.formatEther(croBalance);

      // Get $HODL token balance if token address is set
      let tokenBalance = '0';
      if (CONFIG.TOKEN_ADDRESS !== '0x0000000000000000000000000000000000000000') {
        const token = new ethers.Contract(CONFIG.TOKEN_ADDRESS, ERC20_ABI, provider);
        const decimals = await token.decimals();
        const bal = await token.balanceOf(wallet.address);
        tokenBalance = ethers.formatUnits(bal, decimals);
      }

      // Get $CLG balance for the CLG wallet
      let clgBalance = '0';
      const CLG_ADDRESS = '0xa40764b6878e6eb86fac5de4f1f1a80aa6fc67fe';
      try {
        const clgToken = new ethers.Contract(CLG_ADDRESS, ERC20_ABI, provider);
        const clgDecimals = await clgToken.decimals();
        const clgBal = await clgToken.balanceOf(wallet.address);
        clgBalance = ethers.formatUnits(clgBal, clgDecimals);
      } catch { /* CLG not available */ }

      wallets.push({
        id: key,
        token: wallet.token,
        address: wallet.address,
        allocation: wallet.allocation,
        croBalance: croFormatted,
        tokenBalance,
        clgBalance,
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
    timestamp: new Date().toISOString(),
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
    totals: {
      totalCro: latest.totalWalletsCro,
      totalToken: latest.totalWalletsToken,
      airdropCro: latest.airdropAmountCro,
      airdropToken: latest.airdropAmountToken,
      distributionPct: latest.distributionPct,
    },
    wallets: latest.walletBalances,
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

/** Create a provider with fallback: tries RPC_PRIMARY first, then RPC_FALLBACK */
function createProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(CONFIG.RPC_PRIMARY);
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

// --- Auto-snapshot scheduler ---
const SNAPSHOT_INTERVAL_MS = 1 * 60 * 60 * 1000; // 1 hour
const FRONTEND_PUBLIC = path.resolve(__dirname, '../../frontend/public');
let snapshotRunning = false;

// POST /api/snapshot — trigger manual snapshot
app.post('/api/snapshot', async (req, reply) => {
  if (snapshotRunning) {
    reply.status(409);
    return { error: 'Snapshot already in progress' };
  }
  runAutoSnapshot();
  return { message: 'Snapshot started', status: 'running' };
});

// GET /api/snapshot/status — check if snapshot is running
app.get('/api/snapshot/status', async () => {
  return { running: snapshotRunning };
});

async function runAutoSnapshot() {
  if (snapshotRunning) {
    console.log('[auto-snapshot] Already running, skipping');
    return;
  }
  snapshotRunning = true;
  try {
    console.log('[auto-snapshot] Starting scheduled snapshot...');
    const snapshot = await takeSnapshot();

    // Update frontend static JSON files
    const holdersLive = {
      epoch: snapshot.epoch,
      timestamp: snapshot.timestamp,
      holders: snapshot.holders,
      totals: {
        totalCro: snapshot.totalWalletsCro,
        totalToken: snapshot.totalWalletsToken,
        airdropCro: snapshot.airdropAmountCro,
        airdropToken: snapshot.airdropAmountToken,
      },
    };

    const walletsLive = {
      timestamp: new Date().toISOString(),
      wallets: snapshot.walletBalances,
      totals: {
        totalCro: snapshot.totalWalletsCro,
        totalToken: snapshot.totalWalletsToken,
        airdropCro: snapshot.airdropAmountCro,
        airdropToken: snapshot.airdropAmountToken,
        distributionPct: snapshot.distributionPct,
      },
    };

    if (fs.existsSync(FRONTEND_PUBLIC)) {
      fs.writeFileSync(path.join(FRONTEND_PUBLIC, 'holders-live.json'), JSON.stringify(holdersLive, null, 2));
      fs.writeFileSync(path.join(FRONTEND_PUBLIC, 'wallets-live.json'), JSON.stringify(walletsLive, null, 2));
      console.log(`[auto-snapshot] Updated frontend static files (epoch ${snapshot.epoch})`);
    } else {
      console.warn('[auto-snapshot] Frontend public dir not found, skipping static file update');
    }

    console.log(`[auto-snapshot] Complete — epoch ${snapshot.epoch}, ${snapshot.holders.length} holders`);
  } catch (err) {
    console.error('[auto-snapshot] Failed:', err);
  } finally {
    snapshotRunning = false;
  }
}

async function start() {
  // Startup validation
  if (CONFIG.TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
    console.warn('WARNING: TOKEN_ADDRESS not set - holder tracking disabled');
  }

  try {
    await app.listen({ port: CONFIG.PORT, host: '0.0.0.0' });
    console.log(`DiamondHands API running on port ${CONFIG.PORT}`);

    // Run first snapshot 30s after boot, then every 6 hours
    setTimeout(() => {
      runAutoSnapshot();
      setInterval(runAutoSnapshot, SNAPSHOT_INTERVAL_MS);
    }, 30_000);
    console.log(`[auto-snapshot] Scheduled: first run in 30s, then every 6 hours`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

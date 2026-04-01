"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ethers_1 = require("ethers");
const config_1 = require("./config");
const app = (0, fastify_1.default)({ logger: true });
app.register(cors_1.default, { origin: true });
const DATA_DIR = path.resolve(config_1.CONFIG.DATA_DIR);
const SNAPSHOTS_DIR = path.join(DATA_DIR, 'snapshots');
// Ensure dirs exist
if (!fs.existsSync(DATA_DIR))
    fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SNAPSHOTS_DIR))
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
];
// GET /api/config — public config info
app.get('/api/config', async () => {
    return {
        tokenAddress: config_1.CONFIG.TOKEN_ADDRESS,
        taxWallet: config_1.CONFIG.TAX_WALLET,
        airdropCycleDays: config_1.CONFIG.AIRDROP_CYCLE_DAYS,
        airdropDistributionPct: config_1.CONFIG.AIRDROP_DISTRIBUTION_PCT,
        tiers: config_1.CONFIG.TIERS,
        buybackWallets: Object.entries(config_1.CONFIG.BUYBACK_WALLETS).map(([key, w]) => ({
            id: key,
            token: w.token,
            address: w.address,
            allocation: w.allocation,
        })),
        boostPerPeriod: config_1.CONFIG.BOOST_PER_PERIOD,
        boostPeriodDays: config_1.CONFIG.BOOST_PERIOD_DAYS,
    };
});
// GET /api/wallets — live balances of the 3 buyback wallets
app.get('/api/wallets', async () => {
    const provider = await getProviderWithFallback();
    const wallets = [];
    for (const [key, wallet] of Object.entries(config_1.CONFIG.BUYBACK_WALLETS)) {
        try {
            // Get native CRO balance
            const croBalance = await provider.getBalance(wallet.address);
            const croFormatted = ethers_1.ethers.formatEther(croBalance);
            // Get $HODL token balance if token address is set
            let tokenBalance = '0';
            if (config_1.CONFIG.TOKEN_ADDRESS !== '0x0000000000000000000000000000000000000000') {
                const token = new ethers_1.ethers.Contract(config_1.CONFIG.TOKEN_ADDRESS, ERC20_ABI, provider);
                const decimals = await token.decimals();
                const bal = await token.balanceOf(wallet.address);
                tokenBalance = ethers_1.ethers.formatUnits(bal, decimals);
            }
            // Get $CLG balance for the CLG wallet
            let clgBalance = '0';
            const CLG_ADDRESS = '0xa40764b6878e6eb86fac5de4f1f1a80aa6fc67fe';
            try {
                const clgToken = new ethers_1.ethers.Contract(CLG_ADDRESS, ERC20_ABI, provider);
                const clgDecimals = await clgToken.decimals();
                const clgBal = await clgToken.balanceOf(wallet.address);
                clgBalance = ethers_1.ethers.formatUnits(clgBal, clgDecimals);
            }
            catch { /* CLG not available */ }
            wallets.push({
                id: key,
                token: wallet.token,
                address: wallet.address,
                allocation: wallet.allocation,
                croBalance: croFormatted,
                tokenBalance,
                clgBalance,
            });
        }
        catch (err) {
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
    const airdropPct = config_1.CONFIG.AIRDROP_DISTRIBUTION_PCT / 100;
    return {
        wallets,
        totals: {
            totalCro: totalCro.toFixed(4),
            totalToken: totalToken.toFixed(4),
            airdropCro: (totalCro * airdropPct).toFixed(4),
            airdropToken: (totalToken * airdropPct).toFixed(4),
            distributionPct: config_1.CONFIG.AIRDROP_DISTRIBUTION_PCT,
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
app.get('/api/snapshots/:epoch', async (req, reply) => {
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
app.get('/api/holder/:address', async (req, reply) => {
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
    const holder = latest.holders?.find((h) => h.address.toLowerCase() === address);
    if (!holder) {
        reply.status(404);
        return { error: 'Holder not found' };
    }
    // Get history across all snapshots
    const history = files.map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, f), 'utf-8'));
        const h = data.holders?.find((h) => h.address.toLowerCase() === address);
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
    const nextAirdrop = new Date(lastDate.getTime() + config_1.CONFIG.AIRDROP_CYCLE_DAYS * 86400000);
    const daysUntil = Math.max(0, Math.ceil((nextAirdrop.getTime() - Date.now()) / 86400000));
    return {
        currentEpoch,
        nextAirdropDate: nextAirdrop.toISOString(),
        daysUntilAirdrop: daysUntil,
        distributionPct: config_1.CONFIG.AIRDROP_DISTRIBUTION_PCT,
        lastSnapshot: lastSnapshot ? {
            epoch: lastSnapshot.epoch,
            timestamp: lastSnapshot.timestamp,
            taxPool: lastSnapshot.taxPoolBalance,
            holderCount: lastSnapshot.holders?.length || 0,
            walletBalances: lastSnapshot.walletBalances || null,
        } : null,
        buybackWallets: Object.entries(config_1.CONFIG.BUYBACK_WALLETS).map(([key, w]) => ({
            id: key,
            token: w.token,
            address: w.address,
            allocation: w.allocation,
        })),
    };
});
/** Create a provider with fallback: tries RPC_PRIMARY first, then RPC_FALLBACK */
function createProvider() {
    return new ethers_1.ethers.JsonRpcProvider(config_1.CONFIG.RPC_PRIMARY);
}
async function getProviderWithFallback() {
    const primary = new ethers_1.ethers.JsonRpcProvider(config_1.CONFIG.RPC_PRIMARY);
    try {
        await primary.getBlockNumber(); // test connectivity
        return primary;
    }
    catch (err) {
        console.warn(`Primary RPC failed (${config_1.CONFIG.RPC_PRIMARY}), falling back to ${config_1.CONFIG.RPC_FALLBACK}`);
        return new ethers_1.ethers.JsonRpcProvider(config_1.CONFIG.RPC_FALLBACK);
    }
}
async function start() {
    // Startup validation
    if (config_1.CONFIG.TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
        console.warn('WARNING: TOKEN_ADDRESS not set - holder tracking disabled');
    }
    try {
        await app.listen({ port: config_1.CONFIG.PORT, host: '0.0.0.0' });
        console.log(`DiamondHands API running on port ${config_1.CONFIG.PORT}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
start();

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeSnapshot = takeSnapshot;
const ethers_1 = require("ethers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("./config");
const ERC20_ABI = [
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
];
function ensureDataDir() {
    const dir = path.resolve(config_1.CONFIG.DATA_DIR);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    const snapshotsDir = path.join(dir, 'snapshots');
    if (!fs.existsSync(snapshotsDir))
        fs.mkdirSync(snapshotsDir, { recursive: true });
    return { dir, snapshotsDir };
}
function loadSellers() {
    const { dir } = ensureDataDir();
    const sellersFile = path.join(dir, 'sellers.json');
    if (fs.existsSync(sellersFile)) {
        return new Set(JSON.parse(fs.readFileSync(sellersFile, 'utf-8')));
    }
    return new Set();
}
function saveSellers(sellers) {
    const { dir } = ensureDataDir();
    fs.writeFileSync(path.join(dir, 'sellers.json'), JSON.stringify([...sellers], null, 2));
}
function getTier(percentage) {
    if (percentage >= config_1.CONFIG.TIERS.DIAMOND)
        return 'diamond';
    if (percentage >= config_1.CONFIG.TIERS.GOLD)
        return 'gold';
    if (percentage >= config_1.CONFIG.TIERS.SILVER)
        return 'silver';
    // Below silver threshold — bronze hands. "jeeter" is only assigned based on hasSold, not holding amount
    return 'bronze';
}
function getBoost(holdingDays) {
    const periods = Math.floor(holdingDays / config_1.CONFIG.BOOST_PERIOD_DAYS);
    if (periods < 2)
        return 0;
    return (periods - 1) * config_1.CONFIG.BOOST_PER_PERIOD;
}
function getEpoch() {
    const { snapshotsDir } = ensureDataDir();
    const files = fs.readdirSync(snapshotsDir).filter(f => f.endsWith('.json'));
    return files.length + 1;
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
async function takeSnapshot() {
    console.log('Taking snapshot...');
    const provider = await getProviderWithFallback();
    const token = new ethers_1.ethers.Contract(config_1.CONFIG.TOKEN_ADDRESS, ERC20_ABI, provider);
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();
    const totalSupplyNum = Number(ethers_1.ethers.formatUnits(totalSupply, decimals));
    // Get tax pool balance
    const taxBalance = await token.balanceOf(config_1.CONFIG.TAX_WALLET);
    // Fetch balances of all 3 buyback wallets
    console.log('Fetching buyback wallet balances...');
    const walletBalances = [];
    for (const [key, wallet] of Object.entries(config_1.CONFIG.BUYBACK_WALLETS)) {
        const croBalance = await provider.getBalance(wallet.address);
        const tokenBal = await token.balanceOf(wallet.address);
        walletBalances.push({
            id: key,
            token: wallet.token,
            address: wallet.address,
            allocation: wallet.allocation,
            croBalance: ethers_1.ethers.formatEther(croBalance),
            tokenBalance: ethers_1.ethers.formatUnits(tokenBal, decimals),
        });
    }
    const totalWalletsCro = walletBalances.reduce((s, w) => s + Number(w.croBalance), 0);
    const totalWalletsToken = walletBalances.reduce((s, w) => s + Number(w.tokenBalance), 0);
    const distPct = config_1.CONFIG.AIRDROP_DISTRIBUTION_PCT / 100; // 0.20
    // 20% of wallet totals = airdrop amount this epoch
    const airdropCro = totalWalletsCro * distPct;
    const airdropToken = totalWalletsToken * distPct;
    // Scan Transfer events to find all holders
    console.log('Scanning transfer events...');
    const filter = token.filters.Transfer();
    const holders = new Map();
    const sellers = loadSellers();
    // Exclude buyback wallet addresses and DEX pair from seller tracking
    const buybackAddresses = new Set(Object.values(config_1.CONFIG.BUYBACK_WALLETS).map(w => w.address.toLowerCase()));
    const excludeFromSellers = new Set([
        ...buybackAddresses,
        config_1.CONFIG.DEX_PAIR.toLowerCase(),
        config_1.CONFIG.TOKEN_ADDRESS.toLowerCase(),
        config_1.CONFIG.CREATOR_WALLET.toLowerCase(),
    ]);
    // Scan in chunks of 2000 blocks (Cronos limit)
    const CHUNK_SIZE = 2000;
    const lookbackBlock = blockNumber - 172800 * 60; // ~60 days of blocks at 0.5s
    const START_BLOCK = Math.max(config_1.CONFIG.DEPLOY_BLOCK, lookbackBlock);
    for (let from = Math.max(0, START_BLOCK); from <= blockNumber; from += CHUNK_SIZE) {
        const to = Math.min(from + CHUNK_SIZE - 1, blockNumber);
        try {
            const events = await token.queryFilter(filter, from, to);
            for (const event of events) {
                const log = event;
                const [fromAddr, toAddr] = log.args;
                const fromLower = fromAddr.toLowerCase();
                const toLower = toAddr.toLowerCase();
                // Track sellers — only count as sell if transferring to DEX pair (actual sell)
                // or to another regular wallet (p2p transfer).
                // Exclude: transfers TO tax wallet or token contract (automatic tax deductions on buy/transfer)
                if (fromAddr !== ethers_1.ethers.ZeroAddress &&
                    fromLower !== config_1.CONFIG.TAX_WALLET.toLowerCase() &&
                    !excludeFromSellers.has(fromLower) &&
                    toLower !== config_1.CONFIG.TAX_WALLET.toLowerCase() &&
                    toLower !== config_1.CONFIG.TOKEN_ADDRESS.toLowerCase()) {
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
        }
        catch (err) {
            console.error(`Error scanning blocks ${from}-${to}:`, err);
        }
    }
    // Get current balances for all holders
    console.log(`Fetching balances for ${holders.size} addresses...`);
    const holderRecords = [];
    // Addresses to exclude from holder list
    const excludeAddresses = new Set([
        ethers_1.ethers.ZeroAddress,
        config_1.CONFIG.TAX_WALLET.toLowerCase(),
        ...buybackAddresses,
    ]);
    for (const [address, info] of holders) {
        if (excludeAddresses.has(address))
            continue;
        try {
            const balance = await token.balanceOf(address);
            if (balance === 0n)
                continue;
            const balanceNum = Number(ethers_1.ethers.formatUnits(balance, decimals));
            const percentage = (balanceNum / totalSupplyNum) * 100;
            const tier = getTier(percentage);
            const blocksDiff = blockNumber - info.firstSeen;
            const holdingDays = Math.floor(blocksDiff / 172800);
            const hasSold = sellers.has(address);
            const boost = hasSold ? 0 : getBoost(holdingDays);
            const finalTier = hasSold ? 'jeeter' : tier;
            holderRecords.push({
                address,
                balance: ethers_1.ethers.formatUnits(balance, decimals),
                percentage: Math.round(percentage * 10000) / 10000,
                tier: finalTier,
                firstSeen: info.firstSeen,
                holdingDays,
                hasSold,
                airdropAmount: 0,
                boostPercentage: boost,
                totalWithBoost: 0,
            });
        }
        catch {
            // Skip failed balance checks
        }
    }
    // Calculate airdrop amounts based on 20% of wallet totals
    // Diamond 55%, Gold 30%, Silver 15% — Bronze is visual only (no pool)
    const diamondPool = airdropCro * 0.55;
    const goldPool = airdropCro * 0.30;
    const silverPool = airdropCro * 0.15;
    const tierPools = { diamond: diamondPool, gold: goldPool, silver: silverPool };
    const tiers = {
        diamond: holderRecords.filter(h => h.tier === 'diamond' && !h.hasSold),
        gold: holderRecords.filter(h => h.tier === 'gold' && !h.hasSold),
        silver: holderRecords.filter(h => h.tier === 'silver' && !h.hasSold),
    };
    for (const [tierName, tierHolders] of Object.entries(tiers)) {
        if (tierHolders.length === 0)
            continue;
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
    const snapshot = {
        epoch: getEpoch(),
        timestamp: new Date().toISOString(),
        blockNumber,
        totalSupply: ethers_1.ethers.formatUnits(totalSupply, decimals),
        taxPoolBalance: ethers_1.ethers.formatUnits(taxBalance, decimals),
        walletBalances,
        totalWalletsCro: totalWalletsCro.toFixed(4),
        totalWalletsToken: totalWalletsToken.toFixed(4),
        airdropAmountCro: airdropCro.toFixed(4),
        airdropAmountToken: airdropToken.toFixed(4),
        distributionPct: config_1.CONFIG.AIRDROP_DISTRIBUTION_PCT,
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
    console.log(`  Tax pool: ${ethers_1.ethers.formatUnits(taxBalance, decimals)} $HODL`);
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

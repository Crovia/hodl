export const CONFIG = {
  // Token contract address — set after deployment
  TOKEN_ADDRESS: process.env.TOKEN_ADDRESS || '0xF12D9cbd36738344b5D2281b21C323c8f1a07B1A',

  // Tax wallet address — collects all taxes initially
  TAX_WALLET: process.env.TAX_WALLET || '0x0000000000000000000000000000000000000000',

  // DEX pair address — excluded from seller tracking (it's the liquidity pool, not a person)
  DEX_PAIR: '0xb4c50913f70b870f68e6143126163ba0e9186ad7',

  // Creator wallet — excluded from seller tracking (distributes presale tokens)
  CREATOR_WALLET: '0xAF87e4Df58D735ec2971d2D8Db663B02cA60175D',

  // Addresses excluded from airdrop rewards (still shown in holder list)
  EXCLUDE_FROM_REWARDS: [
    '0xb4c50913f70b870f68e6143126163ba0e9186ad7', // Liquidity Pool (DEX pair)
    '0x185d93b0f57a22e6cab7d9f0d4eb657341ff90b3', // Obsidian Finance
  ],

  // 3 Buyback wallets — taxes are split into these for manual buybacks
  BUYBACK_WALLETS: {
    DHAND: {
      address: process.env.WALLET_DHAND || '0x36148b668edc1d380671467579ee851a72b9455c',
      token: '$HODL',
      allocation: 35, // 35% of taxes
    },
    CLG: {
      address: process.env.WALLET_CLG || '0x04407f3cc344df8c271b56bd42f9a169659266fc',
      token: '$CLG',
      allocation: 33, // 33% of taxes
    },
    ROTATING: {
      address: process.env.WALLET_ROTATING || '0xf8de57e772b1a29b704dae1f9174087ff568d2bc',
      token: 'Rotating',
      allocation: 32, // 32% — community-voted token
    },
  },

  // RPC — primary with fallback
  RPC_URL: process.env.RPC_URL || 'https://evm.cronos.org',
  RPC_PRIMARY: process.env.RPC_PRIMARY || process.env.RPC_URL || 'https://evm.cronos.org',
  RPC_FALLBACK: process.env.RPC_FALLBACK || 'https://evm.cronos.org',

  // Deploy block — contract creation block on Cronos
  DEPLOY_BLOCK: Number(process.env.DEPLOY_BLOCK) || 61499500,

  // Airdrop cycle in days
  AIRDROP_CYCLE_DAYS: 10,

  // Percentage of wallet balances to airdrop each cycle
  // 20% is distributed, 80% stays and accumulates
  AIRDROP_DISTRIBUTION_PCT: 20,

  // Tier thresholds (percentage of total supply)
  TIERS: {
    DIAMOND: 1.8,   // 1.8%+ of supply
    GOLD: 1,         // 1%+ of supply
    SILVER: 0.5,  // 0.5%+ of supply
  },

  // Pool share per tier
  TIER_POOL_SHARE: 33.33,

  // Boost: +10% per 10-day period after first airdrop
  BOOST_PER_PERIOD: 10,
  BOOST_PERIOD_DAYS: 10,

  // Server
  PORT: Number(process.env.PORT) || 3025,

  // Data directory for snapshots
  DATA_DIR: process.env.DATA_DIR || './data',
};

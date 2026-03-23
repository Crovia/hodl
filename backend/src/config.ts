export const CONFIG = {
  // Token contract address — set after deployment
  TOKEN_ADDRESS: process.env.TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',

  // Tax wallet address — collects all taxes initially
  TAX_WALLET: process.env.TAX_WALLET || '0x0000000000000000000000000000000000000000',

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

  // RPC
  RPC_URL: process.env.RPC_URL || 'https://evm.cronos.org',

  // Airdrop cycle in days
  AIRDROP_CYCLE_DAYS: 10,

  // Percentage of wallet balances to airdrop each cycle
  // 20% is distributed, 80% stays and accumulates
  AIRDROP_DISTRIBUTION_PCT: 20,

  // Tier thresholds (percentage of total supply)
  TIERS: {
    DIAMOND: 2,   // 2%+ of supply
    GOLD: 1.5,    // 1.5%+ of supply
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

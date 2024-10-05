import { SupportedChain } from '@/app/schema';

export const DEFAULT_NETWORK: SupportedChain = 'Arbitrum';

export const ANKR_ARBITRUM_RPC_URL = 'https://rpc.ankr.com/arbitrum';

export const ANKR_ARBITRUM_SEPOLIA = 'https://rpc.ankr.com/arbitrum_sepolia';

export const LIVE_HOST_URL = 'https://onchain-buddy.onrender.com';

export const PUBLIC_NEO_X_MAINNET_RPC_URL = 'https://mainnet-1.rpc.banelabs.org';

export const PUBLIC_NEO_X_TESTNET_RPC_URL = 'https://neoxt4seed1.ngd.network';

export const ANKR_BASE_MAINNET_RPC_URL = 'https://rpc.ankr.com/base';
export const ANKR_BASE_SEPOLIA_RPC_URL = 'https://rpc.ankr.com/base_sepolia';

export const ANKR_OPTIMISM_RPC_URL = 'https://rpc.ankr.com/optimism';
export const ANKR_OPTIMISM_SEPOLIA_RPC_URL = 'https://rpc.ankr.com/optimism_sepolia';

export const ANKR_POLYGON_RPC_URL = 'https://rpc.ankr.com/polygon';
export const ANKR_POLYGON_AMOY_RPC_URL = 'https://rpc.ankr.com/polygon_amoy';

export const ANKR_ETHEREUM_RPC_URL = 'https://rpc.ankr.com/eth';
export const ANKR_ETHEREUM_SEPOLIA_RPC_URL = 'https://rpc.ankr.com/eth_sepolia';

export const TRANSFER_EVENT_TOPIC =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export const ZERO_DATA = '0x';

export const FALLBACK_QUERY_DATE_RANGE = {
    start: '1|M',
    end: 'now',
};

export const GET_STARTED_MESSAGES = [
    `Fetch the last 6 months of Uniswap swaps for wallet 0xd78B7563aFaF32bb56F0d86ab6132690572a7bC3 on Ethereum.`,
    `Search for this transaction 0xd8f94b6d3016fa937ad97ba87967b4e79fecee5bb9a2f9b8ed32158ca36d27a6.`,
    `Add this wallet 0x76808d8E91cd0f2E720244B5f88ed37B936d2e2f to my profile.`,
    `Show swap history for wallet 0x3c5eF6a0aF2F5147A53c689a31b8AeeD12fB6f3D on eth between 1 month ago and now on Uniswap.`,
];

export const SUPPORTED_CHAINS = [
    'NeoX',
    'Arbitrum',
    'Base',
    'Optimism',
    'Polygon',
    'Ethereum',
] as const;

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

export type Web3Environment = 'mainnet' | 'testnet';

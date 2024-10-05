import { z } from 'zod';

export const SUPPORTED_CHAINS = [
    'NeoX',
    'Arbitrum',
    'Base',
    'Optimism',
    'Polygon',
    'Ethereum',
] as const;

export const supportedChainSchema = z.enum(SUPPORTED_CHAINS);
export const web3EnvironmentSchema = z.enum(['mainnet', 'testnet']);
export const supportedExchangeSchema = z.enum(['uniswap']);

export type SupportedChain = z.infer<typeof supportedChainSchema>;
export type Web3Environment = z.infer<typeof web3EnvironmentSchema>;
export type SupportedExchange = z.infer<typeof supportedExchangeSchema>;

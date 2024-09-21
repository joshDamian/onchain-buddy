import { SupportedChain } from '@/app/types';
import { Chain } from 'viem';
import { arbitrum } from 'viem/chains';
import { ANKR_ARBITRUM_RPC_URL } from '@/constants/strings';

export type EvmNode = 'ankr-arbitrum-mainnet';

export type EvmNetworkConfig = {
    rpcUrl: string;
    key: EvmNode;
    network: SupportedChain;
    viemChain: Chain;
};

/**
 * @type {EvmNetworkConfig}
 * @description Ankr Arbitrum Mainnet Configuration
 * @property {string} rpcUrl - RPC URL
 * @property {string} key - EVM Node Key
 * @property {string} network - SupportedChain
 * @property {Chain} viemChain - Viem Chain
 */
export const ankrArbitrumMainnet: EvmNetworkConfig = {
    rpcUrl: ANKR_ARBITRUM_RPC_URL,
    key: 'ankr-arbitrum-mainnet',
    network: 'Arbitrum',
    viemChain: arbitrum,
};

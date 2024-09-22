import { SupportedChain, Web3Environment } from '@/app/types';
import { Chain } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import { ANKR_ARBITRUM_RPC_URL, ANKR_ARBITRUM_SEPOLIA } from '@/constants/strings';

export type EvmNode = 'ankr-arbitrum-mainnet' | 'ankr-arbitrum-sepolia';

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

/**
 * @type {EvmNetworkConfig}
 * @description Ankr Arbitrum Sepolia Configuration
 * @property {string} rpcUrl - RPC URL
 * @property {string} key - EVM Node Key
 * @property {string} network - SupportedChain
 * @property {Chain} viemChain - Viem Chain
 */
export const ankrArbitrumSepolia: EvmNetworkConfig = {
    rpcUrl: ANKR_ARBITRUM_SEPOLIA,
    key: 'ankr-arbitrum-sepolia',
    network: 'Arbitrum',
    viemChain: arbitrumSepolia,
};

const APP_DEFAULT_EVM_NETWORK_CONFIGS: Record<
    SupportedChain,
    Record<Web3Environment, EvmNetworkConfig>
> = {
    Arbitrum: {
        mainnet: ankrArbitrumMainnet,
        testnet: ankrArbitrumSepolia,
    },
};

export const getAppDefaultEvmConfig = (
    network: SupportedChain,
    environment: Web3Environment = 'mainnet'
): EvmNetworkConfig => {
    return APP_DEFAULT_EVM_NETWORK_CONFIGS[network][environment];
};

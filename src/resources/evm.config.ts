import { SupportedChain, Web3Environment } from '@/app/types';
import { Chain } from 'viem';
import {
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    mainnet,
    optimism,
    optimismSepolia,
    polygon,
    polygonAmoy,
    sepolia,
} from 'viem/chains';
import {
    ANKR_ARBITRUM_RPC_URL,
    ANKR_ARBITRUM_SEPOLIA,
    ANKR_BASE_MAINNET_RPC_URL,
    ANKR_BASE_SEPOLIA_RPC_URL,
    ANKR_ETHEREUM_RPC_URL,
    ANKR_OPTIMISM_RPC_URL,
    ANKR_OPTIMISM_SEPOLIA_RPC_URL,
    ANKR_POLYGON_AMOY_RPC_URL,
    ANKR_POLYGON_RPC_URL,
    PUBLIC_NEO_X_MAINNET_RPC_URL,
} from '@/constants/strings';
import { neoXMainnet, neoXTestnet } from '@/resources/viem/viemChains';

export type EvmNode =
    | 'ankr-arbitrum-mainnet'
    | 'ankr-arbitrum-sepolia'
    | 'public-neo-x-mainnet'
    | 'public-neo-x-testnet'
    | 'ankr-base-mainnet'
    | 'ankr-base-sepolia'
    | 'ankr-optimism-mainnet'
    | 'ankr-optimism-sepolia'
    | 'ankr-polygon-mainnet'
    | 'ankr-polygon-amoy'
    | 'ankr-ethereum-mainnet'
    | 'ankr-ethereum-sepolia';

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
export const publicNeoXMainnet: EvmNetworkConfig = {
    rpcUrl: PUBLIC_NEO_X_MAINNET_RPC_URL,
    key: 'public-neo-x-mainnet',
    network: 'NeoX',
    viemChain: neoXMainnet,
};
export const publicNeoXTestnet: EvmNetworkConfig = {
    rpcUrl: PUBLIC_NEO_X_MAINNET_RPC_URL,
    key: 'public-neo-x-mainnet',
    network: 'NeoX',
    viemChain: neoXTestnet,
};
export const ankrBaseMainnet: EvmNetworkConfig = {
    rpcUrl: ANKR_BASE_MAINNET_RPC_URL,
    key: 'ankr-base-mainnet',
    network: 'Base',
    viemChain: base,
};
export const ankrBaseSepolia: EvmNetworkConfig = {
    rpcUrl: ANKR_BASE_SEPOLIA_RPC_URL,
    key: 'ankr-base-sepolia',
    network: 'Base',
    viemChain: baseSepolia,
};
export const ankrOptimismMainnet: EvmNetworkConfig = {
    rpcUrl: ANKR_OPTIMISM_RPC_URL,
    key: 'ankr-optimism-mainnet',
    network: 'Optimism',
    viemChain: optimism,
};
export const ankrOptimismSepolia: EvmNetworkConfig = {
    rpcUrl: ANKR_OPTIMISM_SEPOLIA_RPC_URL,
    key: 'ankr-optimism-sepolia',
    network: 'Optimism',
    viemChain: optimismSepolia,
};
export const ankrPolygonMainnet: EvmNetworkConfig = {
    rpcUrl: ANKR_POLYGON_RPC_URL,
    key: 'ankr-polygon-mainnet',
    network: 'Polygon',
    viemChain: polygon,
};
export const ankrPolygonAmoy: EvmNetworkConfig = {
    rpcUrl: ANKR_POLYGON_AMOY_RPC_URL,
    key: 'ankr-polygon-amoy',
    network: 'Polygon',
    viemChain: polygonAmoy,
};
export const ethereumMainnet: EvmNetworkConfig = {
    rpcUrl: ANKR_ETHEREUM_RPC_URL,
    key: 'ankr-ethereum-mainnet',
    network: 'Ethereum',
    viemChain: mainnet,
};
export const ethereumSepolia: EvmNetworkConfig = {
    rpcUrl: ANKR_ETHEREUM_RPC_URL,
    key: 'ankr-ethereum-sepolia',
    network: 'Ethereum',
    viemChain: sepolia,
};

const APP_DEFAULT_EVM_NETWORK_CONFIGS: Record<
    SupportedChain,
    Record<Web3Environment, EvmNetworkConfig>
> = {
    Arbitrum: {
        mainnet: ankrArbitrumMainnet,
        testnet: ankrArbitrumSepolia,
    },
    NeoX: {
        mainnet: publicNeoXMainnet,
        testnet: publicNeoXTestnet,
    },
    Base: {
        mainnet: ankrBaseMainnet,
        testnet: ankrBaseSepolia,
    },
    Optimism: {
        mainnet: ankrOptimismMainnet,
        testnet: ankrOptimismSepolia,
    },
    Polygon: {
        mainnet: ankrPolygonMainnet,
        testnet: ankrPolygonAmoy,
    },
    Ethereum: {
        mainnet: ethereumMainnet,
        testnet: ethereumSepolia,
    },
};

export const getAppDefaultEvmConfig = (
    network: SupportedChain,
    environment: Web3Environment = 'mainnet'
): EvmNetworkConfig => {
    return APP_DEFAULT_EVM_NETWORK_CONFIGS[network][environment];
};

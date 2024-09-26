import { SupportedChain, Web3Environment } from '@/app/types';
import { getAppDefaultEvmConfig } from '@/resources/evm.config';

const FALL_BACK_EXPLORER_URLS: {
    [key in SupportedChain]: {
        [key in Web3Environment]: string;
    };
} = {
    Arbitrum: {
        testnet: 'https://sepolia.arbiscan.io/',
        mainnet: 'https://arbiscan.io/',
    },
    Base: {
        testnet: 'https://sepolia.basescan.org',
        mainnet: 'https://basescan.org',
    },
    NeoX: {
        testnet: 'https://xt4scan.ngd.network',
        mainnet: 'https://xexplorer.neo.org',
    },
    Polygon: {
        testnet: 'https://amoy.polygonscan.com',
        mainnet: 'https://polygonscan.com',
    },
    Optimism: {
        testnet: 'https://optimism-sepolia.blockscout.com',
        mainnet: 'https://optimistic.etherscan.io',
    },
    Ethereum: {
        testnet: 'https://sepolia.etherscan.io',
        mainnet: 'https://etherscan.io',
    },
};

export const getTransactionExplorerUrl = (
    txHash: string,
    chain: SupportedChain,
    environment = 'mainnet' as Web3Environment
) => {
    const networkConfig = getAppDefaultEvmConfig(chain, environment);

    const explorerUrl =
        networkConfig.viemChain.blockExplorers?.default.url ??
        FALL_BACK_EXPLORER_URLS[chain][environment];

    return `${explorerUrl}/tx/${txHash}`;
};

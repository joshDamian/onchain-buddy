import { SupportedChain, Web3Environment } from '@/app/types';

const EXPLORER_URLS: {
    [key in SupportedChain]: {
        [key in Web3Environment]: string;
    };
} = {
    Arbitrum: {
        testnet: 'https://sepolia.arbiscan.io/',
        mainnet: 'https://arbiscan.io/',
    },
};

export const getTransactionExplorerUrl = (
    txHash: string,
    chain: SupportedChain,
    environment = 'mainnet' as Web3Environment
) => {
    switch (chain) {
        default:
            return `${EXPLORER_URLS[chain][environment]}/tx/${txHash}`;
    }
};

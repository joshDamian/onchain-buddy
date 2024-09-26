import { defineChain } from 'viem';
import { PUBLIC_NEO_X_MAINNET_RPC_URL, PUBLIC_NEO_X_TESTNET_RPC_URL } from '@/constants/strings';

export const neoXMainnet = defineChain({
    id: 47763,
    name: 'NeoX Mainnet',
    nativeCurrency: {
        decimals: 18,
        name: 'GAS',
        symbol: 'GAS',
    },
    rpcUrls: {
        default: {
            http: [PUBLIC_NEO_X_MAINNET_RPC_URL],
            webSocket: ['wss://mainnet.wss1.banelabs.org/'],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://xexplorer.neo.org' },
    },
    contracts: {
        multicall3: {
            address: '0xD6010D102015fEa9cB3a9AbFBB51994c0Fd6E672',
            blockCreated: 4299,
        },
    },
});

export const neoXTestnet = defineChain({
    id: 12227332,
    name: 'NeoX T4',
    nativeCurrency: {
        decimals: 18,
        name: 'GAS',
        symbol: 'GAS',
    },
    rpcUrls: {
        default: {
            http: [PUBLIC_NEO_X_TESTNET_RPC_URL],
            webSocket: ['wss://neoxt4wss1.ngd.network'],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://xt4scan.ngd.network/' },
    },
    contracts: {
        multicall3: {
            address: '0x82096F92248dF7afDdef72E545F06e5be0cf0F99',
            blockCreated: 36458,
        },
    },
});

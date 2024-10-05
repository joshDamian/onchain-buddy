import { SupportedChain } from '@/app/schema';

export const SUBGRAPH_BASE_URL = 'https://gateway.thegraph.com';

export const SubgraphIds = {
    MAINNET_UNISWAP_V3: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    ARBITRUM_UNISWAP_V3: 'FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM',
    BASE_UNISWAP_V3: 'GqzP4Xaehti8KSfQmv3ZctFSjnSUYZ4En5NRsiTbvZpz',
    POLYGON_UNISWAP_V3: '3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm',
    OPTIMISM_UNISWAP_V3: 'Cghf4LfVqPiFw6fp6Y5X5Ubc8UpmUhSfJL82zwiBFLaj',
    NEOX_UNISWAP_V3: 'DVjqbErAXc9WDFMaZ6nwrH3GUqtH4vfRdPFar2uGtu12',
};

const UniswapSubgraphIdByNetwork: Record<SupportedChain, string> = {
    Arbitrum: SubgraphIds.ARBITRUM_UNISWAP_V3,
    Base: SubgraphIds.BASE_UNISWAP_V3,
    Ethereum: SubgraphIds.MAINNET_UNISWAP_V3,
    Polygon: SubgraphIds.POLYGON_UNISWAP_V3,
    Optimism: SubgraphIds.OPTIMISM_UNISWAP_V3,
    NeoX: SubgraphIds.NEOX_UNISWAP_V3,
};

export const getUniswapSubgraphIdByNetwork = (network: SupportedChain) =>
    UniswapSubgraphIdByNetwork[network];

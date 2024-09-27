import { SupportedChain } from '@/app/types';
import { SUBGRAPH_BASE_URL, SubgraphIds } from '@/app/Subgraphs/config';
import { gql } from 'graphql-request';
import { querySubgraph } from '@/utils/subgraphs';
import env from '@/constants/env';
import logger from '@/resources/logger';
import { queryTokenMetadataSchema } from '@/app/Subgraphs/schema';

class TokenMetadataQueryLibrary {
    public static readonly SUPPORTED_CHAINS: Array<SupportedChain> = [
        'Arbitrum',
        'Base',
        'Ethereum',
        'Polygon',
        'Optimism',
    ] as const;
    private static readonly SUBGRAPH_BASE_URL = SUBGRAPH_BASE_URL;
    private static readonly SUBGRAPH_API_KEY = env.THE_GRAPH_API_KEY;

    public static async getErc20TokenMetadata(tokenAddress: string, chain: SupportedChain) {
        const subgraphId = this.subgraphIds[chain];

        const query = gql`
            {
                token(id: "${tokenAddress.toLowerCase()}") {
                    id
                    symbol
                    name
                    decimals
                }
            }
        `;

        try {
            const response = (await querySubgraph({
                subgraphBaseUrl: this.SUBGRAPH_BASE_URL,
                subgraphId,
                query,
                subgraphApiKey: this.SUBGRAPH_API_KEY,
            })) as { token: Record<string, string> };

            return queryTokenMetadataSchema.parse(response.token);
        } catch (error) {
            void logger.error(`Error fetching token metadata for ${tokenAddress} on ${chain}`, {
                error,
            });

            return null;
        }
    }

    private static get subgraphIds() {
        return {
            Arbitrum: SubgraphIds.ARBITRUM_UNISWAP_V3,
            Base: SubgraphIds.BASE_UNISWAP_V3,
            Ethereum: SubgraphIds.MAINNET_UNISWAP_V3,
            Polygon: SubgraphIds.POLYGON_UNISWAP_V3,
            Optimism: SubgraphIds.OPTIMISM_UNISWAP_V3,
            NeoX: SubgraphIds.NEOX_UNISWAP_V3,
        } satisfies Record<(typeof this.SUPPORTED_CHAINS)[number], string>;
    }
}

export default TokenMetadataQueryLibrary;

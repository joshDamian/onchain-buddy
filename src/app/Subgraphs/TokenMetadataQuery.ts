import { SupportedChain } from '@/app/schema';
import { getUniswapSubgraphIdByNetwork, SUBGRAPH_BASE_URL } from '@/app/Subgraphs/config';
import { gql } from '@urql/core';
import { querySubgraph } from '@/utils/subgraphs';
import env from '@/constants/env';
import logger from '@/resources/logger';
import { queryTokenMetadataSchema, TokenMetadata } from '@/app/Subgraphs/schema';

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
        const subgraphId = getUniswapSubgraphIdByNetwork(chain);

        const query = gql<{
            token: TokenMetadata;
        }>`
            {
                token(id: "${tokenAddress.toLowerCase()}") {
                    id
                    symbol
                    name
                    decimals
                }
            }
        `;

        const response = await querySubgraph({
            subgraphBaseUrl: this.SUBGRAPH_BASE_URL,
            subgraphId,
            query,
            subgraphApiKey: this.SUBGRAPH_API_KEY,
        });

        if (response.error) {
            void logger.error(`Error fetching token metadata for ${tokenAddress} on ${chain}`, {
                error: response.error,
            });

            return null;
        }

        if (!response.data?.token) {
            return null;
        }

        return queryTokenMetadataSchema.parse(response.data?.token);
    }
}

export default TokenMetadataQueryLibrary;

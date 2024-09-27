import { request } from 'graphql-request';

export type QuerySubgraphParams = {
    subgraphBaseUrl: string;
    subgraphId: string;
    query: string;
    subgraphApiKey: string;
};
export const querySubgraph = async (params: QuerySubgraphParams) => {
    const { subgraphBaseUrl, subgraphId, query, subgraphApiKey } = params;

    const endpoint = `${subgraphBaseUrl}/api/${subgraphApiKey}/subgraphs/id/${subgraphId}`;

    return await request(endpoint, query);
};

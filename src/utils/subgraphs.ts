//import { request } from 'graphql-request';
import {
    Client,
    cacheExchange,
    fetchExchange,
    TypedDocumentNode,
    OperationResult,
} from '@urql/core';

const graphqlClients = new Map<string, Client>();

const getGraphqlClient = (url: string) => {
    if (!graphqlClients.has(url)) {
        const client = new Client({
            url,
            exchanges: [cacheExchange, fetchExchange],
        });

        graphqlClients.set(url, client);
    }
    return graphqlClients.get(url)!;
};

export type QuerySubgraphParams<QueryOutput> = {
    subgraphBaseUrl: string;
    subgraphId: string;
    query: TypedDocumentNode<QueryOutput>;
    subgraphApiKey: string;
};

export const querySubgraph = async <T>(
    params: QuerySubgraphParams<T>
): Promise<OperationResult<T>> => {
    const { subgraphBaseUrl, subgraphId, query, subgraphApiKey } = params;

    const client = getGraphqlClient(
        `${subgraphBaseUrl}/api/${subgraphApiKey}/subgraphs/id/${subgraphId}`
    );

    return await client.query(query, {}).toPromise();
};

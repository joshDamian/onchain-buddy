export const BOT_COMMANDS_REGEX = {
    SUBSCRIBE_WALLET: /^\/subscribe\s+(?<wallet>\w+)$/,
    QUERY_TRANSACTION: /^\/transaction\s+(?<transactionHash>\w+)$/,
    NETWORK_INFO: /^\/network_info$/,
    WALLET_BALANCE: /^\/balance\s+(?<wallet>\w+)$/,
};

export type SubscribeWalletMatchGroups = {
    wallet: string;
};

export type QueryTransactionMatchGroups = {
    transactionHash: string;
};

import { z } from 'zod';
import { supportedChainSchema } from '@/app/schema';

export const findTransactionActionSchema = z.object({
    params: z.object({
        transactionHash: z.string(),
    }),
    action: z.literal('find_transaction'),
});

export const registerWalletActionSchema = z.object({
    params: z.object({
        walletAddress: z.string(),
    }),
    action: z.literal('monitor_wallet'),
});

export const retrieveDeFiSwapsHistory = z.object({
    params: z.object({
        walletAddress: z.string(),
        network: supportedChainSchema,
        exchange: z.string(),
        dateRange: z.object({
            start: z.string(),
            end: z.string(),
        }),
    }),
    action: z.literal('retrieve_defi_swaps_history'),
});

export const possibleActionsSchema = findTransactionActionSchema
    .or(registerWalletActionSchema)
    .or(retrieveDeFiSwapsHistory); // Chain other action schemas with schema.or()

export type PossibleActions = z.infer<typeof possibleActionsSchema>;

export type RetrieveDeFiSwapsHistoryAction = z.infer<typeof retrieveDeFiSwapsHistory>;
export type RegisterWalletAction = z.infer<typeof registerWalletActionSchema>;
export type FindTransactionAction = z.infer<typeof findTransactionActionSchema>;

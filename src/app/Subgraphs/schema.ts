import { z } from 'zod';
import { supportedChainSchema } from '@/app/schema';

export const queryTokenMetadataSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    id: z.string(),
    decimals: z.coerce.number(),
});

export const queryUniswapSwapHistorySchema = z.object({
    amount0: z.coerce.number(),
    amount1: z.coerce.number(),
    amountUSD: z.coerce.number(),
    id: z.string(),
    sender: z.string(),
    recipient: z.string(),
    timestamp: z.string(),
    token0: queryTokenMetadataSchema,
    token1: queryTokenMetadataSchema,
    transaction: z.object({
        id: z.string(),
        timestamp: z.string(),
    }),
});

export const querySwapHistoryInputSchema = z.object({
    sender: z.string(),
    dateRange: z.object({
        start: z.string(),
        end: z.string(),
    }),
    network: supportedChainSchema,
});

export type TokenMetadata = z.infer<typeof queryTokenMetadataSchema>;
export type UniswapSwapHistory = z.infer<typeof queryUniswapSwapHistorySchema>;
export type SwapHistoryInput = z.infer<typeof querySwapHistoryInputSchema>;
export type SwapSummary = {
    totalSwaps: number;
    totalVolumeUSD: number;
    largestSwap: number;
    smallestSwap: number;
    mostSwappedTokens: Record<string, number>; // { tokenSymbol: swapCount }
    volumeTrend: number; // percentage change in volume
};

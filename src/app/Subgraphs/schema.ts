import { z } from 'zod';

export const queryTokenMetadataSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    id: z.string(),
    decimals: z.coerce.number(),
});

export type TokenMetadata = z.infer<typeof queryTokenMetadataSchema>;

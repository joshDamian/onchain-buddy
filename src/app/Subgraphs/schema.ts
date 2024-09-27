import { z } from 'zod';

export const queryTokenMetadataSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    id: z.string(),
    decimals: z.string().transform((val) => parseInt(val, 10)),
});

export type TokenMetadata = z.infer<typeof queryTokenMetadataSchema>;
